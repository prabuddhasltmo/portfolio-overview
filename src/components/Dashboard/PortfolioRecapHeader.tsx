import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  ClickAwayListener,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import InsightsIcon from '@mui/icons-material/Insights';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScienceIcon from '@mui/icons-material/Science';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import { FileText, Sparkles, Send, Activity } from 'lucide-react';
import type { Scenario } from '../../services/openai';
import type { PortfolioData, Sentiment, DashboardSnapshot } from '../../types';
import type { DashboardCardConfig } from '../../types/dashboardConfig';
import CardBox from './CardBox';
import ReportViewerModal from './ReportViewerModal';
import PowerBIPresentationModal from './PowerBIPresentationModal';
import { MONTHS, getDefaultYears } from '../../constants/periods';

export interface PeriodOption {
  month: string;
  year: number;
}

interface PortfolioRecapHeaderProps {
  month: string;
  year: number;
  periods?: PeriodOption[];
  onPeriodChange?: (month: string, year: number) => void;
  onRefresh?: () => void;
  scenarios?: Scenario[];
  onScenarioChange?: (id: string) => void;
  loading?: boolean;
  portfolioData?: PortfolioData;
  historicalData?: PortfolioData[];
  scenarioSentiment?: Sentiment;
  dashboardCards?: DashboardCardConfig[];
  dashboardSnapshot?: DashboardSnapshot | null;
  onCustomize?: () => void;
}

function getAvailableYears(periods: PeriodOption[]): number[] {
  if (periods.length === 0) return getDefaultYears();
  const years = [...new Set(periods.map((p) => p.year))].sort((a, b) => a - b);
  return years;
}

