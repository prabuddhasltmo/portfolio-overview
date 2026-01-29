import { Box, Typography, Divider } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CardBox from './CardBox';

type DelinquentLoansCardProps = {
  delinquentLoans: number;
  activeLoans: number;
  delinquentPercentage: number;
  loans30Days: number;
  loans60Days: number;
  loans90PlusDays: number;
};

const DelinquentLoansCard = ({
  delinquentLoans,
  activeLoans,
  delinquentPercentage,
  loans30Days,
  loans60Days,
  loans90PlusDays,
}: DelinquentLoansCardProps) => {
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
              {delinquentLoans}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px' }}>
              of {activeLoans} active loans ({delinquentPercentage.toFixed(1)}%)
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
            BREAKDOWN BY DAYS PAST DUE
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 1, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px', minWidth: '100px' }}>
                30 Days
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#FFC107', fontWeight: 400, lineHeight: '18px' }}>
                {loans30Days}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px', minWidth: '100px' }}>
                60 Days
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#FF9800', fontWeight: 400, lineHeight: '18px' }}>
                {loans60Days}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography sx={{ fontSize: '12px', color: neutral?.[500], lineHeight: '16px', minWidth: '100px' }}>
                90+ Days
              </Typography>
              <Typography sx={{ fontSize: '13px', color: theme.palette.error.main, fontWeight: 400, lineHeight: '18px' }}>
                {loans90PlusDays}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </CardBox>
  );
};

export default DelinquentLoansCard;
