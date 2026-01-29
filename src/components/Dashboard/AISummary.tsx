import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { PortfolioData } from '../../types';
import { generateAISummary } from '../../services/openai';
import { mockAISummary } from '../../data/mockData';

interface AISummaryProps {
  data: PortfolioData;
  refreshTrigger?: number;
}

export default function AISummary({ data, refreshTrigger }: AISummaryProps) {
  const [summary, setSummary] = useState<string>(mockAISummary);
  const [loading, setLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const result = await generateAISummary(data);
        setSummary(result);
        setIsAIGenerated(result !== mockAISummary);
      } catch (error) {
        console.error('Error fetching AI summary:', error);
        setSummary(mockAISummary);
        setIsAIGenerated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [data, refreshTrigger]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await generateAISummary(data);
      setSummary(result);
      setIsAIGenerated(result !== mockAISummary);
    } catch (error) {
      console.error('Error refreshing AI summary:', error);
    } finally {
      setLoading(false);
    }
  };

  // Highlight key metrics in the summary
  const formatSummary = (text: string) => {
    return text.replace(
      /(\$[\d,]+\.?\d*|\d+(?:,\d{3})*(?:\.\d+)?%?)/g,
      '<strong class="text-blue-700 font-semibold">$1</strong>'
    );
  };

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-7 h-7 bg-violet-100 rounded flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-violet-700">AI Summary</h2>
            {isAIGenerated && (
              <span className="text-[10px] bg-violet-200 text-violet-700 px-1.5 py-0.5 rounded-full font-medium">
                Live
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="ml-auto p-1 text-violet-500 hover:text-violet-700 hover:bg-violet-100 rounded disabled:opacity-50"
              title="Regenerate summary"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-1.5">
              <div className="h-3.5 bg-violet-200 rounded animate-pulse w-full"></div>
              <div className="h-3.5 bg-violet-200 rounded animate-pulse w-5/6"></div>
              <div className="h-3.5 bg-violet-200 rounded animate-pulse w-4/6"></div>
            </div>
          ) : (
            <p
              className="text-[13px] text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatSummary(summary) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
