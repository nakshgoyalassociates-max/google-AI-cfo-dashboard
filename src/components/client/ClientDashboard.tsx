import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { DueDateBadge } from '../common/DueDateBadge';
import { compareDueDates } from '../../utils/dueDate';
import { formatLakhs, formatCrores } from '../../utils/format';
import { ProgressBar } from '../common/ProgressBar';
import { 
  getComplianceFourColorStatus, 
  getActionFourColorStatus, 
  getLineItemRowClasses 
} from '../../utils/statusColors';
import { ComplianceSubtaskProgressIcons } from '../common/ComplianceSubtaskProgressIcons';
import { ActionSubtaskProgressIcons } from '../common/ActionSubtaskProgressIcons';
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
  Users,
  Calculator
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { 
    clientProfile, 
    financialMIS, 
    compliances, 
    actions, 
    stats,
    setActiveTab,
    openMisWithSubTab
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

  // Next 4 upcoming statutory deadlines (sorted by nextDueDate ascending)
  const upcomingFilings = compliances
    .filter(c => !c.subtasks || c.subtasks[2]?.status !== 'completed')
    .sort(compareDueDates)
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
                {formatLakhs(financialMIS.monthlyRevenue, 1)}
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
                <span className="font-semibold text-slate-900">{formatCrores(financialMIS.cashAndBankBalance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">MSME &gt;45D Risk:</span>
                <span className="font-semibold text-amber-700">{formatLakhs(financialMIS.creditorsOver45Days)} Pending</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
            <span>Explore Full Financial MIS & Trends</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* 5 CORE FINANCIAL MIS STATEMENT FAST LAUNCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Financial MIS Core Statements
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('mis')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Financial MIS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            onClick={() => openMisWithSubTab('balance-sheet')}
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
            onClick={() => openMisWithSubTab('pnl')}
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
            onClick={() => openMisWithSubTab('debtor-ageing')}
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
            onClick={() => openMisWithSubTab('fund-flow')}
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

          <button
            onClick={() => openMisWithSubTab('budget')}
            className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 text-left transition-colors cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-800 group-hover:text-amber-800 font-bold">
                <Calculator className="w-3.5 h-3.5 text-amber-600" />
                Budget & Variance
              </span>
              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 border border-amber-300 px-1.5 rounded">FP&A</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">±5% Tracking</p>
            <span className="text-[10px] text-slate-500">Sales, Direct Cost & Opex</span>
          </button>
        </div>
      </div>

      {/* IMMEDIATE PRIORITIES COCKPIT: STATUTORY DUE DATES & URGENT ACTION ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Statutory Deadlines Due in Next 7-15 Days */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Upcoming Statutory Deadlines
                </h3>
                <p className="text-[11px] text-slate-500">Next 7–15 days filing cycle</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('compliances')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All 35 Filings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {upcomingFilings.map(item => {
              const itemStatus = getComplianceFourColorStatus(item);
              const rowClasses = getLineItemRowClasses(itemStatus);

              return (
                <div 
                  key={item.id} 
                  className={`rounded-xl border py-2 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors cursor-pointer ${rowClasses}`}
                  onClick={() => setActiveTab('compliances')}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-200/70 text-slate-700 leading-none">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight">{item.name}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 flex items-center gap-2 flex-wrap leading-tight">
                      <DueDateBadge item={item} compact={true} />
                      {item.taxAmount ? <span>• Est. Tax: {formatLakhs(item.taxAmount)}</span> : null}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <ComplianceSubtaskProgressIcons compliance={item} compact={true} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Operational Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-sky-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Priority Operational Tasks
                </h3>
                <p className="text-[11px] text-slate-500">{openActions.length} pending deliverables</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('actions')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Tasks ({actions.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {topActiveActions.slice(0, 3).map((act) => {
              const actStatus = getActionFourColorStatus(act);
              const rowClasses = getLineItemRowClasses(actStatus);

              return (
                <div 
                  key={act.id} 
                  className={`py-2 px-3 rounded-xl border transition-colors space-y-1.5 cursor-pointer ${rowClasses}`}
                  onClick={() => setActiveTab('actions')}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                      act.priority === 'Urgent' 
                        ? 'bg-rose-100 text-rose-800' 
                        : act.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {act.priority}
                    </span>
                    <span className="text-[10.5px] font-semibold text-slate-500">
                      Due: <strong className="text-slate-800">{act.fixedDeadline.split(' ')[0]}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{act.title}</h4>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1 border-t border-slate-200/50">
                    <span className="text-[10.5px] text-slate-600">Assignee: <strong className="text-slate-800">{act.assignedTo}</strong></span>
                    <ActionSubtaskProgressIcons action={act} compact={true} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CFO STRATEGIC ADVISORY COMMENTARY */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Virtual CFO Strategic Advisory • {clientProfile.cfoName} ({clientProfile.cfoFirm})
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">August 2026 Audit Ready Close</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-xl border border-slate-200">
              "{financialMIS.cfoExecutiveSummary}"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {financialMIS.cfoKeyAlerts.map((alert, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
