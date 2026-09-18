import React, { useState } from 'react';
import { PnlStatementData, ClientProfile } from '../../types';
import { formatINR } from '../../utils/format';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';

interface PnlAccountViewProps {
  pnlStatement: PnlStatementData;
  clientProfile: ClientProfile;
}

export const PnlAccountView: React.FC<PnlAccountViewProps> = ({ pnlStatement, clientProfile }) => {
  const [showInLakhs, setShowInLakhs] = useState(true);

  const formatAmount = (amt: number): string => {
    return formatINR(amt, showInLakhs);
  };

  const { income, expenses, profitability, lineItems } = pnlStatement;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Executive Profit & Loss Account (P&L)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Audit-Ready Books
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  {clientProfile.companyName} • Period: {pnlStatement.period} vs {pnlStatement.comparisonPeriod} ({pnlStatement.financialYear})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Display Units Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setShowInLakhs(true)}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  showInLakhs ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Lakhs / Crores
              </button>
              <button
                onClick={() => setShowInLakhs(false)}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  !showInLakhs ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exact Rupees (₹)
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Margin Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Gross Revenue</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-slate-900 font-mono">
                {formatAmount(income.revenueFromOperations)}
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% MoM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Top-line operations</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Gross Profit Margin</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-slate-900 font-mono">
                {profitability.grossMarginPercent}%
              </span>
              <span className="text-xs text-indigo-700 font-medium">
                {formatAmount(profitability.grossProfit)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Revenue less direct costs</p>
          </div>

          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
            <span className="text-xs text-emerald-800 block font-medium">Operating EBITDA</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-emerald-900 font-mono">
                {formatAmount(profitability.ebitda)}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {profitability.ebitdaMarginPercent}% Margin
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">Core operational profitability</p>
          </div>

          <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            <span className="text-xs text-indigo-800 block font-medium">Net Profit (PAT)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-indigo-900 font-mono">
                {formatAmount(profitability.pat)}
              </span>
              <span className="text-xs font-bold text-indigo-700">
                {profitability.patMarginPercent}% Margin
              </span>
            </div>
            <p className="text-[11px] text-indigo-600 mt-1">Final bottom line after tax</p>
          </div>
        </div>
      </div>

      {/* Structured P&L Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wide uppercase">
            Statement of Profit & Loss for {pnlStatement.period}
          </h3>
          <span className="text-xs text-slate-300 font-mono">
            Figures in {showInLakhs ? 'INR Lakhs' : 'INR (₹)'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-1/2">Particulars & Operational Head</th>
                <th className="py-3 px-3 text-center w-20">Note Ref</th>
                <th className="py-3 px-3 text-right">Current Month</th>
                <th className="py-3 px-3 text-right">Previous Month</th>
                <th className="py-3 px-3 text-right">MoM Variance</th>
                <th className="py-3 px-3 text-right">% of Revenue</th>
                <th className="py-3 px-4 text-right">YTD FY 26-27</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((item) => {
                const isHeading = item.isTotal || item.isSubtotal;
                const isPat = item.id === 'pat-final';
                const isEbitda = item.id === 'ebitda-sub';

                let rowBg = 'hover:bg-slate-50/60';
                if (isPat) rowBg = 'bg-emerald-50/80 font-extrabold text-emerald-950 border-y-2 border-emerald-300';
                else if (isEbitda) rowBg = 'bg-indigo-50/60 font-bold text-indigo-950 border-y border-indigo-200';
                else if (item.isTotal) rowBg = 'bg-slate-100/70 font-bold text-slate-900';
                else if (item.isSubtotal) rowBg = 'bg-slate-50 font-bold text-slate-800';

                return (
                  <tr key={item.id} className={`${rowBg} transition-colors`}>
                    <td className={`py-2.5 px-4 ${isHeading ? 'font-bold' : 'text-slate-700 pl-6'}`}>
                      {item.particulars}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {item.noteRef || '—'}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono ${isHeading ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                      {formatAmount(item.currentMonth)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {formatAmount(item.previousMonth)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">
                      {item.momGrowthPct !== undefined ? (
                        <span className={`inline-flex items-center gap-0.5 ${
                          item.momGrowthPct >= 0 
                            ? (item.id.includes('exp') ? 'text-amber-700' : 'text-emerald-700 font-semibold') 
                            : (item.id.includes('exp') ? 'text-emerald-700 font-semibold' : 'text-rose-600')
                        }`}>
                          {item.momGrowthPct >= 0 ? '+' : ''}{item.momGrowthPct}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {item.pctOfRevenue.toFixed(1)}%
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono ${isHeading ? 'font-bold' : 'text-slate-600'}`}>
                      {formatAmount(item.ytdCurrentYear)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CFO Notes & Accounting Policies */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Virtual CFO Profitability & Tax Commentary:</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
            Direct operational costs maintained at 31.8% of top-line revenue, yielding healthy gross margin of 68.2%. 
            Employee benefit expenses include monthly provision for staff gratuity under Actuarial valuation standards. 
            Corporate advance tax second installment of ₹24 Lakhs was discharged on 15th Sep; monthly tax provision of ₹1.90L is accrued in line with Section 115BAA corporate tax rate (25.17% effective).
          </p>
        </div>
      </div>
    </div>
  );
};
