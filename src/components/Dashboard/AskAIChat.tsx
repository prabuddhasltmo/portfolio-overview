import { useState, useRef, useEffect } from 'react';
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
import { Sparkles, Send, Trash2 } from 'lucide-react';
import CardBox from './CardBox';
import { chatWithAI } from '../../services/openai';
import type { PortfolioData, ChatMessage } from '../../types';

interface AskAIChatProps {
  portfolioData: PortfolioData;
  historicalData: PortfolioData[];
}

export default function AskAIChat({ portfolioData, historicalData }: AskAIChatProps) {
  const theme = useTheme();
  const blueColor =
    (theme.palette as { ui?: { iconBlue?: string }; blue?: string }).ui?.iconBlue ??
    (theme.palette as { blue?: string }).blue ??
    theme.palette.primary.main;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'What is the current delinquency rate?',
    'How are collections trending?',
    'Which loans need attention?',
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      <Box
        sx={{
          overflowY: 'auto',
          maxHeight: 300,
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
                  maxWidth: '85%',
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
