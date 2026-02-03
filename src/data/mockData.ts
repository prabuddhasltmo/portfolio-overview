import type { PortfolioData, AIInsight, SidebarItem, Sentiment } from '../types';

export const portfolioData: PortfolioData = {
  month: 'January',
  year: 2026,
  totalLoans: 1280,
  activeLoans: 1245,
  principalBalance: 185500000,
  unpaidInterest: 1250000,
  totalLateCharges: 45000,
  cashFlow: {
    moneyIn: 2450000,
    moneyInChange: 12.5,
    moneyOut: 125000,
    moneyOutChange: -5.2,
    netCashFlow: 2325000,
  },
  delinquent: {
    total: 1121,
    percentage: 90.0,
    breakdown: {
      thirtyDays: 583,
      sixtyDays: 336,
      ninetyPlusDays: 202,
    },
  },
  trends: {
    collections: 12.5,
    disbursements: -5.2,
    delinquency: -0.8,
    newLoans: 15,
    paidOff: 8,
  },
  actionItems: [
    {
      id: 'LN-2024-001',
      borrower: 'Smith, John & Jane',
      priority: 'High',
      category: 'Checks Due',
      amount: 125000,
      daysPastDue: 95,
    },
    {
      id: 'LN-2024-015',
      borrower: 'Johnson, Michael',
      priority: 'High',
      category: 'Pending Billing',
      amount: 87500,
      daysPastDue: 102,
    },
    {
      id: 'LN-2024-028',
      borrower: 'Williams, Sarah',
      priority: 'Medium',
      category: 'Payment Adjustments',
      amount: 95000,
      daysPastDue: 68,
    },
  ],
};

export const historicalPortfolioData: PortfolioData[] = [
  {
    month: 'October',
    year: 2025,
    totalLoans: 1210,
    activeLoans: 1175,
    principalBalance: 172000000,
    unpaidInterest: 1450000,
    totalLateCharges: 62000,
    cashFlow: {
      moneyIn: 2050000,
      moneyInChange: -2.1,
      moneyOut: 145000,
      moneyOutChange: 3.5,
      netCashFlow: 1905000,
    },
    delinquent: {
      total: 118,
      percentage: 10.0,
      breakdown: {
        thirtyDays: 62,
        sixtyDays: 38,
        ninetyPlusDays: 18,
      },
    },
    trends: {
      collections: -2.1,
      disbursements: 3.5,
      delinquency: 1.2,
      newLoans: 10,
      paidOff: 12,
    },
    actionItems: [],
  },
  {
    month: 'November',
    year: 2025,
    totalLoans: 1235,
    activeLoans: 1200,
    principalBalance: 178000000,
    unpaidInterest: 1380000,
    totalLateCharges: 55000,
    cashFlow: {
      moneyIn: 2180000,
      moneyInChange: 6.3,
      moneyOut: 138000,
      moneyOutChange: -4.8,
      netCashFlow: 2042000,
    },
    delinquent: {
      total: 360,
      percentage: 30.0,
      breakdown: {
        thirtyDays: 187,
        sixtyDays: 108,
        ninetyPlusDays: 65,
      },
    },
    trends: {
      collections: 6.3,
      disbursements: -4.8,
      delinquency: -0.9,
      newLoans: 12,
      paidOff: 10,
    },
    actionItems: [],
  },
  {
    month: 'December',
    year: 2025,
    totalLoans: 1260,
    activeLoans: 1225,
    principalBalance: 182000000,
    unpaidInterest: 1300000,
    totalLateCharges: 48000,
    cashFlow: {
      moneyIn: 2320000,
      moneyInChange: 6.4,
      moneyOut: 130000,
      moneyOutChange: -5.8,
      netCashFlow: 2190000,
    },
    delinquent: {
      total: 735,
      percentage: 60.0,
      breakdown: {
        thirtyDays: 382,
        sixtyDays: 221,
        ninetyPlusDays: 132,
      },
    },
    trends: {
      collections: 6.4,
      disbursements: -5.8,
      delinquency: -0.5,
      newLoans: 14,
      paidOff: 9,
    },
    actionItems: [],
  },
];

export const mockAISummary = `In January 2026, your portfolio received $2,450,000.00 across 342 payments. You have 1,245 active loans with a total principal balance of $185,500,000.00. 87 loans (7.0%) are currently past due. Collections are up 12.5% compared to last month, indicating strong payment performance.`;

