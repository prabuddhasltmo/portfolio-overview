export interface CashFlow {
  moneyIn: number;
  moneyInChange: number;
  moneyOut: number;
  moneyOutChange: number;
  netCashFlow: number;
}

export interface DelinquentBreakdown {
  thirtyDays: number;
  sixtyDays: number;
  ninetyPlusDays: number;
}

export interface Delinquent {
  total: number;
  percentage: number;
  breakdown: DelinquentBreakdown;
}

export interface Trends {
  collections: number;
  disbursements: number;
  delinquency: number;
  newLoans: number;
  paidOff: number;
}

export interface ActionItem {
  id: string;
  borrower: string;
  borrowerEmail?: string;
  priority: 'High' | 'Medium' | 'Low';
  category?: 'Checks Due' | 'Delinquent Loans' | 'Pending Billing' | 'Payment Adjustments' | 'Send Payment Statements';
  amount: number;
  daysPastDue: number;
}

export interface PortfolioData {
  month: string;
  year: number;
  totalLoans: number;
  activeLoans: number;
  principalBalance: number;
  unpaidInterest: number;
  totalLateCharges: number;
  cashFlow: CashFlow;
  delinquent: Delinquent;
  trends: Trends;
  actionItems: ActionItem[];
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'Performance' | 'Delinquency' | 'Risk' | 'Opportunity';
}

/** Snapshot of AI-generated dashboard content for report (no refetch). */
export interface DashboardSnapshot {
  summary: string;
  keyTakeaway: string;
  insights: AIInsight[];
}

export type Sentiment = 'good' | 'neutral' | 'bad';

export interface AISummaryResponse {
  summary: string;
  sentiment: Sentiment;
  keyTakeaway: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  children?: SidebarItem[];
}

// Chart data structure for LLM responses
export interface ChartDataSeries {
  dataKey: string;
  name: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'area';
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  /** Single series: data with "value". Multi-series: data with multiple keys (e.g. moneyIn, moneyOut) and use "series". */
  data: Array<Record<string, string | number>>;
  /** For multi-series bar charts (e.g. Money In vs Money Out). Each item: { dataKey: "moneyIn", name: "Money In" }. */
  series?: ChartDataSeries[];
}

// CTA actions the AI can suggest
export type CTAAction =
  | { type: 'late_notices'; borrowerId?: string }
  | { type: 'send_message'; borrowerId?: string; borrowerEmail?: string; borrowerName?: string }
  | { type: 'view_report'; reportType: 'late_notices' | 'borrower_statement' | 'escrow_analysis'; reportLink?: string };

export interface ChatCTA {
  label: string;
  icon: 'mail' | 'file' | 'alert' | 'send';
  action: CTAAction;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chart?: ChartData;
  ctas?: ChatCTA[];
}

export interface ChatResponse {
  answer: string;
  suggestions: string[];
  chart?: ChartData;
  ctas?: ChatCTA[];
}

export interface ReportMetric {
  label: string;
  value: string;
  change?: string;
}

export interface ReportSection {
  title: string;
  content: string;
  metrics?: ReportMetric[];
}

export interface ReportRecommendation {
  priority: number;
  title: string;
  description: string;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  executiveSummary: string;
  sections: ReportSection[];
  recommendations: ReportRecommendation[];
}

export type ReportType = 'executive' | 'detailed' | 'recommendations';
