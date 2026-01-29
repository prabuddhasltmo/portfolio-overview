import { Box, Typography, Chip, Link } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CardBox from './CardBox';
import type { PortfolioRecapActionItem } from '../../types/portfolioRecap';

type ActionItemsListProps = {
  actionItems: PortfolioRecapActionItem[];
};

const formatCurrency = (value: number | null): string => {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getPriorityColor = (priority: string, theme: Theme) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return theme.palette.error.main;
    case 'medium':
      return theme.palette.warning.main;
    case 'low':
      return theme.palette.primary.main;
    default:
      return (theme.palette as { neutral?: Record<string, string> }).neutral?.[500] ?? '#6B7280';
  }
};

const ActionItemsList = ({ actionItems }: ActionItemsListProps) => {
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
            <AssignmentIcon sx={{ fontSize: '20px', color: theme.palette.text.primary }} />
          </Box>
          <Typography sx={{ color: neutral?.[900], fontWeight: 400, fontSize: '18px', lineHeight: '24px' }}>
            Action Items ({actionItems.length})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
          {actionItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: neutral?.[50],
                borderRadius: '4px',
                '&:hover': { backgroundColor: neutral?.[100] },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Link
                    href="#"
                    underline="hover"
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: theme.palette.primary.main,
                      lineHeight: '20px',
                    }}
                  >
                    {item.loanAccount}
                  </Link>
                  <Chip
                    label={item.priority}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(item.priority, theme),
                      color: theme.palette.common.white,
                      fontSize: '10px',
                      height: 16,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '13px', color: neutral?.[500], lineHeight: '18px' }} noWrap>
                  {item.borrowerName}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: neutral?.[400], lineHeight: '16px' }}>
                  {item.action}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 2 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 400, color: neutral?.[900], lineHeight: '20px' }}>
                  {formatCurrency(item.amount)}
                </Typography>
                {item.daysPastDue != null && (
                  <Typography sx={{ fontSize: '12px', color: theme.palette.error.main, lineHeight: '16px' }}>
                    {item.daysPastDue} days past due
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </CardBox>
  );
};

export default ActionItemsList;
