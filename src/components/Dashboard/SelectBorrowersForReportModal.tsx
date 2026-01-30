import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import type { ActionItem } from '../../types';
import type { ReportMockupType, ReportMockupContext } from '../../types/reportMockup';

const REPORT_TITLES: Record<ReportMockupType, string> = {
  late_notices: 'Late notices',
  borrower_statement: 'Borrower statement',
  escrow_analysis: 'Escrow analysis',
};

function buildReportContext(item: ActionItem): ReportMockupContext {
  return {
    loanId: item.id,
    borrower: item.borrower,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
  };
}

interface SelectBorrowersForReportModalProps {
  open: boolean;
  onClose: () => void;
  reportType: ReportMockupType;
  items: ActionItem[];
  onViewReport: (selectedContexts: ReportMockupContext[]) => void;
}

export default function SelectBorrowersForReportModal({
  open,
  onClose,
  reportType,
  items,
  onViewReport,
}: SelectBorrowersForReportModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const handleViewReport = () => {
    const selected = items.filter((i) => selectedIds.has(i.id)).map(buildReportContext);
    if (selected.length > 0) {
      onViewReport(selected);
      onClose();
      setSelectedIds(new Set());
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  const title = REPORT_TITLES[reportType];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: 24 },
      }}
      aria-labelledby="select-borrowers-title"
    >
      <DialogTitle
        id="select-borrowers-title"
        sx={{
          borderBottom: `1px solid ${neutral?.[200] ?? '#E5E7EB'}`,
          py: 1.5,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
        }}
      >
        <Typography variant="h6" component="span" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Select borrowers — {title}
        </Typography>
        <IconButton size="small" onClick={handleClose} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: neutral?.[600], mb: 2 }}>
            Choose one or more borrowers to generate the report for.
          </Typography>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No action items (borrowers) available.
            </Typography>
          ) : (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onChange={handleSelectAll}
                    size="small"
                  />
                }
                label="Select all"
                sx={{ mb: 1, display: 'block' }}
              />
              <List dense disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {items.map((item) => (
                  <ListItem key={item.id} disablePadding secondaryAction={<Typography variant="caption" color="text.secondary">{item.id}</Typography>}>
                    <ListItemButton
                      role={undefined}
                      onClick={() => handleToggle(item.id)}
                      dense
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Checkbox
                          edge="start"
                          checked={selectedIds.has(item.id)}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText primary={item.borrower} secondary={`${item.daysPastDue} days past due`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, borderTop: `1px solid ${neutral?.[200]}` }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleViewReport}
          disabled={!someSelected}
        >
          View report{selectedIds.size > 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
