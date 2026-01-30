import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { X, Printer, Download, FileText } from 'lucide-react';
import { generateReportData } from '../../services/openai';
import { generatePDF } from '../../utils/reportGenerator';
import type { PortfolioData, ReportData, ReportType } from '../../types';

interface ReportViewerModalProps {
  open: boolean;
  onClose: () => void;
  portfolioData: PortfolioData;
  historicalData: PortfolioData[];
}

export default function ReportViewerModal({
  open,
  onClose,
  portfolioData,
  historicalData,
}: ReportViewerModalProps) {
  const theme = useTheme();
  const [reportType, setReportType] = useState<ReportType>('executive');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && portfolioData) {
      fetchReport();
    }
  }, [open, reportType, portfolioData]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await generateReportData(portfolioData, historicalData, reportType);
      setReportData(data);
    } catch {
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (reportData) {
      generatePDF(reportData, portfolioData);
    }
  };

  const handleReportTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: ReportType | null
  ) => {
    if (newType) {
      setReportType(newType);
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1:
        return theme.palette.error.main;
      case 2:
        return theme.palette.warning.main;
      case 3:
        return theme.palette.info.main;
      default:
        return theme.palette.neutral?.[500] ?? '#6B7280';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'High';
      case 2:
        return 'Medium';
      case 3:
        return 'Low';
      default:
        return 'Medium';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FileText size={24} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Portfolio Report
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.neutral?.[200]}`,
          backgroundColor: theme.palette.neutral?.[50],
        }}
      >
        <ToggleButtonGroup
          value={reportType}
          exclusive
          onChange={handleReportTypeChange}
          size="small"
        >
          <ToggleButton value="executive" sx={{ px: 3 }}>
            Executive
          </ToggleButton>
          <ToggleButton value="detailed" sx={{ px: 3 }}>
            Detailed
          </ToggleButton>
          <ToggleButton value="recommendations" sx={{ px: 3 }}>
            Recommendations
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <DialogContent
        sx={{
          p: 3,
          '@media print': {
            overflow: 'visible',
          },
        }}
        className="report-content"
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="rectangular" height={100} />
            <Skeleton variant="rectangular" height={150} />
            <Skeleton variant="rectangular" height={150} />
          </Box>
        ) : reportData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                {reportData.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.neutral?.[500], mt: 0.5 }}
              >
                Generated:{' '}
                {new Date(reportData.generatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                Executive Summary
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {reportData.executiveSummary}
              </Typography>
            </Box>

            {reportData.sections.map((section, idx) => (
              <Box key={idx}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1.5,
                  }}
                >
                  {section.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {section.content}
                </Typography>

                {section.metrics && section.metrics.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 2,
                      mt: 2,
                      p: 2,
                      backgroundColor: theme.palette.neutral?.[50],
                      borderRadius: 1.5,
                    }}
                  >
                    {section.metrics.map((metric, mIdx) => (
                      <Box key={mIdx}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.neutral?.[500],
                            display: 'block',
                          }}
                        >
                          {metric.label}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                          >
                            {metric.value}
                          </Typography>
                          {metric.change && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: metric.change.startsWith('-')
                                  ? theme.palette.error.main
                                  : theme.palette.success.main,
                                fontWeight: 500,
                              }}
                            >
                              {metric.change}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {idx < reportData.sections.length - 1 && (
                  <Divider sx={{ mt: 3 }} />
                )}
              </Box>
            ))}

            {reportData.recommendations.length > 0 && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 2,
                  }}
                >
                  Recommendations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {reportData.recommendations.map((rec, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        backgroundColor: theme.palette.background.default,
                        borderRadius: 1.5,
                        border: `1px solid ${theme.palette.neutral?.[200]}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={getPriorityLabel(rec.priority)}
                          size="small"
                          sx={{
                            backgroundColor: alpha(getPriorityColor(rec.priority), 0.15),
                            color: getPriorityColor(rec.priority),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                        >
                          {rec.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {rec.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <Typography color="error">
              Failed to generate report. Please try again.
            </Typography>
            <Button onClick={fetchReport} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.neutral?.[200]}`,
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Printer size={18} />}
          onClick={handlePrint}
          disabled={loading || !reportData}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<Download size={18} />}
          onClick={handleDownload}
          disabled={loading || !reportData}
        >
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
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .MuiDialog-root {
              position: static !important;
            }
            .MuiDialogActions-root,
            .MuiDialogTitle-root,
            .MuiToggleButtonGroup-root {
              display: none !important;
            }
          }
        `}
      </style>
    </Dialog>
  );
}
