import type { PortfolioData, AIInsight, SidebarItem } from '../types';

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
    total: 87,
    percentage: 7.0,
    breakdown: {
      thirtyDays: 45,
      sixtyDays: 28,
      ninetyPlusDays: 14,
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
      amount: 125000,
      daysPastDue: 95,
    },
    {
      id: 'LN-2024-015',
      borrower: 'Johnson, Michael',
      priority: 'High',
      amount: 87500,
      daysPastDue: 102,
    },
    {
      id: 'LN-2024-028',
      borrower: 'Williams, Sarah',
      priority: 'Medium',
      amount: 95000,
      daysPastDue: 68,
    },
  ],
};

export const mockAISummary = `In January 2026, your portfolio received $2,450,000.00 across 342 payments. You have 1,245 active loans with a total principal balance of $185,500,000.00. 87 loans (7.0%) are currently past due. Collections are up 12.5% compared to last month, indicating strong payment performance.`;

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
