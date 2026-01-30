import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CardBox from './CardBox';

type ExecutiveSummaryProps = {
  headline: string | null;
  summary: string;
  keyTakeaway: string | null;
  sentiment: 'good' | 'neutral' | 'bad' | null;
  loading?: boolean;
};

const ExecutiveSummary = ({
  headline,
  summary,
  keyTakeaway,
  sentiment,
  loading = false,
}: ExecutiveSummaryProps) => {
  const theme = useTheme();
  const blueColor = (theme.palette as { ui?: { iconBlue?: string }; blue?: string }).ui?.iconBlue ?? (theme.palette as { blue?: string }).blue ?? theme.palette.primary.main;
  const sentimentColors = {
    good: {
      bg: alpha(theme.palette.success?.main ?? '#16a34a', 0.08),
      border: theme.palette.success?.main ?? '#16a34a',
      text: theme.palette.success?.dark ?? '#15803d',
    },
    neutral: {
      bg: alpha(theme.palette.warning?.main ?? '#f59e0b', 0.08),
      border: theme.palette.warning?.main ?? '#f59e0b',
      text: theme.palette.warning?.dark ?? '#b45309',
    },
    bad: {
      bg: alpha(theme.palette.error?.main ?? '#ef4444', 0.08),
      border: theme.palette.error?.main ?? '#ef4444',
      text: theme.palette.error?.dark ?? '#b91c1c',
    },
  } as const;
  const takeawayColors =
    sentiment && sentimentColors[sentiment] ? sentimentColors[sentiment] : null;

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
            minHeight: '96px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={18} />
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: (theme.palette as { neutral?: Record<string, string> }).neutral?.[500],
                }}
              >
                Generating summary…
              </Typography>
            </Box>
          ) : (
            <>
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
            </>
          )}
        </Box>

        {keyTakeaway && !loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1.25,
              px: 1.5,
              backgroundColor:
                takeawayColors?.bg ??
                (theme.palette as { neutral?: Record<string, string> }).neutral?.[50],
              borderRadius: '6px',
              border: `1px solid ${
                takeawayColors?.border ??
                (theme.palette as { neutral?: Record<string, string> }).neutral?.[200]
              }`,
            }}
          >
            <LightbulbOutlinedIcon
              sx={{
                fontSize: '1.125rem',
                color: takeawayColors?.border ?? (theme.palette.warning?.main ?? '#f59e0b'),
                mt: '1px',
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  lineHeight: '14px',
                  color: takeawayColors?.text ?? (theme.palette as { neutral?: Record<string, string> }).neutral?.[500],
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
                  color: takeawayColors?.text ?? (theme.palette as { neutral?: Record<string, string> }).neutral?.[800],
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
