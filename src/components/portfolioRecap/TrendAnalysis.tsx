import { Box, Typography, Divider } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import CardBox from './CardBox';
import type { PortfolioTrends } from '../../types/portfolioRecap';

type TrendAnalysisProps = {
  trends: PortfolioTrends;
};

const TrendAnalysis = ({ trends }: TrendAnalysisProps) => {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const green = (theme.palette as { green?: { dark: string } }).green;

  const formatChange = (value: number, positiveIsGood: boolean) => {
    const color =
      value === 0
        ? neutral?.[500]
        : value > 0
          ? positiveIsGood
            ? green?.dark ?? '#2e7d32'
            : theme.palette.error.main
          : positiveIsGood
            ? theme.palette.error.main
            : green?.dark ?? '#2e7d32';
    return (
      <Typography sx={{ fontSize: '14px', color, lineHeight: '20px', fontWeight: 400 }}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}%
      </Typography>
    );
  };

  return (
    <CardBox
      customSx={{
        padding: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.common.white, 0.82),
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <TimelineIcon sx={{ fontSize: '20px', color: theme.palette.text.primary }} />
          </Box>
          <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '18px', lineHeight: '24px' }}>
            Month-over-Month Trends
          </Typography>
        </Box>

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
            PERCENTAGE CHANGES
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              paddingY: 1.5,
              paddingX: 2,
              borderRadius: 0.5,
              backgroundColor: neutral?.[50],
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Collections
              </Typography>
              {formatChange(trends.moneyInChange, true)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Disbursements
              </Typography>
              {formatChange(trends.moneyOutChange, false)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Delinquency
              </Typography>
              {formatChange(trends.delinquencyChange, false)}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: neutral?.[200] }} />

        <Box sx={{ display: 'flex', gap: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
              New Loans:
            </Typography>
            <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '14px', lineHeight: '20px' }}>
              {trends.newLoansCount}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
              Paid Off:
            </Typography>
            <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '14px', lineHeight: '20px' }}>
              {trends.paidOffLoansCount}
            </Typography>
          </Box>
        </Box>

        {trends.trendSummary && (
          <Box sx={{ p: 2, backgroundColor: neutral?.[50], borderRadius: '4px' }}>
            <Typography
              sx={{
                fontSize: '14px',
                color: neutral?.[700],
                lineHeight: '20px',
                fontWeight: 400,
                fontStyle: 'italic',
              }}
            >
              {trends.trendSummary}
            </Typography>
          </Box>
        )}
      </Box>
    </CardBox>
  );
};

export default TrendAnalysis;
