import React from 'react';
import { ComplianceItem } from '../../types';
import { getComplianceFourColorStatus, getComplianceStuckInfo } from '../../utils/statusColors';
import { 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  ChevronRight
} from 'lucide-react';

interface ComplianceSubtaskProgressIconsProps {
  compliance: ComplianceItem;
  compact?: boolean;
}

export const ComplianceSubtaskProgressIcons: React.FC<ComplianceSubtaskProgressIconsProps> = ({ 
  compliance,
  compact = false 
}) => {
  const status = getComplianceFourColorStatus(compliance);
  const stuckInfo = getComplianceStuckInfo(compliance);
  const subtasks = compliance.subtasks || [];

  const stageIcons = [
    { num: 1, name: 'Subtask 1', role: subtasks[0]?.assignedTo || 'Accounts Team' },
    { num: 2, name: 'Subtask 2', role: subtasks[1]?.assignedTo || 'Virtual CFO' },
    { num: 3, name: 'Subtask 3', role: subtasks[2]?.assignedTo || 'Tax Desk' }
  ];

  return (
    <div className="flex flex-col gap-0.5 py-0" onClick={(e) => e.stopPropagation()}>
      {/* 3 Step Visual Pipeline with Subtask Icons */}
      <div className="flex items-center gap-1.5">
        {stageIcons.map((step, idx) => {
          const st = subtasks[idx];
          const isDone = st && st.status === 'completed';
          const isStuckHere = stuckInfo.isStuck && stuckInfo.stepNumber === step.num;

          let iconContainerClasses = 'w-4.5 h-4.5 rounded flex items-center justify-center transition-colors text-[9.5px] ';
          let iconElement = null;

          if (isDone) {
            // Hard vivid green sign for completed
            iconContainerClasses += 'bg-green-600 text-white shadow-2xs';
            iconElement = <Check className="w-2.5 h-2.5 stroke-[2.5]" />;
          } else if (isStuckHere) {
            if (status === 'overdue') {
              // Hard vivid red sign for overdue
              iconContainerClasses += 'bg-red-600 text-white shadow-2xs';
              iconElement = <AlertTriangle className="w-2.5 h-2.5 stroke-[2]" />;
            } else {
              // Hard vivid orange sign for in-process stuck
              iconContainerClasses += 'bg-orange-500 text-white shadow-2xs';
              iconElement = <AlertCircle className="w-2.5 h-2.5 stroke-[2]" />;
            }
          } else {
            // Neutral upcoming step
            iconContainerClasses += 'bg-slate-100 text-slate-500 border border-slate-300';
            iconElement = <span className="text-[9px] font-normal">{step.num}</span>;
          }

          return (
            <React.Fragment key={step.num}>
              {/* Step Icon with Tooltip */}
              <div 
                className="group relative flex items-center"
                title={`${step.name} - ${isDone ? 'Completed' : isStuckHere ? `Stuck here (${st?.assignedTo || step.role})` : 'Pending'}`}
              >
                <div className={iconContainerClasses}>
                  {iconElement}
                </div>

                {/* Subtask Mini Label (visible in non-compact mode) - No bold text */}
                {!compact && (
                  <span className="ml-1 text-[10px] font-normal hidden md:inline leading-none text-slate-600">
                    {step.name}
                  </span>
                )}
              </div>

              {/* Connecting arrow between steps */}
              {idx < stageIcons.length - 1 && (
                <ChevronRight className={`w-2.5 h-2.5 shrink-0 ${
                  subtasks[idx]?.status === 'completed' ? 'text-green-600' : 'text-slate-300'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Simple and Crisp Bottleneck Status (Where Stuck) - No bold text, hard indicator dot */}
      <div className="text-[10.5px] leading-tight font-normal text-slate-700">
        {status === 'completed' && (
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-green-600 shrink-0"></span>
            <span>All subtasks completed</span>
          </div>
        )}

        {status === 'overdue' && (
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
            <span>Stuck at Subtask {stuckInfo.stepNumber} • Overdue</span>
          </div>
        )}

        {status === 'in_process' && (
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
            <span>Stuck at Subtask {stuckInfo.stepNumber}{stuckInfo.assignee ? ` • ${stuckInfo.assignee}` : ''}</span>
          </div>
        )}

        {status === 'not_due' && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
            <span>Not due currently</span>
          </div>
        )}
      </div>
    </div>
  );
};
