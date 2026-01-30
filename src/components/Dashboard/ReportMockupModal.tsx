import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import type { ReportMockupType, ReportMockupContext } from '../../types/reportMockup';

interface ReportMockupModalProps {
  open: boolean;
  onClose: () => void;
  reportType: ReportMockupType;
  context: ReportMockupContext;
}

const REPORT_TITLES: Record<ReportMockupType, string> = {
  late_notices: 'Late Notice',
  borrower_statement: 'Borrower Statement',
  escrow_analysis: 'Escrow Analysis',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ReportMockupModal({
  open,
  onClose,
  reportType,
  context,
}: ReportMockupModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const title = REPORT_TITLES[reportType];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
          maxHeight: '90vh',
        },
      }}
      aria-labelledby="report-mockup-title"
      aria-describedby="report-mockup-description"
    >
      {/* TMO-style header: title bar with close */}
      <DialogTitle
        id="report-mockup-title"
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
          {title} — {context.loanId}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close"
          sx={{ color: neutral?.[600] }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Document-style body */}
        <Box
          id="report-mockup-description"
          sx={{
            p: 3,
            backgroundColor: theme.palette.common.white,
          }}
        >
          {/* Mock letterhead / document header */}
          <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${neutral?.[200]}` }}>
            <Typography variant="body2" sx={{ color: neutral?.[500], fontSize: '12px' }}>
              Portfolio Services — Document Preview (Mockup)
            </Typography>
            <Typography variant="body2" sx={{ color: neutral?.[600], mt: 0.5 }}>
              Borrower: {context.borrower} · Loan: {context.loanId}
            </Typography>
            {context.amount != null && (
              <Typography variant="body2" sx={{ color: neutral?.[600] }}>
                Amount past due: {formatCurrency(context.amount)}
                {context.daysPastDue != null && ` · ${context.daysPastDue} days past due`}
              </Typography>
            )}
          </Box>

          {reportType === 'late_notices' && (
            <LateNoticesMockup context={context} neutral={neutral} />
          )}
          {reportType === 'borrower_statement' && (
            <BorrowerStatementMockup context={context} neutral={neutral} />
          )}
          {reportType === 'escrow_analysis' && (
            <EscrowAnalysisMockup context={context} neutral={neutral} />
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${neutral?.[200]}`,
          backgroundColor: neutral?.[50],
        }}
      >
        <Typography variant="caption" sx={{ color: neutral?.[500], mr: 'auto' }}>
          This is a mockup. Print/Export would be available in production.
        </Typography>
        <Button onClick={onClose} variant="contained" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LateNoticesMockup({
  context,
  neutral,
}: {
  context: ReportMockupContext;
  neutral?: Record<string, string>;
}) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        LATE PAYMENT NOTICE
      </Typography>
      <Typography variant="body2" sx={{ color: neutral?.[700], mb: 2 }}>
        This notice is to inform you that your mortgage payment is past due. Please remit the
        amount due as soon as possible to avoid additional late fees and negative reporting.
      </Typography>
      <Box sx={{ bgcolor: neutral?.[100], p: 2, borderRadius: 1 }}>
        <Typography variant="caption" sx={{ color: neutral?.[600] }}>
          Loan #: {context.loanId}
        </Typography>
        <br />
        <Typography variant="caption" sx={{ color: neutral?.[600] }}>
          Borrower: {context.borrower}
        </Typography>
        <br />
        {context.amount != null && (
          <>
            <Typography variant="caption" sx={{ color: neutral?.[600] }}>
              Amount due: {formatCurrency(context.amount)}
            </Typography>
            <br />
          </>
        )}
        <Typography variant="caption" sx={{ color: neutral?.[600] }}>
          Please contact our office with any questions.
        </Typography>
      </Box>
    </Box>
  );
}

function BorrowerStatementMockup({
  context,
  neutral,
}: {
  context: ReportMockupContext;
  neutral?: Record<string, string>;
}) {
  const rows = [
    { label: 'Principal balance', value: context.amount != null ? context.amount * 12 : 0 },
    { label: 'Interest accrued', value: 0 },
    { label: 'Escrow balance', value: 0 },
    { label: 'Last payment date', value: '—' },
    { label: 'Next due date', value: '—' },
  ];
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        ACCOUNT STATEMENT
      </Typography>
      <Typography variant="body2" sx={{ color: neutral?.[700], mb: 2 }}>
        Statement for loan {context.loanId}, borrower {context.borrower}.
      </Typography>
      <Table size="small" sx={{ '& td, & th': { borderColor: neutral?.[200], py: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Amount / Value
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell>{r.label}</TableCell>
              <TableCell align="right">
                {typeof r.value === 'number' ? formatCurrency(r.value) : r.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function EscrowAnalysisMockup({
  context,
  neutral,
}: {
  context: ReportMockupContext;
  neutral?: Record<string, string>;
}) {
  const rows = [
    { label: 'Beginning balance', value: 0 },
    { label: 'Deposits', value: 0 },
    { label: 'Disbursements (tax, insurance)', value: 0 },
    { label: 'Projected shortage/surplus', value: 0 },
    { label: 'New monthly payment', value: '—' },
  ];
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        ESCROW ANALYSIS
      </Typography>
      <Typography variant="body2" sx={{ color: neutral?.[700], mb: 2 }}>
        Escrow analysis for loan {context.loanId}. This is a summary of your escrow account
        activity and projected disbursements.
      </Typography>
      <Table size="small" sx={{ '& td, & th': { borderColor: neutral?.[200], py: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Line Item</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell>{r.label}</TableCell>
              <TableCell align="right">
                {typeof r.value === 'number' ? formatCurrency(r.value) : r.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
