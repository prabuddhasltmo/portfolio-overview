import { Box, Typography, ButtonBase, Select, MenuItem, FormControl } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChevronDown, HelpCircle, Bell, Settings, RefreshCw, X, Zap, FlaskConical } from 'lucide-react';
import type { Scenario } from '../../services/openai';

interface HeaderProps {
  month: string;
  year: number;
  onRefresh?: () => void;
  scenarios?: Scenario[];
  onScenarioChange?: (id: string) => void;
}

export default function Header({ month, year, onRefresh, scenarios = [], onScenarioChange }: HeaderProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const activeScenario = scenarios.find((s) => s.active);

  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          height: 40,
          bgcolor: neutral?.[100],
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
          <ButtonBase
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              fontSize: 13,
              color: neutral?.[600],
              bgcolor: neutral?.[200],
              '&:hover': { bgcolor: neutral?.[300] },
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
            All Loans
          </ButtonBase>
          <ButtonBase
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              fontSize: 13,
              color: 'primary.dark',
              bgcolor: 'background.paper',
              border: `1px solid ${neutral?.[200]}`,
              borderBottom: 'none',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
            Portfolio Recap
            <X size={14} style={{ marginLeft: 4, color: neutral?.[400] }} />
          </ButtonBase>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0.75, pr: 1 }}>
          <Typography sx={{ fontSize: 13, color: neutral?.[600] }}>Keevon Test Database</Typography>
          <ButtonBase sx={{ p: 0.75, color: neutral?.[500], '&:hover': { color: neutral?.[700], bgcolor: neutral?.[200] }, borderRadius: 1 }}>
            <HelpCircle size={16} />
          </ButtonBase>
          <ButtonBase sx={{ p: 0.75, color: neutral?.[500], '&:hover': { color: neutral?.[700], bgcolor: neutral?.[200] }, borderRadius: 1 }}>
            <Bell size={16} />
          </ButtonBase>
          <ButtonBase sx={{ p: 0.75, color: neutral?.[500], '&:hover': { color: neutral?.[700], bgcolor: neutral?.[200] }, borderRadius: 1 }}>
            <Settings size={16} />
          </ButtonBase>
          <Box
            sx={{
              width: 28,
              height: 28,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 500,
              ml: 0.5,
            }}
          >
            K
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${neutral?.[200]}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.light',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={16} style={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: neutral?.[900] }}>Portfolio Recap</Typography>
            <Typography sx={{ fontSize: 12, color: neutral?.[500] }}>AI-powered monthly portfolio analysis</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {scenarios.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={activeScenario?.id ?? ''}
                onChange={(e) => onScenarioChange?.(e.target.value)}
                sx={{
                  fontSize: 13,
                  color:
                    activeScenario?.id === 'trending-up'
                      ? 'success.dark'
                      : activeScenario?.id === 'trending-down'
                        ? 'error.dark'
                        : 'warning.dark',
                  bgcolor:
                    activeScenario?.id === 'trending-up'
                      ? 'success.light'
                      : activeScenario?.id === 'trending-down'
                        ? 'error.light'
                        : 'warning.light',
                  border: `1px solid`,
                  borderColor:
                    activeScenario?.id === 'trending-up'
                      ? 'success.main'
                      : activeScenario?.id === 'trending-down'
                        ? 'error.main'
                        : 'warning.main',
                  borderRadius: 1,
                  '& .MuiSelect-select': { py: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 },
                }}
                renderValue={(value) => {
                  const selected = scenarios.find((s) => s.id === value);
                  const scenarioColor =
                    selected?.id === 'trending-up'
                      ? theme.palette.success.main
                      : selected?.id === 'trending-down'
                        ? theme.palette.error.main
                        : theme.palette.warning.main;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <FlaskConical size={14} color={scenarioColor} />
                      {selected?.name ?? value}
                    </Box>
                  );
                }}
              >
                {scenarios.map((s) => (
                  <MenuItem key={s.id} value={s.id} sx={{ fontSize: 13 }}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <ButtonBase
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              border: `1px solid ${neutral?.[300]}`,
              borderRadius: 1,
              fontSize: 13,
              color: neutral?.[700],
              '&:hover': { bgcolor: neutral?.[50] },
            }}
          >
            {month}
            <ChevronDown size={14} />
          </ButtonBase>

          <ButtonBase
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              border: `1px solid ${neutral?.[300]}`,
              borderRadius: 1,
              fontSize: 13,
              color: neutral?.[700],
              '&:hover': { bgcolor: neutral?.[50] },
            }}
          >
            {year}
            <ChevronDown size={14} />
          </ButtonBase>

          <ButtonBase
            onClick={onRefresh}
            sx={{
              p: 0.75,
              color: neutral?.[500],
              '&:hover': { color: neutral?.[700], bgcolor: neutral?.[100] },
              borderRadius: 1,
            }}
            title="Refresh AI insights"
          >
            <RefreshCw size={16} />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}
