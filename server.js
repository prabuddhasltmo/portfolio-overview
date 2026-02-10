import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { AIProjectClient } from '@azure/ai-projects';

/** Get Azure credential from env (service principal) or fall back to DefaultAzureCredential (az login). */
function getAzureCredential() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  if (tenantId && clientId && clientSecret) {
    return new ClientSecretCredential(tenantId, clientId, clientSecret);
  }
  return new DefaultAzureCredential();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const DATA_DIR = join(__dirname, 'data');
let currentScenario = 'trending-up';

// Mock checks data for workflow automation (single source of truth, mirrors src/data/mockData.ts)
const MOCK_CHECKS = [
  {
    id: 'CHK-001',
    ach: true,
    notes: false,
    payeeAccount: 'LENDER-A',
    payeeName: 'GREYSTONE LLC.',
    checkReleaseDate: '2025-09-19',
    payAmount: -1097.45,
    paymentDueDate: '2025-12-01',
    paymentReceived: '2025-09-18',
    payStatus: 'Print',
    loanAccount: 'B001000',
  },
  {
    id: 'CHK-002',
    ach: true,
    notes: false,
    payeeAccount: 'LENDER-A',
    payeeName: 'GREYSTONE LLC.',
    checkReleaseDate: '2025-09-22',
    payAmount: 409.4,
    paymentDueDate: '2025-11-01',
    paymentReceived: '2025-09-18',
    payStatus: 'Print',
    loanAccount: 'B001000',
  },
  {
    id: 'CHK-003',
    ach: true,
    notes: true,
    payeeAccount: 'LENDER-A',
    payeeName: 'GREYSTONE LLC.',
    checkReleaseDate: '2025-09-22',
    payAmount: -1506.85,
    paymentDueDate: '2025-11-01',
    paymentReceived: '2025-09-18',
    payStatus: 'Print',
    loanAccount: 'B001000',
  },
  {
    id: 'CHK-004',
    ach: false,
    notes: false,
    payeeAccount: 'LENDER-B',
    payeeName: 'Paulithereum Inc.',
    checkReleaseDate: '2025-10-09',
    payAmount: 1097.94,
    paymentDueDate: '2025-11-01',
    paymentReceived: '2025-09-29',
    payStatus: 'Print',
    loanAccount: 'LN-2024-001',
  },
  {
    id: 'CHK-005',
    ach: false,
    notes: false,
    payeeAccount: 'LENDER-B',
    payeeName: 'Paulithereum Inc.',
    checkReleaseDate: '2025-10-09',
    payAmount: -1097.94,
    paymentDueDate: '2025-11-01',
    paymentReceived: '2025-09-29',
    payStatus: 'Print',
    loanAccount: 'LN-2024-001',
  },
  {
    id: 'CHK-006',
    ach: true,
    notes: true,
    payeeAccount: 'LENDER-A',
    payeeName: 'GREYSTONE LLC.',
    checkReleaseDate: '2025-10-24',
    payAmount: 71.43,
    paymentDueDate: '2025-10-01',
    paymentReceived: '2025-10-14',
    payStatus: 'Print',
    loanAccount: 'LN-2024-002',
  },
  {
    id: 'CHK-007',
    ach: true,
    notes: false,
    payeeAccount: 'LENDER-A',
    payeeName: 'GREYSTONE LLC.',
    checkReleaseDate: '2025-10-24',
    payAmount: 3191.96,
    paymentDueDate: '2025-11-01',
    paymentReceived: '2025-10-14',
    payStatus: 'Print',
    loanAccount: 'LN-2024-003',
  },
  {
    id: 'CHK-008',
    ach: true,
    notes: false,
    payeeAccount: 'LENDER-A',
    payeeName: 'GREYSTONE LLC.',
    checkReleaseDate: '2025-10-30',
    payAmount: 6191.96,
    paymentDueDate: '2025-12-01',
    paymentReceived: '2025-10-20',
    payStatus: 'Print',
    loanAccount: 'LN-2024-004',
  },
  {
    id: 'CHK-009',
    ach: true,
    notes: false,
    payeeAccount: 'LENDER-A',
    payeeName: 'GREYSTONE LLC.',
    checkReleaseDate: '2025-11-24',
    payAmount: 1392.76,
    paymentDueDate: '2026-01-01',
    paymentReceived: '2025-11-14',
    payStatus: 'Print',
    loanAccount: 'LN-2024-005',
  },
];

/** Returns a copy of the mock checks array. */
const loadMockChecks = () => [...MOCK_CHECKS];

// In-memory store for printed checks and notifications (for demo purposes)
const workflowState = {
  printedChecks: new Set(),
  notifications: [],
};

const loadScenario = (name) => {
  const filePath = join(DATA_DIR, `${name}.json`);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

const listScenarios = () => {
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const name = f.replace('.json', '');
    const data = loadScenario(name);
    return {
      id: name,
      name: data.name,
      description: data.description,
      active: name === currentScenario,
    };
  });
};

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio AI API',
      version: '1.0.0',
      description: 'API for AI-powered portfolio insights',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./server.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioData:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           example: "January"
 *         year:
 *           type: number
 *           example: 2024
 *         totalLoans:
 *           type: number
 *           example: 850
 *         activeLoans:
 *           type: number
 *           example: 742
 *         principalBalance:
 *           type: number
 *           example: 125000000
 *         cashFlow:
 *           type: object
 *           properties:
 *             moneyIn:
 *               type: number
 *               example: 2500000
 *             moneyInChange:
 *               type: number
 *               example: 5.2
 *         delinquent:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 45
 *             percentage:
 *               type: number
 *               example: 6.1
 *             breakdown:
 *               type: object
 *               properties:
 *                 thirtyDays:
 *                   type: number
 *                   example: 25
 *                 sixtyDays:
 *                   type: number
 *                   example: 12
 *                 ninetyPlusDays:
 *                   type: number
 *                   example: 8
 *     AIInsight:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [Performance, Delinquency, Risk, Opportunity]
 */

/**
 * @swagger
 * /api/ai/summary:
 *   post:
 *     summary: Generate AI summary of portfolio data with sentiment analysis
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current:
 *                 $ref: '#/components/schemas/PortfolioData'
 *               historical:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PortfolioData'
 *     responses:
 *       200:
 *         description: AI-generated summary with sentiment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                 sentiment:
 *                   type: string
 *                   enum: [good, neutral, bad]
 *                 keyTakeaway:
 *                   type: string
 *       500:
 *         description: Server error
 */
