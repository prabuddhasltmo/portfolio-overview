import { Wallet } from 'lucide-react';
import type { CashFlow as CashFlowType } from '../../types';

interface CashFlowProps {
  data: CashFlowType;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChange(value: number): { text: string; color: string } {
  const prefix = value > 0 ? '+' : '';
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-slate-500';
  return { text: `${prefix}${value}%`, color };
}

export default function CashFlow({ data }: CashFlowProps) {
  const moneyInChange = formatChange(data.moneyInChange);
  const moneyOutChange = formatChange(data.moneyOutChange);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-blue-50 rounded flex items-center justify-center">
          <Wallet className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Cash Flow</h3>
      </div>

      <div className="space-y-4">
        {/* Money In */}
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Money In (Collections)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(data.moneyIn)}
            </span>
            <span className={`text-xs font-medium ${moneyInChange.color}`}>
              {moneyInChange.text}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100"></div>

        {/* Money Out */}
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Money Out (Disbursements)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-red-500">
              {formatCurrency(data.moneyOut)}
            </span>
            <span className={`text-xs font-medium ${moneyOutChange.color}`}>
              {moneyOutChange.text}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100"></div>

        {/* Net Cash Flow */}
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Net Cash Flow</p>
          <span className="text-lg font-bold text-green-600">
            + {formatCurrency(data.netCashFlow)}
          </span>
        </div>
      </div>
    </div>
  );
}
