export type Role = 'cfo' | 'client' | 'client_team';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  companyId: string; // 'all' for CFO, specific company id for client and client team
  companyName: string;
  avatar: string;
}

export type ComplianceCategory = 
  | 'GST'
  | 'TDS / TCS'
  | 'Income Tax'
  | 'ROC / MCA'
  | 'PF / ESI'
  | 'Professional Tax & State';

export type SubtaskStatus = 'pending' | 'completed';

export interface SubTask {
  id: string;
  subtaskNumber: 1 | 2 | 3;
  title: string;
  stageName: 'Team Draft' | 'CFO Review' | 'Filing & Payment';
  assignedTo: string;
  assignedRole: string;
  deadline: string;
  status: SubtaskStatus;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  documentRef?: string;
}

export interface ComplianceItem {
  id: string;
  companyId?: string;
  sNo: number;
  category: ComplianceCategory;
  name: string;
  applicability: string;
  frequency: 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Annual' | 'Event-based' | 'Ongoing / Transaction-based';
  statutoryDueDate: string;
  type: 'Return' | 'Payment' | 'Return + Payment' | 'Payment + Return' | 'Filing' | 'Certification' | 'Application' | 'Audit Report' | 'Certificate' | 'Governance' | 'Ongoing Monitoring' | 'Renewal';
  penaltyClause: string;
  subtasks: [SubTask, SubTask, SubTask];
  period: string; // e.g. "August 2026", "Q2 FY 24-25"
  arnOrChallanNo?: string;
  taxAmount?: number;
  criticality: 'High' | 'Critical' | 'Medium' | 'Low';
  cfoRemarks?: string;
  cfoRemarksAuthor?: string;
  cfoRemarksUpdatedAt?: string;
  clientRemarks?: string;
  clientRemarksAuthor?: string;
  clientRemarksUpdatedAt?: string;
}

export type ActionCategory = 
  | 'Accounts Payable'
  | 'Accounts Receivable'
  | 'Banking & Treasury'
  | 'Financial Reporting & MIS'
  | 'General Ledger & Fixed Assets'
  | 'Payroll & HR Ops'
  | 'Internal Audit & Controls'
  | 'Direct/Indirect Tax Ops';

export type ActionPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type ActionStatus = 'Pending' | 'In Progress' | 'Under Review' | 'Completed';

export interface ActionSubtask {
  id: string;
  subtaskNumber: number;
  title: string;
  status: SubtaskStatus;
  notes?: string;
  documentRef?: string;
  completedAt?: string;
}

export interface ActionItem {
  id: string;
  companyId?: string;
  title: string;
  description: string;
  category: ActionCategory;
  assignedTo: string;
  assignedToEmail?: string;
  assignedRole: string;
  priority: ActionPriority;
  status: ActionStatus;
  fixedDeadline: string; // e.g. "2026-09-20 17:00"
  estimatedHours?: number;
  timeSpentHours?: number;
  createdAt: string;
  completedAt?: string;
  remarks: string;
  blockedReason?: string;
  subtasks?: ActionSubtask[];
}

export interface ClientProfile {
  id: string;
  companyName: string;
  legalEntity: string;
  gstin: string;
  pan: string;
  cin: string;
  financialYear: string;
  cfoName: string;
  cfoFirm: string;
  sector?: string;
}

export interface FinancialMIS {
  period: string;
  monthlyRevenue: number;
  revenueGrowthMoM: number;
  grossMarginPercent: number;
  ebitda: number;
  ebitdaMarginPercent: number;
  netProfit: number;
  cashAndBankBalance: number;
  monthlyBurnRate: number;
  cashRunwayMonths: number;
  totalDebtors: number;
  debtorsOver90Days: number;
  debtorDaysDSO: number;
  totalCreditors: number;
  creditorsOver45Days: number; // MSME warning
  workingCapital: number;
  quickRatio: number;
  cfoExecutiveSummary: string;
  cfoKeyAlerts: string[];
}

export interface FilterOptions {
  category: string;
  status: string;
  assignee: string;
  searchQuery: string;
  frequency: string;
}

export interface CompanyOverviewSummary {
  companyId: string;
  companyName: string;
  entityType: string;
  gstin: string;
  sector: string;
  compliancePercentage: number;
  fullyCompletedCompliances: number;
  totalCompliances: number;
  pendingCfoReviews: number;
  pendingActions: number;
  overdueActions: number;
  monthlyRevenue: number;
  cashRunwayMonths: number;
  taxPaid: number;
  taxPending: number;
  nextUpcomingDeadline: string;
  company: ClientProfile;
  complianceStats: {
    overallCompliancePercentage: number;
    fullyCompletedCompliances: number;
    totalCompliances: number;
    cfoReviewPendingCount: number;
    openActionsCount: number;
    overdueActionsCount: number;
    taxPaid: number;
    taxPending: number;
  };
  mis: FinancialMIS;
}

