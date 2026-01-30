import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PORTFOLIO_RECAP_QUERY_KEY } from './usePortfolioRecap';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const SCENARIOS_QUERY_KEY = 'scenarios';

export type ScenarioSummary = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

type ScenariosResponse = {
  scenarios?: ScenarioSummary[];
};

const fetchScenarios = async (): Promise<ScenarioSummary[]> => {
  const response = await fetch(`${API_BASE}/api/scenarios`);
  if (!response.ok) {
    throw new Error(`Scenarios request failed: ${response.status}`);
  }
  const data = (await response.json()) as ScenariosResponse;
  return data.scenarios ?? [];
};

const switchScenario = async (id: string): Promise<ScenarioSummary> => {
  const response = await fetch(`${API_BASE}/api/scenarios/${id}`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Scenario switch failed: ${response.status}`);
  }
  return { id, name: id, description: '', active: true };
};

export const useScenarios = () => {
  return useQuery<ScenarioSummary[], Error>({
    queryKey: [SCENARIOS_QUERY_KEY],
    queryFn: fetchScenarios,
  });
};

export const useSwitchScenario = () => {
  const queryClient = useQueryClient();
  return useMutation<ScenarioSummary, Error, string>({
    mutationFn: (id) => switchScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCENARIOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_RECAP_QUERY_KEY] });
    },
  });
};
