import { Box, Typography, Divider } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CardBox from './CardBox';

type PortfolioHealthCardProps = {
  totalLoans: number;
  activeLoans: number;
  totalPrincipalBalance: number;
  totalUnpaidInterest: number;
  totalLateCharges: number;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const PortfolioHealthCard = ({
  totalLoans,
  activeLoans,
  totalPrincipalBalance,
  totalUnpaidInterest,
  totalLateCharges,
}: PortfolioHealthCardProps) => {
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
            <AssessmentIcon sx={{ fontSize: '20px', color: theme.palette.text.primary }} />
          </Box>
          <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '18px', lineHeight: '24px' }}>
            Portfolio Health
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
            PORTFOLIO SUMMARY
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: 'repeat(2, 1fr)',
              gridTemplateColumns: 'repeat(2, 1fr)',
              rowGap: 1.5,
              columnGap: 4,
              paddingY: 1.5,
              paddingX: 2,
              borderRadius: 0.5,
              backgroundColor: neutral?.[50],
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Total Loans:
              </Typography>
              <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '14px', lineHeight: '20px' }}>
                {totalLoans}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Active Loans:
              </Typography>
              <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '14px', lineHeight: '20px' }}>
                {activeLoans}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Principal Balance:
              </Typography>
              <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '14px', lineHeight: '20px' }}>
                {formatCurrency(totalPrincipalBalance)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Unpaid Interest:
              </Typography>
              <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '14px', lineHeight: '20px' }}>
                {formatCurrency(totalUnpaidInterest)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {totalLateCharges > 0 && (
          <>
            <Divider sx={{ borderColor: neutral?.[200] }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: neutral?.[400], fontSize: '13px', lineHeight: '18px', fontWeight: 400 }}>
                Total Late Charges:
              </Typography>
              <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '14px', lineHeight: '20px' }}>
                {formatCurrency(totalLateCharges)}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </CardBox>
  );
};

export default PortfolioHealthCard;
