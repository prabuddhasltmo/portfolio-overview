import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AISummary from './components/Dashboard/AISummary';
import CashFlow from './components/Dashboard/CashFlow';
import DelinquentLoans from './components/Dashboard/DelinquentLoans';
import PortfolioHealth from './components/Dashboard/PortfolioHealth';
import MonthOverMonthTrends from './components/Dashboard/MonthOverMonthTrends';
import AIInsights from './components/Dashboard/AIInsights';
import ActionItems from './components/Dashboard/ActionItems';
import { portfolioData as fallbackData, historicalPortfolioData as fallbackHistorical } from './data/mockData';
import { fetchPortfolioData, fetchScenarios, switchScenario, type Scenario, type PortfolioResponse } from './services/openai';
import type { PortfolioData } from './types';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          month={currentData.month}
          year={currentData.year}
          onRefresh={handleRefresh}
          scenarios={scenarios}
          onScenarioChange={handleScenarioChange}
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500">Loading...</div>
            </div>
          ) : (
            <div className="max-w-6xl space-y-4">
              {/* AI Summary */}
              <AISummary
                data={currentData}
                historicalData={historicalData}
                refreshTrigger={refreshTrigger}
              />

              {/* Top Row: Cash Flow + Delinquent Loans */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CashFlow data={currentData.cashFlow} />
                <DelinquentLoans
                  data={currentData.delinquent}
                  activeLoans={currentData.activeLoans}
                />
              </div>

              {/* Portfolio Health */}
              <PortfolioHealth data={currentData} />

              {/* Month-over-Month Trends */}
              <MonthOverMonthTrends data={currentData.trends} />

              {/* Bottom Row: AI Insights + Action Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AIInsights data={currentData} refreshTrigger={refreshTrigger} />
                <ActionItems items={currentData.actionItems} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
