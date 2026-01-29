import { Box, Typography, Divider } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardBox from './CardBox';
import type { PortfolioTrends } from '../../types/portfolioRecap';

type MoneyFlowCardProps = {
  moneyIn: number;
  moneyOut: number;
  trends: PortfolioTrends | null;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const MoneyFlowCard = ({ moneyIn, moneyOut, trends }: MoneyFlowCardProps) => {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const green = (theme.palette as { green?: { dark: string } }).green;

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
            <AccountBalanceWalletIcon sx={{ fontSize: '20px', color: theme.palette.text.primary }} />
          </Box>
          <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '18px', lineHeight: '24px' }}>
            Cash Flow
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: neutral?.[900], lineHeight: '20px', fontWeight: 400 }}>
            Money In (Collections)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 400, color: green?.dark ?? '#2e7d32', lineHeight: '24px' }}>
              {formatCurrency(moneyIn)}
            </Typography>
            {trends && trends.moneyInChange !== 0 && (
              <Typography
                sx={{
                  fontSize: '12px',
                  color: trends.moneyInChange > 0 ? (green?.dark ?? '#2e7d32') : theme.palette.error.main,
                  lineHeight: '16px',
                }}
              >
                {trends.moneyInChange > 0 ? '+' : ''}{trends.moneyInChange.toFixed(1)}%
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: neutral?.[200] }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: neutral?.[900], lineHeight: '20px', fontWeight: 400 }}>
            Money Out (Disbursements)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 400, color: theme.palette.error.main, lineHeight: '24px' }}>
              {formatCurrency(moneyOut)}
            </Typography>
            {trends && trends.moneyOutChange !== 0 && (
              <Typography
                sx={{
                  fontSize: '12px',
                  color: trends.moneyOutChange > 0 ? theme.palette.error.main : (green?.dark ?? '#2e7d32'),
                  lineHeight: '16px',
                }}
              >
                {trends.moneyOutChange > 0 ? '+' : ''}{trends.moneyOutChange.toFixed(1)}%
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: neutral?.[200] }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: neutral?.[900], lineHeight: '20px', fontWeight: 400 }}>
            Net Cash Flow
          </Typography>
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              color: moneyIn - moneyOut >= 0 ? (green?.dark ?? '#2e7d32') : theme.palette.error.main,
              lineHeight: '24px',
            }}
          >
            {moneyIn - moneyOut >= 0 ? '+ ' : ''}{formatCurrency(moneyIn - moneyOut)}
          </Typography>
        </Box>
      </Box>
    </CardBox>
  );
};

export default MoneyFlowCard;