export const mockSentiment: Sentiment = 'good';

export const mockKeyTakeaway = 'Portfolio is trending positively with improved collections and declining delinquency rates over the past 3 months.';

export const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Strong Collection Performance',
    description:
      'Collections increased by 12.5% this month, with 342 payments totaling $2.45M. This represents the highest collection month in the past 6 months.',
    category: 'Performance',
  },
  {
    id: '2',
    title: 'Delinquency Rate Below Industry Average',
    description:
      'Your 6.99% delinquency rate is well below the industry average of 8.5%. However, 14 loans are 90+ days past due and require immediate attention.',
    category: 'Delinquency',
  },
  {
    id: '3',
    title: 'Late Charges Accumulating',
    description:
      'Total late charges of $45,000 are accumulating across delinquent loans. Consider implementing a payment plan strategy for loans 60+ days past due.',
    category: 'Risk',
  },
  {
    id: '4',
    title: 'Portfolio Growth Opportunity',
    description:
      'With strong cash flow and low delinquency, your portfolio is well-positioned for growth. Consider expanding lending activities.',
    category: 'Opportunity',
  },
];

export const sidebarItems: SidebarItem[] = [
  {
    id: 'loan-applications',
    label: 'Loan Applications',
    children: [],
  },
  {
    id: 'loan-origination',
    label: 'Loan Origination',
    children: [],
  },
  {
    id: 'loan-servicing',
    label: 'Loan Servicing',
    children: [
      { id: 'portfolio-recap', label: 'Portfolio Recap', active: true },
      { id: 'pulse', label: 'Pulse' },
      { id: 'tasks-pending', label: 'Tasks Pending' },
      {
        id: 'loans',
        label: 'Loans',
        children: [
          { id: 'all-loans', label: 'All Loans' },
          { id: 'conventional', label: 'Conventional' },
          { id: 'commercial', label: 'Commercial' },
          { id: 'construction', label: 'Construction' },
          { id: 'lines-of-credit', label: 'Lines of Credit' },
          { id: 'other', label: 'Other' },
          { id: 'loans-smartviews', label: 'Loans SmartViews' },
        ],
      },
      {
        id: 'properties',
        label: 'Properties',
        children: [],
      },
      { id: 'templates', label: 'Templates' },
      { id: 'all-lenders', label: 'All Lenders' },
      { id: 'lenders-smartviews', label: 'Lenders SmartViews' },
      { id: 'all-vendors', label: 'All Vendors' },
      { id: 'vendors-smartviews', label: 'Vendors SmartViews' },
      { id: 'tasks-reports', label: 'Tasks & Reports' },
      { id: 'conversation-log', label: 'Conversation Log' },
      { id: 'text-messages', label: 'Text Messages' },
      { id: 'e-filing', label: 'E-Filing' },
      { id: '1098-mortgage', label: '1098 Mortgage Interest Statem...' },
      { id: '1099-int', label: '1099-INT Interest Income' },
      { id: '1099-misc', label: '1099-MISC Miscellaneous Inco...' },
      { id: '1099-nec', label: '1099-NEC Nonemployee Comp...' },
      { id: 't5-statements', label: 'T5-Statements of Investment I...' },
    ],
  },
  {
    id: 'mortgage-pool',
    label: 'Mortgage Pool Servicing',
    children: [],
  },
  { id: 'ach-express', label: 'ACH Express' },
  {
    id: 'marketplace',
    label: 'Marketplace',
    children: [],
  },
  {
    id: 'custom-letters',
    label: 'Custom Letters & Reports',
    children: [],
  },
  {
    id: 'trust-accounts',
    label: 'Trust Accounts',
    children: [],
  },
  {
    id: 'online-portals',
    label: 'Online Portals',
    children: [],
  },
  { id: 'events-journal', label: 'Events Journal' },
  {
    id: 'business-contacts',
    label: 'Business Contacts',
    children: [],
  },
  { id: 'financial-calculator', label: 'Financial Calculator' },
  { id: 'mailing-label', label: 'Mailing Label Maintenance' },
  { id: 'window-envelope', label: 'Window Envelope Alignment' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'user-management', label: 'User Management' },
  {
    id: 'company-properties',
    label: 'Company Properties',
    children: [],
  },
  { id: 'order-supplies', label: 'Order Supplies' },
  { id: 'feature-request', label: 'Feature Request' },
];
