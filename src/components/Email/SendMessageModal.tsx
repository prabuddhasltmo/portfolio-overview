import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import SendIcon from '@mui/icons-material/Send';
import { sendMessage, generateAIMessageDraft } from '../../services/emailService';
import {
  EmailPriority,
  type EmailFormData,
  type EmailDraftContext,
  type EmailRecipient,
} from '../../types/email';
import type { ActionItem } from '../../types';

function actionItemToContext(item: ActionItem): EmailDraftContext {
  return {
    loanId: item.id,
    borrowerName: item.borrower,
    borrowerEmail: item.borrowerEmail,
    amount: item.amount,
    daysPastDue: item.daysPastDue,
    emailType: 'collection_followup',
  };
}

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  borrowers: ActionItem[];
  initialContext?: EmailDraftContext | null;
  onSuccess?: () => void;
}

export default function SendMessageModal({
  open,
  onClose,
  borrowers,
  initialContext = null,
  onSuccess,
}: SendMessageModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string } }).ui?.iconBlue ?? theme.palette.primary.main;

  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmailFormData>({
    to: { name: '', email: '' },
    from: { name: 'Portfolio Services', email: 'services@lender.com' },
    subject: '',
    body: '',
    priority: EmailPriority.NORMAL,
    cc: '',
    bcc: '',
    addToConversationLog: true,
    attachmentName: '',
  });

  const safeBorrowers = borrowers ?? [];
  const selectedBorrower = safeBorrowers.find((b) => b.id === selectedBorrowerId) ?? null;
  const context: EmailDraftContext | null = selectedBorrower ? actionItemToContext(selectedBorrower) : null;

  const generateDraft = useCallback(async (ctx: EmailDraftContext) => {
    setLoading(true);
    setError(null);
    try {
      const draft = await generateAIMessageDraft(ctx);
      setFormData((prev) => ({
        ...prev,
        subject: draft.subject,
        body: draft.body,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate message draft');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setError(null);
      setFormData((prev) => ({
        ...prev,
        subject: '',
        body: '',
        cc: '',
        bcc: '',
        attachmentName: '',
        addToConversationLog: true,
      }));

      if (initialContext) {
        const match = safeBorrowers.find(
          (b) => b.id === initialContext.loanId || b.borrower === initialContext.borrowerName
        );
        if (match) {
          setSelectedBorrowerId(match.id);
          setFormData((prev) => ({
            ...prev,
            to: { name: match.borrower, email: match.borrowerEmail ?? '' },
          }));
          generateDraft(actionItemToContext(match));
        } else {
          setSelectedBorrowerId('');
        }
      } else {
        setSelectedBorrowerId('');
        setFormData((prev) => ({ ...prev, to: { name: '', email: '' } }));
      }
    }
  }, [open, initialContext, borrowers, generateDraft]);

  const handleBorrowerSelect = (borrowerId: string) => {
    setSelectedBorrowerId(borrowerId);
    const item = safeBorrowers.find((b) => b.id === borrowerId);
    if (item) {
      setFormData((prev) => ({
        ...prev,
        to: { name: item.borrower, email: item.borrowerEmail ?? '' },
      }));
      generateDraft(actionItemToContext(item));
    } else {
      setFormData((prev) => ({ ...prev, to: { name: '', email: '' }, subject: '', body: '' }));
    }
  };

  const handleChange = (field: keyof EmailFormData, value: string | number | EmailRecipient | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttachBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleChange('attachmentName', file.name);
    };
    input.click();
  };

  const handleSend = async () => {
    if (!formData.to.name && !formData.to.email) {
      setError('Please select a recipient');
      return;
    }
    if (!formData.subject || !formData.body) {
      setError('Subject and message are required');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendMessage(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  // Modern font stack
  const fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      fontFamily,
      fontSize: '14px',
      backgroundColor: '#fafbfc',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      '& fieldset': { 
        borderColor: neutral?.[200],
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: neutral?.[300],
      },
      '&.Mui-focused fieldset': {
        borderColor: alpha(blueColor, 0.5),
        borderWidth: '1.5px',
      },
    },
    '& .MuiOutlinedInput-input': {
      fontFamily,
      '&::placeholder': {
        color: neutral?.[400],
        opacity: 1,
      },
    },
  };

  const selectSx = {
    fontFamily,
    fontSize: '14px',
    backgroundColor: '#fafbfc',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    '& fieldset': { 
      borderColor: neutral?.[200],
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: neutral?.[300],
    },
    '&.Mui-focused fieldset': {
      borderColor: alpha(blueColor, 0.5),
      borderWidth: '1.5px',
    },
  };

  const labelWidth = 70;

  const labelSx = {
    fontFamily,
    fontSize: '13px',
    fontWeight: 500,
    color: alpha(blueColor, 0.85),
    backgroundColor: alpha(blueColor, 0.06),
    px: 1.5,
    py: 0.6,
    borderRadius: '6px',
    minWidth: labelWidth,
    textAlign: 'center' as const,
    flexShrink: 0,
    letterSpacing: '0.01em',
  };

  const textLabelSx = {
    fontFamily,
    fontSize: '13px',
    fontWeight: 450,
    color: neutral?.[500],
    minWidth: labelWidth,
    flexShrink: 0,
    letterSpacing: '0.01em',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '16px', 
          maxHeight: '90vh', 
          minWidth: 700,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: `1px solid ${neutral?.[100]}`,
        } 
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${neutral?.[100]}`,
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: alpha(blueColor, 0.08),
            }}
          >
            <MessageOutlinedIcon sx={{ fontSize: 20, color: blueColor }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily,
              fontWeight: 600,
              fontSize: '17px',
              color: neutral?.[800],
              letterSpacing: '-0.01em',
            }}
          >
            Send Message
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{
            color: neutral?.[400],
            '&:hover': { backgroundColor: neutral?.[100], color: neutral?.[600] },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 2, px: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Loan context card - only when borrower selected */}
        {context && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2.5,
              py: 1.25,
              px: 2,
              mt: 1,
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: `1px solid ${neutral?.[150] ?? neutral?.[200]}`,
            }}
          >
            <Typography sx={{ fontFamily, fontSize: '13px', color: neutral?.[600], fontWeight: 400 }}>
              <Box component="span" sx={{ fontWeight: 500, color: neutral?.[700] }}>Loan:</Box> {context.loanId}
            </Typography>
            <Typography sx={{ fontFamily, fontSize: '13px', color: neutral?.[600], fontWeight: 400 }}>
              <Box component="span" sx={{ fontWeight: 500, color: neutral?.[700] }}>Borrower:</Box> {context.borrowerName}
            </Typography>
            {context.amount > 0 && (
              <Typography sx={{ fontFamily, fontSize: '13px', color: neutral?.[600], fontWeight: 400 }}>
                <Box component="span" sx={{ fontWeight: 500, color: neutral?.[700] }}>Amount:</Box> {formatCurrency(context.amount)}
              </Typography>
            )}
            {context.daysPastDue && context.daysPastDue > 0 && (
              <Typography sx={{ fontFamily, fontSize: '13px', color: '#e05a33', fontWeight: 500 }}>
                {context.daysPastDue} days past due
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{
              fontFamily,
              fontSize: '13px',
              borderRadius: '8px',
              '& .MuiAlert-icon': { fontSize: 20 },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Row 1: To dropdown + Priority */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={labelSx}>To</Box>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              value={selectedBorrowerId}
              onChange={(e) => handleBorrowerSelect(e.target.value)}
              displayEmpty
              sx={selectSx}
              MenuProps={{ 
                PaperProps: { 
                  sx: { 
                    borderRadius: '10px', 
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                    mt: 0.5,
                  } 
                } 
              }}
            >
              <MenuItem value="" sx={{ fontFamily, fontSize: '14px', color: neutral?.[400] }}>
                Select recipient...
              </MenuItem>
              {safeBorrowers.map((b) => (
                <MenuItem key={b.id} value={b.id} sx={{ fontFamily, fontSize: '14px' }}>
                  {b.borrower} — {b.id} {b.daysPastDue > 0 && `(${b.daysPastDue}d past due)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography sx={{ fontFamily, fontSize: '13px', fontWeight: 450, color: neutral?.[500], ml: 1 }}>Priority</Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={formData.priority}
              onChange={(e) => handleChange('priority', Number(e.target.value))}
              sx={selectSx}
              MenuProps={{ PaperProps: { sx: { borderRadius: '10px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', mt: 0.5 } } }}
            >
              <MenuItem value={EmailPriority.LOW} sx={{ fontFamily, fontSize: '14px' }}>Low</MenuItem>
              <MenuItem value={EmailPriority.NORMAL} sx={{ fontFamily, fontSize: '14px' }}>Normal</MenuItem>
              <MenuItem value={EmailPriority.HIGH} sx={{ fontFamily, fontSize: '14px' }}>High</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Row 2: Cc */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={labelSx}>Cc</Box>
          <TextField
            size="small"
            fullWidth
            placeholder="Add Cc recipients"
            value={formData.cc ?? ''}
            onChange={(e) => handleChange('cc', e.target.value)}
            disabled={sending}
            sx={inputSx}
          />
        </Box>

        {/* Row 3: Bcc */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={labelSx}>Bcc</Box>
          <TextField
            size="small"
            fullWidth
            placeholder="Add Bcc recipients"
            value={formData.bcc ?? ''}
            onChange={(e) => handleChange('bcc', e.target.value)}
            disabled={sending}
            sx={inputSx}
          />
        </Box>

        {/* Row 4: Subject */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography sx={textLabelSx}>Subject</Typography>
          {loading ? (
            <Box sx={{ flex: 1, height: 40, borderRadius: '8px', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, transparent, ${alpha(blueColor, 0.12)}, transparent)`,
                  animation: 'shimmer 1.8s ease-in-out infinite',
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                  },
                }}
              />
            </Box>
          ) : (
            <TextField
              size="small"
              fullWidth
              placeholder="Enter subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              disabled={sending}
              sx={inputSx}
            />
          )}
        </Box>

        {/* Row 5: Attach */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography sx={textLabelSx}>Attach</Typography>
          <TextField
            size="small"
            placeholder="No file selected"
            value={formData.attachmentName ?? ''}
            disabled
            sx={{ 
              ...inputSx, 
              flex: 1, 
              maxWidth: 260, 
              '& .MuiOutlinedInput-root': { backgroundColor: '#f8fafc' } 
            }}
          />
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleAttachBrowse} 
            disabled={sending} 
            sx={{ 
              fontFamily,
              fontSize: '13px',
              fontWeight: 500,
              borderColor: neutral?.[200], 
              color: neutral?.[600],
              borderRadius: '8px',
              textTransform: 'none',
              px: 2,
              '&:hover': { 
                borderColor: neutral?.[300], 
                backgroundColor: neutral?.[50],
              },
            }}
          >
            Browse
          </Button>
          {formData.attachmentName && (
            <IconButton 
              size="small" 
              onClick={() => handleChange('attachmentName', '')} 
              sx={{ color: '#e05a33', '&:hover': { backgroundColor: alpha('#e05a33', 0.08) } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Message body */}
        {loading ? (
          <Box sx={{ height: 200, borderRadius: '10px', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, transparent, ${alpha(blueColor, 0.12)}, transparent)`,
                animation: 'shimmer 1.8s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' },
                },
              }}
            />
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontFamily, fontSize: '13px', fontWeight: 450, color: neutral?.[400] }}>
                AI is drafting a message...
              </Typography>
            </Box>
          </Box>
        ) : (
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder="Compose your message..."
            value={formData.body}
            onChange={(e) => handleChange('body', e.target.value)}
            disabled={sending}
            sx={{
              ...inputSx,
              '& .MuiOutlinedInput-root': {
                ...inputSx['& .MuiOutlinedInput-root'],
                borderRadius: '10px',
              },
              '& textarea': { 
                fontFamily, 
                fontSize: '14px',
                lineHeight: 1.7,
              },
            }}
          />
        )}

        {/* Add to conversation log */}
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.addToConversationLog ?? true}
              onChange={(e) => handleChange('addToConversationLog', e.target.checked)}
              disabled={sending}
              size="small"
              sx={{ 
                color: neutral?.[300], 
                '&.Mui-checked': { color: blueColor },
                '&:hover': { backgroundColor: alpha(blueColor, 0.04) },
              }}
            />
          }
          label={
            <Typography sx={{ fontFamily, fontSize: '13px', fontWeight: 400, color: neutral?.[600] }}>
              Add to conversation log
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${neutral?.[100]}`, justifyContent: 'flex-end', gap: 1.5 }}>
        <Button 
          onClick={onClose} 
          disabled={sending}
          sx={{
            fontFamily,
            fontSize: '14px',
            fontWeight: 500,
            color: neutral?.[600],
            textTransform: 'none',
            px: 2.5,
            borderRadius: '8px',
            '&:hover': { backgroundColor: neutral?.[100] },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon sx={{ fontSize: 18 }} />}
          onClick={handleSend}
          disabled={loading || sending || !formData.subject || !formData.body || !selectedBorrowerId}
          sx={{
            fontFamily,
            fontSize: '14px',
            fontWeight: 500,
            textTransform: 'none',
            px: 2.5,
            py: 1,
            borderRadius: '8px',
            backgroundColor: blueColor,
            boxShadow: `0 2px 8px ${alpha(blueColor, 0.25)}`,
            '&:hover': {
              backgroundColor: alpha(blueColor, 0.9),
              boxShadow: `0 4px 12px ${alpha(blueColor, 0.35)}`,
            },
            '&.Mui-disabled': {
              backgroundColor: neutral?.[200],
              color: neutral?.[400],
            },
          }}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
