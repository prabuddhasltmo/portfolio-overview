import { ChevronDown, HelpCircle, Bell, Settings, RefreshCw, X, Zap, FlaskConical } from 'lucide-react';
import type { Scenario } from '../../services/openai';

interface HeaderProps {
  month: string;
  year: number;
  onRefresh?: () => void;
  scenarios?: Scenario[];
  onScenarioChange?: (id: string) => void;
}

export default function Header({ month, year, onRefresh, scenarios = [], onScenarioChange }: HeaderProps) {
  const activeScenario = scenarios.find(s => s.active);
  return (
    <header className="bg-white">
      {/* Top bar with tabs */}
      <div className="h-10 bg-slate-100 flex items-end justify-between px-2">
        {/* Tabs */}
        <div className="flex items-end gap-0.5">
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-t-md">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            All Loans
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-blue-700 bg-white rounded-t-md border-t border-x border-slate-200">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Portfolio Recap
            <X size={14} className="ml-1 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 pb-1.5 pr-2">
          <span className="text-[13px] text-slate-600">Keevon Test Database</span>
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded">
            <HelpCircle size={16} />
          </button>
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded">
            <Bell size={16} />
          </button>
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded">
            <Settings size={16} />
          </button>
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium ml-1">
            K
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Portfolio Recap</h1>
            <p className="text-xs text-slate-500">AI-powered monthly portfolio analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scenario selector */}
          {scenarios.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded">
              <FlaskConical size={14} className="text-amber-600" />
              <select
                value={activeScenario?.id || ''}
                onChange={(e) => onScenarioChange?.(e.target.value)}
                className="bg-transparent text-[13px] text-amber-700 font-medium cursor-pointer focus:outline-none"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month selector */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 hover:bg-slate-50">
            {month}
            <ChevronDown size={14} />
          </button>

          {/* Year selector */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 hover:bg-slate-50">
            {year}
            <ChevronDown size={14} />
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="Refresh AI insights"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
