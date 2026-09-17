import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  FileCheck, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  Layers,
  AlertOctagon,
  Check,
  Edit3,
  Filter,
  BellRing,
  Sparkles,
  ReceiptText,
  AlertCircle
} from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const PortfolioOverview: React.FC = () => {
  const { 
    allCompaniesOverview, 
    drillDownToCompany, 
    clientProfile,
    criticalDelayedItems,
    approveCfoComplianceReview,
    switchCompanyAndTab
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'compliance' | 'action' | 'invoice'>('ALL');

  // Aggregate stats across all companies
  const totalCompanies = allCompaniesOverview.length;
  const totalPendingCfoSignoffs = allCompaniesOverview.reduce((acc, c) => acc + (c.pendingCfoReviews || 0), 0);
  const totalCompliancesAll = allCompaniesOverview.reduce((acc, c) => acc + (c.totalCompliances || 0), 0);
  const totalCompletedAll = allCompaniesOverview.reduce((acc, c) => acc + (c.fullyCompletedCompliances || 0), 0);
  const avgComplianceRate = totalCompliancesAll > 0 ? Math.round((totalCompletedAll / totalCompliancesAll) * 100) : 0;
  const totalRevenue = allCompaniesOverview.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);
  const totalTaxQueued = allCompaniesOverview.reduce((acc, c) => acc + (c.taxPending || 0), 0);

  // Filtered critical/delayed items
  const filteredCriticalItems = criticalDelayedItems.filter(item => {
    if (activeFilter === 'ALL') return true;
    return item.type === activeFilter;
  });

  const complianceCritCount = criticalDelayedItems.filter(i => i.type === 'compliance').length;
  const actionCritCount = criticalDelayedItems.filter(i => i.type === 'action').length;
  const invoiceCritCount = criticalDelayedItems.filter(i => i.type === 'invoice').length;

  return (
    <div className="space-y-6">
      
      {/* Portfolio Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Virtual CFO Master Control & Surveillance
              </span>
              <span className="text-xs text-slate-400">
                {clientProfile.cfoFirm}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              All Client Companies Overview & Multi-Entity Control
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consolidated governance across all client entities. Actively monitor compliance, control action deliverables, approve pending sign-offs, and amend any tab directly from the dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">Virtual CFO</span>
              <p className="text-sm font-bold text-white">{clientProfile.cfoName}</p>
              <span className="text-[10px] text-emerald-400 font-medium">Full Monitoring & Amendment Access</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              MG
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Macro KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Client Entities</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalCompanies}</span>
            <span className="text-xs text-slate-500">Managed Companies</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tech, Logistics & Healthcare entities
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Portfolio Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgComplianceRate}%</span>
            <span className="text-xs text-slate-500">Avg Statutory Progress</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalCompletedAll} of {totalCompliancesAll} filings completed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending CFO Sign-Offs</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{totalPendingCfoSignoffs}</span>
            <span className="text-xs text-slate-500">Awaiting CFO Approval</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Drafts prepared by client teams
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Aggregate Monthly Revenue</span>
            <IndianRupee className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">₹{(totalRevenue / 10000000).toFixed(2)} Cr</span>
            <span className="text-xs text-slate-500">/ month</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ₹{(totalTaxQueued / 100000).toFixed(2)}L tax queued for payment
          </p>
        </div>

      </div>

      {/* 🚨 CRITICAL & DELAYED SURVEILLANCE CONSOLE (AUTOMATICALLY HIGHLIGHTED) */}
      <div className="bg-rose-50/40 rounded-2xl border-2 border-rose-300 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-rose-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <h2 className="text-base font-bold text-rose-950 flex items-center gap-2">
                Critical & Delayed Surveillance Console
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                {criticalDelayedItems.length} Requiring CFO Attention
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-1">
              Items approaching statutory deadlines, pending CFO approval, overdue operational tasks, or dwell-time SLA breaches automatically highlighted for immediate control.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              All Alerts ({criticalDelayedItems.length})
            </button>
            <button
              onClick={() => setActiveFilter('compliance')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'compliance'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Statutory Filings ({complianceCritCount})
            </button>
            <button
              onClick={() => setActiveFilter('action')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'action'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Action Items ({actionCritCount})
            </button>
            <button
              onClick={() => setActiveFilter('invoice')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'invoice'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Invoice SLAs ({invoiceCritCount})
            </button>
          </div>
        </div>

        {/* Highlighted Critical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCriticalItems.map((item) => {
            const isCompliance = item.type === 'compliance';
            const isAction = item.type === 'action';
            const isInvoice = item.type === 'invoice';

            return (
              <div 
                key={item.id}
                className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs space-y-3 transition-all hover:border-rose-400 hover:shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Top Bar: Company tag + Severity Pill */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span 
                      onClick={() => drillDownToCompany(item.companyId)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition-colors line-clamp-1"
                      title="Click to jump to company workspace"
                    >
                      🏢 {item.companyName}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.severity === 'Overdue' 
                        ? 'bg-red-100 text-red-800 border border-red-300' 
                        : item.cfoReviewPending 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {item.cfoReviewPending ? '⏳ Awaiting CFO Review' : item.severity === 'Overdue' ? '⚠️ Overdue' : '🚨 Critical'}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                      {item.title}
                    </h3>
                  </div>

                  {/* Deadline & Status Details */}
                  <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Timeline / SLA:</span>
                      <span className="font-semibold text-rose-700">{item.deadlineOrAge}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assignee / Stage:</span>
                      <span className="font-medium text-slate-800">{item.assigneeOrDept}</span>
                    </div>
                    {item.financialAmount && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Value at Stake:</span>
                        <span className="font-bold text-slate-900">₹{item.financialAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Risk / Penalty description */}
                  <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                    Risk: {item.penaltyOrRisk}
                  </p>
                </div>

                {/* Active Controls Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isCompliance && item.cfoReviewPending ? (
                    <button
                      onClick={() => {
                        const rawId = item.id.replace(`crit-comp-${item.companyId}-`, '');
                        approveCfoComplianceReview(item.companyId, rawId);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer flex-1 justify-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sign-Off as CFO</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      if (isCompliance) {
                        switchCompanyAndTab(item.companyId, 'compliances');
                      } else if (isAction) {
                        switchCompanyAndTab(item.companyId, 'actions');
                      } else {
                        switchCompanyAndTab(item.companyId, 'invoices');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer flex-1 justify-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Amend & Control</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MASTER CLIENT OVERVIEW TABLE (ALL COMPANY NAMES & BROAD STATUS) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              All Managed Companies: Broad Compliance & Action Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review broad statutory compliance and action status per company. Use quick buttons to amend any tab or open the company workspace.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg">
            {allCompaniesOverview.length} Companies Under CFO Retainer
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Company Name & Legal Entity</th>
                <th className="py-3.5 px-4 min-w-[170px]">Broad Statutory Compliance</th>
                <th className="py-3.5 px-4 text-center">CFO Sign-Off Queue</th>
                <th className="py-3.5 px-4 text-center">Broad Action Status</th>
                <th className="py-3.5 px-4">Revenue & Runway</th>
                <th className="py-3.5 px-4">Next Filing Due</th>
                <th className="py-3.5 px-4 text-right">Active Amendment & Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCompaniesOverview.map((company) => {
                return (
                  <tr 
                    key={company.companyId}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Company info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 transition-colors shadow-2xs">
                          {(company.companyName || 'CO').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs">
                              {company.companyName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                              {company.entityType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>GSTIN: <span className="font-mono text-slate-700">{company.gstin}</span></span>
                            <span>•</span>
                            <span>{company.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Statutory compliance progress */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{company.compliancePercentage}% Compliant</span>
                          <span className="text-slate-500">
                            {company.fullyCompletedCompliances}/{company.totalCompliances} Closed
                          </span>
                        </div>
                        <ProgressBar 
                          percentage={company.compliancePercentage}
                          height="h-2"
                          color={company.compliancePercentage >= 80 ? 'bg-emerald-600' : 'bg-indigo-600'}
                        />
                      </div>
                    </td>

                    {/* CFO Sign-off queue */}
                    <td className="py-4 px-4 text-center">
                      {company.pendingCfoReviews > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          {company.pendingCfoReviews} Review Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          All Sign-offs Clear
                        </span>
                      )}
                    </td>

                    {/* Action pendencies */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-semibold text-slate-900">
                          {company.pendingActions} Open Actions
                        </span>
                        {company.overdueActions > 0 ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 mt-0.5">
                            {company.overdueActions} Overdue
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                            On Schedule
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Financial MIS */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-slate-900">
                          ₹{(company.monthlyRevenue / 100000).toFixed(1)}L / mo
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Runway: <span className="font-medium text-slate-700">{company.cashRunwayMonths} Mo</span>
                        </div>
                      </div>
                    </td>

                    {/* Next deadline */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-xs">{company.nextUpcomingDeadline}</span>
                      </div>
                    </td>

                    {/* Active Amendment & Control Shortcuts */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => switchCompanyAndTab(company.companyId, 'compliances')}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
                          title="Amend compliance filings and subtasks"
                        >
                          Amend Compliances
                        </button>
                        <button
                          onClick={() => switchCompanyAndTab(company.companyId, 'actions')}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
                          title="Amend action items and deadlines"
                        >
                          Amend Actions
                        </button>
                        <button
                          onClick={() => switchCompanyAndTab(company.companyId, 'mis')}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
                          title="Amend financial figures and commentary"
                        >
                          Amend MIS
                        </button>
                        <button
                          onClick={() => drillDownToCompany(company.companyId)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-900 hover:bg-indigo-600 text-white transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Open full company workspace"
                        >
                          <span>Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Company Statutory Calendar Summary */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          Critical Monthly Statutory Filing Milestones Across Portfolio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Nexora Innovations Tech</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-700 font-semibold">
                Due 20th Sep
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              GSTR-3B Filing & Form 3CD Tax Audit Finalization
            </p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Tax Queued: ₹4.85L</span>
              <button 
                className="text-indigo-600 font-medium cursor-pointer hover:underline" 
                onClick={() => switchCompanyAndTab('client-101', 'compliances')}
              >
                Amend Compliance →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Apex Global Logistics</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-semibold">
                Due 20th Sep
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Monthly GSTR-3B & Interstate Transport RCM Reconciliation
            </p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Tax Queued: ₹6.10L</span>
              <button 
                className="text-indigo-600 font-medium cursor-pointer hover:underline" 
                onClick={() => switchCompanyAndTab('client-102', 'compliances')}
              >
                Amend Compliance →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Zenith HealthTech LLP</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 font-semibold">
                Due 28th Sep
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              ROC Annual Return Form 8 & R&D Payroll PF / ESIC
            </p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Tax Queued: ₹2.40L</span>
              <button 
                className="text-indigo-600 font-medium cursor-pointer hover:underline" 
                onClick={() => switchCompanyAndTab('client-103', 'compliances')}
              >
                Amend Compliance →
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
