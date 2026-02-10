import { Box, IconButton, Tooltip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Mail, FileText, Send, AlertTriangle } from 'lucide-react';
import type { ChatCTA, CTAAction, ActionItem } from '../../types';

interface ChatCTAButtonsProps {
  ctas: ChatCTA[];
  onAction: (action: CTAAction) => void;
  borrowerLookup?: Map<string, ActionItem>;
}

const iconMap = {
  mail: Mail,
  file: FileText,
  send: Send,
  alert: AlertTriangle,
} as const;

const formatBorrowerName = (name: string | undefined) => {
  if (!name) return undefined;
  const parts = name.split(',');
  return parts.length > 1 ? parts[0].trim() : name;
};

const ChatCTAButtons = ({ ctas, onAction, borrowerLookup }: ChatCTAButtonsProps) => {
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
        let borrowerName: string | undefined;
        if (cta.action.type === 'send_message') {
          borrowerName = cta.action.borrowerName;
          if (!borrowerName && cta.action.borrowerId && borrowerLookup?.has(cta.action.borrowerId)) {
            borrowerName = borrowerLookup.get(cta.action.borrowerId)?.borrower;
          }
        }
        const displayLabel =
          borrowerName && cta.action.type === 'send_message'
            ? `Message ${formatBorrowerName(borrowerName)}`
            : cta.label;
        
        return (
          <Tooltip key={index} title={displayLabel} placement="top" arrow>
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
                {displayLabel}
              </Box>
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ChatCTAButtons;
