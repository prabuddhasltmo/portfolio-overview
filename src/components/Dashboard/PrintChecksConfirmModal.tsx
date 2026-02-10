import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface PrintChecksConfirmModalProps {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  totalAmount: number;
  onProceedToNotification: () => void;
  isSubmitting?: boolean;
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

export default function PrintChecksConfirmModal({
  open,
  onClose,
  selectedCount,
  totalAmount,
  onProceedToNotification,
  isSubmitting = false,
}: PrintChecksConfirmModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  const MODAL_WIDTH = 860;
  const MODAL_HEIGHT = 560;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: MODAL_WIDTH,
          maxWidth: '95vw',
          height: MODAL_HEIGHT,
          maxHeight: MODAL_HEIGHT,
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
            Print Checks
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: neutral?.[600] }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 360 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 36, color: theme.palette.success.main }} />
          </Box>

          <Typography sx={{ fontSize: '16px', fontWeight: 600, color: neutral?.[900], mb: 1 }}>
            Checks Ready to Print
          </Typography>

          <Typography sx={{ fontSize: '13px', color: neutral?.[600], mb: 2, lineHeight: 1.6 }}>
            {selectedCount} check{selectedCount !== 1 ? 's' : ''} selected for printing
            <br />
            Total amount: <strong>{formatCurrency(totalAmount)}</strong>
          </Typography>

          <Box
            sx={{
              backgroundColor: neutral?.[50],
              border: `1px solid ${neutral?.[200]}`,
              borderRadius: 1.5,
              px: 2,
              py: 1.5,
              fontSize: '12px',
              color: neutral?.[500],
            }}
          >
            (Mock print checks modal)
          </Box>
        </Box>
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
        <Button onClick={onClose} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          endIcon={isSubmitting ? undefined : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
          disabled={isSubmitting}
          onClick={onProceedToNotification}
          sx={{ textTransform: 'none' }}
        >
          {isSubmitting ? 'Processing…' : 'Notify Lenders'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
