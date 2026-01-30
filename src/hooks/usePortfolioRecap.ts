import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PortfolioRecapModel, PortfolioRecapParams } from '../types/portfolioRecap';
import { mockPortfolioRecapData } from '../data/mockPortfolioRecapData';

export const PORTFOLIO_RECAP_QUERY_KEY = 'portfolioRecap';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type PortfolioApiResponse = {
  current?: {
    month: string;
    year: number;
  };
  historical?: Array<{
    month: string;
    year: number;
  }>;
};

type SummaryResponse = {
  summary?: string;
  sentiment?: string;
  keyTakeaway?: string;
};

type InsightsResponse = {
  insights?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
  }>;
};

const getInsightSeverity = (category: string) => {
  switch (category.toLowerCase()) {
    case 'delinquency':
    case 'risk':
      return 'Warning';
    case 'opportunity':
      return 'Info';
    case 'performance':
      return 'Positive';
    default:
      return 'Info';
  }
};

const getMonthNumber = (monthName: string) => {
  const idx = MONTHS.findIndex((m) => m.toLowerCase() === monthName.toLowerCase());
  return idx >= 0 ? idx + 1 : null;
};

const pickCurrentSnapshot = (
  portfolio: PortfolioApiResponse,
  month: number,
  year: number
) => {
  const candidates = [
    ...(portfolio.historical ?? []),
    ...(portfolio.current ? [portfolio.current] : []),
  ];
  const match = candidates.find(
    (item) => getMonthNumber(item.month) === month && item.year === year
  );
  return match ?? portfolio.current ?? null;
};

const fetchPortfolioRecap = async ({
  month,
  year,
}: PortfolioRecapParams): Promise<PortfolioRecapModel> => {
  const base = {
    ...mockPortfolioRecapData,
    month,
    year,
    generatedAt: new Date().toISOString(),
  };

  try {
    const portfolioResponse = await fetch(`${API_BASE}/api/portfolio`);
    if (!portfolioResponse.ok) {
      throw new Error(`Portfolio request failed: ${portfolioResponse.status}`);
    }

    const portfolio = (await portfolioResponse.json()) as PortfolioApiResponse;
    const currentSnapshot = pickCurrentSnapshot(portfolio, month, year);

    if (!currentSnapshot) {
      throw new Error(`No portfolio data available for ${month}/${year}`);
    }

    const summaryResponse = await fetch(`${API_BASE}/api/ai/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current: currentSnapshot,
        historical: portfolio.historical ?? [],
      }),
    });

    if (!summaryResponse.ok) {
      throw new Error(`AI summary request failed: ${summaryResponse.status}`);
    }

    const summaryData = (await summaryResponse.json()) as SummaryResponse;

    const insightsResponse = await fetch(`${API_BASE}/api/ai/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentSnapshot),
    });

    if (!insightsResponse.ok) {
      throw new Error(`AI insights request failed: ${insightsResponse.status}`);
    }

    const insightsData = (await insightsResponse.json()) as InsightsResponse;

    return {
      ...base,
      summary: summaryData.summary ?? '',
      sentiment:
        summaryData.sentiment === 'good' ||
        summaryData.sentiment === 'neutral' ||
        summaryData.sentiment === 'bad'
          ? summaryData.sentiment
          : null,
      keyTakeaway: summaryData.keyTakeaway ?? null,
      insights: (insightsData.insights ?? []).map((insight) => ({
        title: insight.title,
        description: insight.description,
        category: insight.category,
        severity: getInsightSeverity(insight.category),
      })),
      headline: null,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching portfolio recap summary:', error);
    throw error;
  }
};

export const useGetPortfolioRecap = ({ month, year }: PortfolioRecapParams) => {
  return useQuery<PortfolioRecapModel, Error>({
    queryKey: [PORTFOLIO_RECAP_QUERY_KEY, month, year],
    queryFn: () => fetchPortfolioRecap({ month, year }),
    enabled: month > 0 && month <= 12 && year > 0,
    placeholderData: (previous) => previous,
  });
};

export const useRefreshPortfolioRecap = () => {
  const queryClient = useQueryClient();

  return useMutation<PortfolioRecapModel, Error, PortfolioRecapParams>({
    mutationFn: (params) => fetchPortfolioRecap({ ...params, forceRegenerate: true }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData([PORTFOLIO_RECAP_QUERY_KEY, variables.month, variables.year], data);
    },
  });
};
