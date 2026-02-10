import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { X, Printer, Download } from 'lucide-react';
import { generateDashboardPDF } from '../../utils/reportGenerator';
import type { PortfolioData, Sentiment, DashboardSnapshot } from '../../types';
import type { DashboardCardConfig } from '../../types/dashboardConfig';
import DashboardPrintView from './DashboardPrintView';

interface ReportViewerModalProps {
  open: boolean;
  onClose: () => void;
  portfolioData: PortfolioData;
  historicalData: PortfolioData[];
  scenarioSentiment?: Sentiment;
  dashboardCards: DashboardCardConfig[];
  dashboardSnapshot?: DashboardSnapshot | null;
}

export default function ReportViewerModal({
  open,
  onClose,
  portfolioData,
  historicalData,
  scenarioSentiment,
  dashboardCards,
  dashboardSnapshot,
}: ReportViewerModalProps) {
  const theme = useTheme();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    generateDashboardPDF(portfolioData, dashboardSnapshot ?? undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
      className="report-viewer-dialog"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.neutral?.[200]}`,
          py: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Portfolio Report
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 2,
          '@media print': {
            overflow: 'visible',
          },
        }}
        className="report-content"
      >
        <DashboardPrintView
          portfolioData={portfolioData}
          historicalData={historicalData}
          scenarioSentiment={scenarioSentiment}
          dashboardCards={dashboardCards}
          dashboardSnapshot={dashboardSnapshot ?? undefined}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.neutral?.[200]}`,
          gap: 1,
        }}
        className="report-actions"
      >
        <Button variant="outlined" startIcon={<Printer size={18} />} onClick={handlePrint}>
          Print
        </Button>
        <Button variant="contained" startIcon={<Download size={18} />} onClick={handleDownload}>
          Download PDF
        </Button>
      </DialogActions>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .report-content, .report-content * {
              visibility: visible;
            }
            .report-content {
              position: absolute !important;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0 !important;
            }
            .report-viewer-dialog {
              position: static !important;
            }
            .report-viewer-dialog .MuiDialogTitle-root,
            .report-actions {
              display: none !important;
            }
          }
        `}
      </style>
    </Dialog>
  );
}
