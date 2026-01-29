import { AlertTriangle } from 'lucide-react';
import type { Delinquent } from '../../types';

interface DelinquentLoansProps {
  data: Delinquent;
  activeLoans: number;
}

export default function DelinquentLoans({ data, activeLoans }: DelinquentLoansProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-amber-50 rounded flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Delinquent Loans</h3>
      </div>

      <div className="space-y-4">
        {/* Total Delinquent */}
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Total Delinquent</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{data.total}</span>
            <span className="text-xs text-slate-500">
              of {activeLoans.toLocaleString()} active loans ({data.percentage}%)
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Breakdown by Days Past Due
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">30 Days</span>
              <span className="text-sm font-semibold text-amber-500">
                {data.breakdown.thirtyDays}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">60 Days</span>
              <span className="text-sm font-semibold text-orange-500">
                {data.breakdown.sixtyDays}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">90+ Days</span>
              <span className="text-sm font-semibold text-red-500">
                {data.breakdown.ninetyPlusDays}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
