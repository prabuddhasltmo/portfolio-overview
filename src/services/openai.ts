import OpenAI from 'openai';
import type { PortfolioData, AIInsight } from '../types';
import { mockAISummary, mockAIInsights } from '../data/mockData';

const getClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return null;
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export async function generateAISummary(data: PortfolioData): Promise<string> {
  const client = getClient();

  if (!client) {
    // Return mock data if no API key
    return mockAISummary;
  }

  const prompt = `You are a financial analyst assistant for a mortgage servicing company. Based on the following portfolio data, generate a concise 2-3 sentence summary highlighting key statistics and performance indicators.

Portfolio Data for ${data.month} ${data.year}:
- Total Loans: ${data.totalLoans}
- Active Loans: ${data.activeLoans}
- Principal Balance: $${data.principalBalance.toLocaleString()}
- Money In (Collections): $${data.cashFlow.moneyIn.toLocaleString()} (${data.cashFlow.moneyInChange > 0 ? '+' : ''}${data.cashFlow.moneyInChange}% vs last month)
- Delinquent Loans: ${data.delinquent.total} (${data.delinquent.percentage}%)
- 30 Days Past Due: ${data.delinquent.breakdown.thirtyDays}
- 60 Days Past Due: ${data.delinquent.breakdown.sixtyDays}
- 90+ Days Past Due: ${data.delinquent.breakdown.ninetyPlusDays}

Generate a professional summary that mentions the collection amount, number of payments (assume ~342 payments), active loans, principal balance, delinquency status, and collection performance trend. Keep it factual and data-driven.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || mockAISummary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return mockAISummary;
  }
}

export async function generateAIInsights(data: PortfolioData): Promise<AIInsight[]> {
  const client = getClient();

  if (!client) {
    // Return mock data if no API key
    return mockAIInsights;
  }

  const prompt = `You are a financial analyst assistant for a mortgage servicing company. Based on the following portfolio data, generate exactly 4 actionable insights.

Portfolio Data for ${data.month} ${data.year}:
- Total Loans: ${data.totalLoans}
- Active Loans: ${data.activeLoans}
- Principal Balance: $${data.principalBalance.toLocaleString()}
- Unpaid Interest: $${data.unpaidInterest.toLocaleString()}
- Total Late Charges: $${data.totalLateCharges.toLocaleString()}
- Money In (Collections): $${data.cashFlow.moneyIn.toLocaleString()} (${data.cashFlow.moneyInChange > 0 ? '+' : ''}${data.cashFlow.moneyInChange}% vs last month)
- Money Out (Disbursements): $${data.cashFlow.moneyOut.toLocaleString()} (${data.cashFlow.moneyOutChange}% vs last month)
- Net Cash Flow: $${data.cashFlow.netCashFlow.toLocaleString()}
- Delinquent Loans: ${data.delinquent.total} of ${data.activeLoans} (${data.delinquent.percentage}%)
- 30 Days Past Due: ${data.delinquent.breakdown.thirtyDays}
- 60 Days Past Due: ${data.delinquent.breakdown.sixtyDays}
- 90+ Days Past Due: ${data.delinquent.breakdown.ninetyPlusDays}
- New Loans This Month: ${data.trends.newLoans}
- Paid Off This Month: ${data.trends.paidOff}
- Delinquency Trend: ${data.trends.delinquency}% change

Return a JSON array with exactly 4 insights. Each insight must have:
- id: a unique string (1, 2, 3, 4)
- title: a short title (5-7 words)
- description: a 1-2 sentence explanation with specific data points
- category: one of "Performance", "Delinquency", "Risk", or "Opportunity"

Include one insight for each category. Focus on actionable observations.

Return ONLY the JSON array, no other text.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        const insights = JSON.parse(content) as AIInsight[];
        return insights;
      } catch {
        console.error('Error parsing AI insights JSON');
        return mockAIInsights;
      }
    }
    return mockAIInsights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return mockAIInsights;
  }
}
