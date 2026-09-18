import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Upload, 
  ArrowRight, 
  Send, 
  CheckSquare, 
  User, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ComplianceItem } from '../../types';
import { DueDateBadge } from '../common/DueDateBadge';
import { formatLakhs } from '../../utils/format';
import { formatDueDate } from '../../utils/dueDate';
import { 
  getComplianceFourColorStatus, 
  getActionFourColorStatus, 
  getLineItemRowClasses 
} from '../../utils/statusColors';
import { ComplianceSubtaskProgressIcons } from '../common/ComplianceSubtaskProgressIcons';
import { ActionSubtaskProgressIcons } from '../common/ActionSubtaskProgressIcons';

export const ClientTeamDashboard: React.FC = () => {
  const { 
    clientProfile, 
    compliances, 
    actions, 
    toggleSubtask, 
    setSelectedCompliance, 
    setActiveTab, 
    stats 
  } = useApp();

  const [activeQueueFilter, setActiveQueueFilter] = useState<'all' | 'draft' | 'filing' | 'completed'>('all');

  // Step 1: Draft pending collation by accounting team
  const draftPendingItems = (compliances || []).filter(c => c?.subtasks && c.subtasks[0]?.status === 'pending');

  // Step 2: In review by CFO
  const inCfoReviewItems = (compliances || []).filter(c => c?.subtasks && c.subtasks[0]?.status === 'completed' && c.subtasks[1]?.status === 'pending');

  // Step 3: Approved by CFO, ready for team payment & filing
  const readyForFilingItems = (compliances || []).filter(c => c?.subtasks && c.subtasks[1]?.status === 'completed' && c.subtasks[2]?.status === 'pending');

  // Completed
  const completedCompliances = (compliances || []).filter(c => c?.subtasks && c.subtasks[2]?.status === 'completed');

  // Filtered list based on active pill
  const displayedCompliances = (compliances || []).filter(c => {
    if (!c?.subtasks) return false;
    if (activeQueueFilter === 'draft') return c.subtasks[0]?.status === 'pending';
    if (activeQueueFilter === 'filing') return c.subtasks[1]?.status === 'completed' && c.subtasks[2]?.status === 'pending';
    if (activeQueueFilter === 'completed') return c.subtasks[2]?.status === 'completed';
    return true;
  });

  // Team operational action pendencies
  const operationalActions = (actions || []).filter(a => a && (a.category === 'Banking & Treasury' || a.category === 'Accounts Payable' || a.category === 'Internal Audit & Controls' || a.assignedRole?.includes('Account') || a.assignedRole?.includes('Tax')));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Workstation Header & Security Badge */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  {clientProfile.companyName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-sky-600" />
                  Accounts Operations Workstation (Restricted Entity)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Desk Lead: <span className="font-semibold text-slate-700">Sneha Roy & Finance Ops Team</span> • Virtual CFO: <span className="font-semibold text-slate-700">{clientProfile.cfoName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('compliances')}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Full Compliance Master</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Action Items ({operationalActions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Stage Operational Work Queue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stage 1: Drafting Queue */}
        <div 
          onClick={() => setActiveQueueFilter('draft')}
          className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
            activeQueueFilter === 'draft' ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Step 1: Team Collation
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Needs Attention
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{draftPendingItems.length}</span>
            <span className="text-xs text-slate-500">Drafts pending</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Ledger collation & voucher extraction before sending to CFO.
          </p>
        </div>

        {/* Stage 2: In CFO Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Step 2: Virtual CFO Review
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              With CFO Desk
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{inCfoReviewItems.length}</span>
            <span className="text-xs text-slate-500">Awaiting sign-off</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Under verification by {clientProfile.cfoName}.
          </p>
        </div>

        {/* Stage 3: Approved & Queued for Payment/Filing */}
        <div 
          onClick={() => setActiveQueueFilter('filing')}
          className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
            activeQueueFilter === 'filing' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Step 3: Ready for Filing
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              CFO Approved
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{readyForFilingItems.length}</span>
            <span className="text-xs text-slate-500">Challans/returns</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Upload tax payment challan & file on government portal.
          </p>
        </div>

        {/* Completed */}
        <div 
          onClick={() => setActiveQueueFilter('completed')}
          className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
            activeQueueFilter === 'completed' ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Filing Completed
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {stats.overallCompliancePercentage}% Done
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{completedCompliances.length}</span>
            <span className="text-xs text-slate-500">of {compliances.length} items</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            ARNs & challan receipts verified on MCA / GSTN portals.
          </p>
        </div>

      </div>

      {/* Main Operations Grid: Queue & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Compliance Work Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  Statutory Operations Work Queue
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track drafting milestones, upload challans, and manage government filings
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
                <button
                  onClick={() => setActiveQueueFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeQueueFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({compliances.length})
                </button>
                <button
                  onClick={() => setActiveQueueFilter('draft')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeQueueFilter === 'draft' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Drafting ({draftPendingItems.length})
                </button>
                <button
                  onClick={() => setActiveQueueFilter('filing')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeQueueFilter === 'filing' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Filing Due ({readyForFilingItems.length})
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 mt-2">
              {displayedCompliances.slice(0, 7).map(item => {
                const isDraftPending = item.subtasks[0].status === 'pending';
                const isCfoReview = item.subtasks[0].status === 'completed' && item.subtasks[1].status === 'pending';
                const isReadyToPayAndFile = item.subtasks[1].status === 'completed' && item.subtasks[2].status === 'pending';
                const isFullyDone = item.subtasks[2].status === 'completed';
                const itemStatus = getComplianceFourColorStatus(item);
                const rowClasses = getLineItemRowClasses(itemStatus);

                return (
                  <div key={item.id} className={`py-2 px-3 rounded-lg border transition-colors ${rowClasses}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-slate-100 text-slate-700 leading-none">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer leading-tight" onClick={() => setSelectedCompliance(item)}>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {item.frequency}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 leading-tight">
                          <DueDateBadge item={item} compact={true} />
                          {item.taxAmount && (
                            <span className="text-slate-700 font-mono text-[10.5px]">
                              Tax: {formatLakhs(item.taxAmount)}
                            </span>
                          )}
                          {item.arnOrChallanNo && (
                            <span className="text-green-800 font-mono text-[10.5px] font-bold">
                              Challan: {item.arnOrChallanNo}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Small icons showing where task is stuck + Action Stage Button */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <ComplianceSubtaskProgressIcons compliance={item} compact={true} />

                        {isDraftPending && (
                          <button
                            onClick={() => toggleSubtask(item.id, 1, 'Draft collated by Accounts Team')}
                            className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer leading-tight"
                          >
                            <Send className="w-3 h-3" />
                            <span>Submit Draft</span>
                          </button>
                        )}

                        {isCfoReview && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 leading-tight">
                            <Clock className="w-3 h-3" />
                            <span>In CFO Review</span>
                          </span>
                        )}

                        {isReadyToPayAndFile && (
                          <button
                            onClick={() => toggleSubtask(item.id, 3, 'Challan generated & filed by Tax Desk', 'CHL-2026-SEP')}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer leading-tight"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Mark Filed</span>
                          </button>
                        )}

                        {isFullyDone && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-800 border border-green-300 flex items-center gap-1 leading-tight font-bold">
                            <CheckCircle2 className="w-3 h-3 text-green-700" />
                            <span>100% Filed</span>
                          </span>
                        )}

                        <button
                          onClick={() => setSelectedCompliance(item)}
                          title="View Details"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => setActiveTab('compliances')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors inline-flex items-center gap-1"
              >
                <span>View all {compliances.length} compliances in Master Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Daily Action Tasks & Assignments */}
        <div className="space-y-4">
          
          {/* Action Tasks Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-600" />
                Accounting Desk Tasks
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {operationalActions.length} Pending
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {operationalActions.slice(0, 4).map(action => {
                const actStatus = getActionFourColorStatus(action);
                const rowClasses = getLineItemRowClasses(actStatus);

                return (
                  <div key={action.id} className={`py-2 px-3 rounded-lg border transition-colors space-y-1.5 ${rowClasses}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-tight">
                          {action.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-1 leading-tight">
                          {action.description}
                        </p>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold shrink-0 leading-none ${
                        action.priority === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-200' :
                        action.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {action.priority}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 border-t border-slate-200/50 text-[10.5px] text-slate-500 gap-1.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {action.assignedTo} • Due: {formatDueDate(action.fixedDeadline)}
                      </span>
                      <ActionSubtaskProgressIcons action={action} compact={true} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('actions')}
                className="w-full py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Action Pendencies Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section 43B(h) MSME Vendor Vigilance Alert */}
          <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <h4 className="text-xs font-bold text-amber-900">
                MSME 45-Day Payment Rule (Sec 43B(h))
              </h4>
            </div>
            <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
              2 vendor payments totaling <span className="font-semibold">₹2.80 Lakhs</span> are approaching day 41. Verify invoices & queue bank RTGS to eliminate tax disallowances.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
