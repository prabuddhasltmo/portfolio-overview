import { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import type { PortfolioData, AIInsight } from '../../types';
import { generateAIInsights } from '../../services/openai';
import { mockAIInsights } from '../../data/mockData';

interface AIInsightsProps {
  data: PortfolioData;
  refreshTrigger?: number;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Performance: {
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  Delinquency: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  Risk: {
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
  Opportunity: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
};

export default function AIInsights({ data, refreshTrigger }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>(mockAIInsights);
  const [loading, setLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const result = await generateAIInsights(data);
        setInsights(result);
        setIsAIGenerated(JSON.stringify(result) !== JSON.stringify(mockAIInsights));
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        setInsights(mockAIInsights);
        setIsAIGenerated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [data, refreshTrigger]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await generateAIInsights(data);
      setInsights(result);
      setIsAIGenerated(true);
    } catch (error) {
      console.error('Error refreshing AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-amber-100 rounded flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">AI Insights</h3>
        <span className="text-xs text-slate-500">({insights.length})</span>
        {isAIGenerated && (
          <span className="text-[10px] bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
            Live
          </span>
        )}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="ml-auto p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded disabled:opacity-50"
          title="Regenerate insights"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded p-3 space-y-1.5">
              <div className="h-3.5 bg-amber-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-amber-100 rounded animate-pulse w-full"></div>
              <div className="h-3 bg-amber-100 rounded animate-pulse w-5/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const colors = categoryColors[insight.category] || categoryColors.Performance;
            return (
              <div key={insight.id} className="bg-white rounded p-3">
                <div className="flex items-start gap-2 mb-1">
                  <h4 className="text-[13px] font-semibold text-slate-800 flex-1">
                    {insight.title}
                  </h4>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
                  >
                    {insight.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
