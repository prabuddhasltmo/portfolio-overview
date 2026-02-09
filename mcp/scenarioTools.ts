import { z } from 'zod';
import { loadScenario, listScenarios, type ScenarioListOptions } from '../lib/scenarioStore.js';

const noInputSchema = z.object({}).strict();

const scenarioIdSchema = z.object({
  id: z.string().min(1, 'Scenario identifier is required'),
}).strict();

const actionItemsSchema = z.object({
  id: z.string().min(1, 'Scenario identifier is required').optional(),
}).strict();

export interface ScenarioToolOptions {
  dataDir?: string;
  activeScenarioId?: string | null;
  getActiveScenarioId?: () => string | null;
}

export interface RegisteredTool {
  name: string;
  title: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (args?: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface ToolRegistry {
  registerTool: (tool: RegisteredTool) => void;
}

const createActiveScenarioGetter = (options: ScenarioToolOptions) => {
  if (typeof options?.getActiveScenarioId === 'function') {
    return options.getActiveScenarioId;
  }
  const fallback = options?.activeScenarioId ?? null;
  return () => fallback;
};

const baseScenarioOptions = (options: ScenarioToolOptions): ScenarioListOptions => {
  const base: ScenarioListOptions = {};
  if (options?.dataDir) base.dataDir = options.dataDir;
  return base;
};

export const createScenarioTools = (options: ScenarioToolOptions = {}) => {
  const getActiveScenarioId = createActiveScenarioGetter(options);
  const scenarioOptions = baseScenarioOptions(options);

  const listScenariosTool: RegisteredTool = {
    name: 'list_scenarios',
    description: 'List all available scenarios with metadata and active flag.',
    title: 'List Scenarios',
    inputSchema: noInputSchema,
    handler: async () => {
      return listScenarios({
        ...scenarioOptions,
        activeScenarioId: getActiveScenarioId(),
      });
    },
  };

  const getScenarioTool: RegisteredTool = {
    name: 'get_scenario',
    description: 'Load the full payload for a specific scenario.',
    title: 'Get Scenario Detail',
    inputSchema: scenarioIdSchema,
    handler: async (input?: Record<string, unknown>) => {
      const parsed = scenarioIdSchema.parse(input ?? {});
      return loadScenario(parsed.id, scenarioOptions);
    },
  };

  const getActionItemsTool: RegisteredTool = {
    name: 'get_action_items',
    description: 'Return current action items for a scenario (defaults to active).',
    title: 'Get Scenario Action Items',
    inputSchema: actionItemsSchema,
    handler: async (input?: Record<string, unknown>) => {
      const parsed = actionItemsSchema.parse(input ?? {});
      const scenarioId = parsed.id ?? getActiveScenarioId();
      if (!scenarioId) {
        throw new Error('Scenario id is required when no active scenario is configured');
      }
      const scenario = loadScenario(scenarioId, scenarioOptions);
      return (scenario?.current as Record<string, unknown>)?.actionItems ?? [];
    },
  };

  return [listScenariosTool, getScenarioTool, getActionItemsTool];
};

export const registerScenarioTools = (registry: ToolRegistry, options: ScenarioToolOptions = {}) => {
  const tools = createScenarioTools(options);
  tools.forEach(tool => {
    registry.registerTool(tool);
  });
  return tools;
};
