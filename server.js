import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const DATA_DIR = join(__dirname, 'data');
let currentScenario = 'trending-up';

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

app.use(express.static(join(__dirname, 'dist')));
app.use((_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
