import { Box, Typography, Divider } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Delinquent } from '../../types';
import CardBox from './CardBox';

interface DelinquentLoansProps {
  data: Delinquent;
  activeLoans: number;
}

export default function DelinquentLoans({ data, activeLoans }: DelinquentLoansProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: neutral?.[900], lineHeight: '20px', fontWeight: 400 }}>
            Total Delinquent
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 400, color: neutral?.[900], lineHeight: '24px' }}>
              {data.total}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px' }}>
              of {activeLoans.toLocaleString()} active loans ({data.percentage.toFixed(1)}%)
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: neutral?.[200] }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 1, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px', minWidth: '100px' }}>
                30 Days
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#FFC107', fontWeight: 400, lineHeight: '18px' }}>
                {data.breakdown.thirtyDays}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px', minWidth: '100px' }}>
                60 Days
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#FF9800', fontWeight: 400, lineHeight: '18px' }}>
                {data.breakdown.sixtyDays}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px', minWidth: '100px' }}>
                90+ Days
              </Typography>
              <Typography sx={{ fontSize: '13px', color: theme.palette.error.main, fontWeight: 400, lineHeight: '18px' }}>
                {data.breakdown.ninetyPlusDays}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </CardBox>
  );
}
