import { Box, Typography, Divider } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Delinquent } from '../../types';
import CardBox from './CardBox';

interface DelinquentLoansProps {
  data: Delinquent;
  activeLoans: number;
}

interface HorizontalBarProps {
  value: number;
  maxValue: number;
  color: string;
  label: string;
  displayValue: number;
}

function HorizontalBar({ value, maxValue, color, label, displayValue }: HorizontalBarProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px', minWidth: '80px', flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, position: 'relative', height: 4, backgroundColor: neutral?.[100], borderRadius: '2px', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: '2px',
            transition: 'width 0.5s ease-out',
          }}
        />
      </Box>
      <Typography sx={{ fontSize: '13px', color, fontWeight: 500, lineHeight: '18px', minWidth: '32px', textAlign: 'right' }}>
        {displayValue}
      </Typography>
    </Box>
  );
}

// Interpolate color: green → yellow → orange → red
function getDelinquencyColor(percentage: number): string {
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  
  // Define color stops: green (0%), yellow (33%), orange (66%), red (100%)
  // Green: #22c55e (34,197,94), Yellow: #FFC107 (255,193,7), Orange: #FF9800 (255,152,0), Red: #ef4444 (239,68,68)
  
  let r: number, g: number, b: number;
  
  if (clampedPct <= 33) {
    // Green to Yellow (0-33%)
    const t = clampedPct / 33;
    r = Math.round(34 + (255 - 34) * t);
    g = Math.round(197 + (193 - 197) * t);
    b = Math.round(94 + (7 - 94) * t);
  } else if (clampedPct <= 66) {
    // Yellow to Orange (33-66%)
    const t = (clampedPct - 33) / 33;
    r = Math.round(255 + (255 - 255) * t);
    g = Math.round(193 + (152 - 193) * t);
    b = Math.round(7 + (0 - 7) * t);
  } else {
    // Orange to Red (66-100%)
    const t = (clampedPct - 66) / 34;
    r = Math.round(255 + (239 - 255) * t);
    g = Math.round(152 + (68 - 152) * t);
    b = Math.round(0 + (68 - 0) * t);
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

export default function DelinquentLoans({ data, activeLoans }: DelinquentLoansProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  const maxBreakdown = Math.max(data.breakdown.thirtyDays, data.breakdown.sixtyDays, data.breakdown.ninetyPlusDays, 1);
  const delinquencyPercent = data.percentage;

  return (
    <CardBox
      customSx={{
        padding: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.common.white, 0.82),
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            <WarningAmberIcon sx={{ fontSize: '20px', color: theme.palette.text.primary }} />
          </Box>
          <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '18px', lineHeight: '24px' }}>
            Delinquent Loans
          </Typography>
        </Box>

        {/* Total Delinquent with main progress bar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: '14px', color: neutral?.[900], lineHeight: '20px', fontWeight: 400 }}>
              Total Delinquent
            </Typography>
            <Typography sx={{ fontSize: '14px', color: neutral?.[700], fontWeight: 500 }}>
              {data.total} <Typography component="span" sx={{ fontSize: '12px', color: neutral?.[500], fontWeight: 400 }}>of {activeLoans.toLocaleString()}</Typography>
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', height: 6, backgroundColor: neutral?.[100], borderRadius: '3px', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${Math.min(delinquencyPercent, 100)}%`,
                backgroundColor: getDelinquencyColor(delinquencyPercent),
                borderRadius: '3px',
                transition: 'width 0.5s ease-out, background-color 0.3s ease',
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '12px', color: getDelinquencyColor(delinquencyPercent), lineHeight: '16px', fontWeight: 500 }}>
            {data.percentage.toFixed(1)}% delinquency rate
          </Typography>
        </Box>

        <Divider sx={{ borderColor: neutral?.[200] }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            sx={{
              color: neutral?.[400],
              fontSize: '12px',
              fontWeight: 400,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              lineHeight: '16px',
            }}
          >
            Breakdown by Days Past Due
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
            <HorizontalBar
              label="30 Days"
              value={data.breakdown.thirtyDays}
              maxValue={maxBreakdown}
              color="#FFC107"
              displayValue={data.breakdown.thirtyDays}
            />
            <HorizontalBar
              label="60 Days"
              value={data.breakdown.sixtyDays}
              maxValue={maxBreakdown}
              color="#FF9800"
              displayValue={data.breakdown.sixtyDays}
            />
            <HorizontalBar
              label="90+ Days"
              value={data.breakdown.ninetyPlusDays}
              maxValue={maxBreakdown}
              color={theme.palette.error.main}
              displayValue={data.breakdown.ninetyPlusDays}
            />
          </Box>
        </Box>
      </Box>
    </CardBox>
  );
}
