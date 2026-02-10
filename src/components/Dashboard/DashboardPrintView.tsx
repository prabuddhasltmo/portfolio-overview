import { Box } from '@mui/material';
import type { PortfolioData, Sentiment, DashboardSnapshot } from '../../types';
import type { DashboardCardConfig } from '../../types/dashboardConfig';
import { mockAISummary, mockKeyTakeaway, mockAIInsights } from '../../data/mockData';
import AISummary from './AISummary';
import CashFlow from './CashFlow';
import DelinquentLoans from './DelinquentLoans';
import PortfolioHealth from './PortfolioHealth';
import MonthOverMonthTrends from './MonthOverMonthTrends';
import AIInsights from './AIInsights';
import ActionItems from './ActionItems';
import CardBox from './CardBox';

const PRINTABLE_CARD_IDS = [
  'ai-summary',
  'cash-flow',
  'delinquent-loans',
  'portfolio-health',
  'month-trends',
  'ai-insights',
  'action-items',
] as const;

interface DashboardPrintViewProps {
  portfolioData: PortfolioData;
  historicalData: PortfolioData[];
  scenarioSentiment?: Sentiment;
  dashboardCards: DashboardCardConfig[];
  dashboardSnapshot?: DashboardSnapshot;
}

export default function DashboardPrintView({
  portfolioData,
  historicalData,
  scenarioSentiment,
  dashboardCards,
  dashboardSnapshot,
}: DashboardPrintViewProps) {
  const visibleIds = dashboardCards
    .filter((c) => c.visible && PRINTABLE_CARD_IDS.includes(c.id as (typeof PRINTABLE_CARD_IDS)[number]))
    .map((c) => c.id);

  const renderCard = (id: string): React.ReactNode => {
    switch (id) {
      case 'ai-summary':
        return (
          <AISummary
            key={id}
            data={portfolioData}
            historicalData={historicalData}
            scenarioSentiment={scenarioSentiment}
            staticContent={{
              summary: dashboardSnapshot?.summary ?? mockAISummary,
              keyTakeaway: dashboardSnapshot?.keyTakeaway ?? mockKeyTakeaway,
            }}
          />
        );
      case 'cash-flow':
        return <CashFlow key={id} data={portfolioData.cashFlow} />;
      case 'delinquent-loans':
        return (
          <DelinquentLoans
            key={id}
            data={portfolioData.delinquent}
            activeLoans={portfolioData.activeLoans}
          />
        );
      case 'portfolio-health':
        return <PortfolioHealth key={id} data={portfolioData} />;
      case 'month-trends':
        return <MonthOverMonthTrends key={id} data={portfolioData.trends} />;
      case 'ai-insights':
        return (
          <AIInsights
            key={id}
            data={portfolioData}
            staticInsights={dashboardSnapshot?.insights ?? mockAIInsights}
          />
        );
      case 'action-items':
        return <ActionItems key={id} items={portfolioData.actionItems ?? []} />;
      default:
        return null;
    }
  };

  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < visibleIds.length) {
    const id = visibleIds[i];
    const cfg = dashboardCards.find((c) => c.id === id);
    const isHalf = cfg?.halfWidth ?? false;
    const nextId = visibleIds[i + 1];
    const nextCfg = nextId ? dashboardCards.find((c) => c.id === nextId) : undefined;

    if (isHalf && nextCfg?.halfWidth) {
      nodes.push(
        <Box
          key={`grid-${id}-${nextId}`}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 1.5,
          }}
        >
          {renderCard(id)}
          {renderCard(nextId)}
        </Box>
      );
      i += 2;
    } else {
      nodes.push(renderCard(id));
      i += 1;
    }
  }

  return (
    <Box
      className="report-print-view"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        '& button, & .MuiIconButton-root, & [role="button"]': {
          display: 'none !important',
        },
      }}
    >
      <Box sx={{ mb: 1 }}>
        <CardBox
          customSx={{
            padding: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box component="h1" sx={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                Portfolio Recap — {portfolioData.month} {portfolioData.year}
              </Box>
              <Box component="p" sx={{ fontSize: '0.875rem', color: 'text.secondary', margin: '4px 0 0' }}>
                Report generated from dashboard view
              </Box>
            </Box>
          </Box>
        </CardBox>
      </Box>
      {nodes}
    </Box>
  );
}
