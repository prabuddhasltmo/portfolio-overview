import { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AISummary from './components/Dashboard/AISummary';
import CashFlow from './components/Dashboard/CashFlow';
import DelinquentLoans from './components/Dashboard/DelinquentLoans';
import PortfolioHealth from './components/Dashboard/PortfolioHealth';
import MonthOverMonthTrends from './components/Dashboard/MonthOverMonthTrends';
import AIInsights from './components/Dashboard/AIInsights';
import ActionItems from './components/Dashboard/ActionItems';
import { portfolioData } from './data/mockData';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
          month={portfolioData.month}
          year={portfolioData.year}
          onRefresh={handleRefresh}
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-6xl space-y-4">
            {/* AI Summary */}
            <AISummary data={portfolioData} refreshTrigger={refreshTrigger} />

            {/* Top Row: Cash Flow + Delinquent Loans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CashFlow data={portfolioData.cashFlow} />
              <DelinquentLoans
                data={portfolioData.delinquent}
                activeLoans={portfolioData.activeLoans}
              />
            </div>

            {/* Portfolio Health */}
            <PortfolioHealth data={portfolioData} />

            {/* Month-over-Month Trends */}
            <MonthOverMonthTrends data={portfolioData.trends} />

            {/* Bottom Row: AI Insights + Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AIInsights data={portfolioData} refreshTrigger={refreshTrigger} />
              <ActionItems items={portfolioData.actionItems} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
