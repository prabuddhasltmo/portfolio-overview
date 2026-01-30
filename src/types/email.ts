export enum EmailPriority {
  LOW = 1,
  NORMAL = 0,
  HIGH = 2,
}

export interface EmailRecipient {
  name: string;
  email: string;
}

export interface EmailDraftContext {
  loanId: string;
  borrowerName: string;
  borrowerEmail?: string;
  amount: number;
  daysPastDue?: number;
  emailType: 'collection_followup' | 'check_in' | 'refinance_offer' | 'general';
}

export interface EmailFormData {
  to: EmailRecipient;
  from: EmailRecipient;
  subject: string;
  body: string;
  priority: EmailPriority;
}

export interface Message {
  id: string;
  from: EmailRecipient;
  to: EmailRecipient;
  subject: string;
  body: string;
  priority: EmailPriority;
  sentAt: string;
  isRead: boolean;
  folder: 'inbox' | 'sent';
}

export interface AIEmailDraftResponse {
  subject: string;
  body: string;
}

export interface DraftEmailModalProps {
  open: boolean;
  onClose: () => void;
  context: EmailDraftContext;
  onSend?: (email: EmailFormData) => Promise<void>;
}
