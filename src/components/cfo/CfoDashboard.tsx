import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { ProgressBar } from '../common/ProgressBar';
import { ComplianceInlineDetail } from '../common/ComplianceInlineDetail';
import { PortfolioOverview } from './PortfolioOverview';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  IndianRupee, 
  FileCheck, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Calendar,
  Building2,
  Layers,
  ArrowLeft
} from 'lucide-react';

export const CfoDashboard: React.FC = () => {
  const { 
    compliances, 
    toggleSubtask, 
    financialMIS, 
    stats, 
    actions, 
    setActiveTab,
    clientProfile,
    cfoViewMode,
    setCfoViewMode,
    returnToPortfolio,
    companies,
    selectedCompanyId,
    setSelectedCompanyId
  } = useApp();

  const [expandedQueueId, setExpandedQueueId] = useState<string | null>(null);
  const [expandedCatItemId, setExpandedCatItemId] = useState<string | null>(null);
  const [expandedCriticalId, setExpandedCriticalId] = useState<string | null>(null);

  // If in Portfolio mode, render the master portfolio overview
  if (cfoViewMode === 'portfolio') {
    return <PortfolioOverview />;
  }

  // Compliances requiring Sub-task 2 (CFO Review)
  const cfoReviewQueue = (compliances || []).filter(
    c => c?.subtasks && c.subtasks[0]?.status === 'completed' && c.subtasks[1]?.status === 'pending'
  );

  // Critical items approaching deadline
  const criticalUpcoming = (compliances || []).filter(
    c => c?.criticality === 'Critical' && c.subtasks && c.subtasks[2]?.status !== 'completed'
  );

  // Category stats
  const categories = [
    'GST', 
    'TDS / TCS', 
    'Income Tax', 
    'ROC / MCA', 
    'PF / ESI', 
    'Professional Tax & State'
  ] as const;

  const categoryProgress = categories.map(cat => {
    const items = (compliances || []).filter(c => c && c.category === cat);
    const totalSubtasks = items.length * 3;
    let completedSubtasks = 0;
    items.forEach(c => {
      completedSubtasks += (c?.subtasks || []).filter(s => s && s.status === 'completed').length;
    });
    const pct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    return {
      category: cat,
      total: items.length,
      pct,
      items
    };
  });

  return (
    <div className="space-y-4">
      {/* View Switcher & Company Breadcrumb Bar for CFO */}
      <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={returnToPortfolio}
            className="px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← All Companies Overview</span>
          </button>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Company Switcher Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 hidden md:inline">Company:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.legalEntity})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-slate-500 text-[11px] hidden lg:inline">
            Status: Single-Company CFO Workspace
          </span>
          <button
            onClick={() => setCfoViewMode('portfolio')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Layers className="w-3 h-3 text-indigo-600" />
            <span>Switch to Portfolio View</span>
          </button>
        </div>
      </div>

      {/* Formal Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Virtual CFO Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {clientProfile.cfoName} ({clientProfile.cfoFirm})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance of statutory compliances, CFO review sign-off queue, pendencies, and cash runway for <span className="font-semibold text-slate-700">{clientProfile.companyName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('compliances')}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Compliances Master</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('mis')}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            Financial MIS
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Compliance Rate"
          value={`${stats.overallCompliancePercentage}%`}
          subtitle={`${stats.fullyCompletedCompliances} of ${stats.totalCompliances} Fully Filed`}
          icon={ShieldCheck}
          badge={{
            text: stats.overallCompliancePercentage >= 80 ? 'Optimal' : 'Active Filings',
            variant: stats.overallCompliancePercentage >= 80 ? 'success' : 'warning'
          }}
          iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
          onClick={() => setActiveTab('compliances')}
        />

        <MetricCard
          title="CFO Review Queue"
          value={cfoReviewQueue.length}
          subtitle="Team Draft Ready for Sign-Off"
          icon={FileCheck}
          badge={{
            text: cfoReviewQueue.length > 0 ? 'Pending Action' : 'All Clear',
            variant: cfoReviewQueue.length > 0 ? 'warning' : 'success'
          }}
          iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200"
        />

        <MetricCard
          title="Cash in Bank & Runway"
          value={`₹${(financialMIS.cashAndBankBalance / 10000000).toFixed(2)} Cr`}
          subtitle={`${financialMIS.cashRunwayMonths} Months Runway (Burn ₹${(financialMIS.monthlyBurnRate / 100000).toFixed(1)}L)`}
          icon={IndianRupee}
          badge={{
            text: financialMIS.cashRunwayMonths >= 6 ? 'Healthy Runway' : 'Watch Runway',
            variant: financialMIS.cashRunwayMonths >= 6 ? 'success' : 'warning'
          }}
          iconBgColor="bg-sky-50 text-sky-600 border-sky-200"
          onClick={() => setActiveTab('mis')}
        />

        <MetricCard
          title="Action Work Pendencies"
          value={stats.pendingActions + stats.inProgressActions}
          subtitle={`${stats.overdueActions} Overdue • ${stats.completedActions} Closed`}
          icon={CheckSquare}
          badge={{
            text: stats.overdueActions > 0 ? `${stats.overdueActions} Overdue` : 'On Schedule',
            variant: stats.overdueActions > 0 ? 'danger' : 'info'
          }}
          iconBgColor="bg-amber-50 text-amber-600 border-amber-200"
          onClick={() => setActiveTab('actions')}
        />
      </div>

      {/* CFO Review Queue (Sub-task 2 Approvals) */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sub-task 2: CFO Review & Authorization Queue
              </h2>
              <p className="text-xs text-slate-500">
                Accounting team has completed draft preparation. Your sign-off is required before final portal upload and payment.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            {cfoReviewQueue.length} Items Awaiting Sign-off
          </span>
        </div>

        <div className="p-6">
          {cfoReviewQueue.length === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-800">CFO Review Inbox is Clear!</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No draft filings are waiting for CFO sign-off right now. The accounting team is working on upcoming schedules.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cfoReviewQueue.map(comp => (
                <div 
                  key={comp.id}
                  className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-xs transition-all space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {comp.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Due: {comp.statutoryDueDate.split(';')[0]}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {comp.name}
                      </h3>
                    </div>
                    {comp.taxAmount && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Tax Liability</span>
                        <p className="text-xs font-bold text-slate-900 font-mono">
                          ₹{comp.taxAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Team draft notes */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <p className="text-[11px] font-semibold text-slate-500">Sub-task 1 Draft Note (By {comp.subtasks[0].assignedTo}):</p>
                    <p className="text-slate-700 mt-0.5 italic">
                      "{comp.subtasks[0].notes || 'Data compilation verified with ERP vouchers.'}"
                    </p>
                  </div>

                  {/* Sub-task 2 Requirement */}
                  <div className="text-xs space-y-1 text-slate-600">
                    <span className="font-semibold text-indigo-900 block">CFO Review Scope:</span>
                    <p className="text-[11px] text-slate-600">{comp.subtasks[1].title}</p>
                  </div>

                  {/* Quick Sign-off action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedQueueId(expandedQueueId === comp.id ? null : comp.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                    >
                      <span>{expandedQueueId === comp.id ? 'Hide Subtasks ▲' : 'View Subtasks & Remarks ▼'}</span>
                    </button>
                    <button
                      onClick={() => toggleSubtask(comp.id, 2, 'Approved by CA Manish Goyal post verification with financials.')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Sign-off</span>
                    </button>
                  </div>

                  {/* Inline Expanded Subtask & Remarks */}
                  {expandedQueueId === comp.id && (
                    <div className="pt-2 border-t border-indigo-100">
                      <ComplianceInlineDetail
                        compliance={comp}
                        onClose={() => setExpandedQueueId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Master by Category Grid with Progressive Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Statutory Compliance Health by Category
            </h2>
            <p className="text-xs text-slate-500">
              Progressive completion across 3 subtasks (Drafting → CFO Review → Portal Filing)
            </p>
          </div>
          <button
            onClick={() => setActiveTab('compliances')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open Master Compliance Table (35) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryProgress.map(cat => (
            <div 
              key={cat.category}
              className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:border-indigo-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {cat.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                  {cat.total} Compliances
                </span>
              </div>

              {/* Progressive summary bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cycle Progress</span>
                  <span className="font-bold text-slate-900">{cat.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      cat.pct === 100 
                        ? 'bg-emerald-500' 
                        : cat.pct >= 50 
                        ? 'bg-blue-500' 
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>

              {/* Sample items inside this category with inline drill down */}
              <div className="divide-y divide-slate-100 pt-1">
                {cat.items.slice(0, 3).map(item => {
                  const doneSubtasks = (item?.subtasks || []).filter(s => s && s.status === 'completed').length;
                  const isItemExpanded = expandedCatItemId === item.id;

                  return (
                    <div key={item.id} className="py-2">
                      <div 
                        onClick={() => setExpandedCatItemId(isItemExpanded ? null : item.id)}
                        className="flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-slate-50 px-1 rounded transition-colors"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="text-[10px] text-indigo-600 font-medium">
                              {isItemExpanded ? '▲' : '▼'}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400">Due: {item.statutoryDueDate.split('(')[0]}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            doneSubtasks === 3 
                              ? 'bg-emerald-100 text-emerald-800'
                              : doneSubtasks === 2
                              ? 'bg-blue-100 text-blue-800'
                              : doneSubtasks === 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {doneSubtasks}/3
                          </span>
                        </div>
                      </div>

                      {/* Inline drill down for category item */}
                      {isItemExpanded && (
                        <div className="pt-2">
                          <ComplianceInlineDetail
                            compliance={item}
                            onClose={() => setExpandedCatItemId(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Critical Filings & Action Work Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Statutory Deadlines & Milestones (Penalty-free, Practical) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Upcoming Statutory Deadlines & Milestones
              </h2>
            </div>
            <span className="text-xs text-slate-400">Active Cycle</span>
          </div>

          <div className="space-y-3">
            {criticalUpcoming.slice(0, 4).map(item => {
              const isCritExpanded = expandedCriticalId === item.id;
              return (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-slate-900 mt-1">{item.name}</h3>
                    </div>
                    <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      Due: {item.statutoryDueDate.split(';')[0]}
                    </span>
                  </div>

                  <ProgressBar 
                    subtasks={item.subtasks}
                    size="sm"
                    showLabels={false}
                    interactive={false}
                  />

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Period: {item.period}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedCriticalId(isCritExpanded ? null : item.id)}
                      className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                    >
                      {isCritExpanded ? 'Hide Subtasks ▲' : 'View Subtasks ▼'}
                    </button>
                  </div>

                  {/* Inline drill down card */}
                  {isCritExpanded && (
                    <div className="pt-2 border-t border-indigo-100">
                      <ComplianceInlineDetail
                        compliance={item}
                        onClose={() => setExpandedCriticalId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Action Work & Pendencies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Operational Pendencies (Accounting Dept)
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('actions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All ({actions.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {actions.slice(0, 4).map(act => (
              <div 
                key={act.id}
                className="p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        act.priority === 'Urgent' 
                          ? 'bg-rose-100 text-rose-800' 
                          : act.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {act.priority}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {act.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900">{act.title}</h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                    act.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : act.status === 'Under Review'
                      ? 'bg-indigo-100 text-indigo-800'
                      : act.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {act.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Assigned: <strong className="text-slate-700">{act.assignedTo}</strong></span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Target: {act.fixedDeadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
