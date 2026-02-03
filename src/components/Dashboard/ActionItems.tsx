import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Checkbox,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { ActionItem } from '../../types';
import type { EmailDraftContext } from '../../types/email';
import type { ReportMockupContext, ReportMockupType } from '../../types/reportMockup';
import CardBox from './CardBox';

interface ActionItemsProps {
  items: ActionItem[];
  onMessageClick?: (context: EmailDraftContext) => void;
  onReportGenerate?: (reportType: ReportMockupType, selectedContexts: ReportMockupContext[]) => void;
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

const CATEGORY_ORDER = ['Checks Due', 'Pending Billing', 'Payment Adjustments'] as const;

type ActionCategory = typeof CATEGORY_ORDER[number];

const getCategoryForItem = (item: ActionItem): ActionCategory => {
  if (item.category === 'Checks Due' || item.category === 'Pending Billing' || item.category === 'Payment Adjustments') {
    return item.category;
  }
  if (item.daysPastDue >= 90) return 'Checks Due';
  if (item.daysPastDue >= 60) return 'Pending Billing';
  return 'Payment Adjustments';
};

const getEmailTypeForCategory = (category: ActionCategory): EmailDraftContext['emailType'] => {
  switch (category) {
    case 'Checks Due':
      return 'checks_due';
    case 'Pending Billing':
      return 'pending_billing';
    case 'Payment Adjustments':
    default:
      return 'payment_adjustment';
  }
};

function buildMessageContext(item: ActionItem): EmailDraftContext {
  const category = getCategoryForItem(item);
  return {
    loanId: item.id,
    borrowerName: item.borrower,
    borrowerEmail: item.borrowerEmail,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
    emailType: getEmailTypeForCategory(category),
  };
}

function buildReportContext(item: ActionItem): ReportMockupContext {
  return {
    loanId: item.id,
    borrower: item.borrower,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
  };
}

export default function ActionItems({ items, onMessageClick, onReportGenerate }: ActionItemsProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string } }).ui?.iconBlue ??
    theme.palette.primary.main;

  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<HTMLElement | null>(null);
  const [reportSelection, setReportSelection] = useState<ActionItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Record<ActionCategory, boolean>>({
    'Checks Due': false,
    'Pending Billing': false,
    'Payment Adjustments': false,
  });

  const groupedItems = useMemo(() => {
    const grouped: Record<ActionCategory, ActionItem[]> = {
      'Checks Due': [],
      'Pending Billing': [],
      'Payment Adjustments': [],
    };
    items.forEach((item) => {
      grouped[getCategoryForItem(item)].push(item);
    });
    return grouped;
  }, [items]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = new Set(items.map((item) => item.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [items]);

  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  const handleReportsButtonClick = (e: React.MouseEvent<HTMLElement>, selection: ActionItem[]) => {
    if (!onReportGenerate || selection.length === 0) return;
    e.stopPropagation();
    setReportSelection(selection);
    setReportsMenuAnchor(e.currentTarget);
  };

  const handleReportsMenuClose = () => {
    setReportsMenuAnchor(null);
    setReportSelection([]);
  };

  const handleReportOptionClick = (reportType: ReportMockupType) => {
    const contexts = reportSelection.map(buildReportContext);
    if (contexts.length > 0) {
      onReportGenerate?.(reportType, contexts);
    }
    handleReportsMenuClose();
  };

  const toggleCategoryExpanded = (category: ActionCategory) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleItemSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategorySelection = (category: ActionCategory) => {
    const categoryIds = groupedItems[category].map((item) => item.id);
    if (categoryIds.length === 0) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = categoryIds.every((id) => next.has(id));
      categoryIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const categoryMeta: Record<ActionCategory, { accent: string; helper: string }> = {
    'Checks Due': {
      accent: theme.palette.error.main,
      helper: 'Disbursements waiting approval',
    },
    'Pending Billing': {
      accent: theme.palette.warning.main,
      helper: 'Invoices and payoffs to process',
    },
    'Payment Adjustments': {
      accent: theme.palette.info.main,
      helper: 'Rate and payment updates',
    },
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
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
            <Box>
              <Typography sx={{ color: neutral?.[900], fontWeight: 500, fontSize: '18px', lineHeight: '24px' }}>
                Action Items
              </Typography>
              <Typography sx={{ color: neutral?.[500], fontSize: '12px', lineHeight: '16px' }}>
                {items.length} total tasks
                {selectedItems.length > 0 ? ` | ${selectedItems.length} selected` : ''}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SummarizeOutlinedIcon sx={{ fontSize: 18 }} />}
              disabled={!onReportGenerate || selectedItems.length === 0}
              onClick={(e) => handleReportsButtonClick(e, selectedItems)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: alpha(blueColor, 0.3),
                color: blueColor,
                '&:hover': {
                  borderColor: alpha(blueColor, 0.5),
                  backgroundColor: alpha(blueColor, 0.06),
                },
                '&.Mui-disabled': {
                  borderColor: neutral?.[200],
                  color: neutral?.[400],
                },
              }}
            >
              Generate report
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
          {CATEGORY_ORDER.map((category, idx) => {
            const categoryItems = groupedItems[category];
            const categoryIds = categoryItems.map((item) => item.id);
            const allSelected = categoryIds.length > 0 && categoryIds.every((id) => selectedIds.has(id));
            const someSelected = categoryIds.some((id) => selectedIds.has(id));
            const accent = categoryMeta[category].accent;

            return (
              <Box key={category}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(accent, 0.25)}`,
                    backgroundColor: alpha(accent, 0.06),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={() => toggleCategorySelection(category)}
                      disabled={categoryIds.length === 0}
                    />
                    <Box>
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: neutral?.[900] }}>
                        {category}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: neutral?.[500] }}>
                        {categoryMeta[category].helper}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '12px', color: neutral?.[500] }}>
                      {categoryItems.length} items
                    </Typography>
                    <IconButton size="small" onClick={() => toggleCategoryExpanded(category)}>
                      {expandedCategories[category] ? (
                        <KeyboardArrowDownIcon sx={{ color: neutral?.[500] }} />
                      ) : (
                        <KeyboardArrowRightIcon sx={{ color: neutral?.[500] }} />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={expandedCategories[category]}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.25, mb: 1 }}>
                    {categoryItems.length === 0 ? (
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: 1,
                          backgroundColor: neutral?.[50],
                          color: neutral?.[500],
                          fontSize: '12px',
                        }}
                      >
                        No items in this category.
                      </Box>
                    ) : (
                      categoryItems.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 1.5,
                              backgroundColor: neutral?.[50],
                              border: `1px solid ${isSelected ? alpha(blueColor, 0.4) : neutral?.[200]}`,
                              '&:hover': { backgroundColor: neutral?.[100] },
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(item.id)}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  sx={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: theme.palette.primary.main,
                                  }}
                                >
                                  {item.id}
                                </Typography>
                                <Chip
                                  label={item.priority}
                                  size="small"
                                  sx={{
                                    backgroundColor: getPriorityColor(item.priority, theme),
                                    color: theme.palette.common.white,
                                    fontSize: '10px',
                                    height: 18,
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                />
                              </Box>
                              <Typography sx={{ fontSize: '13px', color: neutral?.[600], lineHeight: '18px' }} noWrap>
                                {item.borrower}
                              </Typography>
                              <Typography sx={{ fontSize: '12px', color: neutral?.[400], lineHeight: '16px' }}>
                                Follow up on {item.daysPastDue}+ days past due.
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: 120 }}>
                              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: neutral?.[900], lineHeight: '20px' }}>
                                {formatCurrency(item.amount)}
                              </Typography>
                              <Typography sx={{ fontSize: '12px', color: theme.palette.error.main, lineHeight: '16px' }}>
                                {item.daysPastDue} days past due
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {onMessageClick && (
                                <Tooltip title="Send message" placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onMessageClick(buildMessageContext(item));
                                    }}
                                    sx={{
                                      color: blueColor,
                                      backgroundColor: alpha(blueColor, 0.1),
                                      '&:hover': { backgroundColor: alpha(blueColor, 0.2) },
                                    }}
                                  >
                                    <SendIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onReportGenerate && (
                                <Tooltip title="Generate report" placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={(event) => {
                                      setSelectedIds((prev) => {
                                        const next = new Set(prev);
                                        next.add(item.id);
                                        return next;
                                      });
                                      handleReportsButtonClick(event, [item]);
                                    }}
                                    sx={{
                                      color: blueColor,
                                      backgroundColor: alpha(blueColor, 0.1),
                                      '&:hover': { backgroundColor: alpha(blueColor, 0.2) },
                                    }}
                                  >
                                    <SummarizeOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </Box>
                </Collapse>

                {idx < CATEGORY_ORDER.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            );
          })}
        </Box>
      </Box>
      <Menu
        id="reports-menu"
        anchorEl={reportsMenuAnchor}
        open={Boolean(reportsMenuAnchor)}
        onClose={handleReportsMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{
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
    </CardBox>
  );
}
