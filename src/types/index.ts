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
  priority: 'High' | 'Medium' | 'Low';
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

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  children?: SidebarItem[];
}
