import React, { useState } from 'react';
import { ActionItem, ActionStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDueDate } from '../../utils/dueDate';
import { 
  Save, 
  Edit3, 
  Trash2, 
  Plus, 
  FileText,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ActionInlineDetailProps {
  action: ActionItem;
  onClose?: () => void;
}

export const ActionInlineDetail: React.FC<ActionInlineDetailProps> = ({ action, onClose }) => {
  const { 
    updateAction, 
    deleteAction, 
    toggleActionSubtask, 
    addActionSubtask 
  } = useApp();

  const subtasks = action.subtasks || [];
  const completedCount = subtasks.filter(s => s.status === 'completed').length;
  const totalSubtasks = subtasks.length;
  const percentage = totalSubtasks > 0 ? Math.round((completedCount / totalSubtasks) * 100) : (action.status === 'Completed' ? 100 : 0);
  const isAllDone = totalSubtasks > 0 ? completedCount === totalSubtasks : action.status === 'Completed';

  // New subtask input state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Remarks local editing state
  const [remarksText, setRemarksText] = useState(action.remarks || '');
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);

  const now = new Date();
  const deadlineDate = new Date(action.fixedDeadline);
  const isOverdue = action.status !== 'Completed' && !isNaN(deadlineDate.getTime()) && deadlineDate < now;

  const handleAddNewSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addActionSubtask(action.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const handleSaveRemarks = (e: React.FormEvent) => {
    e.preventDefault();
    updateAction({
      ...action,
      remarks: remarksText.trim()
    });
    setIsEditingRemarks(false);
  };

  const handleStatusChange = (newStatus: ActionStatus) => {
    updateAction({
      ...action,
      status: newStatus
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 rounded-xl p-3.5 border-2 border-indigo-200 shadow-md space-y-3 my-1 text-xs ring-2 ring-indigo-500/10">
      {/* Colorful Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-950 text-xs tracking-tight">Subtasks & Bottleneck Execution Pipeline</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-100/90 text-indigo-800 font-medium">
                {action.category || 'Action Item'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-normal">
              Track progress, resolve bottlenecks, and update status below.
            </p>
          </div>
        </div>

        {/* Status Callout Badge & Add Button */}
        <div className="flex items-center gap-2">
          {isAllDone ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-green-600 text-white flex items-center gap-1.5 font-medium shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> All {totalSubtasks} Subtasks Completed
            </span>
          ) : isOverdue ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-red-600 text-white flex items-center gap-1.5 font-medium shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Overdue • {completedCount}/{totalSubtasks} Done
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-orange-500 text-white flex items-center gap-1.5 font-medium shadow-2xs">
              <Clock className="w-3.5 h-3.5" /> In Process • {completedCount}/{totalSubtasks} Done
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsAddingSubtask(!isAddingSubtask)}
            className="px-2.5 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            <span>Add Subtask</span>
          </button>
        </div>
      </div>

      {/* Progressive Graph Line */}
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-[10px] text-indigo-900 font-semibold uppercase tracking-wider shrink-0">Progress:</span>
        <div className="flex-1 h-2 bg-indigo-100/80 rounded-full overflow-hidden border border-indigo-200/50">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isAllDone
                ? 'bg-green-600'
                : isOverdue
                ? 'bg-red-500'
                : percentage > 0
                ? 'bg-orange-500'
                : 'bg-slate-200'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[11px] text-indigo-950 font-semibold shrink-0">{percentage}%</span>
      </div>

      {isAddingSubtask && (
        <form onSubmit={handleAddNewSubtask} className="flex items-center gap-2 bg-indigo-50/70 p-2 rounded-lg border border-indigo-200">
          <input
            type="text"
            autoFocus
            placeholder="New subtask description..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="flex-1 px-2.5 py-1 text-xs border border-indigo-200 rounded-md bg-white focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium cursor-pointer"
          >
            Add Subtask
          </button>
          <button
            type="button"
            onClick={() => setIsAddingSubtask(false)}
            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Subtasks List with Colorful Cards */}
      <div className="space-y-2">
        {action.subtasks.length === 0 ? (
          <p className="p-3 text-slate-400 text-center italic bg-white rounded-lg border border-slate-200">
            No subtasks defined yet. Click "Add Subtask" above to define steps.
          </p>
        ) : (
          action.subtasks.map((st) => {
            const isDone = st.status === 'completed';
            const isStuckHere = !isDone && (st.subtaskNumber === 1 || action.subtasks.find(s => s.subtaskNumber === st.subtaskNumber - 1)?.status === 'completed');

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
              <div 
                key={st.id} 
                className={`p-2.5 rounded-lg border transition-all ${cardStyle} flex items-center justify-between gap-3 shadow-2xs`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span 
                    onClick={() => toggleActionSubtask(action.id, st.subtaskNumber)}
                    title="Click to toggle status"
                    className={`px-2 py-0.5 rounded text-[10px] font-normal shrink-0 cursor-pointer border ${badgeStyle}`}
                  >
                    Subtask {st.subtaskNumber}
                  </span>

                  <span className="font-semibold text-slate-900 truncate">
                    {st.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    Target: {st.deadline ? formatDueDate(st.deadline) : ''}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleActionSubtask(action.id, st.subtaskNumber)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-normal border cursor-pointer transition-colors ${buttonStyle}`}
                    title="Click to toggle status"
                  >
                    {isDone ? 'Completed ✓' : isStuckHere ? (isOverdue ? 'Overdue ⚠' : 'In Process !') : 'Pending'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Remarks & Stage Management with Colorful Styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-indigo-100">
        {/* Remarks Box */}
        <div className="md:col-span-2 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-700" />
              <span>Working Notes & Action Remarks</span>
            </span>
            {!isEditingRemarks && (
              <button
                type="button"
                onClick={() => {
                  setRemarksText(action.remarks || '');
                  setIsEditingRemarks(true);
                }}
                className="text-[11px] text-indigo-700 hover:text-indigo-950 font-medium flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{action.remarks ? 'Edit' : '+ Add Note'}</span>
              </button>
            )}
          </div>

          {isEditingRemarks ? (
            <form onSubmit={handleSaveRemarks} className="space-y-1.5">
              <textarea
                rows={2}
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                placeholder="Enter accountant notes or update status..."
                className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white focus:outline-hidden"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingRemarks(false)}
                  className="px-2 py-0.5 text-slate-500 hover:bg-indigo-100 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-slate-700 italic bg-white/80 p-2 rounded border border-indigo-100 min-h-[30px]">
              {action.remarks ? `"${action.remarks}"` : <span className="text-slate-400 not-italic">No remarks recorded.</span>}
            </p>
          )}
        </div>

        {/* Task Controls: Status & Delete */}
        <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-950">Status Update</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete action task "${action.title}"?`)) {
                  deleteAction(action.id);
                }
              }}
              title="Delete task"
              className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>

          <div>
            <select
              value={action.status}
              onChange={(e) => handleStatusChange(e.target.value as ActionStatus)}
              className="w-full text-xs font-semibold rounded border border-blue-200 px-2 py-1.5 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="pt-1 text-[11px] text-slate-500">
            Due: <strong className="text-slate-700">{action.fixedDeadline ? action.fixedDeadline.split(' ')[0] : ''}</strong>
          </div>
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
