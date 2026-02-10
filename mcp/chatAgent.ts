import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createScenarioTools, type RegisteredTool, type ScenarioToolOptions } from './scenarioTools.js';
import { createActionTools } from './actionTools.js';
import type { ScenarioSummary } from '../lib/scenarioStore.js';

const TOOL_RESULT_KEY = 'result';

type Nullable<T> = T | null;

type ToolArguments = Record<string, unknown>;

type OpenAIChatMessage = { role: string; content: string };

interface OpenAIChatClient {
  chat: {
    completions: {
      create: (args: {
        model: string;
        max_tokens?: number;
        messages: OpenAIChatMessage[];
      }) => Promise<{ choices: Array<{ message?: { content?: string | null } | null }> }>;
    };
  };
}

export interface CTAAction {
  type: 'late_notices' | 'send_message' | 'view_report';
  borrowerId?: string;
  borrowerEmail?: string;
  borrowerName?: string;
  reportType?: string;
  reportLink?: string;
  [key: string]: unknown;
}

export interface ChatCTA {
  label: string;
  icon: 'mail' | 'file' | 'alert' | 'send';
  action: CTAAction;
}

interface ActionItemLike {
  id?: string;
  borrower?: string;
  borrowerEmail?: string;
  amount?: number;
  daysPastDue?: number;
  priority?: string;
  [key: string]: unknown;
}

interface CashFlowLike {
  moneyIn?: number;
  moneyInChange?: number;
  moneyOut?: number;
  moneyOutChange?: number;
  netCashFlow?: number;
}

interface DelinquencyLike {
  total?: number;
  percentage?: number;
  breakdown?: {
    thirtyDays?: number;
    sixtyDays?: number;
    ninetyPlusDays?: number;
  };
}

interface TrendLike {
  collections?: number;
  disbursements?: number;
  delinquency?: number;
  newLoans?: number;
  paidOff?: number;
}

export interface PortfolioDataLike {
  month: string;
  year: number;
  totalLoans?: number;
  activeLoans?: number;
  principalBalance?: number;
  unpaidInterest?: number;
  totalLateCharges?: number;
  cashFlow?: CashFlowLike;
  delinquent?: DelinquencyLike;
  trends?: TrendLike;
  actionItems?: ActionItemLike[];
  [key: string]: unknown;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  question: string;
  portfolioData: PortfolioDataLike;
  historicalData?: PortfolioDataLike[];
  conversationHistory?: ConversationMessage[];
  scenarioId?: string | null;
  toolIds?: string[];
}

export interface ChatResult {
  answer: string;
  suggestions: string[];
  chart: unknown;
  ctas: ChatCTA[];
}

export interface McpChatAgentOptions {
  openaiFactory?: () => OpenAIChatClient | null;
  dataDir: string;
  getActiveScenarioId?: () => string | null;
}

const formatCurrency = (value: unknown): string => {
  if (value == null) return 'N/A';
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 'N/A' : `$${numeric.toLocaleString()}`;
};

const formatPercent = (value: unknown): string => {
  if (value == null) return 'N/A';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 'N/A';
  const prefix = numeric > 0 ? '+' : '';
  return `${prefix}${numeric}%`;
};

export class McpChatAgent {
  private readonly openaiFactory?: () => OpenAIChatClient | null;

  private readonly dataDir: string;

  private readonly getActiveScenarioId?: () => string | null;

  private _readyPromise: Promise<void> | null = null;

  private _client: Client | null = null;

  private _server: McpServer | null = null;

  constructor({ openaiFactory, dataDir, getActiveScenarioId }: McpChatAgentOptions) {
    this.openaiFactory = openaiFactory;
    this.dataDir = dataDir;
    this.getActiveScenarioId = getActiveScenarioId;
  }

  async ensureReady(): Promise<void> {
    if (!this._readyPromise) {
      this._readyPromise = this.initialize();
    }
    await this._readyPromise;
  }

  private async initialize(): Promise<void> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    this._server = new McpServer({
      name: 'PortfolioContextServer',
      version: '1.0.0',
    });

    const toolOptions: ScenarioToolOptions = {
      dataDir: this.dataDir,
      getActiveScenarioId: this.getActiveScenarioId,
    };

    const scenarioTools = createScenarioTools(toolOptions);
    const actionTools = createActionTools(toolOptions);

    [...scenarioTools, ...actionTools].forEach(tool => this.registerTool(tool));

    this._client = new Client({
      name: 'PortfolioChatClient',
      version: '1.0.0',
    });

