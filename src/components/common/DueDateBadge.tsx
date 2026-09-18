import React from 'react';
import { ComplianceItem } from '../../types';
import { nextDueDate, formatDueDate, dueStatus, daysUntilDue } from '../../utils/dueDate';
import { CheckCircle2, AlertTriangle, Clock, Calendar } from 'lucide-react';

interface DueDateBadgeProps {
  item: ComplianceItem;
  className?: string;
  showPrefix?: boolean;
  compact?: boolean;
}

export const DueDateBadge: React.FC<DueDateBadgeProps> = ({
  item,
  className = '',
  showPrefix = true,
  compact = false,
}) => {
  const dueIso = nextDueDate(item);
  const formattedDate = dueIso ? formatDueDate(dueIso) : item.statutoryDueDate;
  const status = dueStatus(item);
  const days = daysUntilDue(item);

  const renderBadge = () => {
    switch (status) {
      case 'filed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Filed</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>{days !== null && days < 0 ? `${Math.abs(days)}d overdue` : 'Overdue'}</span>
          </span>
        );
      case 'due-soon':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `${days}d left`}</span>
          </span>
        );
      case 'upcoming':
      default:
        return days !== null ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{days > 0 ? `In ${days}d` : 'Upcoming'}</span>
          </span>
        ) : null;
    }
  };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="font-mono text-slate-700">{formattedDate}</span>
        {renderBadge()}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-slate-600 font-medium">
        {showPrefix && 'Due: '}
        <strong className="text-slate-900 font-semibold font-mono">{formattedDate}</strong>
      </span>
      {renderBadge()}
    </div>
  );
};
