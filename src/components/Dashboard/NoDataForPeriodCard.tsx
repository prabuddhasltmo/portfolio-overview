import { Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CardBox from './CardBox';

const MESSAGE = 'No data available for this month';

export default function NoDataForPeriodCard() {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  return (
    <CardBox
      customSx={{
        padding: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.common.white, 0.82),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 120,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: neutral?.[600],
          textAlign: 'center',
        }}
      >
        {MESSAGE}
      </Typography>
    </CardBox>
  );
}
