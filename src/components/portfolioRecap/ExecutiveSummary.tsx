import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CardBox from './CardBox';
import type { Sentiment } from '../../types/portfolioRecap';

type ExecutiveSummaryProps = {
  headline: string | null;
  summary: string;
  keyTakeaway: string | null;
  sentiment?: Sentiment;
};

const sentimentConfig = {
  good: {
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    textColor: '#166534',
    icon: TrendingUpIcon,
  },
  neutral: {
    bgColor: '#fefce8',
    borderColor: '#fde047',
    textColor: '#854d0e',
    icon: TrendingFlatIcon,
  },
  bad: {
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    textColor: '#991b1b',
    icon: TrendingDownIcon,
  },
};

const ExecutiveSummary = ({ headline, summary, keyTakeaway, sentiment = 'neutral' }: ExecutiveSummaryProps) => {
  const theme = useTheme();
  const blueColor = (theme.palette as { ui?: { iconBlue?: string }; blue?: string }).ui?.iconBlue ?? (theme.palette as { blue?: string }).blue ?? theme.palette.primary.main;
  const config = sentimentConfig[sentiment];
  const SentimentIcon = config.icon;

  return (
    <CardBox
      customSx={{
        padding: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.common.white, 0.82),
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
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
              backgroundColor: alpha(blueColor, 0.08),
              borderRadius: '8px',
              padding: '10px',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: '1.25rem', color: blueColor }} />
          </Box>
          <Typography
            sx={{
              color: (theme.palette as { neutral?: Record<string, string> }).neutral?.[900],
              fontWeight: 400,
              fontSize: '1.125rem',
              lineHeight: '24px',
            }}
          >
            AI Summary
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: alpha(blueColor, 0.04),
            borderRadius: '6px',
            borderLeft: `3px solid ${blueColor}`,
          }}
        >
          {headline && (
            <Typography
              sx={{
                fontSize: '0.9375rem',
                lineHeight: '22px',
                color: (theme.palette as { neutral?: Record<string, string> }).neutral?.[900],
                fontWeight: 500,
                mb: 0.75,
              }}
            >
              {headline}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: (theme.palette as { neutral?: Record<string, string> }).neutral?.[700],
              fontWeight: 400,
            }}
          >
            {summary}
          </Typography>
        </Box>

        {keyTakeaway && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1.25,
              px: 1.5,
              backgroundColor: config.bgColor,
              borderRadius: '6px',
              border: `1px solid ${config.borderColor}`,
            }}
          >
            <SentimentIcon
              sx={{
                fontSize: '1.125rem',
                color: config.textColor,
                mt: '1px',
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  lineHeight: '14px',
                  color: config.textColor,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 0.5,
                }}
              >
                Key Takeaway
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: config.textColor,
                  fontWeight: 400,
                }}
              >
                {keyTakeaway}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </CardBox>
  );
};

export default ExecutiveSummary;
