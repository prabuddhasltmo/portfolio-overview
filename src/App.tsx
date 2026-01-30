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
import NoDataForPeriodCard from './components/Dashboard/NoDataForPeriodCard';
import { portfolioData as fallbackData, historicalPortfolioData as fallbackHistorical } from './data/mockData';
import { fetchPortfolioData, fetchScenarios, switchScenario, type Scenario, type PortfolioResponse } from './services/openai';
import type { PortfolioData } from './types';
import portfolioRecapTheme from './portfolioRecapTheme';
import { periodKey, parsePeriodKey } from './constants/periods';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string | null>(null);

  const rawCurrent: PortfolioData = portfolio?.current || fallbackData;
  const rawHistorical: PortfolioData[] = portfolio?.historical || fallbackHistorical;
  const allPeriods: PortfolioData[] = [rawCurrent, ...rawHistorical];

  const effectiveKey =
    selectedPeriodKey && allPeriods.some((p) => periodKey(p.month, p.year) === selectedPeriodKey)
      ? selectedPeriodKey
      : periodKey(rawCurrent.month, rawCurrent.year);

  const currentData: PortfolioData = allPeriods.find((p) => periodKey(p.month, p.year) === effectiveKey) ?? rawCurrent;
  const historicalData: PortfolioData[] = allPeriods.filter((p) => periodKey(p.month, p.year) !== effectiveKey);

  const displayMonth = (() => {
    if (!selectedPeriodKey) return rawCurrent.month;
    const match = allPeriods.find((p) => periodKey(p.month, p.year) === selectedPeriodKey);
    if (match) return match.month;
    const parsed = parsePeriodKey(selectedPeriodKey);
    return parsed?.month ?? rawCurrent.month;
  })();
  const displayYear = (() => {
    if (!selectedPeriodKey) return rawCurrent.year;
    const match = allPeriods.find((p) => periodKey(p.month, p.year) === selectedPeriodKey);
    if (match) return match.year;
    const parsed = parsePeriodKey(selectedPeriodKey);
    return parsed?.year ?? rawCurrent.year;
  })();

  const hasDataForSelectedPeriod =
    !selectedPeriodKey || allPeriods.some((p) => periodKey(p.month, p.year) === selectedPeriodKey);

  const handlePeriodChange = (month: string, year: number) => {
    setSelectedPeriodKey(periodKey(month, year));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [scenarioList, portfolioResponse] = await Promise.all([
      fetchScenarios(),
      fetchPortfolioData(),
    ]);
    setScenarios(scenarioList);
    setPortfolio(portfolioResponse);
    setSelectedPeriodKey(null);
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
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Sidebar />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            component="main"
            sx={{
              flex: 1,
              overflowY: 'auto',
              bgcolor: 'background.default',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <PortfolioRecapHeader
                month={displayMonth}
                year={displayYear}
                periods={allPeriods.map((p) => ({ month: p.month, year: p.year }))}
                onPeriodChange={handlePeriodChange}
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
                  {hasDataForSelectedPeriod ? (
                    <AISummary
                      data={currentData}
                      historicalData={historicalData}
                      refreshTrigger={refreshTrigger}
                    />
                  ) : (
                    <NoDataForPeriodCard />
                  )}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                      gap: 1.5,
                    }}
                  >
                    {hasDataForSelectedPeriod ? (
                      <CashFlow data={currentData.cashFlow} />
                    ) : (
                      <NoDataForPeriodCard />
                    )}
                    {hasDataForSelectedPeriod ? (
                      <DelinquentLoans
                        data={currentData.delinquent}
                        activeLoans={currentData.activeLoans}
                      />
                    ) : (
                      <NoDataForPeriodCard />
                    )}
                  </Box>

                  {hasDataForSelectedPeriod ? (
                    <PortfolioHealth data={currentData} />
                  ) : (
                    <NoDataForPeriodCard />
                  )}

                  {hasDataForSelectedPeriod ? (
                    <MonthOverMonthTrends data={currentData.trends} />
                  ) : (
                    <NoDataForPeriodCard />
                  )}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                      gap: 1.5,
                    }}
                  >
                    {hasDataForSelectedPeriod ? (
                      <AIInsights data={currentData} refreshTrigger={refreshTrigger} />
                    ) : (
                      <NoDataForPeriodCard />
                    )}
                    <ActionItems items={currentData.actionItems} />
                  </Box>

                  {lastUpdated && <GeneratedTimestamp timestamp={lastUpdated} />}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
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
