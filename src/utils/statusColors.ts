import { ComplianceItem, ActionItem, SubTask, ActionSubtask } from '../types';
import { isComplianceFiled, daysUntilDue } from './dueDate';

export type FourColorStatus = 'completed' | 'in_process' | 'overdue' | 'not_due';

export interface StuckInfo {
  isStuck: boolean;
  status: FourColorStatus;
  label: string;
  stepNumber?: number | null;
  stepName?: string | null;
  stepTitle?: string | null;
  assignee?: string | null;
  deadline?: string | null;
  totalSteps?: number;
  completedSteps?: number;
}

/**
 * Evaluates the 4-color status for a Statutory Compliance Item:
 * - 'completed': All 3 subtasks completed or filed (Green)
 * - 'overdue': Deadline passed and not completed (Red)
 * - 'in_process': Work started / in draft / in CFO review (Orange)
 * - 'not_due': Not due or applicable currently / upcoming with no work started (Without colour)
 */
export function getComplianceFourColorStatus(item: ComplianceItem): FourColorStatus {
  const isFiled = isComplianceFiled(item) || (item.subtasks && item.subtasks.every(s => s && s.status === 'completed'));
  if (isFiled) {
    return 'completed';
  }

  const days = daysUntilDue(item);
  const isOverdue = days !== null && days < 0;
  if (isOverdue) {
    return 'overdue';
  }

  const subtasksList: SubTask[] = item.subtasks ? [...item.subtasks] : [];
  const completedCount = subtasksList.filter(s => s && s.status === 'completed').length;
  const hasNotes = subtasksList.some(s => Boolean(s?.notes && s.notes.trim().length > 0));
  const hasRemarks = Boolean((item.cfoRemarks && item.cfoRemarks.trim().length > 0) || (item.clientRemarks && item.clientRemarks.trim().length > 0));

  if (completedCount > 0 || hasNotes || hasRemarks) {
    return 'in_process';
  }

  return 'not_due';
}

/**
 * Returns detailed bottleneck info indicating where the compliance task is stuck
 */
export function getComplianceStuckInfo(item: ComplianceItem): StuckInfo {
  const status = getComplianceFourColorStatus(item);
  const subtasksList: SubTask[] = item.subtasks ? [...item.subtasks] : [];
  const completedCount = subtasksList.filter(s => s && s.status === 'completed').length;

  if (status === 'completed') {
    return {
      isStuck: false,
      status: 'completed',
      label: 'All subtasks completed',
      stepNumber: null,
      stepName: 'Completed',
      stepTitle: item.arnOrChallanNo ? `ARN: ${item.arnOrChallanNo}` : 'Completed',
      assignee: null,
      totalSteps: 3,
      completedSteps: 3
    };
  }

  // Find the first pending subtask (this is where the item is actively blocked/stuck)
  const pendingStep = subtasksList.find(s => s && s.status === 'pending') || subtasksList[0];
  const stepNum = pendingStep?.subtaskNumber || 1;

  if (status === 'overdue') {
    return {
      isStuck: true,
      status: 'overdue',
      label: `Overdue at Subtask ${stepNum}`,
      stepNumber: stepNum,
      stepName: `Subtask ${stepNum}`,
      stepTitle: `Subtask ${stepNum}`,
      assignee: pendingStep?.assignedTo || '',
      deadline: pendingStep?.deadline || '',
      totalSteps: 3,
      completedSteps: completedCount
    };
  }

  if (status === 'in_process') {
    return {
      isStuck: true,
      status: 'in_process',
      label: `Stuck at Subtask ${stepNum}${pendingStep?.assignedTo ? ` • ${pendingStep.assignedTo}` : ''}`,
      stepNumber: stepNum,
      stepName: `Subtask ${stepNum}`,
      stepTitle: `Subtask ${stepNum}`,
      assignee: pendingStep?.assignedTo || '',
      deadline: pendingStep?.deadline || '',
      totalSteps: 3,
      completedSteps: completedCount
    };
  }

  // Not due or applicable currently
  return {
    isStuck: false,
    status: 'not_due',
    label: `Not due currently • Subtask ${stepNum}`,
    stepNumber: stepNum,
    stepName: `Subtask ${stepNum}`,
    stepTitle: `Subtask ${stepNum}`,
    assignee: pendingStep?.assignedTo || '',
    deadline: pendingStep?.deadline || '',
    totalSteps: 3,
    completedSteps: 0
  };
}

