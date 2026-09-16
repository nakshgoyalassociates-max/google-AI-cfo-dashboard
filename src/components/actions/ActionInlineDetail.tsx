import React, { useState } from 'react';
import { ActionItem, ActionStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Save, 
  Edit3, 
  Trash2, 
  Plus, 
  FileText
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
    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2.5 my-1 text-xs">
      {/* Subtasks directly shown without repeating action heading */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 px-0.5">
          {/* Progressive graph line with colour indication only, no % or milestone ratio */}
          <div className="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completedCount === totalSubtasks && totalSubtasks > 0
                  ? 'bg-emerald-500'
                  : percentage >= 50
                  ? 'bg-indigo-600'
                  : percentage > 0
                  ? 'bg-amber-500'
                  : 'bg-slate-200'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSubtask(!isAddingSubtask)}
            className="text-[11px] text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>Add Milestone</span>
          </button>
        </div>

        {isAddingSubtask && (
          <form onSubmit={handleAddNewSubtask} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200">
            <input
              type="text"
              autoFocus
              placeholder="Milestone description..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
            >
              Add
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

        <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-lg border border-slate-200 overflow-hidden">
          {action.subtasks.length === 0 ? (
            <p className="p-3 text-slate-400 text-center italic">No milestones defined yet.</p>
          ) : (
            action.subtasks.map((st) => {
              const isDone = st.status === 'completed';

              return (
                <div 
                  key={st.id} 
                  className="p-2.5 flex items-center justify-between gap-3 hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span 
                      onClick={() => toggleActionSubtask(action.id, st.subtaskNumber)}
                      title="Click to toggle status"
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 cursor-pointer border ${
                        isDone 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Step {st.subtaskNumber}
                    </span>

                    <span className="font-medium text-slate-900 truncate">
                      {st.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      Target: {st.deadline ? st.deadline.split(' ')[0] : ''}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleActionSubtask(action.id, st.subtaskNumber)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${
                        isDone 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {isDone ? 'Completed ✓' : 'Pending'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Remarks & Stage Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {/* Remarks Box */}
        <div className="md:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Working Notes & Action Remarks</span>
            </span>
            {!isEditingRemarks && (
              <button
                type="button"
                onClick={() => {
                  setRemarksText(action.remarks || '');
                  setIsEditingRemarks(true);
                }}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-0.5 cursor-pointer"
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
                className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingRemarks(false)}
                  className="px-2 py-0.5 text-slate-500 hover:bg-slate-200 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-slate-700 italic bg-white p-2 rounded border border-slate-100 min-h-[30px]">
              {action.remarks ? `"${action.remarks}"` : <span className="text-slate-400 not-italic">No remarks recorded.</span>}
            </p>
          )}
        </div>

        {/* Task Controls: Status & Delete */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Status Update</span>
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
              className="w-full text-xs font-semibold rounded border border-slate-300 px-2 py-1.5 bg-white text-slate-800 focus:outline-hidden"
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
            className="text-slate-400 hover:text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Close Subtasks ▲</span>
          </button>
        </div>
      )}
    </div>
  );
};
