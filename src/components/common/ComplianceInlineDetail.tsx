import React, { useState } from 'react';
import { ComplianceItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDueDate } from '../../utils/dueDate';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Edit3,
  Clock,
  AlertTriangle,
  Layers,
  FileCheck
} from 'lucide-react';

interface ComplianceInlineDetailProps {
  compliance: ComplianceItem;
  onClose?: () => void;
}

export const ComplianceInlineDetail: React.FC<ComplianceInlineDetailProps> = ({ compliance, onClose }) => {
  const { toggleSubtask, updateComplianceRemarks } = useApp();

  // Active drilled-down subtask (1, 2, or 3, or null if none drilled down)
  const [drilledSubtaskId, setDrilledSubtaskId] = useState<1 | 2 | 3 | null>(null);

  // Subtask edit state
  const [subtaskNoteInput, setSubtaskNoteInput] = useState('');
  const [subtaskDocInput, setSubtaskDocInput] = useState('');
  const [isEditingSubtaskDetails, setIsEditingSubtaskDetails] = useState(false);

  // CFO Remarks local state
  const [cfoText, setCfoText] = useState(compliance.cfoRemarks || '');
  const [isEditingCfo, setIsEditingCfo] = useState(false);

  // Client Remarks local state
  const [clientText, setClientText] = useState(compliance.clientRemarks || '');
  const [isEditingClient, setIsEditingClient] = useState(false);

  const completedCount = (compliance?.subtasks || []).filter(s => s && s.status === 'completed').length;
  const isAllDone = completedCount === 3;

  const now = new Date();
  const deadlineDate = new Date(compliance.dueDate);
  const isOverdue = compliance.status !== 'Filed' && !isNaN(deadlineDate.getTime()) && deadlineDate < now;

  // Open drill-down for a specific subtask
  const handleToggleDrillDown = (num: 1 | 2 | 3) => {
    if (drilledSubtaskId === num) {
      setDrilledSubtaskId(null);
      setIsEditingSubtaskDetails(false);
    } else {
      setDrilledSubtaskId(num);
      const st = compliance.subtasks.find(s => s.subtaskNumber === num);
      setSubtaskNoteInput(st?.notes || '');
      setSubtaskDocInput(st?.documentRef || '');
      setIsEditingSubtaskDetails(false);
    }
  };

  const handleSaveSubtaskNotes = (num: 1 | 2 | 3) => {
    toggleSubtask(compliance.id, num, subtaskNoteInput.trim() || undefined, subtaskDocInput.trim() || undefined);
    setIsEditingSubtaskDetails(false);
  };

  const handleSaveCfoRemarks = (e: React.FormEvent) => {
    e.preventDefault();
    updateComplianceRemarks(compliance.id, 'cfo', cfoText.trim());
    setIsEditingCfo(false);
  };

  const handleSaveClientRemarks = (e: React.FormEvent) => {
    e.preventDefault();
    updateComplianceRemarks(compliance.id, 'client', clientText.trim());
    setIsEditingClient(false);
  };

  return (
    <div className="bg-indigo-50 rounded-xl p-3.5 border-2 border-indigo-200 shadow-sm space-y-3 my-1 text-xs">
      {/* Colorful Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-indigo-200/70">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-950 text-xs tracking-tight">Subtasks & Bottleneck Execution Pipeline</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-100/90 text-indigo-800 font-medium">
                {compliance.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-normal">
              Track progress, resolve bottlenecks, and attach ARN/filing reference notes below.
            </p>
          </div>
        </div>

        {/* Status Callout Badge */}
        <div className="flex items-center gap-2">
          {isAllDone ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-green-600 text-white flex items-center gap-1.5 font-medium shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> All 3 Subtasks Completed
            </span>
          ) : isOverdue ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-red-600 text-white flex items-center gap-1.5 font-medium shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Overdue • {completedCount}/3 Subtasks Done
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-orange-500 text-white flex items-center gap-1.5 font-medium shadow-2xs">
              <Clock className="w-3.5 h-3.5" /> In Process • {completedCount}/3 Subtasks Done
            </span>
          )}
        </div>
      </div>

      {/* Subtasks List with Colorful Cards */}
      <div className="space-y-2">
        {compliance.subtasks.map((st) => {
          const isDone = st.status === 'completed';
          const isDrilled = drilledSubtaskId === st.subtaskNumber;
          const isStuckHere = !isDone && (st.subtaskNumber === 1 || compliance.subtasks.find(s => s.subtaskNumber === st.subtaskNumber - 1)?.status === 'completed');

          // Determine card styling based on state
          const cardStyle = isDone
            ? 'bg-green-50/70 border-green-300/90 hover:bg-green-50'
            : isStuckHere
            ? (isOverdue 
                ? 'bg-red-50/75 border-red-300 ring-1 ring-red-300/80 hover:bg-red-50' 
                : 'bg-orange-50/80 border-orange-300 ring-1 ring-orange-300/80 hover:bg-orange-50')
            : 'bg-white border-slate-200 hover:bg-slate-50/60';

          const badgeStyle = isDone
            ? 'bg-green-600 text-white border-green-600'
            : isStuckHere
            ? (isOverdue ? 'bg-red-600 text-white border-red-600' : 'bg-orange-500 text-white border-orange-500')
            : 'bg-slate-200 text-slate-700 border-slate-300';

          const buttonStyle = isDone
            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
            : isStuckHere
            ? (isOverdue 
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                : 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600')
            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';

          return (
            <div key={st.id} className={`rounded-lg border transition-all ${cardStyle} overflow-hidden shadow-2xs`}>
              {/* Subtask Row Header */}
              <div 
                onClick={() => handleToggleDrillDown(st.subtaskNumber)}
                className="p-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubtask(compliance.id, st.subtaskNumber);
                    }}
                    title="Click to toggle status"
                    className={`px-2 py-0.5 rounded text-[10px] font-normal shrink-0 cursor-pointer border ${badgeStyle}`}
                  >
                    Subtask {st.subtaskNumber}
                  </span>

                  <div className="truncate">
                    <span className="font-semibold text-slate-900">
                      {st.title}
                    </span>
                    <span className="text-slate-300 mx-1.5">•</span>
                    <span className="text-slate-600 font-medium text-[11px]">
                      {st.assignedTo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    Target: {st.deadline ? formatDueDate(st.deadline) : ''}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubtask(compliance.id, st.subtaskNumber);
                    }}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-normal border cursor-pointer transition-colors ${buttonStyle}`}
                    title="Click to toggle status"
                  >
                    {isDone ? 'Completed ✓' : isStuckHere ? (isOverdue ? 'Overdue ⚠' : 'In Process !') : 'Pending'}
                  </button>

                  <span className="text-slate-400 p-0.5">
                    {isDrilled ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </span>
                </div>
              </div>

              {/* Subtask drill down */}
              {isDrilled && (
                <div className="bg-white/95 p-3 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px]">
                    <div className="text-slate-600 space-y-0.5">
                      <p><span className="text-slate-900 font-medium">Subtask:</span> Subtask {st.subtaskNumber} ({st.assignedTo})</p>
                      <p><span className="text-slate-900 font-medium">Target Date:</span> {st.deadline ? formatDueDate(st.deadline) : 'N/A'}</p>
                      {st.completedAt && (
                        <p className="text-green-700 font-medium">Completed: {st.completedAt}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSubtask(compliance.id, st.subtaskNumber)}
                        className={`px-2.5 py-1 rounded text-xs font-normal cursor-pointer flex items-center gap-1.5 ${
                          isDone 
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Reopen Subtask' : 'Mark Completed'}</span>
                      </button>

                      {!isEditingSubtaskDetails && (
                        <button
                          type="button"
                          onClick={() => setIsEditingSubtaskDetails(true)}
                          className="px-2.5 py-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Notes / ARN</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditingSubtaskDetails ? (
                    <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-200 space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-indigo-900 block mb-0.5">
                          Subtask Execution Notes:
                        </label>
                        <input
                          type="text"
                          value={subtaskNoteInput}
                          onChange={(e) => setSubtaskNoteInput(e.target.value)}
                          placeholder="e.g. Verified with bank statement and ledger vouchers..."
                          className="w-full p-1.5 border border-indigo-200 rounded text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-indigo-900 block mb-0.5">
                          Filing ARN / Challan Reference:
                        </label>
                        <input
                          type="text"
                          value={subtaskDocInput}
                          onChange={(e) => setSubtaskDocInput(e.target.value)}
                          placeholder="e.g. ARN: AA0708240019208"
                          className="w-full p-1.5 border border-indigo-200 rounded text-xs font-mono bg-white"
                        />
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingSubtaskDetails(false)}
                          className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveSubtaskNotes(st.subtaskNumber)}
                          className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Details</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/90">
                        <span className="text-[10px] font-bold text-blue-900 block uppercase tracking-wide">Notes / Status:</span>
                        <p className="text-slate-800 mt-0.5 italic">
                          {st.notes ? `"${st.notes}"` : <span className="text-slate-400 not-italic">No notes recorded.</span>}
                        </p>
                      </div>

                      <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/90">
                        <span className="text-[10px] font-bold text-emerald-900 block uppercase tracking-wide">Filing Reference / ARN:</span>
                        <p className="font-mono text-slate-800 font-semibold mt-0.5 flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{st.documentRef || compliance.arnOrChallanNo || <span className="text-slate-400 font-sans font-normal">Pending generation</span>}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dual Remarks: CFO & Client with Distinct Colorful Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* CFO Remarks */}
        <div className="bg-white rounded-lg p-2.5 border border-indigo-200 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span className="font-bold text-indigo-950 text-xs">CFO Verification Note</span>
            </div>
            {!isEditingCfo && (
              <button
                type="button"
                onClick={() => setIsEditingCfo(true)}
                className="text-[11px] text-indigo-700 hover:text-indigo-950 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{compliance.cfoRemarks ? 'Edit' : '+ Add Note'}</span>
              </button>
            )}
          </div>

          {isEditingCfo ? (
            <form onSubmit={handleSaveCfoRemarks} className="space-y-1.5">
              <textarea
                rows={2}
                value={cfoText}
                onChange={(e) => setCfoText(e.target.value)}
                placeholder="Enter CFO note..."
                className="w-full p-1.5 text-xs rounded border border-indigo-300 bg-white focus:outline-hidden"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingCfo(false)}
                  className="px-2 py-0.5 text-slate-500 hover:bg-indigo-100 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-indigo-700 hover:bg-indigo-800 text-white font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-slate-700 text-[11px] italic bg-indigo-50/50 p-2 rounded border border-indigo-100">
              {compliance.cfoRemarks ? `"${compliance.cfoRemarks}"` : <span className="text-slate-400 not-italic">No CFO note added yet.</span>}
            </p>
          )}
        </div>

        {/* Client Remarks */}
        <div className="bg-white rounded-lg p-2.5 border border-teal-200 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-bold text-teal-950 text-xs">Client Team Note</span>
            </div>
            {!isEditingClient && (
              <button
                type="button"
                onClick={() => setIsEditingClient(true)}
                className="text-[11px] text-teal-700 hover:text-teal-950 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{compliance.clientRemarks ? 'Edit' : '+ Add Note'}</span>
              </button>
            )}
          </div>

          {isEditingClient ? (
            <form onSubmit={handleSaveClientRemarks} className="space-y-1.5">
              <textarea
                rows={2}
                value={clientText}
                onChange={(e) => setClientText(e.target.value)}
                placeholder="Enter client team note..."
                className="w-full p-1.5 text-xs rounded border border-teal-300 bg-white focus:outline-hidden"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingClient(false)}
                  className="px-2 py-0.5 text-slate-500 hover:bg-teal-100 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-slate-700 text-[11px] italic bg-teal-50/50 p-2 rounded border border-teal-100">
              {compliance.clientRemarks ? `"${compliance.clientRemarks}"` : <span className="text-slate-400 not-italic">No client note added yet.</span>}
            </p>
          )}
        </div>
      </div>

      {onClose && (
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Close Subtasks ▲</span>
          </button>
        </div>
      )}
    </div>
  );
};
