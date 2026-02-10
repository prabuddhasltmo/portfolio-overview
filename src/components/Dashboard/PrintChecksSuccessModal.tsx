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

interface PrintChecksSuccessModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export default function PrintChecksSuccessModal({
  open,
  onClose,
  message,
}: PrintChecksSuccessModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  const MODAL_WIDTH = 560;
  const MODAL_HEIGHT = 380;

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
            Print &amp; Notify Complete
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
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.success.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
          </Box>

          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: neutral?.[900], mb: 1 }}>
            All set
          </Typography>

          <Typography sx={{ fontSize: '14px', color: neutral?.[600], lineHeight: 1.6 }}>
            {message ?? 'Checks and lender notification of electronic deposit have been processed successfully.'}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${neutral?.[200]}`,
          backgroundColor: neutral?.[50],
          justifyContent: 'center',
        }}
      >
        <Button variant="contained" size="medium" onClick={onClose} sx={{ textTransform: 'none', minWidth: 120 }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
