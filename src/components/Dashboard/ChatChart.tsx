import { Box, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../../types';

interface ChatChartProps {
  data: ChartData;
}

const ChatChart = ({ data }: ChatChartProps) => {
  const theme = useTheme();

  // Extract theme colors for consistency with app
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string } }).ui?.iconBlue ??
    theme.palette.primary.main;
  const neutral = theme.palette.neutral as Record<string, string> | undefined;

  // Light blue theme palette - modern, clean, lightweight
  const colors = {
    primary: blueColor, // #0070E8
    primaryLight: alpha(blueColor, 0.12),
    secondary: '#06b6d4', // Cyan accent
    tertiary: '#8b5cf6', // Purple for third series
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    text: theme.palette.text.primary,
    textSecondary: neutral?.[400] ?? theme.palette.text.secondary,
    border: neutral?.[200] ?? '#E1E7EE',
    background: neutral?.[50] ?? '#F6F7F9',
    backgroundHover: neutral?.[100] ?? '#F0F2F6',
  };

  const isMultiSeries = Boolean(data.series && data.series.length >= 2);

  // Transform data for Recharts
  const chartData = data.data.map((item) => {
    const row: Record<string, string | number> = { name: (item.label as string) ?? '' };
    if (isMultiSeries && data.series) {
      data.series.forEach((s) => {
        const v = item[s.dataKey];
        if (typeof v === 'number') row[s.dataKey] = v;
      });
    } else {
      const val = item.value ?? 0;
      row.value = typeof val === 'number' ? val : Number(val) || 0;
    }
    return row;
  });

  // Calculate insights
  const getValues = (key: string) => chartData.map((d) => (d[key] as number) ?? 0).filter((v) => typeof v === 'number');
  const values = isMultiSeries && data.series?.[0] ? getValues(data.series[0].dataKey) : getValues('value');
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const lastValue = values[values.length - 1] ?? 0;
  const firstValue = values[0] ?? 0;
  const percentChange = firstValue !== 0 ? ((lastValue - firstValue) / Math.abs(firstValue)) * 100 : 0;
  const trend = percentChange > 1 ? 'up' : percentChange < -1 ? 'down' : 'neutral';

  // Series colors: blue for income/money in, dark orange-red for expenses/money out
  const getSeriesColor = (dataKey: string, index: number) => {
    const key = dataKey.toLowerCase();
    if (key.includes('moneyin') || key.includes('collection') || key.includes('income') || key.includes('in')) {
      return colors.primary; // Blue
    }
    if (key.includes('moneyout') || key.includes('disbursement') || key.includes('expense') || key.includes('out')) {
      return '#e05a33'; // Dark orange-red
    }
    // Fallback colors for other series
    const fallbackColors = [colors.primary, '#e05a33', colors.tertiary];
    return fallbackColors[index % fallbackColors.length];
  };

  const commonProps = {
    data: chartData,
    margin: { top: 16, right: 12, left: 4, bottom: 4 },
  };

  // Format values
  const formatValue = (value: number) =>
    value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value.toLocaleString()}`;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  // Clean, minimal tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; dataKey: string; color?: string }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 2,
          px: 1.5,
          py: 1,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 16px rgba(0, 112, 232, 0.08)',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: colors.textSecondary,
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        {payload.map((entry, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            {payload.length > 1 && (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color || colors.primary }} />
            )}
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
              {payload.length > 1 ? `${entry.name}: ` : ''}
              {formatValue(entry.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Minimal custom legend for multi-series
  const CustomLegend = () => {
    if (!isMultiSeries || !data.series) return null;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mt: 1 }}>
        {data.series.map((s, i) => (
          <Box key={s.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 1,
                backgroundColor: getSeriesColor(s.dataKey, i),
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 500 }}>
              {s.name}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return (
          <BarChart {...commonProps} barGap={2} barCategoryGap="25%">
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.primaryLight, radius: 4 }} />
            {isMultiSeries && data.series ? (
              data.series.map((s, i) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={getSeriesColor(s.dataKey, i)}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              ))
            ) : (
              <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={50} />
            )}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.primary} stopOpacity={0.2} />
                <stop offset="100%" stopColor={colors.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.primary}
              strokeWidth={2}
              fill="url(#areaFill)"
            />
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.primary} stopOpacity={0.08} />
                <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="none" fill="url(#lineFill)" />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.primary}
              strokeWidth={2.5}
              dot={{ fill: '#fff', stroke: colors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: colors.primary, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.warning : colors.textSecondary;

  return (
    <Box
      sx={{
        mt: 2,
        mb: 1,
        borderRadius: 2,
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pt: 1.5,
          pb: 0.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: colors.text,
            }}
          >
            {data.title}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: colors.textSecondary,
            }}
          >
            {data.xAxisLabel}
          </Typography>
        </Box>

        {/* Trend indicator (single series only) */}
        {!isMultiSeries && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              backgroundColor: alpha(trendColor, 0.1),
            }}
          >
            <TrendIcon size={12} color={trendColor} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: trendColor }}>
              {Math.abs(percentChange).toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: 180, px: 0.5 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>

      {/* Legend for multi-series */}
      {isMultiSeries && <CustomLegend />}

      {/* Footer insights */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', gap: 3 }}>
          {isMultiSeries && data.series ? (
            data.series.map((s, i) => {
              const vals = getValues(s.dataKey);
              const total = vals.reduce((a, b) => a + b, 0);
              return (
                <Box key={s.dataKey}>
                  <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {s.name} (total)
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: getSeriesColor(s.dataKey, i) }}>
                    {formatValue(total)}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <>
              <Box>
                <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Latest
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.primary }}>
                  {formatValue(lastValue)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Average
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
                  {formatValue(average)}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary }}>
          {data.yAxisLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatChart;