    await Promise.all([
      this._server.connect(serverTransport),
      this._client.connect(clientTransport),
    ]);
  }

  private registerTool(tool: RegisteredTool): void {
    this._server?.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args: unknown, _extra?: unknown) => {
        const parsedArgs =
          args && typeof args === 'object' ? (args as ToolArguments) : ({} as ToolArguments);
        const payload = await tool.handler(parsedArgs);
        return {
          content: [
            {
              type: 'text' as const,
              text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
            },
          ],
          structuredContent: { [TOOL_RESULT_KEY]: payload },
        };
      },
    );
  }

  private async callTool(name: string, args: ToolArguments = {}): Promise<unknown> {
    await this.ensureReady();
    if (!this._client) {
      throw new Error('MCP client not initialized');
    }
    const result = await this._client.callTool({ name, arguments: args });
    const structured = result.structuredContent as Record<string, unknown> | undefined;
    if (structured && TOOL_RESULT_KEY in structured) {
      return structured[TOOL_RESULT_KEY];
    }
    const contentArray = (result as { content?: Array<{ type: string; text?: string }> }).content ?? [];
    const firstTextChunk = contentArray.find(chunk => chunk.type === 'text')?.text;
    if (!firstTextChunk) return null;
    try {
      return JSON.parse(firstTextChunk);
    } catch {
      return firstTextChunk;
    }
  }

  static shouldSuggestFollowUp(question?: string): boolean {
    return /(follow[\s-]?up|contact|message|reach out|notify|late notice)/i.test(question ?? '');
  }

  static shouldSuggestReport(question?: string): boolean {
    const hint = question?.toLowerCase() ?? '';
    return /\breport\b|\bsummary\b|\bstatement\b|\banalysis\b|\bgenerate\b|\bprepare\b/.test(hint);
  }

  static shouldListScenarios(question?: string): boolean {
    const hint = question?.toLowerCase() ?? '';
    return /\blist\b.*scenarios|\bavailable\b.*scenarios|\bshow\b.*scenarios/.test(hint);
  }

  static displayBorrowerName(name?: string | null): string {
    if (!name) return 'Borrower';
    const parts = name.split(',');
    return parts.length > 1 ? parts[0].trim() : name;
  }

  static formatAnswer(answer: string): string {
    if (!answer) return '';
    return answer
      .replace(/\r\n/g, '\n')
      .replace(/([^\n])(-\s)/g, (_, prefix) => `${prefix}\n- `)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async chat({
    question,
    portfolioData,
    historicalData,
    conversationHistory = [],
    scenarioId,
    toolIds = [],
  }: ChatRequest): Promise<ChatResult> {
    const openaiClient = this.openaiFactory?.();
    if (!openaiClient) {
      throw new Error('OpenAI API key not configured');
    }

    const activeScenarioId: Nullable<string> = scenarioId ?? this.getActiveScenarioId?.() ?? null;
    const resolvedToolIds = toolIds.length > 0 ? toolIds : ['get_action_items'];

    const toolOutputs: Record<string, any> = {};
    for (const toolId of resolvedToolIds) {
      const requiresScenarioId = ['get_scenario', 'get_action_items'].includes(toolId);
      const args = requiresScenarioId ? { id: activeScenarioId } : {};
      try {
        toolOutputs[toolId] = await this.callTool(toolId, args);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toolOutputs[toolId] = { error: message };
      }
    }

    const scenarioData =
      toolOutputs.get_scenario && !toolOutputs.get_scenario?.error
        ? (toolOutputs.get_scenario as PortfolioDataLike)
        : null;
    const currentData: PortfolioDataLike | null = scenarioData?.current
      ? (scenarioData.current as PortfolioDataLike)
      : portfolioData;
    const historyData: PortfolioDataLike[] =
      (scenarioData?.historical as PortfolioDataLike[]) ?? historicalData ?? [];
    const actionItems: ActionItemLike[] =
      toolOutputs.get_action_items && !toolOutputs.get_action_items?.error
        ? (toolOutputs.get_action_items as ActionItemLike[])
        : currentData?.actionItems ?? [];

    if (!currentData) {
      throw new Error('Current portfolio data is required for chat responses');
    }

    const historicalSummary =
      historyData?.map(h => `
${h.month} ${h.year}:
- Active Loans: ${h.activeLoans}
- Principal Balance: ${formatCurrency(h.principalBalance)}
- Collections: ${formatCurrency(h.cashFlow?.moneyIn)} (${formatPercent(h.cashFlow?.moneyInChange)})
- Disbursements: ${formatCurrency(h.cashFlow?.moneyOut)} (${h.cashFlow?.moneyOutChange != null ? formatPercent(h.cashFlow.moneyOutChange) : 'N/A'})
- Delinquency Rate: ${h.delinquent?.percentage ?? 'N/A'}%`).join('\n') || 'No historical data available';

    const actionItemsSummary =
      actionItems.length > 0
        ? actionItems
            .map(
              a =>
                `- Loan ${a.id}: ${a.borrower}, ${formatCurrency(a.amount)}, ${a.daysPastDue ?? 0} days past due, priority ${a.priority ?? 'N/A'}`,
            )
            .join('\n')
        : 'None listed.';

    const availableToolsDescription =
      resolvedToolIds.length > 0 ? resolvedToolIds.map(id => `- ${id}`).join('\n') : 'None provided.';

    const systemPrompt = `You are a financial analyst assistant for a mortgage servicing company. You have access to MCP tools with these identifiers:
${availableToolsDescription}

CURRENT PORTFOLIO DATA (${currentData.month} ${currentData.year}):
- Total Loans: ${currentData.totalLoans}
- Active Loans: ${currentData.activeLoans}
- Principal Balance: ${formatCurrency(currentData.principalBalance)}
- Unpaid Interest: ${formatCurrency(currentData.unpaidInterest)}
- Total Late Charges: ${formatCurrency(currentData.totalLateCharges)}
- Money In (Collections): ${formatCurrency(currentData.cashFlow?.moneyIn)} (${formatPercent(currentData.cashFlow?.moneyInChange)} vs last month)
- Money Out (Disbursements): ${formatCurrency(currentData.cashFlow?.moneyOut)} (${currentData.cashFlow?.moneyOutChange != null ? formatPercent(currentData.cashFlow.moneyOutChange) : 'N/A'} vs last month)
- Net Cash Flow: ${formatCurrency(currentData.cashFlow?.netCashFlow)}
- Delinquent Loans: ${currentData.delinquent?.total} (${currentData.delinquent?.percentage}%)
- 30 Days Past Due: ${currentData.delinquent?.breakdown?.thirtyDays}
- 60 Days Past Due: ${currentData.delinquent?.breakdown?.sixtyDays}
- 90+ Days Past Due: ${currentData.delinquent?.breakdown?.ninetyPlusDays}
- Collections Trend: ${formatPercent(currentData.trends?.collections)}
- Disbursements Trend: ${currentData.trends?.disbursements != null ? formatPercent(currentData.trends.disbursements) : 'N/A'}
- Delinquency Trend: ${formatPercent(currentData.trends?.delinquency)}
- New Loans This Month: ${currentData.trends?.newLoans}
- Loans Paid Off: ${currentData.trends?.paidOff}

ACTION ITEMS (from MCP tools when available):
${actionItemsSummary}

HISTORICAL DATA (Past Periods):
${historicalSummary}

FORMAT INSTRUCTIONS:
- Present action items or borrower follow-ups as a bulleted list with one borrower per line.
- Insert a blank line between distinct sections/paragraphs for readability.

CHART INSTRUCTIONS:
When the user asks for a graph, chart, visualization, or comparison across time periods, include a "chart" object in your response.

SINGLE METRIC (one line of bars or one trend):
- type: "bar", "line", or "area"
- title, xAxisLabel, yAxisLabel: strings
- data: Array of { label: "Month YYYY", value: number } - one value per period

COMPARISON (e.g. "money in vs money out", "collections vs disbursements", "X and Y"):
- type: "bar"
- title, xAxisLabel, yAxisLabel: strings
- data: Array of objects with label PLUS one key per series, e.g. { label: "October 2025", moneyIn: 2050000, moneyOut: 145000 }
- series: Array of { dataKey: "moneyIn", name: "Money In" }, { dataKey: "moneyOut", name: "Money Out" }
Use exact dataKey strings that match the keys in each data object. Populate from historical data: Collections = cashFlow.moneyIn, Disbursements = cashFlow.moneyOut for each month.

CTA INSTRUCTIONS:
When your answer relates to actionable items, include a "ctas" array with suggested actions. Each CTA should have:
- label: Button text (e.g., "Generate Late Notices")
- icon: One of "alert", "mail", "send", "file"
- action: An object with type and optional context

Include CTAs for these topics:
- Delinquency/lateness/past due discussions → { type: "late_notices", label: "Generate Late Notices", icon: "alert", action: { type: "late_notices" } }
- Discussing specific borrowers or collections → { type: "send_message", label: "Message Borrower", icon: "send", action: { type: "send_message", borrowerId: "...", borrowerEmail: "..." } }
- Reports/statements requests → { type: "view_report", label: "View Report", icon: "file", action: { type: "view_report", reportType: "late_notices" or "borrower_statement" or "escrow_analysis" } }

Be proactive about suggesting relevant CTAs based on the conversation context.`;

    const messages: OpenAIChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      {
        role: 'user',
        content: `${question}

After answering, suggest 2-3 follow-up questions the user might want to ask. Format your response as JSON with these fields:
- "answer": Your detailed answer to the question
- "suggestions": An array of 2-3 suggested follow-up questions
- "chart": (optional) If a chart/graph was requested, include the chart object as described in CHART INSTRUCTIONS. Set to null if no chart is needed.
- "ctas": (optional) An array of contextual action buttons as described in CTA INSTRUCTIONS. Set to [] if no actions are relevant.

Return ONLY the JSON object, no other text or markdown.`,
      },
    ];

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages,
    });

    let content = response.choices[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(content);
    const suggestions =
      Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
        ? parsed.suggestions
        : [
            'What is the trend in delinquent loans over the last few months?',
            'Can we compare collections and disbursements recently?',
            'Which borrowers need immediate follow-up?',
          ];
    const autoCtas: ChatCTA[] = [];

    const isReportQuestion = McpChatAgent.shouldSuggestReport(question);
    const shouldList = McpChatAgent.shouldListScenarios(question);

    let scenarioList: ScenarioSummary[] = [];
    if (shouldList) {
      try {
        scenarioList = (await this.callTool('list_scenarios')) as ScenarioSummary[];
      } catch (error) {
        console.error('Failed to list scenarios via MCP:', error);
      }
    }

    if (McpChatAgent.shouldSuggestFollowUp(question) && actionItems.length > 0) {
      const [primaryBorrower] = actionItems;
      autoCtas.push({
        label: `Message ${McpChatAgent.displayBorrowerName(primaryBorrower.borrower ?? '')}`,
        icon: 'send',
        action: {
          type: 'send_message',
          borrowerId: primaryBorrower.id,
          borrowerEmail: primaryBorrower.borrowerEmail,
          borrowerName: primaryBorrower.borrower,
        },
      });
    }

    if (isReportQuestion && activeScenarioId) {
      try {
        const reportType = 'borrower_statement';
        const reportResult = (await this.callTool('generate_report_mockup', {
          id: activeScenarioId,
          reportType,
        })) as { link?: string };
        autoCtas.push({
          label: 'Open Statement Report',
          icon: 'file',
          action: {
            type: 'view_report',
            reportType,
            reportLink: reportResult?.link,
          },
        });
      } catch (error) {
        console.error('Failed to generate report mockup CTA:', error);
        autoCtas.push({
          label: 'Generate Late Notices',
          icon: 'alert',
          action: { type: 'late_notices' },
        });
      }
      if (!autoCtas.some(cta => cta.action.type === 'view_report')) {
        autoCtas.push({
          label: 'Open Statement Report',
          icon: 'file',
          action: {
            type: 'view_report',
            reportType: 'borrower_statement',
          },
        });
      }
    }

    const modelCtas: ChatCTA[] = (parsed.ctas || []).filter((cta: ChatCTA) => {
      if (isReportQuestion) {
        return cta.action.type === 'view_report';
      }
      return true;
    });

    const ctaKey = (cta: ChatCTA) => {
      if (cta.action.type === 'send_message') {
        return `${cta.action.type}:${cta.action.borrowerId ?? ''}`;
      }
      if (cta.action.type === 'view_report') {
        return `${cta.action.type}:${cta.action.reportType ?? ''}`;
      }
      return cta.action.type;
    };

    const seenKeys = new Set<string>();
    const baseCtas: ChatCTA[] = [];
    for (const cta of modelCtas) {
      const key = ctaKey(cta);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        baseCtas.push(cta);
      }
    }
    for (const auto of autoCtas) {
      const key = ctaKey(auto);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        baseCtas.push(auto);
      }
    }

    const answerPrefix = scenarioList.length > 0
      ? `Available Scenarios:\n${scenarioList
          .map(s => `- ${s.name} (${s.id})${s.active ? ' [active]' : ''}: ${s.description}`)
          .join('\n')}\n\n`
      : '';

    const formattedAnswer = McpChatAgent.formatAnswer(`${answerPrefix}${parsed.answer || ''}`);
    const reportAutoCtas = autoCtas.filter(cta => cta.action.type === 'view_report');
    const hasReportAuto = reportAutoCtas.length > 0;
    const finalPayload: ChatResult = {
      answer: formattedAnswer,
      suggestions,
      chart: parsed.chart || null,
      ctas: hasReportAuto ? reportAutoCtas : baseCtas,
    };

    console.info('[MCP Chat] response meta:', {
      questionSnippet: question?.slice(0, 60),
      isReportQuestion,
      suggestionsCount: suggestions.length,
      ctas: finalPayload.ctas.map(cta => cta.action.type),
    });

    return finalPayload;
  }
}
