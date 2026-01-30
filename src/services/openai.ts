import type { PortfolioData, AIInsight, AISummaryResponse } from '../types';
import { mockAISummary, mockAIInsights, mockSentiment, mockKeyTakeaway } from '../data/mockData';

const API_BASE = '/api';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface PortfolioResponse {
  scenario: string;
  name: string;
  current: PortfolioData;
  historical: PortfolioData[];
}

export async function fetchScenarios(): Promise<Scenario[]> {
  try {
    const response = await fetch(`${API_BASE}/scenarios`);
    if (!response.ok) throw new Error('Failed to fetch scenarios');
    const result = await response.json();
    return result.scenarios;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
}

export async function switchScenario(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/scenarios/${id}`, { method: 'POST' });
    return response.ok;
  } catch (error) {
    console.error('Error switching scenario:', error);
    return false;
  }
}

export async function fetchPortfolioData(): Promise<PortfolioResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/portfolio`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return null;
  }
}

export async function generateAISummary(
  data: PortfolioData,
  historicalData: PortfolioData[]
): Promise<AISummaryResponse> {
  try {
    const response = await fetch(`${API_BASE}/ai/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: data, historical: historicalData }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    return {
      summary: result.summary || mockAISummary,
      sentiment: result.sentiment || mockSentiment,
      keyTakeaway: result.keyTakeaway || mockKeyTakeaway,
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return {
      summary: mockAISummary,
      sentiment: mockSentiment,
      keyTakeaway: mockKeyTakeaway,
    };
  }
}

export async function generateAIInsights(data: PortfolioData): Promise<AIInsight[]> {
  try {
    const response = await fetch(`${API_BASE}/ai/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    return result.insights || mockAIInsights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return mockAIInsights;
  }
}