/**
 * Evaluates the 4-color status for an Operational Action Task Item:
 * - 'completed': Task status is Completed or all milestones done (Light Green)
 * - 'overdue': Deadline passed and not completed (Red)
 * - 'in_process': Status is In Progress / Under Review or milestones completed (Light Orange)
 * - 'not_due': Pending, deadline in future, no work started (Without colour)
 */
export function getActionFourColorStatus(item: ActionItem): FourColorStatus {
  const subtasks = item.subtasks || [];
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(s => s && s.status === 'completed').length;

  if (item.status === 'Completed' || (totalSubtasks > 0 && completedSubtasks === totalSubtasks)) {
    return 'completed';
  }

  const now = new Date();
  const d = new Date(item.fixedDeadline);
  const isOverdue = !isNaN(d.getTime()) && d < now;
  if (isOverdue) {
    return 'overdue';
  }

  if (
    item.status === 'In Progress' ||
    item.status === 'Under Review' ||
    completedSubtasks > 0 ||
    Boolean(item.remarks && item.remarks.trim().length > 0)
  ) {
    return 'in_process';
  }

  return 'not_due';
}

/**
 * Returns detailed bottleneck info indicating where the action task is stuck
 */
export function getActionStuckInfo(item: ActionItem): StuckInfo {
  const status = getActionFourColorStatus(item);
  const subtasks = item.subtasks || [];
  const totalSubtasks = subtasks.length;
  const completedCount = subtasks.filter(s => s && s.status === 'completed').length;

  if (status === 'completed') {
    return {
      isStuck: false,
      status: 'completed',
      label: 'All subtasks completed',
      stepNumber: null,
      stepName: 'Completed',
      assignee: null,
      totalSteps: totalSubtasks,
      completedSteps: totalSubtasks
    };
  }

  // Check subtasks if any exist
  const pendingSubtask = subtasks.find(s => s && s.status === 'pending');

  if (pendingSubtask) {
    const isOverdue = status === 'overdue';
    return {
      isStuck: true,
      status,
      label: `${isOverdue ? 'Overdue' : 'Stuck'} at Subtask ${pendingSubtask.subtaskNumber}${item.assignedTo ? ` • ${item.assignedTo}` : ''}`,
      stepNumber: pendingSubtask.subtaskNumber,
      stepName: `Subtask ${pendingSubtask.subtaskNumber}`,
      stepTitle: pendingSubtask.title,
      assignee: item.assignedTo,
      deadline: item.fixedDeadline,
      totalSteps: totalSubtasks,
      completedSteps: completedCount
    };
  }

  // If task has no granular subtasks, indicate stage directly
  if (status === 'overdue') {
    return {
      isStuck: true,
      status: 'overdue',
      label: `Overdue with ${item.assignedTo} (${item.assignedRole})`,
      stepNumber: null,
      stepName: item.status,
      stepTitle: item.title,
      assignee: item.assignedTo,
      deadline: item.fixedDeadline,
      totalSteps: 1,
      completedSteps: 0
    };
  }

  if (status === 'in_process') {
    return {
      isStuck: true,
      status: 'in_process',
      label: `In Process with ${item.assignedTo} (${item.status})`,
      stepNumber: null,
      stepName: item.status,
      stepTitle: item.title,
      assignee: item.assignedTo,
      deadline: item.fixedDeadline,
      totalSteps: 1,
      completedSteps: 0
    };
  }

  return {
    isStuck: false,
    status: 'not_due',
    label: `Not Due Yet • Scheduled with ${item.assignedTo}`,
    stepNumber: null,
    stepName: 'Pending',
    stepTitle: item.title,
    assignee: item.assignedTo,
    deadline: item.fixedDeadline,
    totalSteps: 1,
    completedSteps: 0
  };
}

/**
 * Returns plain CSS class names for row background and border.
 * Keeps rows plain and neutral without color, as requested by user.
 */
export function getLineItemRowClasses(_status?: FourColorStatus, isExpanded: boolean = false): string {
  return isExpanded
    ? 'bg-slate-50 border-b border-slate-200 text-slate-900'
    : 'bg-white hover:bg-slate-50/80 border-b border-slate-200 text-slate-900';
}
