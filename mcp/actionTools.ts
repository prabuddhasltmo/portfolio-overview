import { randomUUID } from 'crypto';
import { z } from 'zod';
import type { RegisteredTool, ScenarioToolOptions } from './scenarioTools.js';

const reportInputSchema = z.object({
  id: z.string().min(1, 'Scenario identifier is required').optional(),
  reportType: z.enum(['late_notices', 'borrower_statement', 'escrow_analysis']).optional(),
}).strict();

const createId = (): string => {
  if (typeof randomUUID === 'function') return randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createActiveScenarioGetter = (options: ScenarioToolOptions) => {
  if (typeof options?.getActiveScenarioId === 'function') {
    return options.getActiveScenarioId;
  }
  const fallback = options?.activeScenarioId ?? null;
  return () => fallback;
};

export const createActionTools = (options: ScenarioToolOptions = {}): RegisteredTool[] => {
  const getActiveScenarioId = createActiveScenarioGetter(options);

  const generateReportTool: RegisteredTool = {
    name: 'generate_report_mockup',
    title: 'Generate Report Mockup',
    description: 'Create a shareable report preview link for the active scenario.',
    inputSchema: reportInputSchema,
    handler: async (input?: Record<string, unknown>) => {
      const { id, reportType = 'late_notices' } = reportInputSchema.parse(input ?? {});
      const scenarioId = id ?? getActiveScenarioId();
      if (!scenarioId) {
        throw new Error('Scenario id is required to generate a report mockup');
      }

      const reportId = createId();
      return {
        reportId,
        scenarioId,
        reportType,
        generatedAt: new Date().toISOString(),
        link: `/reports/mock/${scenarioId}/${reportType}/${reportId}`,
      };
    },
  };

  return [generateReportTool];
};
