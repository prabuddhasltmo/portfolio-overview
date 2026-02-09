import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadScenario, listScenarios } from '../dist-tools/lib/scenarioStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VALID_FIXTURE_DIR = join(__dirname, 'fixtures', 'scenarios');
const INVALID_FIXTURE_DIR = join(__dirname, 'fixtures', 'scenarios-invalid');

test('loadScenario returns validated scenario data', () => {
  const scenario = loadScenario('alpha', { dataDir: VALID_FIXTURE_DIR });
  assert.equal(scenario.name, 'Alpha Scenario');
  assert.equal(scenario.description, 'Alpha description');
  assert.equal(scenario.current.month, 'January');
});

test('loadScenario throws when scenario data is invalid', () => {
  assert.throws(
    () => loadScenario('invalid', { dataDir: INVALID_FIXTURE_DIR }),
    /missing fields/i,
  );
});

test('listScenarios returns metadata with active flag', () => {
  const scenarios = listScenarios({ activeScenarioId: 'beta', dataDir: VALID_FIXTURE_DIR });
  assert.equal(scenarios.length, 2);

  const active = scenarios.find(s => s.id === 'beta');
  assert(active?.active);
  assert.equal(active?.sentiment, 'neutral');

  const inactive = scenarios.find(s => s.id === 'alpha');
  assert(inactive && !inactive.active);
});
