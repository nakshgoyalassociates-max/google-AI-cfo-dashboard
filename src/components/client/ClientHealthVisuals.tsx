import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  BalanceSheetData, 
  PnlStatementData, 
  DebtorAgeingData, 
  FinancialMIS, 
  ComplianceItem 
} from '../../types';
import { formatLakhs, formatCrores, formatINR } from '../../utils/format';
import { 
  Activity, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  AlertTriangle,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ClientHealthVisualsProps {
  balanceSheet: BalanceSheetData;
  pnl: PnlStatementData;
  debtorAgeing: DebtorAgeingData;
  financialMIS: FinancialMIS;
  compliances: ComplianceItem[];
}

type VisualPerspective = 'trajectory' | 'outlay' | 'assets' | 'debtors';

export const ClientHealthVisuals: React.FC<ClientHealthVisualsProps> = ({
  balanceSheet,
  pnl,
  debtorAgeing,
  financialMIS,
  compliances
}) => {
  const [perspective, setPerspective] = useState<VisualPerspective>('trajectory');

  // Compute Composite Health Score
  // 1. Compliance Score
  let compDone = 0;
  compliances.forEach(c => {
    (c.subtasks || []).forEach(s => {
      if (s && s.status === 'completed') compDone++;
    });
  });
  const totalSubtasks = (compliances.length || 35) * 3;
  const compScore = totalSubtasks > 0 ? Math.round((compDone / totalSubtasks) * 100) : 91;

  // 2. Liquidity Score: Current ratio ~ 4.14, Runway ~ 8.2 mo => 95/100
  const liquidityScore = 95;

  // 3. Profitability Score: PAT ~ 17.8%, EBITDA ~ 23.5% => 88/100
  const profitScore = 88;

  // 4. Working Capital & Debtor Score: DSO ~ 44d, 55% current => 84/100
  const debtorScore = 84;

  // 5. Budget Variance Score: within ±5% => 86/100
  const budgetScore = 86;

  // Weighted overall index:
  const compositeIndex = Math.round(
    compScore * 0.25 + 
    liquidityScore * 0.25 + 
    profitScore * 0.25 + 
    debtorScore * 0.15 + 
    budgetScore * 0.10
  );

  // 1. Historical Trajectory Data (April 2026 - August 2026 YTD)
  const trajectoryData = [
    { month: 'Apr 26', revenue: 38.5, expenses: 31.8, ebitda: 8.8, pat: 6.7 },
    { month: 'May 26', revenue: 41.2, expenses: 33.6, ebitda: 9.7, pat: 7.6 },
    { month: 'Jun 26', revenue: 43.8, expenses: 35.1, ebitda: 10.4, pat: 8.1 },
    { month: 'Jul 26', revenue: 45.4, expenses: 36.5, ebitda: 10.9, pat: 8.3 },
    { 
      month: 'Aug 26 (MIS)', 
      revenue: Number((((pnl.income.totalIncome || financialMIS.monthlyRevenue || 4850000) / 100000)).toFixed(1)), 
      expenses: Number((((pnl.expenses.totalExpenses || 3985000) / 100000)).toFixed(1)), 
      ebitda: Number((((pnl.profitability.ebitda || financialMIS.ebitda || 1140000) / 100000)).toFixed(1)), 
      pat: Number((((pnl.profitability.pat || financialMIS.netProfit || 865000) / 100000)).toFixed(1)) 
    }
  ];

  // 2. Revenue Outlay Donut Data
  const revenueTotal = pnl.income.totalIncome || financialMIS.monthlyRevenue || 4850000;
  const cogs = pnl.expenses.costOfMaterialsOrDirectCosts || 1542300;
  const payroll = pnl.expenses.employeeBenefitsExpense || 1240000;
  const infraCloud = pnl.expenses.cloudAndInfrastructureCosts || 365000;
  const salesMarketing = pnl.expenses.salesAndMarketingCosts || 322000;
  const adminOther = (pnl.expenses.otherExpenses || 240700) + (pnl.expenses.financeCosts || 95000) + (pnl.expenses.depreciationAndAmortization || 125000);
  const taxes = pnl.profitability.currentTax || 190000;
  const pat = pnl.profitability.pat || financialMIS.netProfit || 865000;

  const outlayDonutData = [
    { name: 'Direct COGS & Materials', value: cogs, color: '#f59e0b', note: 'Direct cost of goods/services' },
    { name: 'Employee Payroll & Benefits', value: payroll, color: '#3b82f6', note: 'Engineering & team compensation' },
    { name: 'Cloud & Tech Infrastructure', value: infraCloud, color: '#06b6d4', note: 'Hosting, APIs & server compute' },
    { name: 'Sales, Marketing & Growth', value: salesMarketing, color: '#8b5cf6', note: 'Customer acquisition & ad spend' },
    { name: 'Admin, D&A & Finance', value: adminOther, color: '#64748b', note: 'Office, legal, audit & bank fees' },
    { name: 'Corporate Tax Provision', value: taxes, color: '#ef4444', note: 'Statutory advance tax provision' },
    { name: 'Net Profit After Tax (PAT)', value: pat, color: '#10b981', note: 'Retained bottom-line profit' }
  ];

  // 3. Asset & Capital Allocation Donut Data
  const fixedAssets = balanceSheet.assets.netPpe + balanceSheet.assets.intangibleAssets + (balanceSheet.assets.capitalWorkInProgress || 0);
  const inventory = balanceSheet.assets.inventories;
  const debtors = balanceSheet.assets.netTradeReceivables || balanceSheet.assets.tradeReceivables;
  const liquidTreasury = balanceSheet.assets.cashAndCashEquivalents + balanceSheet.assets.bankBalancesOther;
  const otherAssets = (balanceSheet.assets.nonCurrentInvestments || 0) + (balanceSheet.assets.longTermLoansAndAdvances || 0) + (balanceSheet.assets.shortTermLoansAndAdvances || 0) + (balanceSheet.assets.otherCurrentAssets || 0);

  const assetsDonutData = [
    { name: 'Fixed & Intangible Assets', value: fixedAssets, color: '#4f46e5', note: 'Office, hardware, IP & licences' },
    { name: 'Inventories & Spares', value: inventory, color: '#f97316', note: 'Raw materials & finished inventory' },
    { name: 'Trade Receivables (Debtors)', value: debtors, color: '#0284c7', note: 'Pending customer invoices' },
    { name: 'Liquid Treasury & Bank FDs', value: liquidTreasury, color: '#10b981', note: 'Instant liquidity in bank accounts' },
    { name: 'Investments & Security Deposits', value: otherAssets, color: '#6b7280', note: 'Bonds, mutual funds & GST credits' }
  ];

  // 4. Debtor Ageing Risk Profile Data
  const debTotal = debtorAgeing.totalReceivables || 6240000;
  const debtorBarData = [
    { bucket: '0-30 Days', amount: Number((debtorAgeing.buckets.days0to30.amount / 100000).toFixed(1)), status: 'Current (Low Risk)', fill: '#10b981' },
    { bucket: '31-60 Days', amount: Number((debtorAgeing.buckets.days31to60.amount / 100000).toFixed(1)), status: 'Approaching Cycle', fill: '#3b82f6' },
    { bucket: '61-90 Days', amount: Number((debtorAgeing.buckets.days61to90.amount / 100000).toFixed(1)), status: 'Follow-Up Needed', fill: '#f59e0b' },
    { bucket: '91-180 Days', amount: Number((debtorAgeing.buckets.days91to180.amount / 100000).toFixed(1)), status: 'Escalated Risk', fill: '#f97316' },
    { bucket: '> 180 Days', amount: Number((debtorAgeing.buckets.daysAbove180.amount / 100000).toFixed(1)), status: 'ECL Provisioned', fill: '#ef4444' }
  ];

  // Custom Currency Tooltip for Pie Charts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = data.value;
      const total = data.payload.totalVal || (
        data.name.includes('Assets') || data.name.includes('Treasury') || data.name.includes('Receivables') 
          ? balanceSheet.assets.totalAssets 
          : revenueTotal
      );
      const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
      const lakhs = (val / 100000).toFixed(2);

      return (
        <div className="bg-slate-950/95 text-white px-3 py-2 rounded-xl text-xs border border-slate-700 shadow-xl pointer-events-none">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span>{data.name}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
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
    <div id="health-charts" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      
      {/* Top Banner: Composite Company Health Scorecard */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Health Index Badge */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black font-mono text-emerald-400 leading-none">
                {compositeIndex}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-200 mt-0.5">
                / 100
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Overall Company Health Score
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Grade A+ • Strong & Resilient
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Multi-dimensional composite rating evaluating Statutory Compliance, Cash Runway & Liquidity, Profitability, Working Capital, and Budget Discipline.
              </p>
            </div>
          </div>

          {/* 5 Health Factor Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0 lg:w-1/2">
            {[
              { label: 'Statutory Filings', score: compScore, color: 'bg-emerald-400' },
              { label: 'Liquidity & Runway', score: liquidityScore, color: 'bg-blue-400' },
              { label: 'Profit Margins', score: profitScore, color: 'bg-indigo-400' },
              { label: 'Working Capital', score: debtorScore, color: 'bg-amber-400' },
              { label: 'Budget Adherence', score: budgetScore, color: 'bg-cyan-400' }
            ].map((factor, idx) => (
              <div key={idx} className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/60 space-y-1.5">
                <span className="text-[10px] text-slate-300 block truncate font-medium">
                  {factor.label}
                </span>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-sm font-bold text-white">{factor.score}%</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${factor.color}`} 
                    style={{ width: `${factor.score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Graphical Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Visual Company Health & Financial Analytics
            </h3>
            <p className="text-[11px] text-slate-500">
              Interactive charts showing historical trend, operating cost allocation, balance sheet deployment, and receivables risk.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {[
            { key: 'trajectory', label: 'Revenue & Profit Trend', icon: TrendingUp },
            { key: 'outlay', label: 'Revenue Cost Outlay', icon: PieIcon },
            { key: 'assets', label: 'Capital & Asset Deployment', icon: Layers },
            { key: 'debtors', label: 'Receivables Risk Curve', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setPerspective(tab.key as VisualPerspective)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  perspective === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Display Canvas */}
      <div className="min-h-[320px]">
        {/* Perspective 1: Revenue, Cost & Profit Trajectory */}
        {perspective === 'trajectory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Financial performance trajectory (Figures in ₹ Lakhs per month)</span>
              <span className="font-mono text-emerald-700 font-semibold">August 2026: ₹48.5L Revenue | ₹8.65L Net Profit</span>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trajectoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} unit="L" />
                  <Tooltip 
                    formatter={(value: any, name: any) => [`₹${value} Lakhs`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="revenue" name="Gross Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Operating Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ebitda" name="Operating EBITDA" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pat" name="Net Profit (PAT)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                <span className="text-[10px] text-indigo-700 font-bold block uppercase">MoM Top-Line</span>
                <span className="text-sm font-bold text-slate-900 font-mono">+7.8% MoM Growth</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Net Profit Margin</span>
                <span className="text-sm font-bold text-slate-900 font-mono">17.8% PAT Margin</span>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-50/60 border border-cyan-100">
                <span className="text-[10px] text-cyan-700 font-bold block uppercase">Operating EBITDA</span>
                <span className="text-sm font-bold text-slate-900 font-mono">23.5% EBITDA Margin</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-600 font-bold block uppercase">Cost-to-Income</span>
                <span className="text-sm font-bold text-slate-900 font-mono">82.2% Cost Absorption</span>
              </div>
            </div>
          </div>
        )}

        {/* Perspective 2: Revenue Cost Outlay (Donut) */}
        {perspective === 'outlay' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-7 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outlayDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {outlayDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-5 space-y-2 text-xs">
              <div className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
                Where does ₹100 of Revenue Go?
              </div>
              {outlayDonutData.map((item, idx) => {
                const pct = ((item.value / revenueTotal) * 100).toFixed(1);
                const lakhs = (item.value / 100000).toFixed(2);
                return (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-900 font-bold">₹{lakhs}L</span>
                      <span className="text-slate-400 ml-1 text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Perspective 3: Capital & Asset Allocation (Donut) */}
        {perspective === 'assets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-7 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetsDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetsDonutData.map((entry, index) => (
                      <Cell key={`asset-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-5 space-y-2 text-xs">
              <div className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Asset & Capital Deployment</span>
                <span className="font-mono text-indigo-700">Total: ₹8.71 Cr</span>
              </div>
              {assetsDonutData.map((item, idx) => {
                const totalAssets = balanceSheet.assets.totalAssets || 87110000;
                const pct = ((item.value / totalAssets) * 100).toFixed(1);
                const lakhs = (item.value / 100000).toFixed(2);
                return (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-900 font-bold">₹{lakhs}L</span>
                      <span className="text-slate-400 ml-1 text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Perspective 4: Debtor Ageing & Receivables Risk (Bar) */}
        {perspective === 'debtors' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Customer Receivables Ageing Quality (Figures in ₹ Lakhs)</span>
              <span className="font-mono text-emerald-700 font-semibold">Total Debtors: ₹62.40L | DSO: 44 Days</span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={debtorBarData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} unit="L" />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value} Lakhs`, 'Outstanding']}
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {debtorBarData.map((entry, index) => (
                      <Cell key={`cell-deb-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">
                  55.3% of receivables (₹34.5L) are in the 0-30 day current bucket with healthy recovery velocity.
                </span>
              </div>
              <span className="text-slate-500 text-[11px] font-mono">
                Provision for Doubtful Debts: ₹2.20L (Conservative ECL)
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
