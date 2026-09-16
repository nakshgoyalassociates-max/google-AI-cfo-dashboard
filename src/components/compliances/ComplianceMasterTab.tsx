import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressBar } from '../common/ProgressBar';
import { ComplianceInlineDetail } from '../common/ComplianceInlineDetail';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  ShieldAlert,
  SlidersHorizontal,
  MessageSquare,
  ShieldCheck,
  Building,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const ComplianceMasterTab: React.FC = () => {
  const { 
    compliances, 
    toggleSubtask, 
    setSelectedCompliance, 
    stats 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Set of expanded compliance IDs for inline subtasks
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['gst-1', 'gst-3']));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(compliances.map(c => c.id));
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const filtered = (compliances || []).filter(c => {
    if (!c) return false;
    const subtasks = c.subtasks || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.applicability.toLowerCase().includes(q) ||
        c.penaltyClause.toLowerCase().includes(q) ||
        (c.cfoRemarks && c.cfoRemarks.toLowerCase().includes(q)) ||
        (c.clientRemarks && c.clientRemarks.toLowerCase().includes(q)) ||
        subtasks.some(s => s && (s.title.toLowerCase().includes(q) || s.assignedTo.toLowerCase().includes(q)));
      if (!match) return false;
    }

    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (selectedFrequency !== 'ALL' && c.frequency !== selectedFrequency) return false;

    const doneCount = subtasks.filter(s => s && s.status === 'completed').length;
    if (selectedStatus === 'COMPLETED' && doneCount !== 3) return false;
    if (selectedStatus === 'IN_PROGRESS' && (doneCount === 0 || doneCount === 3)) return false;
    if (selectedStatus === 'NOT_STARTED' && doneCount !== 0) return false;
    if (selectedStatus === 'CFO_PENDING' && !(subtasks[0]?.status === 'completed' && subtasks[1]?.status === 'pending')) return false;

    return true;
  });

  const exportCSV = () => {
    const headers = ['S.No', 'Category', 'Compliance / Form', 'Frequency', 'Statutory Due Date', 'Progress %', 'Subtask 1 (Team)', 'Subtask 2 (CFO)', 'Subtask 3 (Filing)', 'CFO Remarks', 'Client Team Remarks'];
    const rows = filtered.map(c => {
      const done = (c.subtasks || []).filter(s => s && s.status === 'completed').length;
      return [
        c.sNo,
        `"${c.category}"`,
        `"${c.name}"`,
        `"${c.frequency}"`,
        `"${c.statutoryDueDate}"`,
        `${Math.round((done / 3) * 100)}%`,
        `"${c.subtasks[0].status === 'completed' ? 'Done' : 'Pending'}: ${c.subtasks[0].title}"`,
        `"${c.subtasks[1].status === 'completed' ? 'Done' : 'Pending'}: ${c.subtasks[1].title}"`,
        `"${c.subtasks[2].status === 'completed' ? 'Done' : 'Pending'}: ${c.subtasks[2].title}"`,
        `"${c.cfoRemarks || ''}"`,
        `"${c.clientRemarks || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `virtual_cfo_compliance_master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Formal Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Statutory Compliance Master
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified master register covering 35 statutory compliances across GST, Direct Tax, MCA/ROC, and Labor Laws.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Status Strip */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 shadow-2xs flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span>Total Records: <strong className="text-slate-900 font-semibold">{(compliances || []).length}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Filed & Complete: <strong className="text-emerald-700 font-semibold">{(compliances || []).filter(c => c?.subtasks && c.subtasks.every(s => s && s.status === 'completed')).length}</strong></span>
          <span className="text-slate-300">|</span>
          <span>In Progress: <strong className="text-indigo-700 font-semibold">{(compliances || []).filter(c => c?.subtasks && c.subtasks.some(s => s && s.status === 'completed') && !c.subtasks.every(s => s && s.status === 'completed')).length}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Not Started: <strong className="text-amber-700 font-semibold">{(compliances || []).filter(c => c?.subtasks && c.subtasks.every(s => s && s.status === 'pending')).length}</strong></span>
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

      {/* Filter Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by form name, category, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-slate-400 focus:outline-hidden"
            />
          </div>

          {/* Category & Status Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Categories (6)</option>
              <option value="GST">GST</option>
              <option value="TDS / TCS">TDS / TCS</option>
              <option value="Income Tax">Income Tax</option>
              <option value="ROC / MCA">ROC / MCA</option>
              <option value="PF / ESI">PF / ESI</option>
              <option value="Professional Tax & State">PT & State</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed (3/3)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CFO_PENDING">Awaiting CFO Review</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>

            <select
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Frequencies</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
              <option value="Half-yearly">Half-yearly</option>
              <option value="Event-based">Event-based</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compliance Master Table with Inline Subtask Expanders */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-3 py-3 w-12 text-center">S.No</th>
                <th className="px-4 py-3 min-w-[240px]">Compliance / Form</th>
                <th className="px-3 py-3">Frequency & Due Date</th>
                <th className="px-4 py-3 min-w-[150px]">Progress</th>
                <th className="px-3 py-3 min-w-[120px]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((comp) => {
                const isExpanded = expandedIds.has(comp.id);

                return (
                  <React.Fragment key={comp.id}>
                    {/* Primary Row */}
                    <tr 
                      onClick={() => toggleExpand(comp.id)}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer group ${
                        isExpanded ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* S.No */}
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-400">
                        {comp.sNo}
                      </td>

                      {/* Compliance / Form Name */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {comp.name}
                            </span>
                            {comp.arnOrChallanNo && (
                              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                                Filed ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {comp.applicability}
                          </p>
                        </div>
                      </td>

                      {/* Frequency & Statutory Due Date */}
                      <td className="px-3 py-3 whitespace-nowrap space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded block w-fit">
                          {comp.frequency}
                        </span>
                        <p className="text-[11px] text-slate-700 font-medium max-w-[170px] leading-tight">
                          {comp.statutoryDueDate.split(';')[0]}
                        </p>
                      </td>

                      {/* Progressive graph line with colour indication only */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="min-w-[130px]">
                          <ProgressBar
                            subtasks={comp.subtasks}
                            size="sm"
                          />
                        </div>
                      </td>

                      {/* Remarks Presence Indicator */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {comp.cfoRemarks && (
                            <span 
                              title={`CFO: ${comp.cfoRemarks}`}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>CFO</span>
                            </span>
                          )}
                          {comp.clientRemarks && (
                            <span 
                              title={`Client: ${comp.clientRemarks}`}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                            >
                              <Building className="w-3 h-3" />
                              <span>Client</span>
                            </span>
                          )}
                          {!comp.cfoRemarks && !comp.clientRemarks && (
                            <span className="text-slate-300 text-xs font-mono">—</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* INLINE EXPANDED VIEW: Directly below clicked compliance row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-indigo-200">
                        <td colSpan={5} className="px-4 py-3">
                          <ComplianceInlineDetail
                            compliance={comp}
                            onClose={() => toggleExpand(comp.id)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
