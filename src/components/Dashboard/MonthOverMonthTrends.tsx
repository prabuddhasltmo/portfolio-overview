import { TrendingUp } from 'lucide-react';
import type { Trends } from '../../types';

interface MonthOverMonthTrendsProps {
  data: Trends;
}

function formatChange(value: number): { text: string; color: string } {
  const prefix = value > 0 ? '+' : '';
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-slate-500';
  return { text: `${prefix}${value}%`, color };
}

export default function MonthOverMonthTrends({ data }: MonthOverMonthTrendsProps) {
  const collectionsChange = formatChange(data.collections);
  const disbursementsChange = formatChange(data.disbursements);
  const delinquencyChange = formatChange(data.delinquency);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-blue-50 rounded flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Month-over-Month Trends</h3>
      </div>

      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Percentage Changes
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Collections */}
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Collections</p>
          <p className={`text-lg font-bold ${collectionsChange.color}`}>
            {collectionsChange.text}
          </p>
        </div>

        {/* Disbursements */}
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Disbursements</p>
          <p className={`text-lg font-bold ${disbursementsChange.color}`}>
            {disbursementsChange.text}
          </p>
        </div>

        {/* Delinquency */}
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Delinquency</p>
          <p className={`text-lg font-bold ${delinquencyChange.color}`}>
            {delinquencyChange.text}
          </p>
        </div>
      </div>

      {/* Loan Activity */}
      <div className="flex items-center gap-6 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">New Loans:</span>
          <span className="text-xs font-semibold text-slate-900">{data.newLoans}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Paid Off:</span>
          <span className="text-xs font-semibold text-slate-900">{data.paidOff}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-slate-100 pt-3">
        <p className="text-xs text-green-700 leading-relaxed">
          Collections are up {data.collections}% compared to last month. Delinquency rate has improved by {Math.abs(data.delinquency)} percentage points, indicating <strong className="font-semibold">effective</strong> collection efforts.
        </p>
      </div>
    </div>
  );
}
