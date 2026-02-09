import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createScenarioTools } from '../dist-tools/mcp/scenarioTools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURE_DIR = join(__dirname, 'fixtures', 'scenarios');

const getToolByName = (tools, name) => tools.find(tool => tool.name === name);

test('scenario tools expose list and retrieval handlers', async () => {
  const tools = createScenarioTools({
    dataDir: FIXTURE_DIR,
    getActiveScenarioId: () => 'alpha',
  });

  const listTool = getToolByName(tools, 'list_scenarios');
  assert(listTool, 'list_scenarios tool should exist');
  const listed = await listTool.handler();
  assert.equal(listed.length, 2);
  assert(listed.find(item => item.id === 'alpha' && item.active));

  const loadTool = getToolByName(tools, 'get_scenario');
  const scenario = await loadTool.handler({ id: 'beta' });
  assert.equal(scenario.name, 'Beta Scenario');

  const actionTool = getToolByName(tools, 'get_action_items');
  const actionItems = await actionTool.handler();
  assert.equal(actionItems.length, 1);
  assert.equal(actionItems[0].id, 'LN-1');
});

test('get_action_items validates scenario id when no active scenario is set', async () => {
  const tools = createScenarioTools({ dataDir: FIXTURE_DIR });
  const actionTool = getToolByName(tools, 'get_action_items');
  await assert.rejects(() => actionTool.handler(), /Scenario id is required/);
});
