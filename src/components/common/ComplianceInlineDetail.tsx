import React, { useState } from 'react';
import { ComplianceItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Edit3,
  Check,
  X
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
  const percentage = Math.round((completedCount / 3) * 100);

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
    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2.5 my-1 text-xs">
      {/* Subtasks directly shown without repeating compliance heading */}
      <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-lg border border-slate-200 overflow-hidden">
        {compliance.subtasks.map((st) => {
          const isDone = st.status === 'completed';
          const isDrilled = drilledSubtaskId === st.subtaskNumber;

          return (
            <div key={st.id} className="transition-colors">
              {/* Subtask Row Header */}
                <div 
                  onClick={() => handleToggleDrillDown(st.subtaskNumber)}
                  className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-white/80 ${
                    isDrilled ? 'bg-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubtask(compliance.id, st.subtaskNumber);
                      }}
                      title="Click to toggle status"
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 cursor-pointer border ${
                        isDone 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Step {st.subtaskNumber}
                    </span>

                    <div className="truncate">
                      <span className="font-semibold text-slate-900">
                        {st.title}
                      </span>
                      <span className="text-slate-300 mx-1.5">•</span>
                      <span className="text-slate-500 font-medium text-[11px]">
                        {st.assignedTo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      Target: {st.deadline ? st.deadline.split(' ')[0] : ''}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubtask(compliance.id, st.subtaskNumber);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${
                        isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {isDone ? 'Filed / Verified ✓' : 'Pending'}
                    </button>

                    <span className="text-slate-400 p-0.5">
                      {isDrilled ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Subtask drill down */}
                {isDrilled && (
                  <div className="bg-white p-3 border-t border-slate-100 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px]">
                      <div className="text-slate-600 space-y-0.5">
                        <p><strong className="text-slate-700">Stage:</strong> {st.stageName} ({st.assignedTo})</p>
                        <p><strong className="text-slate-700">Target Date:</strong> {st.deadline}</p>
                        {st.completedAt && (
                          <p className="text-emerald-700 font-semibold">Completed: {st.completedAt}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSubtask(compliance.id, st.subtaskNumber)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                            isDone 
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Reopen Milestone' : 'Mark Completed'}</span>
                        </button>

                        {!isEditingSubtaskDetails && (
                          <button
                            type="button"
                            onClick={() => setIsEditingSubtaskDetails(true)}
                            className="px-2 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Notes / ARN</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditingSubtaskDetails ? (
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Subtask Execution Notes:
                          </label>
                          <input
                            type="text"
                            value={subtaskNoteInput}
                            onChange={(e) => setSubtaskNoteInput(e.target.value)}
                            placeholder="e.g. Verified with bank statement and ledger vouchers..."
                            className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Filing ARN / Challan Reference:
                          </label>
                          <input
                            type="text"
                            value={subtaskDocInput}
                            onChange={(e) => setSubtaskDocInput(e.target.value)}
                            placeholder="e.g. ARN: AA0708240019208"
                            className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono bg-white"
                          />
                        </div>

                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsEditingSubtaskDetails(false)}
                            className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveSubtaskNotes(st.subtaskNumber)}
                            className="px-3 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save Details</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Notes / Status:</span>
                          <p className="text-slate-800 mt-0.5 italic">
                            {st.notes ? `"${st.notes}"` : <span className="text-slate-400 not-italic">No notes recorded.</span>}
                          </p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Filing Reference:</span>
                          <p className="font-mono text-slate-800 font-semibold mt-0.5">
                            {st.documentRef || compliance.arnOrChallanNo || <span className="text-slate-400 font-sans font-normal">Pending generation</span>}
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

      {/* Dual Remarks: CFO & Client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* CFO Remarks */}
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span className="font-bold text-slate-900 text-xs">CFO Verification Note</span>
            </div>
            {!isEditingCfo && (
              <button
                type="button"
                onClick={() => setIsEditingCfo(true)}
                className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
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
                className="w-full p-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-hidden"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingCfo(false)}
                  className="px-2 py-0.5 text-slate-500 hover:bg-slate-200 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-slate-700 text-[11px] italic bg-white p-2 rounded border border-slate-100">
              {compliance.cfoRemarks ? `"${compliance.cfoRemarks}"` : <span className="text-slate-400 not-italic">No CFO note added yet.</span>}
            </p>
          )}
        </div>

        {/* Client Remarks */}
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-700" />
              <span className="font-bold text-slate-900 text-xs">Client Team Note</span>
            </div>
            {!isEditingClient && (
              <button
                type="button"
                onClick={() => setIsEditingClient(true)}
                className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
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
                className="w-full p-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-hidden"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingClient(false)}
                  className="px-2 py-0.5 text-slate-500 hover:bg-slate-200 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-slate-700 text-[11px] italic bg-white p-2 rounded border border-slate-100">
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
            className="text-slate-400 hover:text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Close Subtasks ▲</span>
          </button>
        </div>
      )}
    </div>
  );
};
