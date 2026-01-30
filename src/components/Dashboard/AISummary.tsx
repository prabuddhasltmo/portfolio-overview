import { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, Skeleton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { PortfolioData, Sentiment } from '../../types';
import { generateAISummary } from '../../services/openai';
import { mockAISummary, mockSentiment, mockKeyTakeaway } from '../../data/mockData';
import CardBox from './CardBox';

interface AISummaryProps {
  data: PortfolioData;
  historicalData: PortfolioData[];
  refreshTrigger?: number;
}

export default function AISummary({ data, historicalData, refreshTrigger }: AISummaryProps) {
  const [summary, setSummary] = useState<string>(mockAISummary);
  const [sentiment, setSentiment] = useState<Sentiment>(mockSentiment);
  const [keyTakeaway, setKeyTakeaway] = useState<string>(mockKeyTakeaway);
  const [loading, setLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string }; blue?: string }).ui?.iconBlue ??
    (theme.palette as { blue?: string }).blue ??
    theme.palette.primary.main;

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const result = await generateAISummary(data, historicalData);
        setSummary(result.summary);
        setSentiment(result.sentiment);
        setKeyTakeaway(result.keyTakeaway);
        setIsAIGenerated(result.summary !== mockAISummary);
      } catch (error) {
        console.error('Error fetching AI summary:', error);
        setSummary(mockAISummary);
        setSentiment(mockSentiment);
        setKeyTakeaway(mockKeyTakeaway);
        setIsAIGenerated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [data, historicalData, refreshTrigger]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await generateAISummary(data, historicalData);
      setSummary(result.summary);
      setSentiment(result.sentiment);
      setKeyTakeaway(result.keyTakeaway);
      setIsAIGenerated(result.summary !== mockAISummary);
    } catch (error) {
      console.error('Error refreshing AI summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardBox
      customSx={{
        padding: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.common.white, 0.82),
        border: `1px solid ${alpha(blueColor, 0.2)}`,
        boxShadow: `0 2px 8px ${alpha(blueColor, 0.08)}`,
        flexDirection: 'column',
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              color: neutral?.[900],
              fontWeight: 400,
              fontSize: '1.125rem',
              lineHeight: '24px',
            }}
          >
            AI Summary
          </Typography>
          {isAIGenerated && (
            <Chip
              label="Live"
              size="small"
              sx={{
                fontSize: '10px',
                height: 18,
                backgroundColor: alpha(blueColor, 0.16),
                color: blueColor,
                fontWeight: 500,
              }}
            />
          )}
          <Tooltip title="Regenerate summary">
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  marginLeft: 'auto',
                  color: blueColor,
                  '&:hover': { backgroundColor: alpha(blueColor, 0.1) },
                }}
                size="small"
              >
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: alpha(blueColor, 0.04),
            borderRadius: '6px',
            borderLeft: `3px solid ${blueColor}`,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="85%" />
              <Skeleton variant="text" width="70%" />
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: neutral?.[700],
                fontWeight: 400,
              }}
            >
              {summary}
            </Typography>
          )}
        </Box>

        {!loading && keyTakeaway && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1.25,
              px: 1.5,
              backgroundColor: neutral?.[50],
              borderRadius: '6px',
              border: `1px solid ${neutral?.[200]}`,
            }}
          >
            <LightbulbOutlinedIcon
              sx={{
                fontSize: '1.125rem',
                color: sentiment === 'bad' ? theme.palette.error.main : theme.palette.warning?.main ?? '#f59e0b',
                mt: '1px',
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  lineHeight: '14px',
                  color: neutral?.[500],
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
                  color: neutral?.[800],
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
}
