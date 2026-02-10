import type { PortfolioData, AIInsight, AISummaryResponse, ChatMessage, ChatResponse, ReportData, ReportType } from '../types';
import { mockAISummary, mockAIInsights, mockSentiment, mockKeyTakeaway } from '../data/mockData';

const API_BASE = '/api';


export interface AgentAction {
  tool: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
}

export interface AgentResponse {
  message: string;
  threadId: string;
  actions: AgentAction[];
  status?: 'awaiting_user' | 'completed';
  uiAction?: 'selectChecks' | 'confirmPrint' | 'lenderNotify';
  loanId?: string;
  checks?: Array<{ id: string; payAmount?: number; [key: string]: unknown }>;
  selectedCount?: number;
  totalAmount?: number;
  runId?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface PortfolioResponse {
  scenario: string;
  name: string;
  sentiment: 'good' | 'neutral' | 'bad';
  current: PortfolioData;
  historical: PortfolioData[];
}

export async function fetchScenarios(): Promise<Scenario[]> {
  try {
    const response = await fetch(`${API_BASE}/scenarios`);
    if (!response.ok) throw new Error('Failed to fetch scenarios');
    const result = await response.json();
    return result.scenarios;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
}

export async function switchScenario(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/scenarios/${id}`, { method: 'POST' });
    return response.ok;
  } catch (error) {
    console.error('Error switching scenario:', error);
    return false;
  }
}

export async function fetchPortfolioData(): Promise<PortfolioResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/portfolio`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return null;
  }
}

export async function generateAISummary(
  data: PortfolioData,
  historicalData: PortfolioData[]
): Promise<AISummaryResponse> {
  try {
    const response = await fetch(`${API_BASE}/ai/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: data, historical: historicalData }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    return {
      summary: result.summary || mockAISummary,
      sentiment: result.sentiment || mockSentiment,
      keyTakeaway: result.keyTakeaway || mockKeyTakeaway,
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return {
      summary: mockAISummary,
      sentiment: mockSentiment,
      keyTakeaway: mockKeyTakeaway,
    };
  }
}

export async function generateAIInsights(data: PortfolioData): Promise<AIInsight[]> {
  try {
    const response = await fetch(`${API_BASE}/ai/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    return result.insights || mockAIInsights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return mockAIInsights;
  }
}

export async function chatWithAI(
  question: string,
  portfolioData: PortfolioData,
  historicalData: PortfolioData[],
  conversationHistory: ChatMessage[]
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        portfolioData,
        historicalData,
        conversationHistory: conversationHistory.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    return {
      answer: result.answer || "I couldn't generate a response. Please try again.",
      suggestions: result.suggestions || [],
      chart: result.chart || undefined,
      ctas: result.ctas || undefined,
    };
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return {
      answer: "I'm sorry, I encountered an error processing your request. Please try again.",
      suggestions: [
        'What is the current delinquency rate?',
        'How are collections trending?',
        'What loans need attention?',
      ],
      chart: undefined,
      ctas: undefined,
    };
  }
}

export async function generateReportData(
  portfolioData: PortfolioData,
  historicalData: PortfolioData[],
  reportType: ReportType
): Promise<ReportData> {
  try {
    const response = await fetch(`${API_BASE}/ai/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioData,
        historicalData,
        reportType,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      title: `Portfolio Report - ${portfolioData.month} ${portfolioData.year}`,
      generatedAt: new Date().toISOString(),
      executiveSummary: 'Unable to generate report. Please try again.',
      sections: [],
      recommendations: [],
    };
  }
}

export async function chatWithAgent(
  message: string,
  threadId?: string,
  options?: { interactive?: boolean }
): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        threadId,
        interactive: options?.interactive ?? false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let serverMessage = `Agent request failed (${response.status})`;
      try {
        const errorData = JSON.parse(text);
        serverMessage = errorData.message || errorData.error || serverMessage;
      } catch {
        if (text.length < 200 && !text.trimStart().startsWith('<')) {
          serverMessage = text || serverMessage;
        } else if (response.status === 404 || response.status === 502) {
          serverMessage = 'Backend not reachable. Run "npm run server" in a separate terminal (port 3000).';
        }
      }
      throw new Error(serverMessage);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error chatting with agent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isNetworkError =
      errorMessage.includes('fetch') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('JSON.parse');
    const suggestion = isNetworkError
      ? ' Make sure the backend is running: run "npm run server" in a separate terminal (port 3000).'
      : '';
    return {
      message: `I couldn't complete your workflow request. ${errorMessage}.${suggestion}`,
      threadId: threadId || '',
      actions: [],
    };
  }
}

export async function automateWorkflow(
  loanId: string,
  action: 'print_and_notify' | 'print_only' | 'notify_only' = 'print_and_notify'
): Promise<AgentResponse> {
  const prompts = {
    print_and_notify: `Print all available checks for loan ${loanId} and send the lender notification with default options.`,
    print_only: `Print all available checks for loan ${loanId}.`,
    notify_only: `Send a lender notification for loan ${loanId} with default options.`,
  };

  const useInteractive = action === 'print_and_notify';
  return chatWithAgent(prompts[action], undefined, { interactive: useInteractive });
}

export async function continueAgentFlow(payload: {
  threadId: string;
  runId: string;
  resumeAction: 'selectChecks' | 'confirmPrint' | 'lenderNotify';
  selectedCheckIds?: string[];
  notificationOptions?: {
    transmissionType?: string;
    fromDate?: string;
    toDate?: string;
    envelopeSize?: string;
    replaceBorrowerName?: boolean;
    displayLateCharges?: boolean;
  };
}): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/agent/continue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || err.error || 'Continue failed');
  }

  return response.json();
}

export async function resetWorkflowState(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/workflow/reset`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error resetting workflow state:', error);
    return false;
  }
}
