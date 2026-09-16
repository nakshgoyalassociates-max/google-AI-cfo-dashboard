import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActionPriority, ActionCategory } from '../../types';
import { TEAM_MEMBERS } from '../../data/mockInitialData';
import { X, PlusCircle } from 'lucide-react';

export const NewActionModal: React.FC = () => {
  const { isNewActionModalOpen, setIsNewActionModalOpen, addAction } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActionCategory>('Banking & Treasury');
  const [assignedTo, setAssignedTo] = useState(TEAM_MEMBERS[0].name);
  const [priority, setPriority] = useState<ActionPriority>('High');
  const [fixedDeadline, setFixedDeadline] = useState('2026-09-25 18:00');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [remarks, setRemarks] = useState('');

  if (!isNewActionModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addAction({
      title: title.trim(),
      description: description.trim(),
      category,
      assignedTo,
      priority,
      status: 'Pending',
      fixedDeadline,
      estimatedHours: Number(estimatedHours) || 0,
      remarks: remarks.trim() || undefined
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setRemarks('');
    setIsNewActionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Departmental Operational Work
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Create New Action Task / Pendency
            </h2>
            <p className="text-xs text-slate-500">
              Assign a routine non-compliance accounting task with a fixed target deadline.
            </p>
          </div>
          <button
            onClick={() => setIsNewActionModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bank Reconciliation Statement for HDFC Current A/c"
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions or context for the accountant..."
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActionCategory)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Banking & Treasury">Banking & Treasury</option>
                <option value="Accounts Payable">Accounts Payable (Vendor)</option>
                <option value="Accounts Receivable">Accounts Receivable (Debtors)</option>
                <option value="Financial Reporting & MIS">Financial Reporting & MIS</option>
                <option value="General Ledger & Fixed Assets">General Ledger & Fixed Assets</option>
                <option value="Payroll & HR Ops">Payroll & HR Ops</option>
                <option value="Internal Audit & Controls">Internal Audit & Controls</option>
                <option value="Direct/Indirect Tax Ops">Direct/Indirect Tax Ops</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActionPriority)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Urgent">Urgent (Immediate)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fixed Target Deadline
              </label>
              <input
                type="text"
                value={fixedDeadline}
                onChange={(e) => setFixedDeadline(e.target.value)}
                placeholder="YYYY-MM-DD HH:MM"
                className="w-full p-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Notes / Pre-requisites
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Bank statement downloaded from netbanking portal..."
              className="w-full p-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewActionModalOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
