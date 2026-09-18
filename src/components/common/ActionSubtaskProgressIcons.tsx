import React from 'react';
import { ActionItem } from '../../types';
import { getActionFourColorStatus, getActionStuckInfo } from '../../utils/statusColors';
import { 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  ChevronRight,
  ListTodo
} from 'lucide-react';

interface ActionSubtaskProgressIconsProps {
  action: ActionItem;
  compact?: boolean;
}

export const ActionSubtaskProgressIcons: React.FC<ActionSubtaskProgressIconsProps> = ({
  action,
  compact = false
}) => {
  const status = getActionFourColorStatus(action);
  const stuckInfo = getActionStuckInfo(action);
  const subtasks = action.subtasks || [];

  return (
    <div className="flex flex-col gap-0.5 py-0" onClick={(e) => e.stopPropagation()}>
      {/* Subtask pipeline if subtasks exist */}
      {subtasks.length > 0 ? (
        <div className="flex items-center gap-1.5 flex-wrap">
          {subtasks.map((st, idx) => {
            const isDone = st.status === 'completed';
            const isStuckHere = stuckInfo.isStuck && stuckInfo.stepNumber === st.subtaskNumber;

            let containerClasses = 'w-4 h-4 rounded flex items-center justify-center text-[9px] font-normal transition-colors ';
            let iconElement = null;

            if (isDone) {
              // Hard vivid green sign for completed
              containerClasses += 'bg-green-600 text-white shadow-2xs';
              iconElement = <Check className="w-2.5 h-2.5 stroke-[2.5]" />;
            } else if (isStuckHere) {
              if (status === 'overdue') {
                // Hard vivid red sign for overdue
                containerClasses += 'bg-red-600 text-white shadow-2xs';
                iconElement = <AlertTriangle className="w-2.5 h-2.5 stroke-[2]" />;
              } else {
                // Hard vivid orange sign for in-process stuck
                containerClasses += 'bg-orange-500 text-white shadow-2xs';
                iconElement = <AlertCircle className="w-2.5 h-2.5 stroke-[2]" />;
              }
            } else {
              // Neutral upcoming subtask
              containerClasses += 'bg-slate-100 text-slate-500 border border-slate-300';
              iconElement = <span>{st.subtaskNumber}</span>;
            }

            return (
              <React.Fragment key={st.id || idx}>
                <div 
                  className="flex items-center"
                  title={`Subtask ${st.subtaskNumber}: ${st.title} - ${isDone ? 'Completed' : isStuckHere ? 'Stuck here' : 'Pending'}`}
                >
                  <div className={containerClasses}>
                    {iconElement}
                  </div>
                  {!compact && (
                    <span className="ml-1 text-[9.5px] font-normal hidden lg:inline max-w-[85px] truncate leading-none text-slate-600">
                      Subtask {st.subtaskNumber}
                    </span>
                  )}
                </div>

                {idx < subtasks.length - 1 && (
                  <ChevronRight className={`w-2.5 h-2.5 shrink-0 ${
                    subtasks[idx]?.status === 'completed' ? 'text-green-600' : 'text-slate-300'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        /* If no granular subtasks, show task stage indicator */
        <div className="flex items-center gap-1.5 text-[10px] leading-tight font-normal">
          <span className="text-slate-400 text-[9.5px] flex items-center gap-1">
            <ListTodo className="w-2.5 h-2.5 stroke-[1.5]" />
            <span>Task status:</span>
          </span>
          <span className="text-slate-600">{action.status}</span>
        </div>
      )}

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
            <span className="truncate max-w-xs">{stuckInfo.label}</span>
          </div>
        )}

        {status === 'in_process' && (
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
            <span className="truncate max-w-xs">{stuckInfo.label}</span>
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
