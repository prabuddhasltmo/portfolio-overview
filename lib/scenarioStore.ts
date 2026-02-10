import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DEFAULT_DATA_DIR = join(process.cwd(), 'data');

export interface ScenarioCurrentPeriod {
  month: string;
  year: number;
  [key: string]: unknown;
}

export interface ScenarioData {
  name: string;
  description: string;
  sentiment?: string;
  current: ScenarioCurrentPeriod;
  historical: ScenarioCurrentPeriod[];
  [key: string]: unknown;
}

export interface ScenarioSummary {
  id: string;
  name: string;
  description: string;
  sentiment: string;
  active: boolean;
}

export interface ScenarioLoadOptions {
  dataDir?: string;
}

export interface ScenarioListOptions extends ScenarioLoadOptions {
  activeScenarioId?: string | null;
}

const REQUIRED_ROOT_FIELDS: Array<keyof ScenarioData | 'current' | 'historical'> = [
  'name',
  'description',
  'current',
  'historical',
];

const ensureString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const validateScenarioData = (data: unknown, scenarioId: string): ScenarioData => {
  if (!data || typeof data !== 'object') {
    throw new Error(`Scenario "${scenarioId}" is not a valid object`);
  }

  const scenario = data as ScenarioData;
  const missingFields = REQUIRED_ROOT_FIELDS.filter(field => {
    if (!(field in scenario)) return true;
    if (field === 'current') {
      return typeof scenario.current !== 'object' || scenario.current === null;
    }
    if (field === 'historical') {
      return !Array.isArray(scenario.historical);
    }
    return (scenario as Record<string, unknown>)[field] == null;
  });

  if (missingFields.length > 0) {
    throw new Error(`Scenario "${scenarioId}" is missing fields: ${missingFields.join(', ')}`);
  }

  if (!ensureString(scenario.name) || !ensureString(scenario.description)) {
    throw new Error(`Scenario "${scenarioId}" requires non-empty name and description`);
  }

  if (
    !scenario.current ||
    typeof scenario.current !== 'object' ||
    !ensureString(scenario.current.month) ||
    typeof scenario.current.year !== 'number'
  ) {
    throw new Error(`Scenario "${scenarioId}" current period is invalid`);
  }

  return scenario;
};

const resolveDataDir = (customDir?: string): string => customDir ?? DEFAULT_DATA_DIR;

export const loadScenario = (
  scenarioId: string,
  options: ScenarioLoadOptions = {},
): ScenarioData => {
  if (!ensureString(scenarioId)) {
    throw new Error('scenarioId must be a non-empty string');
  }

  const dataDir = resolveDataDir(options.dataDir);
  const filePath = join(dataDir, `${scenarioId}.json`);

  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Unable to read scenario "${scenarioId}": ${message}`);
  }

  const parsed = JSON.parse(content);
  return validateScenarioData(parsed, scenarioId);
};

export const listScenarios = (options: ScenarioListOptions = {}): ScenarioSummary[] => {
  const { activeScenarioId = null, dataDir: customDir } = options;
  const dataDir = resolveDataDir(customDir);
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'messages.json');

  return files.map(file => {
    const scenarioId = file.replace(/\.json$/, '');
    const data = loadScenario(scenarioId, { dataDir });
    return {
      id: scenarioId,
      name: data.name,
      description: data.description,
      sentiment: String(data.sentiment ?? 'neutral'),
      active: scenarioId === activeScenarioId,
    } satisfies ScenarioSummary;
  });
};

export const getDataDir = (): string => DEFAULT_DATA_DIR;
