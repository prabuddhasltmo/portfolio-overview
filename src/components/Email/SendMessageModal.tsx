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
  Skeleton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailComposer from './EmailComposer';
import { sendMessage, generateAIMessageDraft } from '../../services/emailService';
import {
  EmailPriority,
  type EmailFormData,
  type EmailDraftContext,
  type EmailRecipient,
} from '../../types/email';

interface SendMessageModalProps {
  open: boolean;
  onClose: () => void;
  context: EmailDraftContext;
  onSuccess?: () => void;
}

export default function SendMessageModal({
  open,
  onClose,
  context,
  onSuccess,
}: SendMessageModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string } }).ui?.iconBlue ??
    theme.palette.primary.main;

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmailFormData>({
    to: {
      name: context.borrowerName,
      email: context.borrowerEmail || '',
    },
    from: {
      name: 'Portfolio Services',
      email: 'services@lender.com',
    },
    subject: '',
    body: '',
    priority: EmailPriority.NORMAL,
  });

  const generateDraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const draft = await generateAIMessageDraft(context);
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
  }, [context]);

  useEffect(() => {
    if (open) {
      setFormData({
        to: {
          name: context.borrowerName,
          email: context.borrowerEmail || '',
        },
        from: {
          name: 'Portfolio Services',
          email: 'services@lender.com',
        },
        subject: '',
        body: '',
        priority: EmailPriority.NORMAL,
      });
      setError(null);
      generateDraft();
    }
  }, [open, context, generateDraft]);

  const handleChange = (
    field: keyof EmailFormData,
    value: string | number | EmailRecipient
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSend = async () => {
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '90vh',
          marginTop: '48px',
          marginBottom: '24px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${neutral?.[200]}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: alpha(blueColor, 0.1),
            }}
          >
            <MessageOutlinedIcon sx={{ fontSize: 20, color: blueColor }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Message borrower
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3.5 }}>
        <Box
          sx={{
            p: 1.5,
            mt: 1.5,
            mb: 2,
            backgroundColor: alpha(blueColor, 0.05),
            borderRadius: '8px',
            border: `1px solid ${alpha(blueColor, 0.15)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>
              <strong>Loan:</strong> {context.loanId}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>
              <strong>Borrower:</strong> {context.borrowerName}
            </Typography>
            {context.amount > 0 && (
              <Typography sx={{ fontSize: '13px', color: neutral?.[600] }}>
                <strong>Amount:</strong> {formatCurrency(context.amount)}
              </Typography>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} width={200} />
            <Skeleton variant="rounded" height={120} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: blueColor, animation: 'pulse 1.5s infinite' }} />
              <Typography sx={{ fontSize: '13px', color: neutral?.[500] }}>
                AI is drafting a short message...
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <EmailComposer
              formData={formData}
              onChange={handleChange}
              readOnlyRecipient
              disabled={sending}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2,
                p: 1.5,
                backgroundColor: neutral?.[50],
                borderRadius: '6px',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16, color: blueColor }} />
              <Typography sx={{ fontSize: '12px', color: neutral?.[500] }}>
                AI drafted this short message based on the loan context. You can edit before sending.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${neutral?.[200]}`,
          justifyContent: 'space-between',
        }}
      >
        <Button
          startIcon={<RefreshIcon />}
          onClick={generateDraft}
          disabled={loading || sending}
          sx={{ color: blueColor }}
        >
          Regenerate
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSend}
            disabled={loading || sending || !formData.subject || !formData.body}
          >
            {sending ? 'Sending...' : 'Send message'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
