import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { ProgressBar } from '../common/ProgressBar';
import { ComplianceInlineDetail } from '../common/ComplianceInlineDetail';
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
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Lock,
  Building2
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { 
    clientProfile, 
    financialMIS, 
    compliances, 
    actions, 
    stats,
    setActiveTab
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const filteredCompliances = compliances.filter(c => {
    if (activeCategoryFilter === 'ALL') return true;
    return c.category === activeCategoryFilter;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Formal Client Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Executive Briefing & Performance
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              Single-Company Scope: {clientProfile.companyName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Period: {financialMIS.period}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified financial metrics, statutory compliance standing, and CFO operational deliverables for <span className="font-semibold text-slate-700">{clientProfile.companyName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => setActiveTab('mis')}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full MIS</span>
          </button>
        </div>
      </div>

      {/* Top 4 Big Executive Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Revenue"
          value={`₹${(financialMIS.monthlyRevenue / 100000).toFixed(1)} Lakhs`}
          subtitle="Net sales revenue for month"
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
          subtitle={`${financialMIS.ebitdaMarginPercent}% Operating Margin`}
          icon={ArrowUpRight}
          badge={{
            text: '23.5% Margin',
            variant: 'success'
          }}
          iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200"
        />

        <MetricCard
          title="Cash in Bank & Runway"
          value={`₹${(financialMIS.cashAndBankBalance / 10000000).toFixed(2)} Cr`}
          subtitle={`${financialMIS.cashRunwayMonths} Months Safe Runway`}
          icon={IndianRupee}
          badge={{
            text: `${financialMIS.cashRunwayMonths} Mo. Runway`,
            variant: 'info'
          }}
          iconBgColor="bg-sky-50 text-sky-600 border-sky-200"
        />

        <MetricCard
          title="Compliance Health Score"
          value={`${stats.overallCompliancePercentage}%`}
          subtitle="Zero Penalties Incurred"
          icon={ShieldCheck}
          badge={{
            text: '100% On-Time Record',
            variant: 'success'
          }}
          iconBgColor="bg-teal-50 text-teal-600 border-teal-200"
        />
      </div>

      {/* CFO Advisory Note Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Virtual CFO Monthly Commentary & Action Points
                </h2>
                <p className="text-xs text-slate-500">
                  By {clientProfile.cfoName} • {clientProfile.cfoFirm}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                FY 2026-27 Strategic Review
              </span>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              "{financialMIS.cfoExecutiveSummary}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {financialMIS.cfoKeyAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Client Compliances Tracker with Progressive Visual Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Your Statutory Compliances Status
            </h2>
            <p className="text-xs text-slate-500">
              Each compliance is divided into 3 milestones: Data Draft → CFO Review → Portal Filing
            </p>
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'GST', 'TDS / TCS', 'Income Tax', 'ROC / MCA', 'PF / ESI'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompliances.slice(0, 10).map((comp) => {
              const completedCount = (comp?.subtasks || []).filter(s => s && s.status === 'completed').length;
              const isExpanded = expandedCardId === comp.id;

              return (
                <div
                  key={comp.id}
                  className={`rounded-xl border transition-all space-y-3 bg-white ${
                    isExpanded 
                      ? 'border-indigo-400 ring-2 ring-indigo-500/20 md:col-span-2 p-5' 
                      : 'border-slate-200 p-4 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div 
                    onClick={() => setExpandedCardId(isExpanded ? null : comp.id)}
                    className="flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {comp.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {comp.frequency}
                        </span>
                        {comp.cfoRemarks && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            🛡️ CFO Remark
                          </span>
                        )}
                        {comp.clientRemarks && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🏢 Team Remark
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {comp.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {comp.arnOrChallanNo ? (
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          Filed ✓
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500">
                          Due: {comp.statutoryDueDate.split(';')[0]}
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Simple Progressive Line */}
                  <ProgressBar
                    subtasks={comp.subtasks}
                    size="sm"
                    showLabels={false}
                    interactive={false}
                  />

                  {/* Plain-English summary for the client */}
                  <div 
                    onClick={() => setExpandedCardId(isExpanded ? null : comp.id)}
                    className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 cursor-pointer"
                  >
                    <span>
                      {completedCount === 3
                        ? 'Filed on statutory portal'
                        : completedCount === 2
                        ? 'CFO approved; filing in progress'
                        : completedCount === 1
                        ? 'Draft submitted to CFO'
                        : 'Scheduled for current cycle'}
                    </span>
                    <span className="text-indigo-600 font-semibold hover:underline">
                      {isExpanded ? 'Hide Subtasks ▲' : 'View Subtasks ▼'}
                    </span>
                  </div>

                  {/* Inline Expanded View */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-indigo-100">
                      <ComplianceInlineDetail
                        compliance={comp}
                        onClose={() => setExpandedCardId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setActiveTab('compliances')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Explore all 35 statutory compliances in full master table →
            </button>
          </div>
        </div>
      </div>

      {/* Operational Pendencies: Let the client see what the accounting team is doing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Ongoing Departmental Action Items
            </h2>
            <p className="text-xs text-slate-500">
              Internal tasks handled by the finance & accounting team to keep books audit-ready
            </p>
          </div>
          <button
            onClick={() => setActiveTab('actions')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All Action Items ({actions.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.slice(0, 6).map((act) => (
            <div key={act.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  act.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {act.priority}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  act.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {act.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 line-clamp-1">{act.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">{act.description}</p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60">
                <span>By: {act.assignedTo}</span>
                <span>Due: {act.fixedDeadline.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
