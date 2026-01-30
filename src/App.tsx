import { useCallback, useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Sidebar from './components/Layout/Sidebar';
import PortfolioRecapHeader from './components/Dashboard/PortfolioRecapHeader';
import AISummary from './components/Dashboard/AISummary';
import CashFlow from './components/Dashboard/CashFlow';
import DelinquentLoans from './components/Dashboard/DelinquentLoans';
import PortfolioHealth from './components/Dashboard/PortfolioHealth';
import MonthOverMonthTrends from './components/Dashboard/MonthOverMonthTrends';
import AIInsights from './components/Dashboard/AIInsights';
import ActionItems from './components/Dashboard/ActionItems';
import CardBox from './components/Dashboard/CardBox';
import { portfolioData as fallbackData, historicalPortfolioData as fallbackHistorical } from './data/mockData';
import { fetchPortfolioData, fetchScenarios, switchScenario, type Scenario, type PortfolioResponse } from './services/openai';
import type { PortfolioData } from './types';
import portfolioRecapTheme from './portfolioRecapTheme';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currentData: PortfolioData = portfolio?.current || fallbackData;
  const historicalData: PortfolioData[] = portfolio?.historical || fallbackHistorical;

  const loadData = useCallback(async () => {
    setLoading(true);
    const [scenarioList, portfolioResponse] = await Promise.all([
      fetchScenarios(),
      fetchPortfolioData(),
    ]);
    setScenarios(scenarioList);
    setPortfolio(portfolioResponse);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleScenarioChange = async (scenarioId: string) => {
    const success = await switchScenario(scenarioId);
    if (success) {
      await loadData();
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ThemeProvider theme={portfolioRecapTheme}>
      <CssBaseline />
      <div className="flex h-screen bg-[#F8F8FF]">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-[#F8F8FF] p-4">
            <div className="space-y-3">
              <PortfolioRecapHeader
                month={currentData.month}
                year={currentData.year}
                onRefresh={handleRefresh}
                scenarios={scenarios}
                onScenarioChange={handleScenarioChange}
                loading={loading}
              />

              {loading ? (
                <CardBox
                  customSx={{
                    padding: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.82)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '320px',
                  }}
                >
                  <CircularProgress size={48} />
                </CardBox>
              ) : (
                <>
                  <AISummary
                    data={currentData}
                    historicalData={historicalData}
                    refreshTrigger={refreshTrigger}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <CashFlow data={currentData.cashFlow} />
                    <DelinquentLoans
                      data={currentData.delinquent}
                      activeLoans={currentData.activeLoans}
                    />
                  </div>

                  <PortfolioHealth data={currentData} />

                  <MonthOverMonthTrends data={currentData.trends} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <AIInsights data={currentData} refreshTrigger={refreshTrigger} />
                    <ActionItems items={currentData.actionItems} />
                  </div>

                  {lastUpdated && <GeneratedTimestamp timestamp={lastUpdated} />}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;

function GeneratedTimestamp({ timestamp }: { timestamp: Date }) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  return (
    <Box sx={{ textAlign: 'right' }}>
      <Typography
        sx={{
          fontSize: '12px',
          color: neutral?.[400],
          lineHeight: '16px',
        }}
      >
        Generated: {timestamp.toLocaleString()}
      </Typography>
    </Box>
  );
}
