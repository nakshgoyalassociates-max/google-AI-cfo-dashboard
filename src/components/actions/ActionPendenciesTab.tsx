import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActionItem, ActionStatus, ActionCategory } from '../../types';
import { TEAM_MEMBERS } from '../../data/mockInitialData';
import { ActionInlineDetail } from './ActionInlineDetail';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  User, 
  Maximize2, 
  Minimize2,
  RefreshCw
} from 'lucide-react';

export const ActionPendenciesTab: React.FC = () => {
  const { 
    actions, 
    setIsNewActionModalOpen, 
    stats 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const now = new Date();

  // Filter actions
  const filteredActions = actions.filter(act => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        act.title.toLowerCase().includes(q) || 
        act.description.toLowerCase().includes(q) ||
        act.assignedTo.toLowerCase().includes(q) ||
        (act.remarks && act.remarks.toLowerCase().includes(q)) ||
        (act.subtasks && act.subtasks.some(s => s.title.toLowerCase().includes(q)));
      if (!match) return false;
    }

    if (selectedCategory !== 'ALL' && act.category !== selectedCategory) return false;
    if (selectedAssignee !== 'ALL' && act.assignedTo !== selectedAssignee) return false;

    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'OVERDUE') {
        if (act.status === 'Completed') return false;
        const d = new Date(act.fixedDeadline);
        if (isNaN(d.getTime()) || d >= now) return false;
      } else if (act.status !== selectedStatus) {
        return false;
      }
    }

    return true;
  });

  const isOverdue = (deadlineStr: string, status: ActionStatus) => {
    if (status === 'Completed') return false;
    const deadline = new Date(deadlineStr);
    return !isNaN(deadline.getTime()) && deadline < now;
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredActions.map(a => a.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedAssignee('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Formal Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Action Items & Operational Pendencies
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational workflows, bank reconciliations, vendor audits, and departmental milestone tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewActionModalOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Action Task</span>
          </button>
        </div>
      </div>

      {/* Summary Status Strip */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 shadow-2xs flex-wrap gap-2">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span>Total Tasks: <strong className="text-slate-900 font-semibold">{stats.totalActions}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Pending: <strong className="text-amber-700 font-semibold">{stats.pendingActions}</strong></span>
          <span className="text-slate-300">|</span>
          <span>In Progress: <strong className="text-sky-700 font-semibold">{stats.inProgressActions}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Under Review: <strong className="text-purple-700 font-semibold">{stats.underReviewActions}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Completed: <strong className="text-emerald-700 font-semibold">{stats.completedActions}</strong></span>
          {stats.overdueActions > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <span>Overdue: <strong className="text-rose-700 font-semibold">{stats.overdueActions}</strong></span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 cursor-pointer flex items-center gap-1"
          >
            <Maximize2 className="w-3 h-3 text-slate-500" />
            <span>Expand All</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={collapseAll}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 cursor-pointer flex items-center gap-1"
          >
            <Minimize2 className="w-3 h-3 text-slate-500" />
            <span>Collapse</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action items by title, description or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Banking & Treasury">Banking & Treasury</option>
              <option value="Accounts Payable">Accounts Payable</option>
              <option value="Accounts Receivable">Accounts Receivable</option>
              <option value="Financial Reporting & MIS">Financial Reporting & MIS</option>
              <option value="General Ledger & Fixed Assets">General Ledger & FAR</option>
              <option value="Payroll & HR Ops">Payroll & HR Ops</option>
              <option value="Internal Audit & Controls">Internal Audit</option>
              <option value="Direct/Indirect Tax Ops">Tax Operations</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>

            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Assignees</option>
              {TEAM_MEMBERS.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Items Vertical Master Table with Inline Subtask Expanders */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-3 py-3 w-12 text-center">S.No</th>
                <th className="px-4 py-3 min-w-[240px]">Action Task & Scope</th>
                <th className="px-3 py-3 min-w-[140px]">Assignee</th>
                <th className="px-3 py-3 min-w-[130px]">Target Deadline</th>
                <th className="px-4 py-3 min-w-[140px]">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No action tasks found matching your filter criteria.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
                    >
                      Clear search and filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredActions.map((act, index) => {
                  const subtasks = act.subtasks || [];
                  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
                  const totalSubtasks = subtasks.length;
                  const progressPct = totalSubtasks > 0 
                    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
                    : (act.status === 'Completed' ? 100 : 0);
                  const isExpanded = expandedIds.has(act.id);
                  const overdue = isOverdue(act.fixedDeadline, act.status);

                  return (
                    <React.Fragment key={act.id}>
                      {/* Primary Vertical Row */}
                      <tr 
                        onClick={() => toggleExpand(act.id)}
                        className={`hover:bg-indigo-50/30 transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        {/* S.No */}
                        <td className="px-3 py-3 text-center font-mono text-slate-400 font-semibold text-[11px]">
                          {index + 1}
                        </td>

                        {/* Title & Description preview */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors flex items-center gap-1.5">
                            <span>{act.title}</span>
                            {overdue && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase tracking-tight">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md mt-0.5">
                            {act.description}
                          </p>
                        </td>

                        {/* Assignee */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[9px]">
                              {act.assignedTo.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-slate-800 block text-[11px]">
                                {act.assignedTo}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {act.assignedRole}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Fixed Deadline (Date only, without time) */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className={`font-mono text-[11px] font-semibold flex items-center gap-1 ${
                            overdue ? 'text-rose-600 font-bold' : 'text-slate-700'
                          }`}>
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{act.fixedDeadline ? act.fixedDeadline.split(' ')[0] : ''}</span>
                          </div>
                        </td>

                        {/* Progressive graph line with colour indication only */}
                        <td className="px-4 py-3 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                completedSubtasks === totalSubtasks && totalSubtasks > 0
                                  ? 'bg-emerald-500'
                                  : progressPct >= 50
                                  ? 'bg-indigo-600'
                                  : progressPct > 0
                                  ? 'bg-amber-500'
                                  : 'bg-slate-200'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Inline Subtask & Drill Down Row */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/20">
                          <td colSpan={5} className="px-4 py-3 sm:px-6">
                            <ActionInlineDetail 
                              action={act} 
                              onClose={() => toggleExpand(act.id)} 
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
