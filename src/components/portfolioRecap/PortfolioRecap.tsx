import { useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, IconButton, Tooltip, Select, MenuItem } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import InsightsIcon from '@mui/icons-material/Insights';
import ScienceIcon from '@mui/icons-material/Science';
import CardBox from './CardBox';
import { useGetPortfolioRecap, useRefreshPortfolioRecap, useGetScenarios, useSwitchScenario } from '../../hooks/usePortfolioRecap';
import MonthSelector from './MonthSelector';
import ExecutiveSummary from './ExecutiveSummary';
import MoneyFlowCard from './MoneyFlowCard';
import DelinquentLoansCard from './DelinquentLoansCard';
import PortfolioHealthCard from './PortfolioHealthCard';
import InsightsList from './InsightsList';
import ActionItemsList from './ActionItemsList';
import TrendAnalysis from './TrendAnalysis';

const PortfolioRecap = () => {
  const theme = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading, isError, error } = useGetPortfolioRecap({ month, year });
  const refreshMutation = useRefreshPortfolioRecap();
  const { data: scenarios = [] } = useGetScenarios();
  const switchScenarioMutation = useSwitchScenario();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const activeScenario = scenarios.find(s => s.active);

  const handleScenarioChange = (scenarioId: string) => {
    switchScenarioMutation.mutate(scenarioId);
  };

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleRefresh = () => {
    refreshMutation.mutate({ month, year });
  };

  const monthName = useMemo(() => {
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
  }, [month, year]);

  const renderContent = () => {
    if (isLoading || refreshMutation.isPending) {
      return (
        <CardBox
          customSx={{
            padding: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.white, 0.82),
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress size={48} />
        </CardBox>
      );
    }

    if (isError) {
      return (
        <CardBox
          customSx={{
            padding: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.white, 0.82),
          }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            Failed to load portfolio recap: {error?.message ?? 'Unknown error'}
          </Alert>
        </CardBox>
      );
    }

    if (!data) {
      return (
        <CardBox
          customSx={{
            padding: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.white, 0.82),
          }}
        >
          <Alert severity="info" sx={{ width: '100%' }}>
            No data available for {monthName} {year}
          </Alert>
        </CardBox>
      );
    }

    return (
      <>
        <ExecutiveSummary
          headline={data.headline}
          summary={data.summary}
          keyTakeaway={data.keyTakeaway}
          sentiment={data.sentiment}
        />

        <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
          <MoneyFlowCard moneyIn={data.moneyIn} moneyOut={data.moneyOut} trends={data.trends} />
          <DelinquentLoansCard
            delinquentLoans={data.delinquentLoans}
            activeLoans={data.activeLoans}
            delinquentPercentage={data.delinquentPercentage}
            loans30Days={data.loans30DaysPastDue}
            loans60Days={data.loans60DaysPastDue}
            loans90PlusDays={data.loans90PlusDaysPastDue}
          />
        </Box>

        <PortfolioHealthCard
          totalLoans={data.totalLoans}
          activeLoans={data.activeLoans}
          totalPrincipalBalance={data.totalPrincipalBalance}
          totalUnpaidInterest={data.totalUnpaidInterest}
          totalLateCharges={data.totalLateCharges}
        />

        {data.trends && <TrendAnalysis trends={data.trends} />}

        <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
          <InsightsList insights={data.insights ?? []} />
          {data.actionItems && data.actionItems.length > 0 && (
            <ActionItemsList actionItems={data.actionItems} />
          )}
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            sx={{
              fontSize: '12px',
              color: neutral?.[400],
              lineHeight: '16px',
            }}
          >
            Generated: {new Date(data.generatedAt).toLocaleString()}
          </Typography>
        </Box>
      </>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minHeight: '100%',
        overflowY: 'auto',
        borderRadius: '0 0 8px 8px',
        backgroundColor: '#F8F8FF',
        p: 2,
      }}
    >
      <CardBox
        customSx={{
          padding: 2,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.common.white, 0.82),
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: neutral?.[50],
              borderRadius: '8px',
              padding: '10px',
            }}
          >
            <InsightsIcon sx={{ fontSize: '20px', color: theme.palette.text.primary }} />
          </Box>
          <Box>
            <Typography
              sx={{
                color: neutral?.[900],
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '24px',
              }}
            >
              Portfolio Recap
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: neutral?.[400],
                lineHeight: '18px',
              }}
            >
              AI-powered monthly portfolio analysis
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {scenarios.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
              }}
            >
              <ScienceIcon sx={{ fontSize: '16px', color: '#d97706' }} />
              <Select
                value={activeScenario?.id || ''}
                onChange={(e) => handleScenarioChange(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#b45309',
                  '& .MuiSelect-select': { py: 0, pr: 2 },
                }}
              >
                {scenarios.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
          <MonthSelector month={month} year={year} onChange={handleMonthChange} />
          <Tooltip title="Regenerate recap">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': { backgroundColor: neutral?.[100] },
              }}
            >
              <RefreshIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardBox>

      {renderContent()}
    </Box>
  );
};

export default PortfolioRecap;
