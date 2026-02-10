import { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, Alert, Skeleton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { Theme } from '@mui/material/styles';
import type { PortfolioData, AIInsight } from '../../types';
import { generateAIInsights } from '../../services/openai';
import { mockAIInsights } from '../../data/mockData';
import CardBox from './CardBox';

interface AIInsightsProps {
  data: PortfolioData;
  refreshTrigger?: number;
  /** When provided, use these insights instead of fetching (e.g. for report snapshot). */
  staticInsights?: AIInsight[];
  onDataReady?: (insights: AIInsight[]) => void;
}

const getSeverityColor = (severity: string, theme: Theme) => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return theme.palette.error.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'positive':
      return (theme.palette as { green?: { dark: string } }).green?.dark ?? '#4CAF50';
    default:
      return theme.palette.primary.main;
  }
};

const getCategoryColor = (category: string, theme: Theme) => {
  switch (category.toLowerCase()) {
    case 'collections':
      return (theme.palette as { green?: { dark: string } }).green?.dark ?? '#4CAF50';
    case 'delinquency':
      return theme.palette.error.main;
    case 'risk':
      return theme.palette.warning.main;
    case 'performance':
      return theme.palette.primary.main;
    case 'opportunity':
      return (theme.palette as { tealBlue?: { main: string } }).tealBlue?.main ?? '#0E7E88';
    default:
      return (theme.palette as { neutral?: Record<string, string> }).neutral?.[500] ?? '#6B7280';
  }
};

const getInsightSeverity = (category: string) => {
  switch (category.toLowerCase()) {
    case 'risk':
      return 'Critical';
    case 'delinquency':
      return 'Warning';
    case 'opportunity':
      return 'Positive';
    default:
      return 'Info';
  }
};

export default function AIInsights({ data, refreshTrigger, staticInsights, onDataReady }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>(staticInsights ?? mockAIInsights);
  const [loading, setLoading] = useState(!staticInsights);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string }; blue?: string }).ui?.iconBlue ??
    (theme.palette as { blue?: string }).blue ??
    theme.palette.primary.main;

  useEffect(() => {
    if (staticInsights) {
      setInsights(staticInsights);
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const result = await generateAIInsights(data);
        setInsights(result);
        setIsAIGenerated(JSON.stringify(result) !== JSON.stringify(mockAIInsights));
        onDataReady?.(result);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        setInsights(mockAIInsights);
        setIsAIGenerated(false);
        onDataReady?.(mockAIInsights);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [data, refreshTrigger, staticInsights]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await generateAIInsights(data);
      setInsights(result);
      setIsAIGenerated(true);
      onDataReady?.(result);
    } catch (error) {
      console.error('Error refreshing AI insights:', error);
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
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: alpha(blueColor, 0.1),
              borderRadius: '8px',
              padding: '10px',
            }}
          >
            <LightbulbIcon sx={{ fontSize: '20px', color: blueColor, position: 'relative', zIndex: 1 }} />
            <AutoAwesomeIcon
              sx={{
                fontSize: '12px',
                color: blueColor,
                position: 'absolute',
                top: '4px',
                right: '4px',
                zIndex: 2,
                opacity: 0.9,
              }}
            />
          </Box>
          <Typography sx={{ color: blueColor, fontWeight: 500, fontSize: '18px', lineHeight: '24px' }}>
            AI Insights ({insights.length})
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
          <Tooltip title="Regenerate insights">
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

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  p: 1.5,
                  backgroundColor: neutral?.[50],
                  borderRadius: '4px',
                }}
              >
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="85%" />
              </Box>
            ))}
          </Box>
        ) : insights.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              backgroundColor: neutral?.[50],
              '& .MuiAlert-icon': { color: blueColor },
            }}
          >
            AI Insights are currently unavailable. Portfolio metrics above are calculated from real data.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {insights.map((insight) => {
              const severity = getInsightSeverity(insight.category);
              return (
                <Box
                  key={insight.id}
                  sx={{
                    p: 1.5,
                    backgroundColor: neutral?.[50],
                    borderRadius: '4px',
                    borderLeft: `3px solid ${getSeverityColor(severity, theme)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: neutral?.[900],
                        lineHeight: '20px',
                      }}
                    >
                      {insight.title}
                    </Typography>
                    <Chip
                      label={insight.category}
                      size="small"
                      sx={{
                        backgroundColor: getCategoryColor(insight.category, theme),
                        color: theme.palette.common.white,
                        fontSize: '10px',
                        height: 16,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '13px', color: neutral?.[500], lineHeight: '18px' }}>
                    {insight.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </CardBox>
  );
}
