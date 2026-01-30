import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import type { SelectChangeEvent } from '@mui/material';
import { EmailPriority, type EmailFormData, type EmailRecipient } from '../../types/email';

interface EmailComposerProps {
  formData: EmailFormData;
  onChange: (field: keyof EmailFormData, value: string | number | EmailRecipient) => void;
  readOnlyRecipient?: boolean;
  disabled?: boolean;
}

export default function EmailComposer({
  formData,
  onChange,
  readOnlyRecipient = false,
  disabled = false,
}: EmailComposerProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  const handlePriorityChange = (e: SelectChangeEvent<number>) => {
    onChange('priority', Number(e.target.value));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          backgroundColor: neutral?.[50],
          borderRadius: '6px',
        }}
      >
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 500,
            color: neutral?.[500],
            minWidth: '60px',
          }}
        >
          To:
        </Typography>
        {readOnlyRecipient ? (
          <Box>
            <Typography sx={{ fontSize: '14px', color: neutral?.[900] }}>
              {formData.to.name}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: neutral?.[500] }}>
              {formData.to.email}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            <TextField
              size="small"
              placeholder="Recipient Name"
              value={formData.to.name}
              onChange={(e) => onChange('to', { ...formData.to, name: e.target.value })}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              placeholder="Email Address"
              value={formData.to.email}
              onChange={(e) => onChange('to', { ...formData.to, email: e.target.value })}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
          </Box>
        )}
      </Box>

      <TextField
        fullWidth
        label="Subject"
        value={formData.subject}
        onChange={(e) => onChange('subject', e.target.value)}
        disabled={disabled}
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.common.white,
          },
        }}
      />

      <FormControl size="small" sx={{ maxWidth: 200 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={formData.priority}
          label="Priority"
          onChange={handlePriorityChange}
          disabled={disabled}
          sx={{ backgroundColor: theme.palette.common.white }}
        >
          <MenuItem value={EmailPriority.LOW}>Low</MenuItem>
          <MenuItem value={EmailPriority.NORMAL}>Normal</MenuItem>
          <MenuItem value={EmailPriority.HIGH}>High</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={10}
        label="Message"
        value={formData.body}
        onChange={(e) => onChange('body', e.target.value)}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.common.white,
          },
          '& textarea': {
            fontFamily: 'inherit',
            lineHeight: 1.6,
          },
        }}
      />
    </Box>
  );
}
