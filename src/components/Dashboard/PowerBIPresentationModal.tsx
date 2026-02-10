import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import type { PortfolioData } from '../../types';
import { generatePowerBIPresentation } from '../../services/openai';

interface PowerBIPresentationModalProps {
  open: boolean;
  onClose: () => void;
  portfolioData?: PortfolioData;
  historicalData?: PortfolioData[];
}

const LINE_CHART_QUERY =
  'create A line chart illustrating the delinquency trend over time, showing how the number of delinquent loans has changed from October 2025 to January 2026';
const CASH_FLOW_QUERY =
  "create A bar chart comparing 'Money In' (Collections) vs 'Money Out' (Disbursements) across each of these months, so stakeholders can easily see changes in cash flow";
const TABLE_QUERY =
  'Tables or matrix visuals providing detailed loan data, such as active loans, principal balances, and specific borrower action items for quick reference';

export default function PowerBIPresentationModal({
  open,
  onClose,
  portfolioData,
  historicalData = [],
}: PowerBIPresentationModalProps) {
  const [lineResult, setLineResult] = useState('');
  const [lineLoading, setLineLoading] = useState(false);
  const [lineError, setLineError] = useState<string | null>(null);
  const [cashFlowResult, setCashFlowResult] = useState('');
  const [cashFlowLoading, setCashFlowLoading] = useState(false);
  const [cashFlowError, setCashFlowError] = useState<string | null>(null);
  const [tableResult, setTableResult] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  useEffect(() => {
    let isCancelled = false;

    const fetchLineAndCashFlow = async () => {
      try {
        setLineLoading(true);
        setLineError(null);
        const presentation = await generatePowerBIPresentation(LINE_CHART_QUERY);
        if (!isCancelled) {
          setLineResult(presentation);
        }
      } catch {
        if (!isCancelled) {
          setLineError('Failed to generate delinquency presentation.');
        }
      } finally {
        if (!isCancelled) {
          setLineLoading(false);
        }
      }

      if (isCancelled) return;

      try {
        setCashFlowLoading(true);
        setCashFlowError(null);
        const presentation = await generatePowerBIPresentation(CASH_FLOW_QUERY);
        if (!isCancelled) {
          setCashFlowResult(presentation);
        }
      } catch {
        if (!isCancelled) {
          setCashFlowError('Failed to generate cash flow presentation.');
        }
      } finally {
        if (!isCancelled) {
          setCashFlowLoading(false);
        }
      }

      if (isCancelled) return;

      try {
        setTableLoading(true);
        setTableError(null);
        const presentation = await generatePowerBIPresentation(TABLE_QUERY);
        if (!isCancelled) {
          setTableResult(presentation);
        }
      } catch {
        if (!isCancelled) {
          setTableError('Failed to generate loan table presentation.');
        }
      } finally {
        if (!isCancelled) {
          setTableLoading(false);
        }
      }
    };

    if (open) {
      setLineResult('');
      setLineError(null);
      setCashFlowResult('');
      setCashFlowError(null);
      setTableResult('');
      setTableError(null);
      fetchLineAndCashFlow();
    } else {
      setLineLoading(false);
      setCashFlowLoading(false);
      setTableLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [open]);

  const delinquencyChartData = useMemo(() => {
    const timeline = [
      { month: 'October', year: 2025 },
      { month: 'November', year: 2025 },
      { month: 'December', year: 2025 },
      { month: 'January', year: 2026 },
    ];
    const map = new Map<string, number>();
    [...(historicalData ?? []), portfolioData]
      .filter((item): item is PortfolioData => Boolean(item))
      .forEach(item => {
        const key = `${item.month}-${item.year}`;
        map.set(key, item.delinquent?.total ?? 0);
      });

    return timeline.map(period => {
      const key = `${period.month}-${period.year}`;
      const total = map.get(key);
      return {
        label: `${period.month.slice(0, 3)} ${String(period.year).slice(-2)}`,
        delinquent: typeof total === 'number' ? total : null,
      };
    });
  }, [historicalData, portfolioData]);

  const hasChartData = delinquencyChartData.some(point => typeof point.delinquent === 'number');
  const cashFlowChartData = useMemo(() => {
    const timeline = [
      { month: 'October', year: 2025 },
      { month: 'November', year: 2025 },
      { month: 'December', year: 2025 },
      { month: 'January', year: 2026 },
    ];
    const map = new Map<string, { moneyIn: number; moneyOut: number }>();
    [...(historicalData ?? []), portfolioData]
      .filter((item): item is PortfolioData => Boolean(item))
      .forEach(item => {
        const key = `${item.month}-${item.year}`;
        map.set(key, {
          moneyIn: item.cashFlow?.moneyIn ?? 0,
          moneyOut: item.cashFlow?.moneyOut ?? 0,
        });
      });

    return timeline.map(period => {
      const key = `${period.month}-${period.year}`;
      const values = map.get(key);
      return {
        label: `${period.month.slice(0, 3)} ${String(period.year).slice(-2)}`,
        moneyIn: values ? values.moneyIn : null,
        moneyOut: values ? values.moneyOut : null,
      };
    });
  }, [historicalData, portfolioData]);
  const hasCashFlowData = cashFlowChartData.some(
    point => typeof point.moneyIn === 'number' || typeof point.moneyOut === 'number'
  );
  const loanTableData = useMemo(() => {
    const timeline = [
      { month: 'October', year: 2025 },
      { month: 'November', year: 2025 },
      { month: 'December', year: 2025 },
      { month: 'January', year: 2026 },
    ];
    return timeline.map(period => {
      const entry = [...(historicalData ?? []), portfolioData].find(
        item => item?.month === period.month && item?.year === period.year
      );
      return {
        label: `${period.month} ${period.year}`,
        activeLoans: entry?.activeLoans ?? null,
        principalBalance: entry?.principalBalance ?? null,
        actionItems: entry?.actionItems?.length ?? null,
      };
    });
  }, [historicalData, portfolioData]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, p: 2, width: '80vw', maxWidth: '80vw' } }}
    >
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Power BI Presentation</DialogTitle>
      <DialogContent
        sx={{
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontSize: '14px', color: neutral?.[700] }}>
            Delinquency trend overview (October 2025 – January 2026)
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 320,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${neutral?.[200]}`,
              backgroundColor: theme.palette.background.paper,
              flexShrink: 0,
            }}
          >
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={delinquencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={neutral?.[200]} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: neutral?.[600] }} />
                  <YAxis
                    tick={{ fontSize: 12, fill: neutral?.[600] }}
                    label={{ value: 'Delinquent Loans', angle: -90, position: 'insideLeft', offset: 10 }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: number | string | Array<number | string>) =>
                      typeof value === 'number' ? value : value ?? 'N/A'
                    }
                    labelFormatter={label => `Period: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="delinquent"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: neutral?.[500], fontSize: '14px' }}>
                  Delinquency data unavailable for the requested timeframe.
                </Typography>
              </Box>
            )}
          </Box>
          {lineLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: neutral?.[600], flexShrink: 0 }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>Contacting OpenAI backend...</Typography>
            </Box>
          ) : lineError ? (
            <Typography sx={{ color: theme.palette.error.main, fontSize: '13px', flexShrink: 0 }}>{lineError}</Typography>
          ) : (
            <Box
              sx={{
                fontSize: '14px',
                color: neutral?.[900],
                '& p': { mb: 1.5 },
                '& ul': { pl: 3, mb: 1.5 },
                '& li': { mb: 0.75 },
                flexShrink: 0,
              }}
            >
              <ReactMarkdown>{lineResult || 'Awaiting presentation details.'}</ReactMarkdown>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontSize: '14px', color: neutral?.[700] }}>
            Cash flow comparison (Collections vs Disbursements)
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 320,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${neutral?.[200]}`,
              backgroundColor: theme.palette.background.paper,
              flexShrink: 0,
            }}
          >
            {hasCashFlowData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={neutral?.[200]} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: neutral?.[600] }} />
                  <YAxis tick={{ fontSize: 12, fill: neutral?.[600] }} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: number | string | Array<number | string>) =>
                      typeof value === 'number'
                        ? `$${value.toLocaleString()}`
                        : Array.isArray(value)
                          ? value
                          : value ?? 'N/A'
                    }
                    labelFormatter={label => `Period: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="moneyIn" name="Money In" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="moneyOut" name="Money Out" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: neutral?.[500], fontSize: '14px' }}>
                  Cash flow data unavailable for the requested timeframe.
                </Typography>
              </Box>
            )}
          </Box>
          {cashFlowLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: neutral?.[600], flexShrink: 0 }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>Contacting OpenAI backend...</Typography>
            </Box>
          ) : cashFlowError ? (
            <Typography sx={{ color: theme.palette.error.main, fontSize: '13px', flexShrink: 0 }}>
              {cashFlowError}
            </Typography>
          ) : (
            <Box
              sx={{
                fontSize: '14px',
                color: neutral?.[900],
                '& p': { mb: 1.5 },
                '& ul': { pl: 3, mb: 1.5 },
                '& li': { mb: 0.75 },
                flexShrink: 0,
              }}
            >
              <ReactMarkdown>{cashFlowResult || 'Awaiting presentation details.'}</ReactMarkdown>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontSize: '14px', color: neutral?.[700] }}>Loan details snapshot</Typography>
          <Box
            sx={{
              width: '100%',
              p: 2,
              borderRadius: 2,
              border: `1px solid ${neutral?.[200]}`,
              backgroundColor: theme.palette.background.paper,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
              {loanTableData.map(row => (
                <Box
                  key={row.label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: `1px solid ${neutral?.[200]}`,
                    backgroundColor: neutral?.[50],
                  }}
                >
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: neutral?.[800] }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '12px', color: neutral?.[600] }}>
                    Active Loans:{' '}
                    <strong>{typeof row.activeLoans === 'number' ? row.activeLoans : 'Not available'}</strong>
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: neutral?.[600] }}>
                    Principal Balance:{' '}
                    <strong>
                      {typeof row.principalBalance === 'number'
                        ? `$${row.principalBalance.toLocaleString()}`
                        : 'Not available'}
                    </strong>
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: neutral?.[600] }}>
                    Action Items:{' '}
                    <strong>
                      {typeof row.actionItems === 'number' ? `${row.actionItems} open` : 'Not available'}
                    </strong>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          {tableLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: neutral?.[600], flexShrink: 0 }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>Contacting OpenAI backend...</Typography>
            </Box>
          ) : tableError ? (
            <Typography sx={{ color: theme.palette.error.main, fontSize: '13px', flexShrink: 0 }}>
              {tableError}
            </Typography>
          ) : (
            <Box
              sx={{
                fontSize: '14px',
                color: neutral?.[900],
                '& p': { mb: 1.5 },
                '& ul': { pl: 3, mb: 1.5 },
                '& li': { mb: 0.75 },
                flexShrink: 0,
              }}
            >
              <ReactMarkdown>{tableResult || 'Awaiting presentation details.'}</ReactMarkdown>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ pt: 0.5 }}>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
