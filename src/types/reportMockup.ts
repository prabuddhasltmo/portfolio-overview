/** Report types available from the action-item row dropdown (TMO-style mockups). */
export type ReportMockupType = 'late_notices' | 'borrower_statement' | 'escrow_analysis';

export interface ReportMockupContext {
  loanId: string;
  borrower: string;
  amount?: number;
  daysPastDue?: number;
}
