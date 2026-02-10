import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import { mockChecks as mockChecksData } from '../../data/mockData';

interface SelectPrintChecksModalProps {
  open: boolean;
  onClose: () => void;
  onPrintSelected?: (selectedCount: number, totalAmount: number, selectedCheckIds?: string[]) => void;
  loanId?: string;
  borrower?: string;
  checks?: Array<Record<string, unknown>>;
  isSubmitting?: boolean;
}

interface CheckRow {
  id: string;
  ach: boolean;
  notes: boolean;
  payeeAccount: string;
  payeeName: string;
  checkReleaseDate: string;
  payAmount: number;
  paymentDueDate: string;
  paymentReceived: string;
  payStatus: string;
  loanAccount: string;
}

function formatCurrency(value: number): string {
  const prefix = value < 0 ? '-' : '';
  return prefix + new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
}

const MODAL_WIDTH = 860;
const MODAL_MAX_HEIGHT = 560;

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return isoDate;
  const [y, m, d] = isoDate.split('-');
  return m && d ? `${m}/${d}/${y}` : isoDate;
}

function normalizeCheck(row: Record<string, unknown>): CheckRow {
  return {
    id: String(row.id ?? ''),
    ach: Boolean(row.ach),
    notes: Boolean(row.notes),
    payeeAccount: String(row.payeeAccount ?? ''),
    payeeName: String(row.payeeName ?? ''),
    checkReleaseDate: formatDateForDisplay(String(row.checkReleaseDate ?? '')),
    payAmount: Number(row.payAmount ?? 0),
    paymentDueDate: formatDateForDisplay(String(row.paymentDueDate ?? '')),
    paymentReceived: formatDateForDisplay(String(row.paymentReceived ?? '')),
    payStatus: String(row.payStatus ?? 'Print'),
    loanAccount: String(row.loanAccount ?? ''),
  };
}

export default function SelectPrintChecksModal({
  open,
  onClose,
  onPrintSelected,
  loanId,
  borrower,
  checks: checksProp,
  isSubmitting = false,
}: SelectPrintChecksModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const [checks, setChecks] = useState<CheckRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const source = checksProp?.length ? checksProp : mockChecksData;
    const rows = source.map((c) => normalizeCheck(c as Record<string, unknown>));
    setChecks(rows);
    setSelectedIds(new Set(rows.map((r) => r.id)));
  }, [open, checksProp, loanId]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === checks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(checks.map((c) => c.id)));
    }
  };

  const selectedRows = checks.filter((c) => selectedIds.has(c.id));
  const selectedTotal = selectedRows.reduce((sum, c) => sum + c.payAmount, 0);

  const handlePrintClick = () => {
    onPrintSelected?.(selectedIds.size, selectedTotal, Array.from(selectedIds));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: MODAL_WIDTH,
          maxWidth: '95vw',
          maxHeight: MODAL_MAX_HEIGHT,
          height: MODAL_MAX_HEIGHT,
          borderRadius: 2,
          boxShadow: 24,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${neutral?.[200]}`,
          py: 1.5,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PrintOutlinedIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
          <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Select & Print Checks
            {loanId && ` — ${loanId}`}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: neutral?.[600] }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Info bar */}
        {(loanId || borrower) && (
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              backgroundColor: neutral?.[50],
              borderBottom: `1px solid ${neutral?.[200]}`,
            }}
          >
            <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>
              {borrower && `Borrower: ${borrower}`}
              {borrower && loanId && ' · '}
              {loanId && `Loan: ${loanId}`}
            </Typography>
          </Box>
        )}

        {/* Summary */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${neutral?.[200]}`,
          }}
        >
          <Typography sx={{ fontSize: '13px', color: neutral?.[700] }}>
            {checks.length} checks available
          </Typography>
          <Chip
            label={`Selected: ${selectedIds.size} · ${formatCurrency(selectedTotal)}`}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
              fontSize: '12px',
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 340 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ backgroundColor: neutral?.[50], py: 1 }}>
                  <Checkbox
                    size="small"
                    checked={checks.length > 0 && selectedIds.size === checks.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < checks.length}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>ACH</TableCell>
                <TableCell sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>NOTES</TableCell>
                <TableCell sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>PAYEE</TableCell>
                <TableCell sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>RELEASE DATE</TableCell>
                <TableCell align="right" sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>AMOUNT</TableCell>
                <TableCell sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>DUE DATE</TableCell>
                <TableCell sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>STATUS</TableCell>
                <TableCell sx={{ backgroundColor: neutral?.[50], fontWeight: 600, fontSize: '11px', color: neutral?.[600], py: 1 }}>LOAN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checks.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => toggleSelection(row.id)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'inherit',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={isSelected} />
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {row.ach && <FlashOnIcon sx={{ fontSize: 16, color: '#f59e0b' }} />}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {row.notes && <NoteAltOutlinedIcon sx={{ fontSize: 16, color: '#22c55e' }} />}
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', color: neutral?.[800], py: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: '12px', color: theme.palette.primary.main, fontWeight: 500 }}>
                          {row.payeeAccount}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: neutral?.[500] }}>
                          {row.payeeName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', color: neutral?.[700], py: 1 }}>{row.checkReleaseDate}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '12px', fontWeight: 500, color: row.payAmount < 0 ? theme.palette.error.main : neutral?.[900], py: 1 }}>
                      {formatCurrency(row.payAmount)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', color: neutral?.[700], py: 1 }}>{row.paymentDueDate}</TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip
                        label={row.payStatus}
                        size="small"
                        sx={{
                          fontSize: '10px',
                          height: 20,
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', color: neutral?.[700], py: 1 }}>{row.loanAccount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${neutral?.[200]}`,
          backgroundColor: neutral?.[50],
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '12px', color: neutral?.[500], mr: 'auto' }}>
          This is a mockup preview
        </Typography>
        <Button onClick={onClose} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={isSubmitting ? undefined : <PrintOutlinedIcon sx={{ fontSize: 16 }} />}
          disabled={selectedIds.size === 0 || isSubmitting}
          onClick={handlePrintClick}
          sx={{ textTransform: 'none' }}
        >
          {isSubmitting ? 'Processing…' : `Print Selected (${selectedIds.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
