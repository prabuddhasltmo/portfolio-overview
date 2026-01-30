import type { EmailDraftContext, EmailFormData, Message, AIEmailDraftResponse, EmailPriority } from '../types/email';

const API_BASE = '/api';

export async function generateAIDraft(context: EmailDraftContext): Promise<AIEmailDraftResponse> {
  const response = await fetch(`${API_BASE}/ai/draft-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate email draft');
  }

  return response.json();
}

export async function generateAIMessageDraft(context: EmailDraftContext): Promise<AIEmailDraftResponse> {
  const response = await fetch(`${API_BASE}/ai/draft-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate message draft');
  }

  return response.json();
}

export async function sendMessage(email: EmailFormData): Promise<Message> {
  const response = await fetch(`${API_BASE}/messages/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email.to,
      from: email.from,
      subject: email.subject,
      body: email.body,
      priority: email.priority,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}

export async function getMessages(folder: 'inbox' | 'sent' = 'inbox'): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/messages?folder=${folder}`);

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data = await response.json();
  return data.messages;
}

export async function getMessage(id: string): Promise<Message> {
  const response = await fetch(`${API_BASE}/messages/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch message');
  }

  return response.json();
}

export async function markAsRead(messageId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/messages/${messageId}/read`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to mark message as read');
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/messages/${messageId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete message');
  }
}

export async function getUnreadCount(): Promise<number> {
  const response = await fetch(`${API_BASE}/messages/unread-count`);

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  return data.count;
}

export function getPriorityLabel(priority: EmailPriority): string {
  switch (priority) {
    case 1:
      return 'Low';
    case 2:
      return 'High';
    case 0:
    default:
      return 'Normal';
  }
}
