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
  const apiKey = process.env.OPENAI_API_KEY;
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

app.use(express.static(join(__dirname, 'dist')));
app.use((_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
