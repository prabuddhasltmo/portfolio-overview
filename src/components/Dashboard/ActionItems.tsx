import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Link,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import SendIcon from '@mui/icons-material/Send';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { ActionItem } from '../../types';
import type { EmailDraftContext } from '../../types/email';
import type { ReportMockupType } from '../../types/reportMockup';
import CardBox from './CardBox';

interface ActionItemsProps {
  items: ActionItem[];
  onMessageClick?: (context: EmailDraftContext) => void;
  onReportTypeChoose?: (reportType: ReportMockupType) => void;
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

const REPORT_OPTIONS: { type: ReportMockupType; label: string; icon: React.ReactNode }[] = [
  { type: 'late_notices', label: 'Late notices', icon: <NotificationsActiveOutlinedIcon fontSize="small" /> },
  { type: 'borrower_statement', label: 'Borrower statement', icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { type: 'escrow_analysis', label: 'Escrow analysis', icon: <AccountBalanceOutlinedIcon fontSize="small" /> },
];

function buildMessageContext(item: ActionItem): EmailDraftContext {
  return {
    loanId: item.id,
    borrowerName: item.borrower,
    borrowerEmail: item.borrowerEmail,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
    emailType: 'collection_followup',
  };
}

export default function ActionItems({ items, onMessageClick, onReportTypeChoose }: ActionItemsProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string } }).ui?.iconBlue ??
    theme.palette.primary.main;

  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<HTMLElement | null>(null);

  const handleReportsButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setReportsMenuAnchor(e.currentTarget);
  };

  const handleReportsMenuClose = () => setReportsMenuAnchor(null);

  const handleReportOptionClick = (reportType: ReportMockupType) => {
    onReportTypeChoose?.(reportType);
    handleReportsMenuClose();
  };

  return (
    <CardBox
      customSx={{
        padding: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.common.white, 0.82),
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {onMessageClick && items.length > 0 && (
              <Tooltip title="Send message" placement="top">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageClick(buildMessageContext(items[0]));
                  }}
                  sx={{
                    color: blueColor,
                    backgroundColor: alpha(blueColor, 0.1),
                    '&:hover': { backgroundColor: alpha(blueColor, 0.2) },
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onReportTypeChoose && (
              <>
                <Tooltip title="Reports" placement="top">
                  <IconButton
                    id="reports-button"
                    size="small"
                    onClick={handleReportsButtonClick}
                    aria-haspopup="true"
                    aria-controls={reportsMenuAnchor ? 'reports-menu' : undefined}
                    aria-expanded={Boolean(reportsMenuAnchor)}
                    sx={{
                      color: blueColor,
                      backgroundColor: alpha(blueColor, 0.1),
                      '&:hover': { backgroundColor: alpha(blueColor, 0.2) },
                    }}
                  >
                    <SummarizeOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="reports-menu"
                  anchorEl={reportsMenuAnchor}
                  open={Boolean(reportsMenuAnchor)}
                  onClose={handleReportsMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  MenuListProps={{
                    'aria-labelledby': 'reports-button',
                    sx: { py: 1 },
                  }}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                        mt: 0.5,
                        borderRadius: '10px',
                        border: `1px solid ${neutral?.[200]}`,
                        minWidth: 200,
                        '&::before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                          borderTop: `1px solid ${neutral?.[200]}`,
                          borderLeft: `1px solid ${neutral?.[200]}`,
                        },
                      },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      px: 2,
                      py: 0.75,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: neutral?.[400],
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Generate Report
                  </Typography>
                  {REPORT_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.type}
                      onClick={() => handleReportOptionClick(opt.type)}
                      sx={{
                        py: 1.25,
                        px: 2,
                        mx: 1,
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: alpha(blueColor, 0.08),
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 32,
                          color: blueColor,
                        }}
                      >
                        {opt.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={opt.label}
                        primaryTypographyProps={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: neutral?.[800],
                        }}
                      />
                      <ChevronRightIcon sx={{ fontSize: 16, color: neutral?.[400], ml: 1 }} />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
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
