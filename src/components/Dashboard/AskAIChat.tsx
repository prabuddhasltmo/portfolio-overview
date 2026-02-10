import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Sparkles, Send, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import CardBox from './CardBox';
import ChatChart from './ChatChart';
import ChatCTAButtons from './ChatCTAButtons';
import { chatWithAI } from '../../services/openai';
import type { PortfolioData, ChatMessage, CTAAction, ActionItem } from '../../types';
import type { EmailDraftContext } from '../../types/email';
import type { ReportMockupType } from '../../types/reportMockup';

interface AskAIChatProps {
  portfolioData: PortfolioData;
  historicalData: PortfolioData[];
  onOpenLateNotices?: () => void;
  onOpenSendMessage?: (context: EmailDraftContext) => void;
  onOpenReport?: (type: ReportMockupType) => void;
}

export default function AskAIChat({
  portfolioData,
  historicalData,
  onOpenLateNotices,
  onOpenSendMessage,
  onOpenReport,
}: AskAIChatProps) {
  const theme = useTheme();
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string }; blue?: string }).ui?.iconBlue ??
    (theme.palette as { blue?: string }).blue ??
    theme.palette.primary.main;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'What is the current delinquency rate?',
    'How are collections trending?',
    'Which loans need attention?',
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const borrowerLookup = useMemo(() => {
    const map = new Map<string, ActionItem>();
    (portfolioData.actionItems ?? []).forEach(item => {
      if (item.id) {
        map.set(item.id, item);
      }
    });
    return map;
  }, [portfolioData.actionItems]);

  const resolveBorrowerName = (action: CTAAction) => {
    if (action.type !== 'send_message') return undefined;
    if (action.borrowerName) return action.borrowerName;
    if (action.borrowerId && borrowerLookup.has(action.borrowerId)) {
      return borrowerLookup.get(action.borrowerId)?.borrower;
    }
    return undefined;
  };

  const handleToggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const handleCTAAction = (action: CTAAction) => {
    switch (action.type) {
      case 'late_notices':
        onOpenLateNotices?.();
        break;
      case 'send_message': {
        const sendContext: EmailDraftContext = {
          loanId: action.borrowerId || '',
          borrowerName: resolveBorrowerName(action) || action.borrowerId || 'Borrower',
          borrowerEmail: action.borrowerEmail,
          amount: 0,
          emailType: 'collection_followup',
        };
        onOpenSendMessage?.(sendContext);
        break;
      }
      case 'view_report':
        if (action.reportLink) {
          window.open(action.reportLink, '_blank', 'noopener,noreferrer');
        } else {
          onOpenReport?.(action.reportType);
        }
        break;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: q,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(q, portfolioData, historicalData, messages);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        chart: response.chart ?? undefined,
        ctas: response.ctas ?? undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setSuggestions([
      'What is the current delinquency rate?',
      'How are collections trending?',
      'Which loans need attention?',
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <CardBox
      customSx={{
        flexDirection: 'column',
        gap: 2,
        padding: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.common.white, 0.82),
        border: `1px solid ${alpha(blueColor, 0.2)}`,
        boxShadow: `0 2px 8px ${alpha(blueColor, 0.08)}`,
        minHeight: expanded ? 600 : 'auto',
        transition: 'min-height 0.3s ease-in-out',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
            }}
          >
            <Sparkles size={18} color="#fff" />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            Ask AI
          </Typography>
          <Chip
            label="Live"
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.15),
              color: theme.palette.success.main,
              fontWeight: 500,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleToggleExpand}
            sx={{
              color: theme.palette.neutral?.[400],
              '&:hover': {
                color: blueColor,
                backgroundColor: alpha(blueColor, 0.1),
              },
            }}
          >
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </IconButton>
          {messages.length > 0 && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                color: theme.palette.neutral?.[400],
                '&:hover': {
                  color: theme.palette.error.main,
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <Trash2 size={18} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          overflowY: 'auto',
          minHeight: expanded ? 450 : 150,
          maxHeight: expanded ? 500 : 300,
          flex: expanded ? 1 : 'none',
          transition: 'all 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          px: 0.5,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.neutral?.[200],
            borderRadius: 3,
          },
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 1,
              py: 3,
            }}
          >
            <Sparkles size={32} color={theme.palette.neutral?.[300]} />
            <Typography
              sx={{
                color: theme.palette.neutral?.[400],
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              Ask anything about your portfolio data
            </Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: msg.role === 'assistant' && msg.chart ? '95%' : '85%',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor:
                    msg.role === 'user'
                      ? theme.palette.primary.main
                      : theme.palette.neutral?.[100],
                  color:
                    msg.role === 'user' ? '#fff' : theme.palette.text.primary,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </Typography>
                {msg.role === 'assistant' && msg.chart && (
                  <ChatChart data={msg.chart} />
                )}
                {msg.role === 'assistant' && msg.ctas && msg.ctas.length > 0 && (
                  <ChatCTAButtons
                    ctas={msg.ctas}
                    onAction={handleCTAAction}
                    borrowerLookup={borrowerLookup}
                  />
                )}
              </Box>
            </Box>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: theme.palette.neutral?.[100],
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: theme.palette.neutral?.[500],
                }}
              >
                Thinking...
              </Typography>
            </Box>
          </Box>
        )}
        <div ref={chatEndRef} />
      </Box>

      {suggestions.length > 0 && messages.length < 4 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {suggestions.slice(0, 3).map((suggestion, idx) => (
            <Chip
              key={idx}
              label={suggestion}
              size="small"
              onClick={() => handleSend(suggestion)}
              disabled={loading}
              sx={{
                cursor: 'pointer',
                backgroundColor: theme.palette.neutral?.[100],
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: theme.palette.neutral?.[200],
                },
              }}
            />
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Ask about your portfolio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.neutral?.[50],
              '& fieldset': {
                borderColor: theme.palette.neutral?.[200],
              },
              '&:hover fieldset': {
                borderColor: theme.palette.neutral?.[300],
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
        <IconButton
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.neutral?.[200],
              color: theme.palette.neutral?.[400],
            },
          }}
        >
          <Send size={18} />
        </IconButton>
      </Box>
    </CardBox>
  );
}
