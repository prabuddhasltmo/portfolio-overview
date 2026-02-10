import { useCallback, useEffect, useMemo, useState } from 'react';
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
import AskAIChat from './components/Dashboard/AskAIChat';
import ActionItems from './components/Dashboard/ActionItems';
import { AgentWorkflowProvider } from './contexts/AgentWorkflowContext';
import CardBox from './components/Dashboard/CardBox';
import NoDataForPeriodCard from './components/Dashboard/NoDataForPeriodCard';
import ReportMockupModal from './components/Dashboard/ReportMockupModal';
import CustomizeDashboardModal from './components/Dashboard/CustomizeDashboardModal';
import { SendMessageModal } from './components/Email';
import {
  portfolioData as fallbackData,
  historicalPortfolioData as fallbackHistorical,
  mockAISummary,
  mockKeyTakeaway,
  mockAIInsights,
} from './data/mockData';
import { fetchPortfolioData, fetchScenarios, switchScenario, type Scenario, type PortfolioResponse } from './services/openai';
import type { PortfolioData, ActionItem, DashboardSnapshot } from './types';
import type { EmailDraftContext } from './types/email';
import type { ReportMockupType, ReportMockupContext } from './types/reportMockup';
import type { DashboardCardConfig } from './types/dashboardConfig';
import { loadDashboardConfig, saveDashboardConfig } from './types/dashboardConfig';
import portfolioRecapTheme from './portfolioRecapTheme';
import { periodKey, parsePeriodKey } from './constants/periods';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string | null>(null);
  const [sendMessageContext, setSendMessageContext] = useState<EmailDraftContext | null>(null);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [sendMessageBorrowers, setSendMessageBorrowers] = useState<ActionItem[] | null>(null);
  const [sendMessageEmailTypeOverride, setSendMessageEmailTypeOverride] = useState<EmailDraftContext['emailType'] | null>(null);
  const [reportMockupOpen, setReportMockupOpen] = useState(false);
  const [reportMockupType, setReportMockupType] = useState<ReportMockupType>('late_notices');
  const [reportMockupContext, setReportMockupContext] = useState<ReportMockupContext | null>(null);
  const [dashboardCards, setDashboardCards] = useState<DashboardCardConfig[]>(loadDashboardConfig);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [dashboardSnapshot, setDashboardSnapshot] = useState<DashboardSnapshot | null>(null);

  const rawCurrent: PortfolioData = portfolio?.current || fallbackData;
  const rawHistorical: PortfolioData[] = portfolio?.historical || fallbackHistorical;

  const allPeriods = useMemo(
    () => [rawCurrent, ...rawHistorical],
    [rawCurrent, rawHistorical]
  );

  const effectiveKey =
    selectedPeriodKey && allPeriods.some((p) => periodKey(p.month, p.year) === selectedPeriodKey)
      ? selectedPeriodKey
      : periodKey(rawCurrent.month, rawCurrent.year);

  const currentData = useMemo(
    () => allPeriods.find((p) => periodKey(p.month, p.year) === effectiveKey) ?? rawCurrent,
    [allPeriods, effectiveKey, rawCurrent]
  );

  const historicalData = useMemo(
    () => allPeriods.filter((p) => periodKey(p.month, p.year) !== effectiveKey),
    [allPeriods, effectiveKey]
  );

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

  const openSendMessage = (
    context?: EmailDraftContext | null,
    options?: { borrowers?: ActionItem[] | null; emailTypeOverride?: EmailDraftContext['emailType'] | null }
  ) => {
    setSendMessageContext(context ?? null);
    setSendMessageBorrowers(options?.borrowers ?? null);
    setSendMessageEmailTypeOverride(options?.emailTypeOverride ?? null);
    setSendMessageOpen(true);
  };

  const closeSendMessage = () => {
    setSendMessageOpen(false);
    setSendMessageContext(null);
    setSendMessageBorrowers(null);
    setSendMessageEmailTypeOverride(null);
  };

  const buildLateNoticeContext = (item: ActionItem): EmailDraftContext => ({
    loanId: item.id,
    borrowerName: item.borrower,
    borrowerEmail: item.borrowerEmail,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
    emailType: 'collection_followup',
  });

  const openLateNoticeModal = () => {
    const delinquentItems = (currentData.actionItems ?? []).filter((item) => (item.daysPastDue ?? 0) > 0);
    const initial = delinquentItems.length > 0 ? buildLateNoticeContext(delinquentItems[0]) : null;
    openSendMessage(initial, {
      borrowers: delinquentItems,
      emailTypeOverride: 'collection_followup',
    });
  };

  const handleGenerateReport = (reportType: ReportMockupType, selectedContexts: ReportMockupContext[]) => {
    if (selectedContexts.length === 0) return;
    setReportMockupType(reportType);
    setReportMockupContext(selectedContexts[0]);
    setReportMockupOpen(true);
  };

  const buildReportContext = (item: PortfolioData['actionItems'][number]): ReportMockupContext => ({
    loanId: item.id,
    borrower: item.borrower,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
  });

  const openReportFromChat = (reportType: ReportMockupType) => {
    const contexts = currentData.actionItems.map(buildReportContext);
    handleGenerateReport(reportType, contexts);
  };

  const openLateNoticesFromChat = () => {
    openReportFromChat('late_notices');
  };

  const closeReportMockup = () => {
    setReportMockupOpen(false);
    setReportMockupContext(null);
  };

  const handleSaveDashboardConfig = (cards: DashboardCardConfig[]) => {
    setDashboardCards(cards);
    saveDashboardConfig(cards);
  };

  const isCardVisible = (id: string) =>
    dashboardCards.find((c) => c.id === id)?.visible ?? true;

  /** Build an ordered list of visible card IDs. */
  const visibleCardIds = dashboardCards.filter((c) => c.visible).map((c) => c.id);

  /** Render a single card by ID. Returns null if the card is hidden. */
  const renderCard = (id: string): React.ReactNode => {
    if (!isCardVisible(id)) return null;
    switch (id) {
      case 'ai-summary':
        return hasDataForSelectedPeriod ? (
          <AISummary
            key={id}
            data={currentData}
            historicalData={historicalData}
            refreshTrigger={refreshTrigger}
            scenarioSentiment={portfolio?.sentiment}
            onOpenLateNotices={openLateNoticeModal}
            onDataReady={(summary, keyTakeaway) =>
              setDashboardSnapshot((prev) => ({
                summary,
                keyTakeaway,
                insights: prev?.insights ?? mockAIInsights,
              }))
            }
          />
        ) : (
          <NoDataForPeriodCard key={id} />
        );
      case 'cash-flow':
        return hasDataForSelectedPeriod ? (
          <CashFlow key={id} data={currentData.cashFlow} />
        ) : (
          <NoDataForPeriodCard key={id} />
        );
      case 'delinquent-loans':
        return hasDataForSelectedPeriod ? (
          <DelinquentLoans
            key={id}
            data={currentData.delinquent}
            activeLoans={currentData.activeLoans}
          />
        ) : (
          <NoDataForPeriodCard key={id} />
        );
      case 'portfolio-health':
        return hasDataForSelectedPeriod ? (
          <PortfolioHealth key={id} data={currentData} />
        ) : (
          <NoDataForPeriodCard key={id} />
        );
      case 'month-trends':
        return hasDataForSelectedPeriod ? (
          <MonthOverMonthTrends key={id} data={currentData.trends} />
        ) : (
          <NoDataForPeriodCard key={id} />
        );
      case 'ai-insights':
        return hasDataForSelectedPeriod ? (
          <AIInsights
            key={id}
            data={currentData}
            refreshTrigger={refreshTrigger}
            onDataReady={(insights) =>
              setDashboardSnapshot((prev) => ({
                summary: prev?.summary ?? mockAISummary,
                keyTakeaway: prev?.keyTakeaway ?? mockKeyTakeaway,
                insights,
              }))
            }
          />
        ) : (
          <NoDataForPeriodCard key={id} />
        );
      case 'action-items':
        return (
          <ActionItems
            key={id}
            items={currentData.actionItems}
            onMessageClick={openSendMessage}
            onReportGenerate={handleGenerateReport}
          />
        );
      case 'ask-ai':
        return (
          <AskAIChat
            key={id}
            portfolioData={currentData}
            historicalData={historicalData}
            onOpenLateNotices={openLateNoticesFromChat}
            onOpenSendMessage={openSendMessage}
            onOpenReport={openReportFromChat}
          />
        );
      default:
        return null;
    }
  };

  /**
   * Walk through the ordered visible cards and group consecutive half-width
   * cards into 2-column grids, while full-width cards render standalone.
   */
  const buildDashboardLayout = (): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let i = 0;
    while (i < visibleCardIds.length) {
      const id = visibleCardIds[i];
      const cfg = dashboardCards.find((c) => c.id === id);
      const isHalf = cfg?.halfWidth ?? false;

      if (isHalf) {
        // Peek ahead for the next visible half-width card
        const nextId = visibleCardIds[i + 1];
        const nextCfg = nextId ? dashboardCards.find((c) => c.id === nextId) : undefined;
        if (nextCfg?.halfWidth) {
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
            </Box>,
          );
          i += 2;
        } else {
          // Solo half-width card — still render it full-width
          nodes.push(renderCard(id));
          i += 1;
        }
      } else {
        nodes.push(renderCard(id));
        i += 1;
      }
    }
    return nodes;
  };

  return (
    <ThemeProvider theme={portfolioRecapTheme}>
      <CssBaseline />
      <AgentWorkflowProvider>
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
                portfolioData={currentData}
                historicalData={historicalData}
                scenarioSentiment={portfolio?.sentiment}
                dashboardCards={dashboardCards}
                dashboardSnapshot={dashboardSnapshot}
                onCustomize={() => setCustomizeOpen(true)}
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
                  {buildDashboardLayout()}
                  {lastUpdated && <GeneratedTimestamp timestamp={lastUpdated} />}
                </>
              )}
            </Box>
          </Box>
        </Box>
        </Box>
      </AgentWorkflowProvider>

      <SendMessageModal
        open={sendMessageOpen}
        onClose={closeSendMessage}
        borrowers={sendMessageBorrowers ?? currentData.actionItems ?? []}
        initialContext={sendMessageContext}
        forcedEmailType={sendMessageEmailTypeOverride ?? undefined}
      />
      {reportMockupContext && (
        <ReportMockupModal
          open={reportMockupOpen}
          onClose={closeReportMockup}
          reportType={reportMockupType}
          context={reportMockupContext}
        />
      )}
      <CustomizeDashboardModal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        cards={dashboardCards}
        onSave={handleSaveDashboardConfig}
      />
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
