export interface PortfolioInsight {
  title: string;
  description: string;
  category: string;
  severity: string;
}

export interface PortfolioRecapActionItem {
  loanRecId: string;
  loanAccount: string;
  borrowerName: string;
  action: string;
  priority: string;
  amount: number | null;
  daysPastDue: number | null;
}

export interface PortfolioTrends {
  moneyInChange: number;
  moneyOutChange: number;
  delinquencyChange: number;
  newLoansCount: number;
  paidOffLoansCount: number;
  trendSummary: string;
}

export interface PortfolioRecapModel {
  headline: string | null;
  summary: string;
  keyTakeaway: string | null;
  sentiment: 'good' | 'neutral' | 'bad' | null;
  moneyIn: number;
  moneyOut: number;
  totalLoans: number;
  activeLoans: number;
  delinquentLoans: number;
  delinquentPercentage: number;
  loans30DaysPastDue: number;
  loans60DaysPastDue: number;
  loans90PlusDaysPastDue: number;
  totalPrincipalBalance: number;
  totalUnpaidInterest: number;
  totalLateCharges: number;
  insights: PortfolioInsight[];
  actionItems: PortfolioRecapActionItem[];
  trends: PortfolioTrends | null;
  generatedAt: string;
  month: number;
  year: number;
}

export interface PortfolioRecapParams {
  month: number;
  year: number;
  forceRegenerate?: boolean;
}
