import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PortfolioRecapModel, PortfolioRecapParams } from '../types/portfolioRecap';
import { mockPortfolioRecapData } from '../data/mockPortfolioRecapData';

const QUERY_KEY = 'portfolioRecap';

const fetchPortfolioRecap = async ({
  month,
  year,
}: PortfolioRecapParams): Promise<PortfolioRecapModel> => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));
  return {
    ...mockPortfolioRecapData,
    month,
    year,
    generatedAt: new Date().toISOString(),
  };
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
