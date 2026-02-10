import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportData, PortfolioData, DashboardSnapshot } from '../types';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Generate a dashboard-style PDF (screen-print style) from portfolio data and current screen content. */
export function generateDashboardPDF(portfolioData: PortfolioData, snapshot?: DashboardSnapshot): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Portfolio Recap — ${portfolioData.month} ${portfolioData.year}`, pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 15;

  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  if (snapshot) {
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('AI Summary', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(snapshot.summary, contentWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Key Takeaway', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const takeawayLines = doc.splitTextToSize(snapshot.keyTakeaway, contentWidth);
    doc.text(takeawayLines, margin, yPosition);
    yPosition += takeawayLines.length * 5 + 12;

    if (snapshot.insights.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('AI Insights', margin, yPosition);
      yPosition += 8;

      for (const insight of snapshot.insights) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${insight.title} (${insight.category})`, margin, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(insight.description, contentWidth);
        doc.text(descLines, margin, yPosition);
        yPosition += descLines.length * 4 + 6;
      }
      yPosition += 6;
    }
  }

  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Portfolio Snapshot', margin, yPosition);
  yPosition += 8;

  const snapshotData = [
    ['Total Loans', portfolioData.totalLoans.toLocaleString()],
    ['Active Loans', portfolioData.activeLoans.toLocaleString()],
    ['Principal Balance', formatCurrency(portfolioData.principalBalance)],
    ['Unpaid Interest', formatCurrency(portfolioData.unpaidInterest)],
    [
      'Delinquent',
      `${portfolioData.delinquent.total} (${portfolioData.delinquent.percentage}%)`,
    ],
    ['30/60/90+ Days', `${portfolioData.delinquent.breakdown.thirtyDays} / ${portfolioData.delinquent.breakdown.sixtyDays} / ${portfolioData.delinquent.breakdown.ninetyPlusDays}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: snapshotData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Cash Flow', margin, yPosition);
  yPosition += 8;

  const cashFlow = portfolioData.cashFlow;
  const cashFlowData: [string, string, string][] = [
    ['Money In (Collections)', formatCurrency(cashFlow.moneyIn), `${cashFlow.moneyInChange >= 0 ? '+' : ''}${cashFlow.moneyInChange.toFixed(1)}%`],
    ['Money Out (Disbursements)', formatCurrency(cashFlow.moneyOut), `${cashFlow.moneyOutChange >= 0 ? '+' : ''}${cashFlow.moneyOutChange.toFixed(1)}%`],
    ['Net Cash Flow', formatCurrency(cashFlow.netCashFlow), '—'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['', 'Amount', 'Change']],
    body: cashFlowData,
    theme: 'striped',
    headStyles: { fillColor: [100, 116, 139], textColor: 255 },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Month-over-Month Trends', margin, yPosition);
  yPosition += 8;

  const trends = portfolioData.trends;
  const trendsData = [
    ['Collections', `${trends.collections >= 0 ? '+' : ''}${trends.collections.toFixed(1)}%`],
    ['Disbursements', `${trends.disbursements >= 0 ? '+' : ''}${trends.disbursements.toFixed(1)}%`],
    ['Delinquency', `${trends.delinquency >= 0 ? '+' : ''}${trends.delinquency.toFixed(1)}%`],
    ['New Loans', `${trends.newLoans >= 0 ? '+' : ''}${trends.newLoans}`],
    ['Paid Off', `${trends.paidOff >= 0 ? '+' : ''}${trends.paidOff}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Change']],
    body: trendsData,
    theme: 'striped',
    headStyles: { fillColor: [100, 116, 139], textColor: 255 },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  const actionItems = portfolioData.actionItems ?? [];
  if (actionItems.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Action Items', margin, yPosition);
    yPosition += 8;

    const itemsBody: [string, string, string, string, string, string][] = actionItems.map(
      (item) => [
        item.id,
        item.borrower,
        item.category ?? '—',
        item.priority,
        formatCurrency(item.amount),
        item.daysPastDue != null ? `${item.daysPastDue} days` : '—',
      ]
    );

    autoTable(doc, {
      startY: yPosition,
      head: [['Loan', 'Borrower', 'Category', 'Priority', 'Amount', 'Past Due']],
      body: itemsBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 45 },
        2: { cellWidth: 40 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
      },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = `portfolio-recap-${portfolioData.month.toLowerCase()}-${portfolioData.year}.pdf`;
  doc.save(filename);
}

export function generatePDF(data: ReportData, portfolioData: PortfolioData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  const generatedDate = new Date(data.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${generatedDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(data.executiveSummary, contentWidth);
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 5 + 10;

  if (yPosition > 250) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Portfolio Snapshot', margin, yPosition);
  yPosition += 8;

  const snapshotData = [
    ['Total Loans', portfolioData.totalLoans.toLocaleString()],
    ['Active Loans', portfolioData.activeLoans.toLocaleString()],
    ['Principal Balance', `$${portfolioData.principalBalance.toLocaleString()}`],
    ['Unpaid Interest', `$${portfolioData.unpaidInterest.toLocaleString()}`],
    ['Delinquent Loans', `${portfolioData.delinquent.total} (${portfolioData.delinquent.percentage}%)`],
    ['Net Cash Flow', `$${portfolioData.cashFlow.netCashFlow.toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: snapshotData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  for (const section of data.sections) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(section.title, margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const sectionLines = doc.splitTextToSize(section.content, contentWidth);
    doc.text(sectionLines, margin, yPosition);
    yPosition += sectionLines.length * 5 + 5;

    if (section.metrics && section.metrics.length > 0) {
      const metricsBody = section.metrics.map(m => [
        m.label,
        m.value,
        m.change || '-',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value', 'Change']],
        body: metricsBody,
        theme: 'grid',
        headStyles: { fillColor: [100, 116, 139], textColor: 255 },
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
      });

      yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    yPosition += 5;
  }

  if (data.recommendations.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Recommendations', margin, yPosition);
    yPosition += 8;

    const priorityLabels: Record<number, string> = {
      1: 'High',
      2: 'Medium',
      3: 'Low',
    };

    const recsBody = data.recommendations.map(r => [
      priorityLabels[r.priority] || 'Medium',
      r.title,
      r.description,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Priority', 'Recommendation', 'Description']],
      body: recsBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 'auto' },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 0) {
          const priority = hookData.cell.raw as string;
          if (priority === 'High') {
            hookData.cell.styles.textColor = [220, 38, 38];
            hookData.cell.styles.fontStyle = 'bold';
          } else if (priority === 'Medium') {
            hookData.cell.styles.textColor = [234, 88, 12];
          } else {
            hookData.cell.styles.textColor = [37, 99, 235];
          }
        }
      },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = `portfolio-report-${portfolioData.month.toLowerCase()}-${portfolioData.year}.pdf`;
  doc.save(filename);
}