app.post('/api/ai/summary', async (req, res) => {
  const client = getClient();
  const { current: data, historical } = req.body;

  if (!client) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const historicalSummary = historical?.map(h => `
${h.month} ${h.year}:
- Active Loans: ${h.activeLoans}
- Principal Balance: $${h.principalBalance?.toLocaleString()}
- Collections: $${h.cashFlow?.moneyIn?.toLocaleString()} (${h.cashFlow?.moneyInChange > 0 ? '+' : ''}${h.cashFlow?.moneyInChange}%)
- Delinquency Rate: ${h.delinquent?.percentage}%`).join('\n') || 'No historical data available';

  const prompt = `You are a financial analyst assistant for a mortgage servicing company. Based on the following current and historical portfolio data, provide an analysis.

CURRENT PORTFOLIO DATA (${data.month} ${data.year}):
- Total Loans: ${data.totalLoans}
- Active Loans: ${data.activeLoans}
- Principal Balance: $${data.principalBalance?.toLocaleString()}
- Money In (Collections): $${data.cashFlow?.moneyIn?.toLocaleString()} (${data.cashFlow?.moneyInChange > 0 ? '+' : ''}${data.cashFlow?.moneyInChange}% vs last month)
- Delinquent Loans: ${data.delinquent?.total} (${data.delinquent?.percentage}%)
- 30 Days Past Due: ${data.delinquent?.breakdown?.thirtyDays}
- 60 Days Past Due: ${data.delinquent?.breakdown?.sixtyDays}
- 90+ Days Past Due: ${data.delinquent?.breakdown?.ninetyPlusDays}

HISTORICAL DATA (Past 3 Months):
${historicalSummary}

Respond with a JSON object containing exactly these three fields:
1. "summary": A concise 2-3 sentence summary of the current month's portfolio performance. Keep it factual and data-driven.
2. "sentiment": Compare current performance to the historical trend. Return EXACTLY one of: "good" (portfolio is doing better), "bad" (portfolio is doing worse), or "neutral" (no significant change).
3. "keyTakeaway": A single sentence highlighting the most important trend when comparing current vs historical data.

Return ONLY the JSON object, no other text or markdown.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    let content = response.choices[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(content);
    res.json({
      summary: parsed.summary || '',
      sentiment: parsed.sentiment || 'neutral',
      keyTakeaway: parsed.keyTakeaway || '',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ai/insights:
 *   post:
 *     summary: Generate AI insights from portfolio data
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioData'
 *     responses:
 *       200:
 *         description: AI-generated insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIInsight'
 *       500:
 *         description: Server error
 */
app.post('/api/ai/insights', async (req, res) => {
  const client = getClient();
  const data = req.body;

  if (!client) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const prompt = `You are a financial analyst assistant for a mortgage servicing company. Based on the following portfolio data, generate exactly 4 actionable insights.

Portfolio Data for ${data.month} ${data.year}:
- Total Loans: ${data.totalLoans}
- Active Loans: ${data.activeLoans}
- Principal Balance: $${data.principalBalance?.toLocaleString()}
- Money In (Collections): $${data.cashFlow?.moneyIn?.toLocaleString()}
- Delinquent Loans: ${data.delinquent?.total} (${data.delinquent?.percentage}%)

Return a JSON array with exactly 4 insights. Each insight must have:
- id: a unique string (1, 2, 3, 4)
- title: a short title (5-7 words)
- description: a 1-2 sentence explanation
- category: one of "Performance", "Delinquency", "Risk", or "Opportunity"

Return ONLY the JSON array, no other text.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    let content = response.choices[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const insights = JSON.parse(content);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI about portfolio data
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               portfolioData:
 *                 $ref: '#/components/schemas/PortfolioData'
 *               historicalData:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PortfolioData'
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response with suggestions
 *       500:
 *         description: Server error
 */
app.post('/api/ai/chat', async (req, res) => {
  const client = getClient();
  const { question, portfolioData, historicalData, conversationHistory = [] } = req.body;

  if (!client) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const historicalSummary = historicalData?.map(h => `
${h.month} ${h.year}:
- Active Loans: ${h.activeLoans}
- Principal Balance: $${h.principalBalance?.toLocaleString()}
- Collections: $${h.cashFlow?.moneyIn?.toLocaleString()} (${h.cashFlow?.moneyInChange > 0 ? '+' : ''}${h.cashFlow?.moneyInChange}%)
- Disbursements (Money Out): $${h.cashFlow?.moneyOut?.toLocaleString()} (${h.cashFlow?.moneyOutChange != null ? (h.cashFlow.moneyOutChange > 0 ? '+' : '') + h.cashFlow.moneyOutChange + '%' : 'N/A'})
- Delinquency Rate: ${h.delinquent?.percentage}%`).join('\n') || 'No historical data available';

  const systemPrompt = `You are a financial analyst assistant for a mortgage servicing company. You have access to the following portfolio data:

CURRENT PORTFOLIO DATA (${portfolioData.month} ${portfolioData.year}):
- Total Loans: ${portfolioData.totalLoans}
- Active Loans: ${portfolioData.activeLoans}
- Principal Balance: $${portfolioData.principalBalance?.toLocaleString()}
- Unpaid Interest: $${portfolioData.unpaidInterest?.toLocaleString()}
- Total Late Charges: $${portfolioData.totalLateCharges?.toLocaleString()}
- Money In (Collections): $${portfolioData.cashFlow?.moneyIn?.toLocaleString()} (${portfolioData.cashFlow?.moneyInChange > 0 ? '+' : ''}${portfolioData.cashFlow?.moneyInChange}% vs last month)
- Money Out (Disbursements): $${portfolioData.cashFlow?.moneyOut?.toLocaleString()} (${portfolioData.cashFlow?.moneyOutChange != null ? (portfolioData.cashFlow.moneyOutChange > 0 ? '+' : '') + portfolioData.cashFlow.moneyOutChange + '%' : 'N/A'} vs last month)
- Net Cash Flow: $${portfolioData.cashFlow?.netCashFlow?.toLocaleString()}
- Delinquent Loans: ${portfolioData.delinquent?.total} (${portfolioData.delinquent?.percentage}%)
- 30 Days Past Due: ${portfolioData.delinquent?.breakdown?.thirtyDays}
- 60 Days Past Due: ${portfolioData.delinquent?.breakdown?.sixtyDays}
- 90+ Days Past Due: ${portfolioData.delinquent?.breakdown?.ninetyPlusDays}
- Collections Trend: ${portfolioData.trends?.collections > 0 ? '+' : ''}${portfolioData.trends?.collections}%
- Disbursements Trend: ${portfolioData.trends?.disbursements != null ? (portfolioData.trends.disbursements > 0 ? '+' : '') + portfolioData.trends.disbursements + '%' : 'N/A'}
- Delinquency Trend: ${portfolioData.trends?.delinquency > 0 ? '+' : ''}${portfolioData.trends?.delinquency}%
- New Loans This Month: ${portfolioData.trends?.newLoans}
- Loans Paid Off: ${portfolioData.trends?.paidOff}

ACTION ITEMS (specific delinquent loans to follow up—use these when the user asks who to message or which borrowers are delinquent):
${(portfolioData.actionItems && portfolioData.actionItems.length > 0)
  ? portfolioData.actionItems.map(a => `- Loan ${a.id}: ${a.borrower}, $${(a.amount || 0).toLocaleString()}, ${a.daysPastDue} days past due, priority ${a.priority}`).join('\n')
  : 'None listed.'}

HISTORICAL DATA (Past 3 Months):
${historicalSummary}

Answer questions factually and cite specific numbers from the data. When asked who to message or which borrowers are delinquent, list the specific loans and borrowers from ACTION ITEMS above. Be concise but thorough.

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

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: `${question}

After answering, suggest 2-3 follow-up questions the user might want to ask. Format your response as JSON with these fields:
- "answer": Your detailed answer to the question
- "suggestions": An array of 2-3 suggested follow-up questions
- "chart": (optional) If a chart/graph was requested, include the chart object as described in CHART INSTRUCTIONS. Set to null if no chart is needed.
- "ctas": (optional) An array of contextual action buttons as described in CTA INSTRUCTIONS. Set to [] if no actions are relevant.

Return ONLY the JSON object, no other text or markdown.` }
  ];

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages,
    });

    let content = response.choices[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(content);
    res.json({
      answer: parsed.answer || '',
      suggestions: parsed.suggestions || [],
      chart: parsed.chart || null,
      ctas: parsed.ctas || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ai/report:
 *   post:
 *     summary: Generate a structured AI report
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               portfolioData:
 *                 $ref: '#/components/schemas/PortfolioData'
 *               historicalData:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PortfolioData'
 *               reportType:
 *                 type: string
 *                 enum: [executive, detailed, recommendations]
 *     responses:
 *       200:
 *         description: Structured report data
 *       500:
 *         description: Server error
 */
app.post('/api/ai/report', async (req, res) => {
  const client = getClient();
  const { portfolioData, historicalData, reportType = 'executive' } = req.body;

  if (!client) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const historicalSummary = historicalData?.map(h => `
${h.month} ${h.year}:
- Active Loans: ${h.activeLoans}, Principal: $${h.principalBalance?.toLocaleString()}
- Collections: $${h.cashFlow?.moneyIn?.toLocaleString()} (${h.cashFlow?.moneyInChange > 0 ? '+' : ''}${h.cashFlow?.moneyInChange}%)
- Delinquency: ${h.delinquent?.percentage}%`).join('\n') || 'No historical data';

  const reportTypeInstructions = {
    executive: 'Focus on high-level metrics, trends, and key takeaways for executives. Keep sections concise.',
    detailed: 'Provide comprehensive analysis of all metrics with detailed explanations and comparisons to historical data.',
    recommendations: 'Focus primarily on actionable recommendations based on the data, with supporting analysis.',
  };

  const prompt = `Generate a professional portfolio report based on this data:

CURRENT PORTFOLIO (${portfolioData.month} ${portfolioData.year}):
- Total Loans: ${portfolioData.totalLoans}, Active: ${portfolioData.activeLoans}
- Principal Balance: $${portfolioData.principalBalance?.toLocaleString()}
- Unpaid Interest: $${portfolioData.unpaidInterest?.toLocaleString()}
- Late Charges: $${portfolioData.totalLateCharges?.toLocaleString()}
- Collections: $${portfolioData.cashFlow?.moneyIn?.toLocaleString()} (${portfolioData.cashFlow?.moneyInChange > 0 ? '+' : ''}${portfolioData.cashFlow?.moneyInChange}%)
- Disbursements: $${portfolioData.cashFlow?.moneyOut?.toLocaleString()}
- Net Cash Flow: $${portfolioData.cashFlow?.netCashFlow?.toLocaleString()}
- Delinquent: ${portfolioData.delinquent?.total} loans (${portfolioData.delinquent?.percentage}%)
  - 30 days: ${portfolioData.delinquent?.breakdown?.thirtyDays}
  - 60 days: ${portfolioData.delinquent?.breakdown?.sixtyDays}
  - 90+ days: ${portfolioData.delinquent?.breakdown?.ninetyPlusDays}
- Trends: Collections ${portfolioData.trends?.collections > 0 ? '+' : ''}${portfolioData.trends?.collections}%, Delinquency ${portfolioData.trends?.delinquency > 0 ? '+' : ''}${portfolioData.trends?.delinquency}%

HISTORICAL DATA:
${historicalSummary}

Report Type: ${reportType.toUpperCase()}
Instructions: ${reportTypeInstructions[reportType]}

Return a JSON object with:
- "title": Report title (e.g., "Portfolio Performance Report - January 2026")
- "executiveSummary": 2-3 paragraph summary of portfolio health and key findings
- "sections": Array of 3-4 sections, each with:
  - "title": Section title
  - "content": 1-2 paragraphs of analysis
  - "metrics": Array of key metrics (optional), each with "label", "value", and optional "change"
- "recommendations": Array of 3-5 recommendations, each with:
  - "priority": 1 (high), 2 (medium), or 3 (low)
  - "title": Short recommendation title
  - "description": 1-2 sentence explanation

Return ONLY the JSON object.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    let content = response.choices[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(content);
    res.json({
      title: parsed.title || `Portfolio Report - ${portfolioData.month} ${portfolioData.year}`,
      generatedAt: new Date().toISOString(),
      executiveSummary: parsed.executiveSummary || '',
      sections: parsed.sections || [],
      recommendations: parsed.recommendations || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', openaiConfigured: !!getClient() });
});

/**
 * @swagger
 * /api/scenarios:
 *   get:
 *     summary: List available demo scenarios
 *     tags: [Scenarios]
 *     responses:
 *       200:
 *         description: List of scenarios
 */
app.get('/api/scenarios', (_req, res) => {
  res.json({ scenarios: listScenarios() });
});

/**
 * @swagger
 * /api/scenarios/current:
 *   get:
 *     summary: Get current scenario name
 *     tags: [Scenarios]
 *     responses:
 *       200:
 *         description: Current scenario
 */
app.get('/api/scenarios/current', (_req, res) => {
  res.json({ scenario: currentScenario });
});

/**
 * @swagger
 * /api/scenarios/{id}:
 *   post:
 *     summary: Switch to a different scenario
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scenario ID (e.g., trending-up, trending-neutral, trending-down)
 *     responses:
 *       200:
 *         description: Scenario switched successfully
 *       404:
 *         description: Scenario not found
 */
app.post('/api/scenarios/:id', (req, res) => {
  const { id } = req.params;
  try {
    loadScenario(id);
    currentScenario = id;
    res.json({ success: true, scenario: currentScenario });
  } catch {
    res.status(404).json({ error: 'Scenario not found' });
  }
});

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get portfolio data for the current scenario
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Current and historical portfolio data
 */
app.get('/api/portfolio', (_req, res) => {
  try {
    const data = loadScenario(currentScenario);
    res.json({
      scenario: currentScenario,
      name: data.name,
      sentiment: data.sentiment || 'neutral',
      current: data.current,
      historical: data.historical,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const loadMessages = () => {
  try {
    const filePath = join(DATA_DIR, 'messages.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content).messages || [];
  } catch {
    return [];
  }
};

let messagesStore = loadMessages();
let messageIdCounter = 100;

/**
 * @swagger
 * /api/ai/draft-email:
 *   post:
 *     summary: Generate AI-drafted email content
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loanId:
 *                 type: string
 *               borrowerName:
 *                 type: string
 *               amount:
 *                 type: number
 *               daysPastDue:
 *                 type: number
 *               emailType:
 *                 type: string
 *                 enum: [collection_followup, check_in, refinance_offer, general, checks_due, pending_billing, payment_adjustment]
 *     responses:
 *       200:
 *         description: AI-generated email draft
 */
app.post('/api/ai/draft-email', async (req, res) => {
  const client = getClient();
  const { loanId, borrowerName, amount, daysPastDue, emailType = 'general' } = req.body;

  if (!client) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const prompts = {
    collection_followup: `You are a professional loan servicer. Draft a compassionate but professional collection follow-up email. Be empathetic, offer to discuss payment options, and maintain a positive, helpful tone. Do not be threatening or aggressive.`,
    check_in: `You are a professional loan servicer. Draft a brief, friendly check-in email to maintain the borrower relationship. Keep it warm and professional.`,
    refinance_offer: `You are a professional loan servicer. Draft a professional email offering refinancing options. Highlight potential benefits based on good payment history.`,
    general: `You are a professional loan servicer. Draft a professional email regarding the borrower's loan account.`,
    checks_due: `You are a professional loan servicer. Draft a concise email about a check/disbursement due related to the borrower's loan. Explain what the check is for, any required approvals, and next steps. Keep the tone clear and professional.`,
    pending_billing: `You are a professional loan servicer. Draft a concise email about pending billing or payoff processing for the borrower's loan. Ask for any missing information and provide a clear next step.`,
    payment_adjustment: `You are a professional loan servicer. Draft a professional notice about a payment adjustment (e.g., escrow analysis or rate change). Explain the reason, effective date, and the updated payment amount. Offer to discuss questions.`,
  };

  const contextInfo = [];
  if (borrowerName) contextInfo.push(`Borrower Name: ${borrowerName}`);
  if (loanId) contextInfo.push(`Loan ID: ${loanId}`);
  if (amount) contextInfo.push(`Outstanding Balance: $${amount.toLocaleString()}`);
  if (daysPastDue) contextInfo.push(`Days Past Due: ${daysPastDue}`);

  const prompt = `${prompts[emailType] || prompts.general}

Context:
${contextInfo.join('\n')}

Generate a personalized email. Return a JSON object with:
- "subject": A professional email subject line
- "body": The email body (use \\n for line breaks between paragraphs)

Keep the email concise (3-4 paragraphs max). Be professional but warm.
Return ONLY the JSON object, no markdown or extra text.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    let content = response.choices[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(content);
    res.json({
      subject: parsed.subject || `Regarding Your Loan ${loanId || ''}`.trim(),
      body: parsed.body || '',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/draft-message', async (req, res) => {
  const client = getClient();
  const { loanId, borrowerName, amount, daysPastDue, emailType = 'general' } = req.body;

  if (!client) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const contextInfo = [];
  if (borrowerName) contextInfo.push(`Borrower Name: ${borrowerName}`);
  if (loanId) contextInfo.push(`Loan ID: ${loanId}`);
  if (amount) contextInfo.push(`Outstanding Balance: $${amount.toLocaleString()}`);
  if (daysPastDue) contextInfo.push(`Days Past Due: ${daysPastDue}`);

  const prompts = {
    collection_followup: `You are a professional loan servicer. Draft a SHORT, conversational payment follow-up message. Be empathetic and offer to discuss payment options.`,
    check_in: `You are a professional loan servicer. Draft a SHORT, friendly check-in message to maintain the borrower relationship.`,
    refinance_offer: `You are a professional loan servicer. Draft a SHORT message offering refinancing options and invite the borrower to learn more.`,
    general: `You are a professional loan servicer. Draft a SHORT, conversational message regarding the borrower's loan account.`,
    checks_due: `You are a professional loan servicer. Draft a SHORT message about a check/disbursement due. Explain the purpose and next step.`,
    pending_billing: `You are a professional loan servicer. Draft a SHORT message about pending billing or payoff processing. Ask for any needed information.`,
    payment_adjustment: `You are a professional loan servicer. Draft a SHORT message about a payment adjustment. Mention the change and invite questions.`,
  };

  const prompt = `${prompts[emailType] || prompts.general}

Context:
${contextInfo.join('\n')}

Return a JSON object with:
- "subject": A very short subject line (few words, e.g. "Quick check-in" or "Regarding loan LN-2024-001")
- "body": A short message body: 1-3 sentences max. Conversational tone. Offer to help or ask a quick question. Use \\n for line breaks if needed.

Keep it concise—portal messages should be brief. Return ONLY the JSON object, no markdown.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    let content = response.choices[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(content);
    res.json({
      subject: parsed.subject || `Re: Loan ${loanId || ''}`.trim(),
      body: parsed.body || '',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get messages by folder
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           enum: [inbox, sent]
 *         description: Message folder to retrieve
 *     responses:
 *       200:
 *         description: List of messages
 */
app.get('/api/messages', (req, res) => {
  const folder = req.query.folder || 'inbox';
  const filtered = messagesStore.filter(m => m.folder === folder);
  const sorted = filtered.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  res.json({ messages: sorted });
});

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Unread count
 */
app.get('/api/messages/unread-count', (_req, res) => {
  const count = messagesStore.filter(m => m.folder === 'inbox' && !m.isRead).length;
  res.json({ count });
});

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get a single message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message details
 *       404:
 *         description: Message not found
 */
app.get('/api/messages/:id', (req, res) => {
  const message = messagesStore.find(m => m.id === req.params.id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  res.json(message);
});

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               from:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *               priority:
 *                 type: number
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
app.post('/api/messages/send', (req, res) => {
  const { to, from, subject, body, priority = 0 } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }

  const newMessage = {
    id: `msg-${Date.now()}-${++messageIdCounter}`,
    from: from || { name: 'Portfolio Services', email: 'services@lender.com' },
    to,
    subject,
    body,
    priority,
    sentAt: new Date().toISOString(),
    isRead: true,
    folder: 'sent',
  };

  messagesStore.push(newMessage);
  res.json(newMessage);
});

/**
 * @swagger
 * /api/messages/{id}/read:
 *   post:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read
 *       404:
 *         description: Message not found
 */
app.post('/api/messages/:id/read', (req, res) => {
  const message = messagesStore.find(m => m.id === req.params.id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  message.isRead = true;
  res.json({ success: true });
});

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 *       404:
 *         description: Message not found
 */
app.delete('/api/messages/:id', (req, res) => {
  const index = messagesStore.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  messagesStore.splice(index, 1);
  res.json({ success: true });
});

// ============================================
// WORKFLOW AUTOMATION ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/workflow/checks/{loanId}:
 *   get:
 *     summary: Get checks available for printing for a loan
 *     tags: [Workflow]
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of checks for the loan
 */
app.get('/api/workflow/checks/:loanId', (req, res) => {
  const { loanId } = req.params;
  const allChecks = loadMockChecks();
  
  // Filter checks for this loan, or return all if loanId matches any or is generic
  let checks = allChecks.filter(c => 
    c.loanAccount === loanId || 
    c.loanAccount.toLowerCase().includes(loanId.toLowerCase()) ||
    loanId.toLowerCase().includes(c.loanAccount.toLowerCase())
  );
  
  // If no exact match, return all checks (for demo flexibility)
  if (checks.length === 0) {
    checks = allChecks;
  }

  // Filter out already printed checks
  checks = checks.filter(c => !workflowState.printedChecks.has(c.id));

  const totalAmount = checks.reduce((sum, c) => sum + c.payAmount, 0);

  res.json({
    loanId,
    checks,
    count: checks.length,
    totalAmount,
  });
});

/**
 * @swagger
 * /api/workflow/checks/print:
 *   post:
 *     summary: Print selected checks
 *     tags: [Workflow]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loanId:
 *                 type: string
 *               checkIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Print confirmation
 */
app.post('/api/workflow/checks/print', (req, res) => {
  const { loanId, checkIds } = req.body;
  const allChecks = loadMockChecks();

  // Get checks for this loan
  let checks = allChecks.filter(c => 
    c.loanAccount === loanId || 
    c.loanAccount.toLowerCase().includes(loanId.toLowerCase()) ||
    loanId.toLowerCase().includes(c.loanAccount.toLowerCase())
  );

  if (checks.length === 0) {
    checks = allChecks;
  }

  // Filter to only requested checkIds if provided
  if (checkIds && checkIds.length > 0) {
    checks = checks.filter(c => checkIds.includes(c.id));
  }

  // Filter out already printed
  checks = checks.filter(c => !workflowState.printedChecks.has(c.id));

  // Mark as printed
  checks.forEach(c => workflowState.printedChecks.add(c.id));

  const totalAmount = checks.reduce((sum, c) => sum + c.payAmount, 0);

  res.json({
    success: true,
    loanId,
    printedCount: checks.length,
    totalAmount,
    checkIds: checks.map(c => c.id),
    message: `Successfully printed ${checks.length} check(s) totaling $${Math.abs(totalAmount).toLocaleString()}`,
  });
});

/**
 * @swagger
 * /api/workflow/lender-notification:
 *   post:
 *     summary: Send lender notification of electronic deposit
 *     tags: [Workflow]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loanId:
 *                 type: string
 *               transmissionType:
 *                 type: string
 *               fromDate:
 *                 type: string
 *               toDate:
 *                 type: string
 *               envelopeSize:
 *                 type: string
 *               replaceBorrowerName:
 *                 type: boolean
 *               displayLateCharges:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification confirmation
 */
app.post('/api/workflow/lender-notification', (req, res) => {
  const {
    loanId,
    transmissionType = 'transmission_date',
    fromDate = new Date().toISOString().split('T')[0],
    toDate = new Date().toISOString().split('T')[0],
    envelopeSize = 'standard',
    replaceBorrowerName = false,
    displayLateCharges = false,
  } = req.body;

  const notification = {
    id: `NOTIF-${Date.now()}`,
    loanId,
    transmissionType,
    fromDate,
    toDate,
    envelopeSize,
    replaceBorrowerName,
    displayLateCharges,
    createdAt: new Date().toISOString(),
    status: 'sent',
  };

  workflowState.notifications.push(notification);

  res.json({
    success: true,
    notification,
    message: `Lender notification sent successfully for loan ${loanId}`,
  });
});

/**
 * @swagger
 * /api/workflow/reset:
 *   post:
 *     summary: Reset workflow state (for demo purposes)
 *     tags: [Workflow]
 *     responses:
 *       200:
 *         description: Workflow state reset
 */
app.post('/api/workflow/reset', (_req, res) => {
  workflowState.printedChecks.clear();
  workflowState.notifications = [];
  res.json({ success: true, message: 'Workflow state reset' });
});

// ============================================
// AGENT ORCHESTRATION ENDPOINT
// ============================================

// Tool execution functions
const executeAgentTool = async (toolName, args) => {
  const baseUrl = `http://localhost:${PORT}`;

  switch (toolName) {
    case 'get_checks_for_loan': {
      const response = await fetch(`${baseUrl}/api/workflow/checks/${args.loanId}`);
      return await response.json();
    }
    case 'print_checks': {
      const response = await fetch(`${baseUrl}/api/workflow/checks/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      return await response.json();
    }
    case 'send_lender_notification': {
      const response = await fetch(`${baseUrl}/api/workflow/lender-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      return await response.json();
    }
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
};

// Pending agent runs (pause for user input). Key: runId
const pendingAgentRuns = new Map();

/**
 * @swagger
 * /api/agent/status:
 *   get:
 *     summary: Check agent workflow setup (backend running, which mode)
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Agent status
 */
app.get('/api/agent/status', (_req, res) => {
  const endpoint = process.env.AZURE_AI_PROJECT_ENDPOINT || process.env.AZURE_EXISTING_AIPROJECT_ENDPOINT;
  const agentId = process.env.AZURE_AI_AGENT_ID || process.env.AZURE_EXISTING_AGENT_ID;
  console.log('[DEBUG] /api/agent/status read - endpoint:', endpoint, 'agentId:', agentId);
  const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const mode = endpoint && agentId ? 'azure' : openaiKey ? 'openai' : 'none';
  const useServicePrincipal = !!(process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET);
  res.json({
    status: 'ok',
    mode,
    message: mode === 'azure'
      ? (useServicePrincipal
          ? 'Azure agent configured; using service principal from .env (no az login required).'
          : 'Azure agent configured; ensure you are logged in (az login) or set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET.')
      : mode === 'openai'
        ? 'Using OpenAI fallback for workflow. Backend and workflow endpoints are ready.'
        : 'No AI provider configured. Set OPENAI_API_KEY for OpenAI fallback, or AZURE_AI_PROJECT_ENDPOINT + AZURE_AI_AGENT_ID for Azure.',
  });
});

/**
 * @swagger
 * /api/agent/chat:
 *   post:
 *     summary: Chat with the AI agent for workflow automation
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               threadId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent response with actions taken
 */
app.post('/api/agent/chat', async (req, res) => {
  const { message, threadId, interactive } = req.body;

  const endpoint = process.env.AZURE_AI_PROJECT_ENDPOINT || process.env.AZURE_EXISTING_AIPROJECT_ENDPOINT;
  const agentId = process.env.AZURE_AI_AGENT_ID || process.env.AZURE_EXISTING_AGENT_ID;

  console.log('[DEBUG] agent/chat - interactive:', interactive, 'azure:', !!(endpoint && agentId));
  
  if (!endpoint || !agentId) {
    // Fallback to OpenAI-based simulation when Foundry is not configured
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: 'No AI provider configured' });
    }

    // Simulate agent behavior using OpenAI with function calling
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_checks_for_loan',
          description: 'Get all checks available for printing for a given loan',
          parameters: {
            type: 'object',
            properties: {
              loanId: { type: 'string', description: 'The loan account ID' },
            },
            required: ['loanId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'print_checks',
          description: 'Submit selected checks for printing',
          parameters: {
            type: 'object',
            properties: {
              loanId: { type: 'string', description: 'The loan account ID' },
              checkIds: { type: 'array', items: { type: 'string' }, description: 'Check IDs to print' },
            },
            required: ['loanId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'send_lender_notification',
          description: 'Send lender notification of electronic deposit',
          parameters: {
            type: 'object',
            properties: {
              loanId: { type: 'string', description: 'The loan account ID' },
              transmissionType: { type: 'string' },
              fromDate: { type: 'string' },
              toDate: { type: 'string' },
              envelopeSize: { type: 'string' },
              replaceBorrowerName: { type: 'boolean' },
              displayLateCharges: { type: 'boolean' },
            },
            required: ['loanId'],
          },
        },
      },
    ];

    const systemPrompt = `You are a workflow automation assistant for a mortgage servicing company. You help users automate check printing and lender notification workflows.

When a user asks to print checks or automate the workflow for a loan:
1. First call get_checks_for_loan to see available checks
2. Call print_checks to print them
3. Call send_lender_notification to notify the lender

Be concise. After completing actions, summarize what you did with specific numbers.`;

    try {
      const actions = [];
      let messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ];

      // Run the agent loop
      let continueLoop = true;
      while (continueLoop) {
        const response = await client.chat.completions.create({
          model: 'gpt-4o',
          messages,
          tools,
          tool_choice: 'auto',
        });

        const assistantMessage = response.choices[0].message;
        messages.push(assistantMessage);

        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          const firstCall = assistantMessage.tool_calls[0];
          const toolName = firstCall.function.name;
          const toolArgs = JSON.parse(firstCall.function.arguments || '{}');

          if (interactive && toolName === 'get_checks_for_loan') {
            const checksResult = await executeAgentTool(toolName, toolArgs);
            const checks = checksResult?.checks ?? [];
            const synthRunId = `openai-${Date.now()}`;
            const synthThreadId = threadId || `thread-${Date.now()}`;
            pendingAgentRuns.set(synthRunId, {
              threadId: synthThreadId,
              runId: synthRunId,
              mode: 'openai',
              loanId: toolArgs.loanId,
              messages: [...messages, assistantMessage],
              firstToolCall: firstCall,
              pendingToolCalls: assistantMessage.tool_calls,
              toolOutputForGetChecks: {
                ...checksResult,
                userSelectedCheckIds: null,
              },
              actions: [{ tool: toolName, args: toolArgs, result: checksResult }],
            });
            console.log('[DEBUG] OpenAI interactive - returning selectChecks, checks:', checks.length);
            return res.json({
              status: 'awaiting_user',
              uiAction: 'selectChecks',
              loanId: toolArgs.loanId,
              checks,
              threadId: synthThreadId,
              runId: synthRunId,
              actions: [{ tool: toolName, args: toolArgs, result: checksResult }],
            });
          }

          for (const toolCall of assistantMessage.tool_calls) {
            const tn = toolCall.function.name;
            const ta = JSON.parse(toolCall.function.arguments || '{}');
            const toolResult = await executeAgentTool(tn, ta);
            actions.push({ tool: tn, args: ta, result: toolResult });
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });
          }
        } else {
          // No more tool calls, we have the final response
          continueLoop = false;
          
          return res.json({
            message: assistantMessage.content,
            threadId: threadId || `thread-${Date.now()}`,
            actions,
          });
        }
      }
    } catch (error) {
      console.error('Agent error:', error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    // Use Azure AI Foundry Agent (endpoint + agent ID; auth from env or DefaultAzureCredential)
    try {
      const credential = getAzureCredential();
      const projectClient = AIProjectClient.fromEndpoint(endpoint, credential);
      const agentsClient = projectClient.agents;

      let resolvedThreadId = threadId;
      if (!resolvedThreadId) {
        const thread = await agentsClient.threads.create();
        resolvedThreadId = thread.id;
      }

      await agentsClient.messages.create(resolvedThreadId, 'user', message);

      let run = await agentsClient.runs.create(resolvedThreadId, agentId);
      const actions = [];

      const pollIntervalMs = 1000;
      const maxWaitMs = 120000;
      const start = Date.now();

      while (Date.now() - start < maxWaitMs) {
        if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
          break;
        }

        if (run.status === 'requires_action') {
          const action = run.requiredAction;
          if (action && action.type === 'submit_tool_outputs' && action.submitToolOutputs?.toolCalls) {
            const toolCalls = action.submitToolOutputs.toolCalls;
            const firstCall = toolCalls.find((c) => c.type === 'function' && c.function);
            const name = firstCall?.function?.name;
            const args = firstCall ? JSON.parse(firstCall.function.arguments || '{}') : {};

            console.log('[DEBUG] Azure requires_action - tool:', name, 'interactive:', interactive);

            if (interactive && name === 'get_checks_for_loan') {
              const checksResult = await executeAgentTool(name, args);
              actions.push({ tool: name, args, result: checksResult });
              const checks = checksResult?.checks ?? [];
              pendingAgentRuns.set(run.id, {
                threadId: resolvedThreadId,
                runId: run.id,
                agentsClient,
                actions: [...actions],
                pendingToolCalls: toolCalls,
                resumeAction: 'selectChecks',
                loanId: args.loanId,
              });
              return res.json({
                status: 'awaiting_user',
                uiAction: 'selectChecks',
                loanId: args.loanId,
                checks,
                threadId: resolvedThreadId,
                runId: run.id,
                actions,
              });
            }
            if (interactive && name === 'print_checks') {
              const checks = args.checkIds ?? [];
              let totalAmount = 0;
              try {
                const cr = await executeAgentTool('get_checks_for_loan', { loanId: args.loanId });
                const byId = new Map((cr?.checks ?? []).map((c) => [c.id, c]));
                totalAmount = checks.reduce((s, id) => s + (byId.get(id)?.payAmount ?? 0), 0);
              } catch {
                totalAmount = 0;
              }
              pendingAgentRuns.set(run.id, {
                threadId: resolvedThreadId,
                runId: run.id,
                agentsClient,
                actions: [...actions],
                pendingToolCalls: toolCalls,
                resumeAction: 'confirmPrint',
                loanId: args.loanId,
                printCheckIds: checks,
              });
              return res.json({
                status: 'awaiting_user',
                uiAction: 'confirmPrint',
                loanId: args.loanId,
                selectedCount: checks.length,
                totalAmount,
                threadId: resolvedThreadId,
                runId: run.id,
                actions,
              });
            }
            if (interactive && name === 'send_lender_notification') {
              pendingAgentRuns.set(run.id, {
                threadId: resolvedThreadId,
                runId: run.id,
                agentsClient,
                actions: [...actions],
                pendingToolCalls: toolCalls,
                resumeAction: 'lenderNotify',
                loanId: args.loanId,
                defaultArgs: args,
              });
              return res.json({
                status: 'awaiting_user',
                uiAction: 'lenderNotify',
                loanId: args.loanId,
                threadId: resolvedThreadId,
                runId: run.id,
                actions,
              });
            }

            const toolOutputs = [];
            for (const toolCall of toolCalls) {
              if (toolCall.type === 'function' && toolCall.function) {
                const n = toolCall.function.name;
                const a = JSON.parse(toolCall.function.arguments || '{}');
                const result = await executeAgentTool(n, a);
                actions.push({ tool: n, args: a, result });
                toolOutputs.push({
                  toolCallId: toolCall.id,
                  output: typeof result === 'string' ? result : JSON.stringify(result),
                });
              }
            }
            run = await agentsClient.runs.submitToolOutputs(
              resolvedThreadId,
              run.id,
              toolOutputs
            );
          }
        } else {
          await new Promise((r) => setTimeout(r, pollIntervalMs));
          run = await agentsClient.runs.get(resolvedThreadId, run.id);
        }
      }

      if (run.status === 'failed' && run.lastError) {
        return res.status(500).json({
          error: run.lastError.code || 'run_failed',
          message: run.lastError.message || 'Agent run failed',
          threadId: resolvedThreadId,
          actions,
        });
      }

      const messagesIterator = agentsClient.messages.list(resolvedThreadId, { order: 'desc' });
      let lastAssistantContent = '';
      for await (const msg of messagesIterator) {
        if (msg.role === 'assistant' && msg.content) {
          const textPart = Array.isArray(msg.content)
            ? msg.content.find((c) => c.type === 'text')
            : null;
          if (textPart && textPart.text?.value) {
            lastAssistantContent = textPart.text.value;
            break;
          }
        }
      }

      return res.json({
        message: lastAssistantContent || 'Workflow completed.',
        threadId: resolvedThreadId,
        actions,
      });
    } catch (error) {
      console.error('Azure agent error:', error);
      return res.status(500).json({
        error: 'agent_error',
        message: error.message || 'Azure agent request failed',
        hint: 'Set AZURE_AI_PROJECT_ENDPOINT and AZURE_AI_AGENT_ID. For auth from .env (no az login), set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET (service principal).',
      });
    }
  }
});

const OPENAI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_checks_for_loan',
      description: 'Get all checks available for printing for a given loan',
      parameters: {
        type: 'object',
        properties: { loanId: { type: 'string', description: 'The loan account ID' } },
        required: ['loanId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'print_checks',
      description: 'Submit selected checks for printing',
      parameters: {
        type: 'object',
        properties: {
          loanId: { type: 'string' },
          checkIds: { type: 'array', items: { type: 'string' } },
        },
        required: ['loanId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_lender_notification',
      description: 'Send lender notification of electronic deposit',
      parameters: {
        type: 'object',
        properties: {
          loanId: { type: 'string' },
          transmissionType: { type: 'string' },
          fromDate: { type: 'string' },
          toDate: { type: 'string' },
          envelopeSize: { type: 'string' },
          replaceBorrowerName: { type: 'boolean' },
          displayLateCharges: { type: 'boolean' },
        },
        required: ['loanId'],
      },
    },
  },
];

async function handleOpenAIContinue(req, res, pending, { resumeAction, selectedCheckIds, notificationOptions }) {
  const client = getClient();
  if (!client) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  let { messages, actions: savedActions, firstToolCall, toolOutputForGetChecks } = pending;
  const loanId = pending.loanId || JSON.parse(firstToolCall?.function?.arguments || '{}').loanId;

  if (resumeAction === 'selectChecks') {
    const checksResult = await executeAgentTool('get_checks_for_loan', { loanId });
    const checks = checksResult?.checks ?? [];
    const selected = selectedCheckIds ?? [];
    const selectedChecks = checks.filter((c) => selected.includes(c.id));
    const totalAmount = selectedChecks.reduce((s, c) => s + (c.payAmount ?? 0), 0);
    const toolOutput = JSON.stringify({
      ...checksResult,
      userSelectedCheckIds: selected,
      userSelectedCount: selected.length,
      userSelectedTotalAmount: totalAmount,
      message: `User selected ${selected.length} check(s) totaling $${totalAmount.toFixed(2)}. Proceed with printing.`,
    });
    messages = [
      ...messages,
      {
        role: 'tool',
        tool_call_id: firstToolCall.id,
        content: toolOutput,
      },
    ];
    savedActions.push({ tool: 'get_checks_for_loan', args: { loanId }, result: checksResult });
  }

  if (resumeAction === 'confirmPrint') {
    const pendingCalls = pending.pendingToolCalls ?? (pending.firstToolCall ? [pending.firstToolCall] : []);
    const notifyCall = pendingCalls.find((c) => c?.function?.name === 'send_lender_notification');
    if (notifyCall) {
      const notifyArgs = JSON.parse(notifyCall.function.arguments || '{}');
      const synthRunId = `openai-${Date.now()}`;
      pendingAgentRuns.set(synthRunId, {
        ...pending,
        runId: synthRunId,
        pendingToolCalls: pendingCalls,
        firstToolCall: notifyCall,
        loanId: notifyArgs.loanId ?? pending.loanId,
        defaultArgs: notifyArgs,
        actions: savedActions,
      });
      pendingAgentRuns.delete(pending.runId);
      return res.json({
        status: 'awaiting_user',
        uiAction: 'lenderNotify',
        loanId: notifyArgs.loanId ?? pending.loanId,
        threadId: pending.threadId,
        runId: synthRunId,
        actions: savedActions,
      });
    }

    const tc = pendingCalls.find((c) => c?.function?.name === 'print_checks') ?? pending.firstToolCall;
    const toolArgs = JSON.parse(tc?.function?.arguments || '{}');
    const result = await executeAgentTool('print_checks', toolArgs);
    savedActions.push({ tool: 'print_checks', args: toolArgs, result });
    messages = [
      ...messages,
      { role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) },
    ];

    const nextResponse = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: OPENAI_TOOLS,
      tool_choice: 'auto',
    });
    const nextMsg = nextResponse.choices[0].message;

    if (nextMsg.tool_calls?.length > 0) {
      const ntc = nextMsg.tool_calls[0];
      const nname = ntc.function.name;
      const nargs = JSON.parse(ntc.function.arguments || '{}');
      if (nname === 'send_lender_notification') {
        const synthRunId = `openai-${Date.now()}`;
        pendingAgentRuns.set(synthRunId, {
          ...pending,
          runId: synthRunId,
          messages: [...messages, nextMsg],
          firstToolCall: ntc,
          pendingToolCalls: nextMsg.tool_calls,
          loanId: nargs.loanId,
          defaultArgs: nargs,
          actions: savedActions,
        });
        pendingAgentRuns.delete(pending.runId);
        return res.json({
          status: 'awaiting_user',
          uiAction: 'lenderNotify',
          loanId: nargs.loanId,
          threadId: pending.threadId,
          runId: synthRunId,
          actions: savedActions,
        });
      }
    }

    const lastContent = nextMsg.content || 'Workflow completed.';
    pendingAgentRuns.delete(pending.runId);
    return res.json({
      status: 'completed',
      message: lastContent,
      threadId: pending.threadId,
      actions: savedActions,
    });
  }

  if (resumeAction === 'selectChecks') {
    const checksResult = await executeAgentTool('get_checks_for_loan', { loanId });
    const checks = checksResult?.checks ?? [];
    const selected = selectedCheckIds ?? [];
    const selectedChecks = checks.filter((c) => selected.includes(c.id));
    const totalAmount = selectedChecks.reduce((s, c) => s + (c.payAmount ?? 0), 0);
    const toolOutput = JSON.stringify({
      ...checksResult,
      userSelectedCheckIds: selected,
      userSelectedCount: selected.length,
      userSelectedTotalAmount: totalAmount,
      message: `User selected ${selected.length} check(s) totaling $${totalAmount.toFixed(2)}. Proceed with printing.`,
    });
    messages = [
      ...messages,
      { role: 'tool', tool_call_id: firstToolCall.id, content: toolOutput },
    ];
    savedActions.push({ tool: 'get_checks_for_loan', args: { loanId }, result: checksResult });

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: OPENAI_TOOLS,
      tool_choice: 'auto',
    });
    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls?.length > 0) {
      const tc = assistantMessage.tool_calls[0];
      const toolName = tc.function.name;
      const toolArgs = JSON.parse(tc.function.arguments || '{}');

      if (toolName === 'print_checks') {
        const checks = (await executeAgentTool('get_checks_for_loan', { loanId }))?.checks ?? [];
        const byId = new Map(checks.map((c) => [c.id, c]));
        const totalAmount = (toolArgs.checkIds ?? []).reduce((s, id) => s + (byId.get(id)?.payAmount ?? 0), 0);
        const synthRunId = `openai-${Date.now()}`;
        pendingAgentRuns.set(synthRunId, {
          ...pending,
          runId: synthRunId,
          messages: [...messages, assistantMessage],
          firstToolCall: tc,
          pendingToolCalls: assistantMessage.tool_calls,
          loanId: toolArgs.loanId,
          actions: savedActions,
        });
        pendingAgentRuns.delete(pending.runId);
        return res.json({
          status: 'awaiting_user',
          uiAction: 'confirmPrint',
          loanId: toolArgs.loanId,
          selectedCount: (toolArgs.checkIds ?? []).length,
          totalAmount,
          threadId: pending.threadId,
          runId: synthRunId,
          actions: savedActions,
        });
      }
    }

    return res.json({
      status: 'completed',
      message: assistantMessage.content || 'Workflow completed.',
      threadId: pending.threadId,
      actions: savedActions,
    });
  }

  if (resumeAction === 'lenderNotify') {
    const pendingCalls = pending.pendingToolCalls ?? (pending.firstToolCall ? [pending.firstToolCall] : []);
    const toolMessages = [];

    for (const toolCall of pendingCalls) {
      const name = toolCall?.function?.name;
      const parsedArgs = JSON.parse(toolCall?.function?.arguments || '{}');

      if (name === 'print_checks') {
        const result = await executeAgentTool('print_checks', parsedArgs);
        savedActions.push({ tool: 'print_checks', args: parsedArgs, result });
        toolMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
        continue;
      }

      if (name === 'send_lender_notification') {
        const args = {
          loanId: parsedArgs.loanId ?? pending.loanId ?? loanId,
          transmissionType: notificationOptions?.transmissionType ?? parsedArgs.transmissionType ?? 'transmission_date',
          fromDate: notificationOptions?.fromDate ?? parsedArgs.fromDate ?? new Date().toISOString().split('T')[0],
          toDate: notificationOptions?.toDate ?? parsedArgs.toDate ?? new Date().toISOString().split('T')[0],
          envelopeSize: notificationOptions?.envelopeSize ?? parsedArgs.envelopeSize ?? 'standard',
          replaceBorrowerName: notificationOptions?.replaceBorrowerName ?? parsedArgs.replaceBorrowerName ?? false,
          displayLateCharges: notificationOptions?.displayLateCharges ?? parsedArgs.displayLateCharges ?? false,
        };
        const result = await executeAgentTool('send_lender_notification', args);
        savedActions.push({ tool: 'send_lender_notification', args, result });
        toolMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
        continue;
      }

      const result = await executeAgentTool(name, parsedArgs);
      savedActions.push({ tool: name, args: parsedArgs, result });
      toolMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
    }

    messages = [...messages, ...toolMessages];

    const finalResponse = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: OPENAI_TOOLS,
      tool_choice: 'auto',
    });
    const finalMsg = finalResponse.choices[0].message;
    const lastContent = finalMsg.content || 'Workflow completed.';

    pendingAgentRuns.delete(pending.runId);
    return res.json({
      status: 'completed',
      message: lastContent,
      threadId: pending.threadId,
      actions: savedActions,
    });
  }

  return res.status(400).json({ error: 'Invalid resumeAction' });
}

/**
 * @swagger
 * /api/agent/continue:
 *   post:
 *     summary: Continue agent run after user completed a modal step
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threadId:
 *                 type: string
 *               runId:
 *                 type: string
 *               resumeAction:
 *                 type: string
 *                 enum: [selectChecks, confirmPrint, lenderNotify]
 *               selectedCheckIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               notificationOptions:
 *                 type: object
 *     responses:
 *       200:
 *         description: Agent continued; may return completed or another awaiting_user
 */
app.post('/api/agent/continue', async (req, res) => {
  const { threadId, runId, resumeAction, selectedCheckIds, notificationOptions } = req.body;

  const pending = pendingAgentRuns.get(runId);
  if (!pending) {
    return res.status(404).json({ error: 'No pending run found', hint: 'Session may have expired. Start the workflow again.' });
  }

  if (pending.mode === 'openai') {
    return handleOpenAIContinue(req, res, pending, { resumeAction, selectedCheckIds, notificationOptions });
  }

  const { agentsClient, actions: savedActions, pendingToolCalls } = pending;
  let run;

  try {
    if (resumeAction === 'selectChecks') {
      const toolOutputs = [];
      for (const toolCall of pendingToolCalls) {
        const name = toolCall?.function?.name;
        const args = JSON.parse(toolCall?.function?.arguments || '{}');
        if (name === 'get_checks_for_loan') {
          const checksResult = await executeAgentTool('get_checks_for_loan', args);
          const checks = checksResult?.checks ?? [];
          const selected = selectedCheckIds ?? [];
          const selectedChecks = checks.filter((c) => selected.includes(c.id));
          const totalAmount = selectedChecks.reduce((s, c) => s + (c.payAmount ?? 0), 0);
          const output = JSON.stringify({
            ...checksResult,
            userSelectedCheckIds: selected,
            userSelectedCount: selected.length,
            userSelectedTotalAmount: totalAmount,
            message: `User selected ${selected.length} check(s) totaling $${totalAmount.toFixed(2)}. Proceed with printing.`,
          });
          toolOutputs.push({ toolCallId: toolCall.id, output });
          continue;
        }
        const result = await executeAgentTool(name, args);
        savedActions.push({ tool: name, args, result });
        toolOutputs.push({ toolCallId: toolCall.id, output: JSON.stringify(result) });
      }
      run = await agentsClient.runs.submitToolOutputs(threadId, runId, toolOutputs);
      pendingAgentRuns.delete(runId);
    } else if (resumeAction === 'confirmPrint') {
      const notifyCall = pendingToolCalls.find((c) => c?.function?.name === 'send_lender_notification');
      if (notifyCall) {
        const notifyArgs = JSON.parse(notifyCall.function.arguments || '{}');
        pendingAgentRuns.set(runId, {
          ...pending,
          runId,
          threadId,
          agentsClient,
          actions: savedActions,
          pendingToolCalls,
          resumeAction: 'lenderNotify',
          loanId: notifyArgs.loanId ?? pending.loanId,
          defaultArgs: notifyArgs,
        });
        return res.json({
          status: 'awaiting_user',
          uiAction: 'lenderNotify',
          loanId: notifyArgs.loanId ?? pending.loanId,
          threadId,
          runId,
          actions: savedActions,
        });
      }

      const toolOutputs = [];
      for (const toolCall of pendingToolCalls) {
        const name = toolCall?.function?.name;
        const args = JSON.parse(toolCall?.function?.arguments || '{}');
        const result = await executeAgentTool(name, args);
        savedActions.push({ tool: name, args, result });
        toolOutputs.push({ toolCallId: toolCall.id, output: JSON.stringify(result) });
      }
      run = await agentsClient.runs.submitToolOutputs(threadId, runId, toolOutputs);
      pendingAgentRuns.delete(runId);
    } else if (resumeAction === 'lenderNotify') {
      const toolOutputs = [];
      for (const toolCall of pendingToolCalls) {
        const name = toolCall?.function?.name;
        const parsedArgs = JSON.parse(toolCall?.function?.arguments || '{}');
        if (name === 'send_lender_notification') {
          const args = {
            loanId: parsedArgs.loanId ?? pending.loanId,
            transmissionType: notificationOptions?.transmissionType ?? parsedArgs.transmissionType ?? 'transmission_date',
            fromDate: notificationOptions?.fromDate ?? parsedArgs.fromDate ?? new Date().toISOString().split('T')[0],
            toDate: notificationOptions?.toDate ?? parsedArgs.toDate ?? new Date().toISOString().split('T')[0],
            envelopeSize: notificationOptions?.envelopeSize ?? parsedArgs.envelopeSize ?? 'standard',
            replaceBorrowerName: notificationOptions?.replaceBorrowerName ?? parsedArgs.replaceBorrowerName ?? false,
            displayLateCharges: notificationOptions?.displayLateCharges ?? parsedArgs.displayLateCharges ?? false,
          };
          const result = await executeAgentTool('send_lender_notification', args);
          savedActions.push({ tool: 'send_lender_notification', args, result });
          toolOutputs.push({ toolCallId: toolCall.id, output: JSON.stringify(result) });
          continue;
        }
        const result = await executeAgentTool(name, parsedArgs);
        savedActions.push({ tool: name, args: parsedArgs, result });
        toolOutputs.push({ toolCallId: toolCall.id, output: JSON.stringify(result) });
      }
      run = await agentsClient.runs.submitToolOutputs(threadId, runId, toolOutputs);
      pendingAgentRuns.delete(runId);
    } else {
      return res.status(400).json({ error: 'Invalid resumeAction' });
    }
  } catch (err) {
    console.error('Agent continue error:', err);
    return res.status(500).json({ error: err.message || 'Continue failed' });
  }

  const pollIntervalMs = 1000;
  const maxWaitMs = 60000;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
      break;
    }

    if (run.status === 'requires_action') {
      const action = run.requiredAction;
      if (action?.type === 'submit_tool_outputs' && action.submitToolOutputs?.toolCalls?.length) {
        const toolCalls = action.submitToolOutputs.toolCalls;
        const printCall = toolCalls.find((c) => c?.function?.name === 'print_checks');
        const notifyCall = toolCalls.find((c) => c?.function?.name === 'send_lender_notification');

        if (printCall) {
          const toolArgs = JSON.parse(printCall?.function?.arguments || '{}');
          let totalAmount = 0;
          try {
            const cr = await executeAgentTool('get_checks_for_loan', { loanId: toolArgs.loanId });
            const byId = new Map((cr?.checks ?? []).map((c) => [c.id, c]));
            totalAmount = (toolArgs.checkIds ?? []).reduce((s, id) => s + (byId.get(id)?.payAmount ?? 0), 0);
          } catch {
            totalAmount = 0;
          }
          pendingAgentRuns.set(run.id, {
            threadId,
            runId: run.id,
            agentsClient,
            actions: savedActions,
            pendingToolCalls: toolCalls,
            resumeAction: 'confirmPrint',
            loanId: toolArgs.loanId,
            printCheckIds: toolArgs.checkIds ?? [],
          });
          return res.json({
            status: 'awaiting_user',
            uiAction: 'confirmPrint',
            loanId: toolArgs.loanId,
            selectedCount: (toolArgs.checkIds ?? []).length,
            totalAmount,
            threadId,
            runId: run.id,
            actions: savedActions,
          });
        }

        if (notifyCall) {
          const toolArgs = JSON.parse(notifyCall?.function?.arguments || '{}');
          pendingAgentRuns.set(run.id, {
            threadId,
            runId: run.id,
            agentsClient,
            actions: savedActions,
            pendingToolCalls: toolCalls,
            resumeAction: 'lenderNotify',
            loanId: toolArgs.loanId,
            defaultArgs: toolArgs,
          });
          return res.json({
            status: 'awaiting_user',
            uiAction: 'lenderNotify',
            loanId: toolArgs.loanId,
            threadId,
            runId: run.id,
            actions: savedActions,
          });
        }

        const toolOutputs = [];
        for (const tc of toolCalls) {
          const toolName = tc?.function?.name;
          const toolArgs = JSON.parse(tc?.function?.arguments || '{}');
          const result = await executeAgentTool(toolName, toolArgs);
          savedActions.push({ tool: toolName, args: toolArgs, result });
          toolOutputs.push({ toolCallId: tc.id, output: JSON.stringify(result) });
        }
        run = await agentsClient.runs.submitToolOutputs(threadId, run.id, toolOutputs);
      }
    } else {
      await new Promise((r) => setTimeout(r, pollIntervalMs));
      run = await agentsClient.runs.get(threadId, run.id);
    }
  }

  if (run.status === 'failed' && run.lastError) {
    return res.status(500).json({
      error: run.lastError.code || 'run_failed',
      message: run.lastError.message || 'Agent run failed',
      threadId,
      actions: savedActions,
    });
  }

  let lastAssistantContent = '';
  const messagesIterator = agentsClient.messages.list(threadId, { order: 'desc' });
  for await (const msg of messagesIterator) {
    if (msg.role === 'assistant' && msg.content) {
      const textPart = Array.isArray(msg.content) ? msg.content.find((c) => c.type === 'text') : null;
      if (textPart?.text?.value) {
        lastAssistantContent = textPart.text.value;
        break;
      }
    }
  }

  return res.json({
    status: 'completed',
    message: lastAssistantContent || 'Workflow completed.',
    threadId,
    actions: savedActions,
  });
});

app.use(express.static(join(__dirname, 'dist')));
app.use((_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