export default function PortfolioRecapHeader({
  month,
  year,
  periods = [],
  onPeriodChange,
  onRefresh,
  scenarios = [],
  onScenarioChange,
  loading = false,
  portfolioData,
  historicalData = [],
  scenarioSentiment,
  dashboardCards = [],
  dashboardSnapshot,
  onCustomize,
}: PortfolioRecapHeaderProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [askAIVisible, setAskAIVisible] = useState(false);
  const [askAIValue, setAskAIValue] = useState('');
  const [powerBIModalOpen, setPowerBIModalOpen] = useState(false);
  const availableYears = getAvailableYears(periods);
  const displayMonth = MONTHS.includes(month as (typeof MONTHS)[number]) ? month : MONTHS[0];
  const displayYear = availableYears.includes(year) ? year : availableYears[0] ?? year;
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const ui = (theme.palette as { ui?: Record<string, string> }).ui;
  const activeScenario = scenarios.find((scenario) => scenario.active);
  const handleAskAISubmit = () => {
    const trimmed = askAIValue.trim();
    if (!trimmed) return;
    window.dispatchEvent(new CustomEvent('ask-ai-request', { detail: { question: trimmed } }));
    setAskAIValue('');
    setAskAIVisible(false);
    document.getElementById('ask-ai-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectStyles = {
    fontSize: '14px',
    color: neutral?.[800],
    backgroundColor: theme.palette.common.white,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: ui?.border ?? neutral?.[200],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  };

  return (
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Power BI Presentation" placement="bottom">
            <IconButton
              onClick={() => setPowerBIModalOpen(true)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: theme.palette.error.main,
                color: '#fff',
                boxShadow: theme.shadows[3],
                '&:hover': { background: theme.palette.error.dark },
              }}
            >
              <Activity size={18} />
            </IconButton>
          </Tooltip>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <Tooltip title="Ask AI" placement="bottom">
              <IconButton
                onClick={() => setAskAIVisible((prev) => !prev)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                  color: '#fff',
                  boxShadow: theme.shadows[3],
                  '&:hover': { background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.info.dark})` },
                }}
              >
                <Sparkles size={18} />
              </IconButton>
            </Tooltip>
            {askAIVisible && (
              <ClickAwayListener
                onClickAway={(event) => {
                  const target = event.target as HTMLElement;
                  if (!target.closest('.ask-ai-overlay')) {
                    setAskAIVisible(false);
                    setAskAIValue('');
                  }
                }}
              >
                <Box
                  className="ask-ai-overlay"
                  sx={{
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 300,
                    p: 1.5,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: theme.shadows[6],
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    zIndex: 10,
                  }}
                >
                  <TextField
                    size="small"
                    autoFocus
                    placeholder="Ask AI..."
                    value={askAIValue}
                    onChange={(e) => setAskAIValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAskAISubmit();
                      } else if (e.key === 'Escape') {
                        setAskAIVisible(false);
                        setAskAIValue('');
                      }
                    }}
                    fullWidth
                  />
                  <IconButton
                    onClick={handleAskAISubmit}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      '&:hover': { backgroundColor: theme.palette.primary.dark },
                    }}
                  >
                    <Send size={14} />
                  </IconButton>
                </Box>
              </ClickAwayListener>
            )}
          </Box>
        </Box>

        {scenarios.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={activeScenario?.id ?? ''}
              onChange={(event) => onScenarioChange?.(String(event.target.value))}
              displayEmpty
              renderValue={(value) => {
                const selected = scenarios.find((scenario) => scenario.id === value);
                const scenarioColor =
                  selected?.id === 'trending-up'
                    ? theme.palette.success.main
                    : selected?.id === 'trending-down'
                      ? theme.palette.error.main
                      : theme.palette.warning.main;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon sx={{ fontSize: 16, color: scenarioColor }} />
                    <Typography sx={{ fontSize: '13px', color: scenarioColor }}>
                      {selected?.name ?? 'Select scenario'}
                    </Typography>
                  </Box>
                );
              }}
              sx={selectStyles}
            >
              {scenarios.map((scenario) => (
                <MenuItem key={scenario.id} value={scenario.id} sx={{ fontSize: '14px' }}>
                  {scenario.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {onPeriodChange ? (
          <>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={displayMonth}
                onChange={(e) => onPeriodChange(String(e.target.value), displayYear)}
                sx={{
                  ...selectStyles,
                  borderRadius: '6px',
                  '& .MuiSelect-select': { py: 0.75, px: 1.5 },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: '14px' }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={displayYear}
                onChange={(e) => onPeriodChange(displayMonth, Number(e.target.value))}
                sx={{
                  ...selectStyles,
                  borderRadius: '6px',
                  '& .MuiSelect-select': { py: 0.75, px: 1.5 },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                {availableYears.map((y) => (
                  <MenuItem key={y} value={y} sx={{ fontSize: '14px' }}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                borderRadius: '6px',
                border: `1px solid ${ui?.border ?? neutral?.[200]}`,
                backgroundColor: theme.palette.common.white,
              }}
            >
              <Typography sx={{ fontSize: '14px', color: neutral?.[800] }}>{month}</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: neutral?.[500] }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                borderRadius: '6px',
                border: `1px solid ${ui?.border ?? neutral?.[200]}`,
                backgroundColor: theme.palette.common.white,
              }}
            >
              <Typography sx={{ fontSize: '14px', color: neutral?.[800] }}>{year}</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: neutral?.[500] }} />
            </Box>
          </>
        )}

        <Tooltip title="Refresh AI insights">
          <span>
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': { backgroundColor: neutral?.[100] },
              }}
              size="small"
            >
              <RefreshIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </span>
        </Tooltip>

        <IconButton
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{
            color: neutral?.[600],
            '&:hover': { backgroundColor: neutral?.[100] },
          }}
          size="small"
        >
          <MoreVertIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                mt: 0.5,
                borderRadius: '10px',
                border: `1px solid ${neutral?.[200]}`,
                minWidth: 200,
              },
            },
          }}
        >
          {portfolioData && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setReportModalOpen(true);
              }}
              sx={{
                py: 1.25,
                px: 2,
                mx: 1,
                borderRadius: '6px',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: neutral?.[600] }}>
                <FileText size={18} />
              </ListItemIcon>
              <ListItemText
                primary="View Report"
                primaryTypographyProps={{ fontSize: '14px', fontWeight: 500, color: neutral?.[800] }}
              />
            </MenuItem>
          )}
          {portfolioData && onCustomize && <Divider sx={{ my: 0.5 }} />}
          {onCustomize && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onCustomize();
              }}
              sx={{
                py: 1.25,
                px: 2,
                mx: 1,
                borderRadius: '6px',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: neutral?.[600] }}>
                <SettingsIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Customize Dashboard"
                primaryTypographyProps={{ fontSize: '14px', fontWeight: 500, color: neutral?.[800] }}
              />
            </MenuItem>
          )}
        </Menu>
      </Box>

      {portfolioData && (
        <ReportViewerModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          portfolioData={portfolioData}
          historicalData={historicalData}
          scenarioSentiment={scenarioSentiment}
          dashboardCards={dashboardCards}
          dashboardSnapshot={dashboardSnapshot}
        />
      )}
      <PowerBIPresentationModal
        open={powerBIModalOpen}
        onClose={() => setPowerBIModalOpen(false)}
        portfolioData={portfolioData}
        historicalData={historicalData}
      />
    </CardBox>
  );
}
