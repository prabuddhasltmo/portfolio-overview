import type { PortfolioRecapModel } from '../types/portfolioRecap';

export const mockPortfolioRecapData: PortfolioRecapModel = {
  headline: 'Strong January: Collections up 12.5% with improving delinquency',
  summary:
    'In January 2025, your portfolio received $2,450,000.00 across 342 payments. You have 1,245 active loans with a total principal balance of $185,500,000.00. 87 loans (7.0%) are currently past due. Collections are up 12.5% compared to last month, indicating strong payment performance.',
  keyTakeaway: 'Focus on the 14 loans at 90+ days past due to prevent further escalation.',
  moneyIn: 2450000.0,
  moneyOut: 125000.0,
  totalLoans: 1280,
  activeLoans: 1245,
  delinquentLoans: 87,
  delinquentPercentage: 6.99,
  loans30DaysPastDue: 45,
  loans60DaysPastDue: 28,
  loans90PlusDaysPastDue: 14,
  totalPrincipalBalance: 185500000.0,
  totalUnpaidInterest: 1250000.0,
  totalLateCharges: 45000.0,
  insights: [
    {
      title: 'Strong Collection Performance',
      description:
        'Collections increased by 12.5% this month, with 342 payments totaling $2.45M. This represents the highest collection month in the past 6 months.',
      category: 'Performance',
      severity: 'Positive',
    },
    {
      title: 'Delinquency Rate Below Industry Average',
      description:
        'Your 6.99% delinquency rate is well below the industry average of 8.5%. However, 14 loans are 90+ days past due and require immediate attention.',
      category: 'Delinquency',
      severity: 'Warning',
    },
    {
      title: 'Late Charges Accumulating',
      description:
        'Total late charges of $45,000 are accumulating across delinquent loans. Consider implementing a payment plan strategy for loans 60+ days past due.',
      category: 'Risk',
      severity: 'Warning',
    },
    {
      title: 'Portfolio Growth Opportunity',
      description:
        'With strong cash flow and low delinquency, your portfolio is well-positioned for growth. Consider expanding lending activities.',
      category: 'Opportunity',
      severity: 'Info',
    },
  ],
  actionItems: [
    {
      loanRecId: 'LOAN001',
      loanAccount: 'LN-2024-001',
      borrowerName: 'Smith, John & Jane',
      action: 'Urgent: 90+ days past due',
      priority: 'High',
      amount: 125000.0,
      daysPastDue: 95,
    },
    {
      loanRecId: 'LOAN002',
      loanAccount: 'LN-2024-015',
      borrowerName: 'Johnson, Michael',
      action: 'Urgent: 90+ days past due',
      priority: 'High',
      amount: 87500.0,
      daysPastDue: 102,
    },
    {
      loanRecId: 'LOAN003',
      loanAccount: 'LN-2024-028',
      borrowerName: 'Williams, Sarah',
      action: 'Review: 60+ days past due',
      priority: 'Medium',
      amount: 95000.0,
      daysPastDue: 68,
    },
    {
      loanRecId: 'LOAN004',
      loanAccount: 'LN-2024-042',
      borrowerName: 'Brown, David',
      action: 'Review: 60+ days past due',
      priority: 'Medium',
      amount: 110000.0,
      daysPastDue: 72,
    },
    {
      loanRecId: 'LOAN005',
      loanAccount: 'LN-2024-055',
      borrowerName: 'Davis, Emily',
      action: 'Follow up: 30+ days past due',
      priority: 'Low',
      amount: 75000.0,
      daysPastDue: 35,
    },
    {
      loanRecId: 'LOAN006',
      loanAccount: 'LN-2024-067',
      borrowerName: 'Miller, Robert',
      action: 'Follow up: 30+ days past due',
      priority: 'Low',
      amount: 82000.0,
      daysPastDue: 42,
    },
  ],
  trends: {
    moneyInChange: 12.5,
    moneyOutChange: -5.2,
    delinquencyChange: -0.8,
    newLoansCount: 15,
    paidOffLoansCount: 8,
    trendSummary:
      'Collections are up 12.5% compared to last month. Delinquency rate has improved by 0.8 percentage points, indicating effective collection efforts.',
  },
  generatedAt: new Date().toISOString(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};
