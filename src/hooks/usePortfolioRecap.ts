import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PortfolioRecapModel, PortfolioRecapParams, Scenario } from '../types/portfolioRecap';
import { mockPortfolioRecapData } from '../data/mockPortfolioRecapData';

const QUERY_KEY = 'portfolioRecap';
const SCENARIOS_KEY = 'scenarios';

const fetchPortfolioRecap = async ({
  month,
  year,
}: PortfolioRecapParams): Promise<PortfolioRecapModel> => {
  try {
    const response = await fetch('/api/portfolio');
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return {
      ...mockPortfolioRecapData,
      ...data.current,
      month,
      year,
      sentiment: data.sentiment || 'neutral',
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      ...mockPortfolioRecapData,
      month,
      year,
      sentiment: 'neutral',
      generatedAt: new Date().toISOString(),
    };
  }
};

const fetchScenarios = async (): Promise<Scenario[]> => {
  try {
    const response = await fetch('/api/scenarios');
    if (!response.ok) throw new Error('Failed to fetch scenarios');
    const data = await response.json();
    return data.scenarios;
  } catch {
    return [];
  }
};

const switchScenario = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/scenarios/${id}`, { method: 'POST' });
    return response.ok;
  } catch {
    return false;
  }
};

export const useGetPortfolioRecap = ({ month, year }: PortfolioRecapParams) => {
  return useQuery<PortfolioRecapModel, Error>({
    queryKey: [QUERY_KEY, month, year],
    queryFn: () => fetchPortfolioRecap({ month, year }),
    enabled: month > 0 && month <= 12 && year > 0,
  });
};

export const useRefreshPortfolioRecap = () => {
  const queryClient = useQueryClient();

  return useMutation<PortfolioRecapModel, Error, PortfolioRecapParams>({
    mutationFn: (params) => fetchPortfolioRecap({ ...params, forceRegenerate: true }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData([QUERY_KEY, variables.month, variables.year], data);
    },
  });
};

export const useGetScenarios = () => {
  return useQuery<Scenario[], Error>({
    queryKey: [SCENARIOS_KEY],
    queryFn: fetchScenarios,
  });
};

export const useSwitchScenario = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: switchScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SCENARIOS_KEY] });
    },
  });
};
