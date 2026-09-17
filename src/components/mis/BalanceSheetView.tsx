import React, { useState } from 'react';
import { BalanceSheetData, ClientProfile } from '../../types';
import { 
  Scale, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  HelpCircle, 
  Download, 
  ArrowUpRight,
  TrendingUp,
  Percent,
  Layers,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface BalanceSheetViewProps {
  balanceSheet: BalanceSheetData;
  clientProfile: ClientProfile;
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({ balanceSheet, clientProfile }) => {
  const [showInLakhs, setShowInLakhs] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    shareholders: true,
    nonCurrentLiab: true,
    currentLiab: true,
    nonCurrentAssets: true,
    currentAssets: true
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const formatAmount = (amt: number): string => {
    if (showInLakhs) {
      if (Math.abs(amt) >= 10000000) {
        return `₹${(amt / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(amt / 100000).toFixed(2)} L`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const { equityAndLiabilities: el, assets: as } = balanceSheet;

  // Key Balance Sheet Ratios
  const currentAssetsTotal = as.totalCurrentAssets;
  const currentLiabilitiesTotal = el.totalCurrentLiabilities;
  const currentRatio = currentLiabilitiesTotal > 0 ? (currentAssetsTotal / currentLiabilitiesTotal).toFixed(2) : 'N/A';
  const quickAssets = as.cashAndCashEquivalents + as.netTradeReceivables + as.bankBalancesOther;
  const quickRatio = currentLiabilitiesTotal > 0 ? (quickAssets / currentLiabilitiesTotal).toFixed(2) : 'N/A';
  const netWorth = el.totalShareholdersFunds;
  const totalDebt = el.longTermBorrowings + el.shortTermBorrowings;
  const debtToEquity = netWorth > 0 ? (totalDebt / netWorth).toFixed(2) : '0.00';
  const workingCapital = currentAssetsTotal - currentLiabilitiesTotal;

  const isTallied = el.totalEquityAndLiabilities === as.totalAssets;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Broad Balance Sheet</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-normal">
                    Schedule III / Ind AS Compliant
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  {clientProfile.companyName} • As of {balanceSheet.asOfDate} (Comparative with {balanceSheet.previousDate})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Tally Verification Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
              isTallied 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Balance Sheet Tallied: {formatAmount(as.totalAssets)}</span>
            </div>

            {/* Display Units Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setShowInLakhs(true)}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  showInLakhs ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Lakhs / Crores
              </button>
              <button
                onClick={() => setShowInLakhs(false)}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  !showInLakhs ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exact Rupees (₹)
              </button>
            </div>
          </div>
        </div>

        {/* Financial Health Ratio Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block font-medium">Current Ratio</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-slate-900 font-mono">{currentRatio}x</span>
              <span className="text-[10px] text-emerald-600 font-medium">Target: &gt; 1.33x</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block font-medium">Quick Ratio</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-slate-900 font-mono">{quickRatio}x</span>
              <span className="text-[10px] text-emerald-600 font-medium">Target: &gt; 1.0x</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block font-medium">Debt to Equity</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-slate-900 font-mono">{debtToEquity}x</span>
              <span className="text-[10px] text-indigo-600 font-medium">Healthy Leverage</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block font-medium">Net Working Capital</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-indigo-700 font-mono">{formatAmount(workingCapital)}</span>
              <span className="text-[10px] text-slate-400">Current Surplus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Broad Balance Sheet Two-Column Layout (Equity & Liabilities | Assets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: EQUITY & LIABILITIES */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
              <h3 className="text-sm font-bold tracking-wide uppercase">Equity & Liabilities</h3>
            </div>
            <span className="text-xs font-mono text-slate-300">
              {formatAmount(el.totalEquityAndLiabilities)}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* 1. Shareholders' Funds */}
            <div className="p-4 space-y-2.5">
              <button 
                onClick={() => toggleSection('shareholders')} 
                className="w-full flex items-center justify-between font-bold text-slate-900 hover:text-indigo-600 text-left"
              >
                <span className="flex items-center gap-1.5">
                  {expandedSections.shareholders ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  1. Shareholders' Funds (Net Worth)
                </span>
                <span className="font-mono text-indigo-900 font-bold">{formatAmount(el.totalShareholdersFunds)}</span>
              </button>

              {expandedSections.shareholders && (
                <div className="pl-5 space-y-2 text-slate-600 border-l-2 border-indigo-100 ml-1">
                  <div className="flex items-center justify-between py-0.5">
                    <span>(a) Share Capital (Paid-up Equity)</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.shareCapital)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(b) Reserves & Surplus (Retained Earnings)</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.reservesAndSurplus)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Non-Current Liabilities */}
            <div className="p-4 space-y-2.5">
              <button 
                onClick={() => toggleSection('nonCurrentLiab')} 
                className="w-full flex items-center justify-between font-bold text-slate-900 hover:text-indigo-600 text-left"
              >
                <span className="flex items-center gap-1.5">
                  {expandedSections.nonCurrentLiab ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  2. Non-Current Liabilities
                </span>
                <span className="font-mono text-slate-800">{formatAmount(el.totalNonCurrentLiabilities)}</span>
              </button>

              {expandedSections.nonCurrentLiab && (
                <div className="pl-5 space-y-2 text-slate-600 border-l-2 border-slate-200 ml-1">
                  <div className="flex items-center justify-between py-0.5">
                    <span>(a) Long-Term Borrowings (Term Loans)</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.longTermBorrowings)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(b) Deferred Tax Liabilities (Net)</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.deferredTaxLiabilities)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(c) Other Long-Term Liabilities & Gratuity</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.otherLongTermLiabilities)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Current Liabilities */}
            <div className="p-4 space-y-2.5">
              <button 
                onClick={() => toggleSection('currentLiab')} 
                className="w-full flex items-center justify-between font-bold text-slate-900 hover:text-indigo-600 text-left"
              >
                <span className="flex items-center gap-1.5">
                  {expandedSections.currentLiab ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  3. Current Liabilities
                </span>
                <span className="font-mono text-slate-800">{formatAmount(el.totalCurrentLiabilities)}</span>
              </button>

              {expandedSections.currentLiab && (
                <div className="pl-5 space-y-2 text-slate-600 border-l-2 border-slate-200 ml-1">
                  <div className="flex items-center justify-between py-0.5">
                    <span>(a) Short-Term Borrowings (Bank Cash Credit)</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.shortTermBorrowings)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-1">
                      <span>(b) Trade Payables (Creditors)</span>
                    </span>
                    <span className="font-mono text-slate-800">{formatAmount(el.tradePayables)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 pl-3 bg-amber-50/60 rounded px-2 text-amber-900">
                    <span className="font-medium">• of which MSME Section 43B(h) Dues</span>
                    <span className="font-mono font-semibold">{formatAmount(el.tradePayablesMsme)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(c) Other Current Liabilities (GST/TDS/PF Dues)</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.otherCurrentLiabilities)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(d) Short-Term Provisions (Tax & Bonus)</span>
                    <span className="font-mono text-slate-800">{formatAmount(el.shortTermProvisions)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Equity & Liabilities Footer */}
            <div className="p-4 bg-slate-50 flex items-center justify-between font-extrabold text-slate-900 border-t-2 border-slate-200">
              <span className="text-sm">TOTAL EQUITY & LIABILITIES</span>
              <span className="font-mono text-base text-indigo-900">{formatAmount(el.totalEquityAndLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ASSETS */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <h3 className="text-sm font-bold tracking-wide uppercase">Assets</h3>
            </div>
            <span className="text-xs font-mono text-slate-300">
              {formatAmount(as.totalAssets)}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* 1. Non-Current Assets */}
            <div className="p-4 space-y-2.5">
              <button 
                onClick={() => toggleSection('nonCurrentAssets')} 
                className="w-full flex items-center justify-between font-bold text-slate-900 hover:text-emerald-600 text-left"
              >
                <span className="flex items-center gap-1.5">
                  {expandedSections.nonCurrentAssets ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  1. Non-Current Assets
                </span>
                <span className="font-mono text-slate-800">{formatAmount(as.totalNonCurrentAssets)}</span>
              </button>

              {expandedSections.nonCurrentAssets && (
                <div className="pl-5 space-y-2 text-slate-600 border-l-2 border-slate-200 ml-1">
                  <div className="flex items-center justify-between py-0.5">
                    <span>(a) Property, Plant & Equipment (Gross Block)</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.propertyPlantEquipment)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 text-slate-500 pl-3">
                    <span>Less: Accumulated Depreciation</span>
                    <span className="font-mono text-rose-600">-{formatAmount(as.accumulatedDepreciation)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 font-semibold text-slate-800">
                    <span className="pl-3">Net Block (Fixed Assets)</span>
                    <span className="font-mono text-slate-900">{formatAmount(as.netPpe)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(b) Capital Work-in-Progress (CWIP)</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.capitalWorkInProgress)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(c) Intangible Assets & Software Licences</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.intangibleAssets)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(d) Non-Current Investments & Bonds</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.nonCurrentInvestments)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(e) Long-Term Security Deposits & Advances</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.longTermLoansAndAdvances)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Current Assets */}
            <div className="p-4 space-y-2.5">
              <button 
                onClick={() => toggleSection('currentAssets')} 
                className="w-full flex items-center justify-between font-bold text-slate-900 hover:text-emerald-600 text-left"
              >
                <span className="flex items-center gap-1.5">
                  {expandedSections.currentAssets ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  2. Current Assets
                </span>
                <span className="font-mono text-slate-800">{formatAmount(as.totalCurrentAssets)}</span>
              </button>

              {expandedSections.currentAssets && (
                <div className="pl-5 space-y-2 text-slate-600 border-l-2 border-emerald-100 ml-1">
                  <div className="flex items-center justify-between py-0.5">
                    <span>(a) Inventories (Raw Materials & Spares)</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.inventories)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(b) Trade Receivables (Gross Debtors)</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.tradeReceivables)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 text-slate-500 pl-3">
                    <span>Less: Allowance for Doubtful Debts (ECL)</span>
                    <span className="font-mono text-rose-600">-{formatAmount(as.allowanceForDoubtfulDebts)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 font-semibold text-slate-800">
                    <span className="pl-3">Net Trade Receivables</span>
                    <span className="font-mono text-slate-900">{formatAmount(as.netTradeReceivables)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 font-bold text-indigo-900 bg-indigo-50/50 px-2 rounded">
                    <span>(c) Cash & Cash Equivalents (Liquid Treasury)</span>
                    <span className="font-mono">{formatAmount(as.cashAndCashEquivalents)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(d) Other Bank Balances (Lien FDs)</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.bankBalancesOther)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(e) Short-Term Loans & Staff Imprest</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.shortTermLoansAndAdvances)}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>(f) Other Current Assets (Unutilized GST ITC)</span>
                    <span className="font-mono text-slate-800">{formatAmount(as.otherCurrentAssets)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Assets Footer */}
            <div className="p-4 bg-slate-50 flex items-center justify-between font-extrabold text-slate-900 border-t-2 border-slate-200">
              <span className="text-sm">TOTAL ASSETS</span>
              <span className="font-mono text-base text-emerald-900">{formatAmount(as.totalAssets)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Virtual CFO Audit Note */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block font-semibold">Virtual CFO Compliance & Statutory Note:</strong>
          <p className="mt-1 text-slate-500 leading-relaxed">
            Prepared under Section 129 and Schedule III of the Companies Act 2013 and applicable Indian Accounting Standards (Ind AS). 
            Inventories are valued at lower of cost or net realizable value. Depreciation is computed under straight-line method based on useful life defined in Schedule II. 
            All MSME trade payables are tracked under the Section 43B(h) 45-day statutory window.
          </p>
        </div>
      </div>
    </div>
  );
};
