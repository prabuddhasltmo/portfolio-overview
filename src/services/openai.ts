import type { PortfolioData, AIInsight } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function generateAISummary(data: PortfolioData): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/ai/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: data, historical: [] }),
    });

    if (!response.ok) {
      throw new Error(`AI summary request failed: ${response.status}`);
    }

    const result = (await response.json()) as {
      summary?: string;
      sentiment?: string;
      keyTakeaway?: string;
    };

    return result.summary ?? '';
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw error;
  }
}

export async function generateAIInsights(data: PortfolioData): Promise<AIInsight[]> {
  try {
    const response = await fetch(`${API_BASE}/api/ai/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`AI insights request failed: ${response.status}`);
    }

    const result = (await response.json()) as { insights?: AIInsight[] };
    return result.insights ?? [];
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
}
