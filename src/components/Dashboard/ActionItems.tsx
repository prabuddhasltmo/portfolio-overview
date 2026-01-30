import { Box, Typography, Chip, Link, IconButton, Tooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import type { ActionItem } from '../../types';
import type { EmailDraftContext } from '../../types/email';
import CardBox from './CardBox';

interface ActionItemsProps {
  items: ActionItem[];
  onMessageClick?: (context: EmailDraftContext) => void;
  onEmailClick?: (context: EmailDraftContext) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

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

export default function ActionItems({ items, onMessageClick, onEmailClick }: ActionItemsProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string } }).ui?.iconBlue ??
    theme.palette.primary.main;

  const buildContext = (item: ActionItem): EmailDraftContext => ({
    loanId: item.id,
    borrowerName: item.borrower,
    borrowerEmail: item.borrowerEmail,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
    emailType: 'collection_followup',
  });

  const handleMessageClick = (item: ActionItem) => onMessageClick?.(buildContext(item));
  const handleEmailClick = (item: ActionItem) => onEmailClick?.(buildContext(item));

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
            Action Items ({items.length})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
          {items.map((item) => (
            <Box
              key={item.id}
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
                    onClick={(event) => event.preventDefault()}
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: theme.palette.primary.main,
                      lineHeight: '20px',
                    }}
                  >
                    {item.id}
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
                  {item.borrower}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: neutral?.[400], lineHeight: '16px' }}>
                  Follow up on {item.daysPastDue}+ days past due.
                </Typography>
              </Box>
              {(onMessageClick || onEmailClick) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  {onMessageClick && (
                    <Tooltip title="Message borrower (2-way)" placement="top">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessageClick(item);
                        }}
                        sx={{
                          color: blueColor,
                          backgroundColor: alpha(blueColor, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(blueColor, 0.2),
                          },
                        }}
                      >
                        <MessageOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onEmailClick && (
                    <Tooltip title="Draft email (1-way, no-reply)" placement="top">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmailClick(item);
                        }}
                        sx={{
                          color: blueColor,
                          backgroundColor: alpha(blueColor, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(blueColor, 0.2),
                          },
                        }}
                      >
                        <MailOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
              <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 2 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 400, color: neutral?.[900], lineHeight: '20px' }}>
                  {formatCurrency(item.amount)}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: theme.palette.error.main, lineHeight: '16px' }}>
                  {item.daysPastDue} days past due
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </CardBox>
  );
}
