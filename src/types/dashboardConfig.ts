export interface DashboardCardConfig {
  id: string;
  label: string;
  visible: boolean;
  /** If true the card takes half the row (two halves form a 2-column grid). */
  halfWidth: boolean;
}

export const DEFAULT_DASHBOARD_CARDS: DashboardCardConfig[] = [
  { id: 'ai-summary', label: 'AI Summary', visible: true, halfWidth: false },
  { id: 'cash-flow', label: 'Cash Flow', visible: true, halfWidth: true },
  { id: 'delinquent-loans', label: 'Delinquent Loans', visible: true, halfWidth: true },
  { id: 'portfolio-health', label: 'Portfolio Health', visible: true, halfWidth: false },
  { id: 'month-trends', label: 'Month-over-Month Trends', visible: true, halfWidth: false },
  { id: 'ai-insights', label: 'AI Insights', visible: true, halfWidth: true },
  { id: 'action-items', label: 'Action Items', visible: true, halfWidth: true },
  { id: 'ask-ai', label: 'Ask AI', visible: true, halfWidth: false },
];

const STORAGE_KEY = 'portfolio-dashboard-config';

export function loadDashboardConfig(): DashboardCardConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DASHBOARD_CARDS;
    const parsed: DashboardCardConfig[] = JSON.parse(raw);
    // Merge with defaults so new cards are never lost
    const ids = new Set(parsed.map((c) => c.id));
    const merged = [
      ...parsed,
      ...DEFAULT_DASHBOARD_CARDS.filter((d) => !ids.has(d.id)),
    ];
    return merged;
  } catch {
    return DEFAULT_DASHBOARD_CARDS;
  }
}

export function saveDashboardConfig(cards: DashboardCardConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
