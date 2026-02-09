import { useCallback, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
  Typography,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { DashboardCardConfig } from '../../types/dashboardConfig';

interface CustomizeDashboardModalProps {
  open: boolean;
  onClose: () => void;
  cards: DashboardCardConfig[];
  onSave: (cards: DashboardCardConfig[]) => void;
}

export default function CustomizeDashboardModal({
  open,
  onClose,
  cards,
  onSave,
}: CustomizeDashboardModalProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;

  const [draft, setDraft] = useState<DashboardCardConfig[]>(cards);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  // Reset draft whenever modal opens with fresh cards
  const handleEnter = useCallback(() => {
    setDraft(cards);
    setDragIdx(null);
    setOverIdx(null);
  }, [cards]);

  const toggleVisibility = (id: string) => {
    setDraft((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)),
    );
  };

  /* ── Drag-and-drop handlers ── */
  const handleDragStart = (idx: number, e: React.DragEvent<HTMLDivElement>) => {
    setDragIdx(idx);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag ghost semi-transparent
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4';
    });
  };

  const handleDragEnter = (idx: number) => {
    if (dragIdx === null || idx === dragIdx) return;
    setOverIdx(idx);
    setDraft((prev) => {
      const next = [...prev];
      const item = next.splice(dragIdx, 1)[0];
      next.splice(idx, 0, item);
      setDragIdx(idx);
      return next;
    });
  };

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = '1';
    setDragIdx(null);
    setOverIdx(null);
    dragNode.current = null;
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 3,
          pt: 2.5,
          pb: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SettingsIcon sx={{ fontSize: 22, color: neutral?.[700] }} />
          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: neutral?.[900] }}>
            Customize Dashboard
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: neutral?.[500] }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 500, color: neutral?.[800], mb: 0.5 }}>
          Reorder and show or hide dashboard cards
        </Typography>
        <Typography sx={{ fontSize: '13px', color: neutral?.[400], mb: 2.5 }}>
          Drag to reorder their display and toggle on or off to show or hide.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {draft.map((card, idx) => (
            <Box
              key={card.id}
              draggable
              onDragStart={(e) => handleDragStart(idx, e)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderRadius: '10px',
                border: `1px solid ${
                  overIdx === idx
                    ? theme.palette.primary.main
                    : neutral?.[200] ?? '#E1E7EE'
                }`,
                backgroundColor:
                  overIdx === idx
                    ? alpha(theme.palette.primary.main, 0.04)
                    : theme.palette.common.white,
                cursor: 'grab',
                transition: 'border-color 0.15s, background-color 0.15s',
                userSelect: 'none',
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DragIndicatorIcon
                  sx={{ fontSize: 20, color: neutral?.[300], flexShrink: 0 }}
                />
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: card.visible ? neutral?.[800] : neutral?.[400],
                  }}
                >
                  {card.label}
                </Typography>
              </Box>
              <Switch
                checked={card.visible}
                onChange={() => toggleVisibility(card.id)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.9),
            },
          }}
        >
          Save
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '8px',
            px: 3,
            backgroundColor: neutral?.[400],
            color: theme.palette.common.white,
            '&:hover': {
              backgroundColor: neutral?.[500],
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
