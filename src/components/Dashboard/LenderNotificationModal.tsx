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
  FormControl,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export interface LenderNotificationOptions {
  transmissionType: string;
  fromDate: string;
  toDate: string;
  envelopeSize: string;
  replaceBorrowerName: boolean;
  displayLateCharges: boolean;
}

interface LenderNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (options: LenderNotificationOptions) => void;
  isSubmitting?: boolean;
}

export default function LenderNotificationModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: LenderNotificationModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  const [transmissionOption, setTransmissionOption] = useState('transmission_date');
  const [envelopeSize, setEnvelopeSize] = useState('');
  const [fromDate, setFromDate] = useState('2026-02-09');
  const [toDate, setToDate] = useState('2026-02-09');
  const [replaceBorrower, setReplaceBorrower] = useState(false);
  const [displayLateCharges, setDisplayLateCharges] = useState(false);

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: theme.palette.primary.main,
    mb: 1.5,
  };

  const selectStyle = {
    fontSize: '12px',
    backgroundColor: '#fff',
    '& .MuiSelect-select': { py: 0.875 },
    '& .MuiOutlinedInput-notchedOutline': { borderRadius: 1 },
  };

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
            Lender Notification of Electronic Deposit
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: neutral?.[600] }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
        <Box sx={{ mt: 2 }} />
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ ...labelStyle, mb: 0.5 }}>
            Print Lender Notification of Electronic Deposit
          </Typography>
          <Typography sx={{ fontSize: '12px', color: neutral?.[600], lineHeight: 1.6 }}>
            This assistant will help prepare a notification of electronic deposit. Depending on the lender's preferences, the confirmation will be printed, emailed or both.
          </Typography>
        </Box>

        <Typography sx={labelStyle}>Select Statement Options</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 1.75 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              value={transmissionOption}
              onChange={(e) => setTransmissionOption(e.target.value)}
              sx={selectStyle}
            >
              <MenuItem value="transmission_date">Select notices by transmission date</MenuItem>
              <MenuItem value="payment_date">Select notices by payment date</MenuItem>
              <MenuItem value="due_date">Select notices by due date</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>From:</Typography>
            <TextField
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              sx={{ width: 138, '& input': { fontSize: '12px', py: 0.75 } }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              value={envelopeSize}
              onChange={(e) => setEnvelopeSize(e.target.value)}
              displayEmpty
              sx={selectStyle}
            >
              <MenuItem value="">Select Envelope Size</MenuItem>
              <MenuItem value="standard">Standard (#10)</MenuItem>
              <MenuItem value="large">Large (9x12)</MenuItem>
              <MenuItem value="window">Window Envelope</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>To:</Typography>
            <TextField
              type="date"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              sx={{ width: 138, '& input': { fontSize: '12px', py: 0.75 } }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={replaceBorrower}
                onChange={(e) => setReplaceBorrower(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: '13px', color: neutral?.[700] }}>
                  Replace Borrower Name with Primary Property
                </Typography>
                <Tooltip title="Use the primary property name instead of borrower name on the notification">
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                </Tooltip>
              </Box>
            }
            sx={{ ml: 0 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={displayLateCharges}
                onChange={(e) => setDisplayLateCharges(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: '13px', color: neutral?.[700] }}>
                  Display Late Charges Separately
                </Typography>
                <Tooltip title="Show late charges as a separate line item on the notification">
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                </Tooltip>
              </Box>
            }
            sx={{ ml: 0 }}
          />
        </Box>

        <Typography sx={labelStyle}>Select Categories to Include or Exclude</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '12px', color: theme.palette.primary.main, mb: 0.75 }}>
              Include Categories
            </Typography>
            <Box
              sx={{
                height: 68,
                border: `1px solid ${neutral?.[200]}`,
                borderRadius: 1,
                backgroundColor: '#fff',
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '12px', color: theme.palette.primary.main, mb: 0.75 }}>
              Exclude Categories
            </Typography>
            <Box
              sx={{
                height: 68,
                border: `1px solid ${neutral?.[200]}`,
                borderRadius: 1,
                backgroundColor: '#fff',
              }}
            />
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
          onClick={() => {
            onSubmit?.({
              transmissionType: transmissionOption,
              fromDate,
              toDate,
              envelopeSize: envelopeSize || 'standard',
              replaceBorrowerName: replaceBorrower,
              displayLateCharges: displayLateCharges,
            });
            if (!onSubmit) onClose();
          }}
          sx={{ textTransform: 'none' }}
        >
          {isSubmitting ? 'Processing…' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
