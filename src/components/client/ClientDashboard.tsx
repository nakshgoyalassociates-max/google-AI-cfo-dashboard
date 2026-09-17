import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { ProgressBar } from '../common/ProgressBar';
import { 
  ShieldCheck, 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  FileText, 
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  Lock,
  Building2,
  CheckSquare,
  BarChart3,
  Layers,
  ArrowRight,
  AlertTriangle,
  ReceiptText,
  Scale,
  ArrowRightLeft,
  Users
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { 
    clientProfile, 
    financialMIS, 
    compliances, 
    actions, 
    stats,
    setActiveTab,
    invoiceStats
  } = useApp();

  const handlePrint = () => {
    window.print();
  };

  // 1. Broad Compliance Statistics & Categories
  const categories = [
    { name: 'GST', label: 'Goods & Services Tax', code: 'GST' },
    { name: 'TDS / TCS', label: 'Tax Deducted at Source', code: 'TDS / TCS' },
    { name: 'Income Tax', label: 'Corporate Income & Advance Tax', code: 'Income Tax' },
    { name: 'ROC / MCA', label: 'Ministry of Corporate Affairs', code: 'ROC / MCA' },
    { name: 'PF / ESI', label: 'Labor Laws & Employee Benefits', code: 'PF / ESI' }
  ];

  const categorySummaries = categories.map(cat => {
    const items = compliances.filter(c => c.category === cat.code);
    const completed = items.filter(c => c.subtasks && c.subtasks[2]?.status === 'completed').length;
    const pendingReview = items.filter(c => c.subtasks && c.subtasks[0]?.status === 'completed' && c.subtasks[1]?.status === 'pending').length;
    const totalSubtasks = items.length * 3;
    let completedSubtasks = 0;
    items.forEach(c => {
      completedSubtasks += (c.subtasks || []).filter(s => s && s.status === 'completed').length;
    });
    const pct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return {
      ...cat,
      totalItems: items.length,
      completedItems: completed,
      pendingReviewItems: pendingReview,
      progressPct: pct,
      status: pct === 100 ? 'Fully Filed' : pct >= 66 ? 'CFO Verified' : 'In Progress'
    };
  });

  // Next 4 upcoming statutory deadlines
  const upcomingFilings = compliances
    .filter(c => !c.subtasks || c.subtasks[2]?.status !== 'completed')
    .slice(0, 4);

  // 2. Broad Action Items Breakdown
  const openActions = actions.filter(a => a.status !== 'Completed');
  const overdueActions = actions.filter(a => {
    if (a.status === 'Completed') return false;
    const d = new Date(a.fixedDeadline);
    return !isNaN(d.getTime()) && d < new Date();
  });
  const urgentActions = actions.filter(a => a.status !== 'Completed' && a.priority === 'Urgent');

  // Top active operations
  const topActiveActions = openActions.slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Formal Executive Summarised Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Executive Summary Briefing
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                Period: {financialMIS.period}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                Managed by {clientProfile.cfoName} ({clientProfile.cfoFirm})
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {clientProfile.companyName} • Broad Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Consolidated executive snapshot capturing the broad picture of statutory compliance standing, active operational action items, and financial performance (MIS).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Briefing</span>
            </button>
            <button
              onClick={() => setActiveTab('mis')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Financial MIS</span>
            </button>
            <button
              onClick={() => setActiveTab('compliances')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compliance Master</span>
            </button>
          </div>
        </div>
      </div>

      {/* TRI-PILLAR BROAD PICTURE SUMMARY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Broad Picture of Statutory Compliance */}
        <div 
          onClick={() => setActiveTab('compliances')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                1. Statutory Compliance Picture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {stats.overallCompliancePercentage}% Health
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {stats.fullyCompletedCompliances} <span className="text-sm font-normal text-slate-500">/ {stats.totalCompliances}</span>
              </span>
              <span className="text-xs font-medium text-emerald-700">Filings Completed</span>
            </div>

            <div className="mt-2.5">
              <ProgressBar 
                percentage={stats.overallCompliancePercentage}
                height="h-2"
                color="bg-emerald-600"
              />
            </div>

            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">CFO Sign-off Queue:</span>
                <span className="font-semibold text-indigo-700">{stats.cfoReviewPendingCount} items in review</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Statutory Penalties:</span>
                <span className="font-semibold text-emerald-700">₹0 (Zero default)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
            <span>Explore 35 Master Compliances</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Broad Picture of Operational Action Items */}
        <div 
          onClick={() => setActiveTab('actions')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-sky-600" />
                2. Action Items & Operations Picture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                {openActions.length} Active Tasks
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {openActions.length} <span className="text-sm font-normal text-slate-500">Open Pendencies</span>
              </span>
              {overdueActions.length > 0 ? (
                <span className="text-xs font-bold text-rose-600">({overdueActions.length} Overdue)</span>
              ) : (
                <span className="text-xs font-medium text-emerald-700">All on Schedule</span>
              )}
            </div>

            <div className="mt-2.5">
              <ProgressBar 
                percentage={Math.round((stats.completedActions / (stats.totalActions || 1)) * 100)}
                height="h-2"
                color="bg-sky-600"
              />
            </div>

            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Urgent Priority:</span>
                <span className={`font-semibold ${urgentActions.length > 0 ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                  {urgentActions.length} Urgent Deliverables
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed this Month:</span>
                <span className="font-semibold text-emerald-700">{stats.completedActions} Tasks Closed</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-800">
            <span>View All Departmental Actions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Broad Picture of Financial MIS */}
        <div 
          onClick={() => setActiveTab('mis')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                3. Financial MIS & Runway Picture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                +{financialMIS.revenueGrowthMoM}% MoM
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                ₹{(financialMIS.monthlyRevenue / 100000).toFixed(1)}L
              </span>
              <span className="text-xs font-medium text-slate-500">Monthly Net Revenue</span>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>EBITDA Margin: <strong className="text-slate-800">{financialMIS.ebitdaMarginPercent}%</strong></span>
              <span>Runway: <strong className="text-emerald-700">{financialMIS.cashRunwayMonths} Months</strong></span>
            </div>

            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cash in Bank:</span>
                <span className="font-semibold text-slate-900">₹{(financialMIS.cashAndBankBalance / 10000000).toFixed(2)} Cr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">MSME &gt;45D Risk:</span>
                <span className="font-semibold text-amber-700">₹{(financialMIS.creditorsOver45Days / 100000).toFixed(2)}L Pending</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
            <span>Explore Full Financial MIS & Trends</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* BROAD PICTURE 1: FINANCIAL MIS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Broad Picture: Financial MIS & Unit Economics
            </h2>
            <p className="text-xs text-slate-500">
              High-level profitability, working capital health, and CFO strategic advisory notes
            </p>
          </div>
          <button
            onClick={() => setActiveTab('mis')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Complete Financial MIS Deck</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 4 Key Executive Financial Vitals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Revenue"
            value={`₹${(financialMIS.monthlyRevenue / 100000).toFixed(1)} Lakhs`}
            subtitle="Net sales revenue for August 2026"
            icon={TrendingUp}
            trend={{
              value: `+${financialMIS.revenueGrowthMoM}%`,
              isPositive: true,
              label: 'MoM Growth'
            }}
            iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
          />

          <MetricCard
            title="Operating EBITDA"
            value={`₹${(financialMIS.ebitda / 100000).toFixed(1)} Lakhs`}
            subtitle={`${financialMIS.ebitdaMarginPercent}% Operating EBITDA Margin`}
            icon={ArrowUpRight}
            badge={{
              text: '23.5% Margin',
              variant: 'success'
            }}
            iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200"
          />

          <MetricCard
            title="Cash & Runway"
            value={`₹${(financialMIS.cashAndBankBalance / 10000000).toFixed(2)} Cr`}
            subtitle={`${financialMIS.cashRunwayMonths} Months Zero-Revenue Runway`}
            icon={IndianRupee}
            badge={{
              text: `${financialMIS.cashRunwayMonths} Mo. Runway`,
              variant: 'info'
            }}
            iconBgColor="bg-sky-50 text-sky-600 border-sky-200"
          />

          <MetricCard
            title="Working Capital"
            value={`₹${(financialMIS.workingCapital / 100000).toFixed(1)} Lakhs`}
            subtitle={`Quick Ratio: ${financialMIS.quickRatio}x (Healthy)`}
            icon={ShieldCheck}
            badge={{
              text: 'Strong Liquidity',
              variant: 'success'
            }}
            iconBgColor="bg-teal-50 text-teal-600 border-teal-200"
          />
        </div>

        {/* 4 Core Financial Statement Fast Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => setActiveTab('mis')}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 group-hover:text-indigo-700">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                Balance Sheet
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">Tally ✓</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">₹4.02 Cr</p>
            <span className="text-[10px] text-slate-400">Schedule III Ind AS</span>
          </button>

          <button
            onClick={() => setActiveTab('mis')}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 group-hover:text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                P&L Account
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">PAT +17.8%</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">₹8.65 Lakhs</p>
            <span className="text-[10px] text-slate-400">Net Profit after tax</span>
          </button>

          <button
            onClick={() => setActiveTab('mis')}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 group-hover:text-indigo-700">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Debtor Ageing
              </span>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 rounded">DSO: 44d</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">₹62.4 Lakhs</p>
            <span className="text-[10px] text-slate-400">Total receivables ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('mis')}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50/50 hover:border-sky-300 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 group-hover:text-sky-700">
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
                Fund Flow
              </span>
              <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-1.5 rounded">Inflow +₹2.5L</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">₹21.65 Lakhs</p>
            <span className="text-[10px] text-slate-400">Sources = Applications</span>
          </button>
        </div>

        {/* CFO Strategic Commentary & Management Action Points */}
        <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4.5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Virtual CFO Strategic Commentary • {clientProfile.cfoName}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">August 2026 Audit Ready Close</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                "{financialMIS.cfoExecutiveSummary}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {financialMIS.cfoKeyAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-lg text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BROAD PICTURE 2: STATUTORY COMPLIANCE STATUS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Broad Picture: Statutory Compliance Master Standing
            </h2>
            <p className="text-xs text-slate-500">
              Track compliance across 5 statutory frameworks: GST, TDS, Direct Tax, ROC, and Labor Laws
            </p>
          </div>
          <button
            onClick={() => setActiveTab('compliances')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Compliance Master Table (35 Items)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Category-wise Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categorySummaries.map((cat) => (
            <div 
              key={cat.code}
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2.5 hover:bg-white hover:border-indigo-300 transition-colors cursor-pointer"
              onClick={() => setActiveTab('compliances')}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  cat.progressPct === 100 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : cat.progressPct >= 66
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {cat.status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Progress:</span>
                  <span className="font-bold text-slate-800">{cat.progressPct}%</span>
                </div>
                <ProgressBar percentage={cat.progressPct} height="h-1.5" />
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span>{cat.completedItems} of {cat.totalItems} Filed</span>
                {cat.pendingReviewItems > 0 && (
                  <span className="text-amber-700 font-semibold">{cat.pendingReviewItems} in Review</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Immediate Upcoming Statutory Deadlines */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Immediate Upcoming Statutory Filings in Current Cycle
            </h3>
            <span className="text-[11px] text-slate-500">Next 7-15 Days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {upcomingFilings.map(item => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => setActiveTab('compliances')}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Due: <strong className="text-rose-700">{item.statutoryDueDate.split(';')[0]}</strong></span>
                    {item.taxAmount ? <span>• Tax: ₹{(item.taxAmount / 100000).toFixed(2)}L</span> : null}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {item.subtasks[0]?.status === 'completed' ? 'CFO Review Pending' : 'Collation in Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BROAD PICTURE 3: OPERATIONAL ACTION ITEMS STATUS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-sky-600" />
              Broad Picture: Operational Action Items & Internal Deliverables
            </h2>
            <p className="text-xs text-slate-500">
              Internal tasks handled by the finance, accounting, and compliance team to keep books audit-ready
            </p>
          </div>
          <button
            onClick={() => setActiveTab('actions')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Action Items ({actions.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Action Priority Quick Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 font-medium">Total Action Items</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{actions.length} Tasks</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 font-medium">Open & In-Progress</span>
            <p className="text-xl font-bold text-blue-700 mt-1">{openActions.length} Pending</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 font-medium">Overdue Deadlines</span>
            <p className={`text-xl font-bold mt-1 ${overdueActions.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {overdueActions.length} Overdue
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 font-medium">Completed this Cycle</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{stats.completedActions} Completed</p>
          </div>
        </div>

        {/* Top Active Operational Pendencies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topActiveActions.map((act) => (
            <div 
              key={act.id} 
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors space-y-2 cursor-pointer"
              onClick={() => setActiveTab('actions')}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  act.priority === 'Urgent' 
                    ? 'bg-rose-100 text-rose-800' 
                    : act.priority === 'High'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {act.priority} Priority
                </span>
                <span className="text-[11px] font-bold text-blue-700">
                  {act.status}
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900">{act.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">{act.description}</p>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100">
                <span>Assignee: <strong className="text-slate-700">{act.assignedTo}</strong> ({act.assignedRole || 'Finance Team'})</span>
                <span>Due: <strong className="text-slate-800">{act.fixedDeadline.split(' ')[0]}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
