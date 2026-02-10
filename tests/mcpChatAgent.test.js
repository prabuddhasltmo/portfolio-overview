import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadScenario } from '../dist-tools/lib/scenarioStore.js';
import { McpChatAgent } from '../dist-tools/mcp/chatAgent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURE_DIR = join(__dirname, 'fixtures', 'scenarios');

const createStubOpenAI = (collector) => ({
  chat: {
    completions: {
      create: async (payload) => {
        collector.messages = payload.messages;
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  answer: 'Stub answer',
                  suggestions: ['Try collections trend'],
                  chart: null,
                  ctas: [],
                }),
              },
            },
          ],
        };
      },
    },
  },
});

test('MCP chat agent uses registered tools before calling OpenAI and suggests follow-up CTA', async () => {
  const scenario = loadScenario('alpha', { dataDir: FIXTURE_DIR });
  const payloadCollector = {};

  const agent = new McpChatAgent({
    openaiFactory: () => createStubOpenAI(payloadCollector),
    dataDir: FIXTURE_DIR,
    getActiveScenarioId: () => 'alpha',
  });

  const result = await agent.chat({
    question: 'Who should we follow up with?',
    portfolioData: scenario.current,
    historicalData: scenario.historical,
    conversationHistory: [],
    toolIds: ['get_action_items'],
  });

  assert.equal(result.answer, 'Stub answer');
  assert.ok(Array.isArray(result.suggestions));
  assert(payloadCollector.messages?.[0]?.content.includes('get_action_items'));
  const sendCTA = result.ctas?.find(cta => cta.action.type === 'send_message');
  assert(sendCTA, 'Expected follow-up CTA');
  assert.equal(sendCTA.action.borrowerId, 'LN-1');
});

test('MCP chat agent generates report CTA with link when a report is requested', async () => {
  const scenario = loadScenario('alpha', { dataDir: FIXTURE_DIR });
  const agent = new McpChatAgent({
    openaiFactory: () => createStubOpenAI({}),
    dataDir: FIXTURE_DIR,
    getActiveScenarioId: () => 'alpha',
  });

  const result = await agent.chat({
    question: 'Please generate a detailed report for this scenario.',
    portfolioData: scenario.current,
    historicalData: scenario.historical,
    conversationHistory: [],
  });

  const reportCTA = result.ctas?.find(cta => cta.action.type === 'view_report');
  assert(reportCTA, 'Expected report CTA');
  assert(reportCTA.action.reportLink?.includes('/api/reports/mock/alpha/borrower_statement'));
});

test('MCP chat agent lists scenarios when requested', async () => {
  const scenario = loadScenario('alpha', { dataDir: FIXTURE_DIR });
  const agent = new McpChatAgent({
    openaiFactory: () => createStubOpenAI({}),
    dataDir: FIXTURE_DIR,
    getActiveScenarioId: () => 'alpha',
  });

  const result = await agent.chat({
    question: 'Please list all available scenarios with descriptions.',
    portfolioData: scenario.current,
    historicalData: scenario.historical,
    conversationHistory: [],
  });

  assert(result.answer.includes('Available Scenarios:'), 'Should include scenario header');
  assert(result.answer.includes('Alpha Scenario'), 'Should list alpha scenario');
  assert(result.answer.includes('Beta Scenario'), 'Should list beta scenario');
});
