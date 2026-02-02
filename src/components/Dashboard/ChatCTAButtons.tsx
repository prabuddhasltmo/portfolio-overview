import { Box, IconButton, Tooltip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Mail, FileText, Send, AlertTriangle } from 'lucide-react';
import type { ChatCTA, CTAAction } from '../../types';

interface ChatCTAButtonsProps {
  ctas: ChatCTA[];
  onAction: (action: CTAAction) => void;
}

const iconMap = {
  mail: Mail,
  file: FileText,
  send: Send,
  alert: AlertTriangle,
} as const;

const ChatCTAButtons = ({ ctas, onAction }: ChatCTAButtonsProps) => {
  const theme = useTheme();
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string } }).ui?.iconBlue ??
    theme.palette.primary.main;

  if (!ctas || ctas.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.75,
        mt: 1.5,
        pt: 1,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      }}
    >
      {ctas.map((cta, index) => {
        const IconComponent = iconMap[cta.icon] || AlertTriangle;
        
        return (
          <Tooltip key={index} title={cta.label} placement="top" arrow>
            <IconButton
              size="small"
              onClick={() => onAction(cta.action)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                backgroundColor: alpha(blueColor, 0.1),
                color: blueColor,
                fontSize: '0.75rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(blueColor, 0.2),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <IconComponent size={14} />
              <Box
                component="span"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {cta.label}
              </Box>
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ChatCTAButtons;
