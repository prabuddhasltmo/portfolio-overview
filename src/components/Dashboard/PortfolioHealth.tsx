import { FileText } from 'lucide-react';
import type { PortfolioData } from '../../types';

interface PortfolioHealthProps {
  data: PortfolioData;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export default function PortfolioHealth({ data }: PortfolioHealthProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-blue-50 rounded flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Portfolio Health</h3>
      </div>

      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Portfolio Summary
      </p>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {/* Total Loans */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500">Total Loans:</span>
          <span className="text-sm font-semibold text-slate-900">
            {formatNumber(data.totalLoans)}
          </span>
        </div>

        {/* Active Loans */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500">Active Loans:</span>
          <span className="text-sm font-semibold text-slate-900">
            {formatNumber(data.activeLoans)}
          </span>
        </div>

        {/* Principal Balance */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500">Principal Balance:</span>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(data.principalBalance)}
          </span>
        </div>

        {/* Unpaid Interest */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500">Unpaid Interest:</span>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(data.unpaidInterest)}
          </span>
        </div>

        {/* Total Late Charges */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500">Total Late Charges:</span>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(data.totalLateCharges)}
          </span>
        </div>
      </div>
    </div>
  );
}
