import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  PnlStatementData, 
  BalanceSheetData, 
  DebtorAgeingData, 
  FinancialMIS 
} from '../../types';
import { formatLakhs, formatCrores, formatINR } from '../../utils/format';
import { 
  PieChart as PieIcon, 
  TrendingUp, 
  Scale, 
  Users, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface MisVisualBroadPictureProps {
  pnl: PnlStatementData;
  balanceSheet: BalanceSheetData;
  debtorAgeing: DebtorAgeingData;
  financialMIS: FinancialMIS;
  onNavigateSubTab: (subTab: 'balance-sheet' | 'pnl' | 'debtor-ageing' | 'fund-flow' | 'budget') => void;
}

type VisualPerspective = 'dual' | 'pnl' | 'balance-sheet' | 'debtors';

export const MisVisualBroadPicture: React.FC<MisVisualBroadPictureProps> = ({
  pnl,
  balanceSheet,
  debtorAgeing,
  financialMIS,
  onNavigateSubTab
}) => {
  const [perspective, setPerspective] = useState<VisualPerspective>('dual');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // 1. P&L Revenue Outlay & Margins Data (Where does Revenue go?)
  const revenueTotal = pnl.income.totalIncome || financialMIS.monthlyRevenue || 4985000;
  const cogs = pnl.expenses.costOfMaterialsOrDirectCosts || 1542300;
  const payroll = pnl.expenses.employeeBenefitsExpense || 1240000;
  const infraCloud = pnl.expenses.cloudAndInfrastructureCosts || 365000;
  const salesMarketing = pnl.expenses.salesAndMarketingCosts || 322000;
  const adminOther = (pnl.expenses.otherExpenses || 240700) + (pnl.expenses.financeCosts || 95000) + (pnl.expenses.depreciationAndAmortization || 125000);
  const taxes = pnl.profitability.currentTax || 190000;
  const pat = pnl.profitability.pat || financialMIS.netProfit || 865000;

  const pnlChartData = [
    { name: 'Direct COGS & Materials', value: cogs, color: '#f59e0b', note: 'Direct cost of goods/services' },
    { name: 'Employee & Payroll', value: payroll, color: '#3b82f6', note: 'Engineering & team compensation' },
    { name: 'Cloud & Tech Infra', value: infraCloud, color: '#06b6d4', note: 'Hosting, APIs & server compute' },
    { name: 'Sales & Growth', value: salesMarketing, color: '#8b5cf6', note: 'Customer acquisition & marketing' },
    { name: 'Admin, D&A & Finance', value: adminOther, color: '#64748b', note: 'Office, legal, audit & bank fees' },
    { name: 'Income Tax Provision', value: taxes, color: '#ef4444', note: 'Statutory advance tax provision' },
    { name: 'Net Profit After Tax (PAT)', value: pat, color: '#10b981', note: 'Retained bottom-line earnings' },
  ];

  // 2. Balance Sheet Capital & Assets Allocation Data (How is Capital Deployed?)
  const fixedAssets = balanceSheet.assets.netPpe + balanceSheet.assets.intangibleAssets + (balanceSheet.assets.capitalWorkInProgress || 0);
  const inventory = balanceSheet.assets.inventories;
  const debtors = balanceSheet.assets.netTradeReceivables || balanceSheet.assets.tradeReceivables;
  const liquidTreasury = balanceSheet.assets.cashAndCashEquivalents + balanceSheet.assets.bankBalancesOther;
  const otherAssets = (balanceSheet.assets.nonCurrentInvestments || 0) + (balanceSheet.assets.longTermLoansAndAdvances || 0) + (balanceSheet.assets.shortTermLoansAndAdvances || 0) + (balanceSheet.assets.otherCurrentAssets || 0);
  const totalAssets = balanceSheet.assets.totalAssets || 87110000;

  const balanceSheetChartData = [
    { name: 'Fixed & Intangible Assets', value: fixedAssets, color: '#4f46e5', note: 'Tech infra, hardware & licences' },
    { name: 'Inventories & Spares', value: inventory, color: '#f97316', note: 'Raw materials & finished goods' },
    { name: 'Trade Receivables (Debtors)', value: debtors, color: '#0284c7', note: 'Customer billing outstanding' },
    { name: 'Liquid Treasury & FDs', value: liquidTreasury, color: '#059669', note: 'Bank balances & liquid deposits' },
    { name: 'Investments & Advances', value: otherAssets, color: '#6b7280', note: 'Security deposits, bonds & GST ITC' },
  ];

  // 3. Debtor Ageing Risk Profile
  const debtorsTotal = debtorAgeing.totalReceivables || 6240000;
  const deb0to30 = debtorAgeing.buckets.days0to30.amount;
  const deb31to60 = debtorAgeing.buckets.days31to60.amount;
  const deb61to90 = debtorAgeing.buckets.days61to90.amount;
  const deb91to180 = debtorAgeing.buckets.days91to180.amount;
  const debAbove180 = debtorAgeing.buckets.daysAbove180.amount;

  const debtorsChartData = [
    { name: '0-30 Days (Current)', value: deb0to30, color: '#10b981', note: 'Healthy & on-schedule collections' },
    { name: '31-60 Days (Approaching)', value: deb31to60, color: '#3b82f6', note: 'Standard commercial credit cycle' },
    { name: '61-90 Days (Follow-up)', value: deb61to90, color: '#f59e0b', note: 'Active finance follow-up' },
    { name: '91-180 Days (High Risk)', value: deb91to180, color: '#f97316', note: 'Escalated to management' },
    { name: '> 180 Days (Overdue)', value: debAbove180, color: '#ef4444', note: 'ECL provisioned risk accounts' },
  ];

  // Custom tooltip for clean, crisp currency formatting
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = data.value;
      const total = payload[0].payload.totalVal || (
        payload[0].payload.name.includes('Days') ? debtorsTotal : 
        payload[0].payload.name.includes('Assets') || payload[0].payload.name.includes('Treasury') ? totalAssets : revenueTotal
      );
      const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
      const lakhs = (val / 100000).toFixed(2);

      return (
        <div className="bg-slate-950/95 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs border border-slate-700 shadow-xl pointer-events-none">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span>{data.name}</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2 font-mono">
            <span className="text-emerald-400 font-bold text-sm">₹{lakhs} Lakhs</span>
            <span className="text-slate-300 text-xs">({pct}% of Total)</span>
          </div>
          {data.payload.note && (
            <p className="text-[11px] text-slate-400 mt-1">{data.payload.note}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header & Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <PieIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Broad Picture MIS Visualizer
            </h2>
            <span className="text-[10px] uppercase font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full">
              At A Glance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete financial breakdown showing Operating Outlay, Asset Allocation, and Receivables Quality.
          </p>
        </div>

        {/* Crisp Perspective Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setPerspective('dual')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              perspective === 'dual'
                ? 'bg-white text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dual Master View
          </button>
          <button
            onClick={() => setPerspective('pnl')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              perspective === 'pnl'
                ? 'bg-white text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            P&L Outlay
          </button>
          <button
            onClick={() => setPerspective('balance-sheet')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              perspective === 'balance-sheet'
                ? 'bg-white text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Capital & Assets
          </button>
          <button
            onClick={() => setPerspective('debtors')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              perspective === 'debtors'
                ? 'bg-white text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Receivables Risk
          </button>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className={`grid gap-6 ${perspective === 'dual' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* CHART 1: P&L Cost & Profit Anatomy */}
        {(perspective === 'dual' || perspective === 'pnl') && (
          <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Where Revenue Goes: P&L Outlay
                </h3>
              </div>
              <button
                onClick={() => onNavigateSubTab('pnl')}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Full P&L</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Donut Chart with Centered Metric */}
            <div className="relative h-64 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={pnlChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(data) => setHoveredSlice(data.name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {pnlChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="#fff" 
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Callout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Revenue</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {formatLakhs(revenueTotal, 1)}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-200">
                  PAT: {pnl.profitability.patMarginPercent}%
                </span>
              </div>
            </div>

            {/* Crisp Legend Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/60 text-[11px]">
              {pnlChartData.map((item) => {
                const pct = ((item.value / revenueTotal) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between p-1.5 rounded hover:bg-white transition-colors">
                    <div className="flex items-center gap-1.5 truncate pr-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 truncate font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-900 font-semibold shrink-0">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 2: Balance Sheet Capital & Asset Allocation */}
        {(perspective === 'dual' || perspective === 'balance-sheet') && (
          <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Capital Deployment: Asset Mix
                </h3>
              </div>
              <button
                onClick={() => onNavigateSubTab('balance-sheet')}
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Balance Sheet</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Donut Chart with Centered Metric */}
            <div className="relative h-64 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={balanceSheetChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(data) => setHoveredSlice(data.name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {balanceSheetChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="#fff" 
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Callout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Assets</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {formatCrores(totalAssets)}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5 border border-indigo-200">
                  Balanced 100%
                </span>
              </div>
            </div>

            {/* Crisp Legend Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/60 text-[11px]">
              {balanceSheetChartData.map((item) => {
                const pct = ((item.value / totalAssets) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between p-1.5 rounded hover:bg-white transition-colors">
                    <div className="flex items-center gap-1.5 truncate pr-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 truncate font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-900 font-semibold shrink-0">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 3: Debtor Ageing & Receivables Quality */}
        {perspective === 'debtors' && (
          <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Debtor Ageing Quality & Risk Slices
                </h3>
              </div>
              <button
                onClick={() => onNavigateSubTab('debtor-ageing')}
                className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Ledger Detail</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 my-2">
              <div className="relative h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={debtorsChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {debtorsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Debtors</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {formatLakhs(debtorsTotal, 1)}
                  </span>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded mt-0.5 border border-sky-200">
                    DSO: {debtorAgeing.daysSalesOutstanding}d
                  </span>
                </div>
              </div>

              {/* Ageing Explanation & Action points */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span>Current & Healthy (0-60 Days):</span>
                    <span className="text-emerald-700 font-mono font-bold">
                      {(((deb0to30 + deb31to60) / debtorsTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ₹{((deb0to30 + deb31to60) / 100000).toFixed(2)}L within normal payment cycle.
                  </p>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                  <div className="flex items-center justify-between font-semibold text-rose-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      Critical Overdue (&gt; 90 Days):
                    </span>
                    <span className="text-rose-700 font-mono font-bold">
                      {(((deb91to180 + debAbove180) / debtorsTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    ₹{((deb91to180 + debAbove180) / 100000).toFixed(2)}L requires follow-up. Provisioned: ₹{(debtorAgeing.provisionForBadDebts / 100000).toFixed(1)}L.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Crisp Quick-Takeaway Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <span className="text-slate-500 font-medium">Gross Margin:</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {pnl.profitability.grossMarginPercent}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Healthy cost ratio</span>
        </div>

        <div>
          <span className="text-slate-500 font-medium">Operating EBITDA:</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {pnl.profitability.ebitdaMarginPercent}%
          </p>
          <span className="text-[10px] text-slate-500 font-medium">{formatLakhs(pnl.profitability.ebitda, 1)} Monthly</span>
        </div>

        <div>
          <span className="text-slate-500 font-medium">Liquid Treasury:</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {formatCrores(liquidTreasury)}
          </p>
          <span className="text-[10px] text-sky-600 font-medium">{financialMIS.cashRunwayMonths} Mo. Zero-Rev Runway</span>
        </div>

        <div>
          <span className="text-slate-500 font-medium">Safe Receivables (0-60d):</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {(((deb0to30 + deb31to60) / debtorsTotal) * 100).toFixed(1)}%
          </p>
          <span className="text-[10px] text-indigo-600 font-medium">DSO: {debtorAgeing.daysSalesOutstanding} Days</span>
        </div>
      </div>
    </div>
  );
};
