import { AlertCircle } from 'lucide-react';
import type { ActionItem } from '../../types';

interface ActionItemsProps {
  items: ActionItem[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  High: { bg: 'bg-red-100', text: 'text-red-600' },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-600' },
  Low: { bg: 'bg-green-100', text: 'text-green-600' },
};

export default function ActionItems({ items }: ActionItemsProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-slate-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Action Items</h3>
        <span className="text-xs text-slate-500">({items.length})</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const colors = priorityColors[item.priority] || priorityColors.Medium;
          return (
            <div
              key={item.id}
              className="border border-slate-100 rounded p-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-blue-600">
                      {item.id}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{item.borrower}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Urgent: {item.daysPastDue}+ days past due
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-800">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {item.daysPastDue} days past due
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
