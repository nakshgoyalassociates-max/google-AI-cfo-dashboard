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

export interface BalanceSheetData {
  asOfDate: string;
  previousDate: string;
  equityAndLiabilities: {
    // 1. Shareholders' Funds
    shareCapital: number;
    reservesAndSurplus: number;
    totalShareholdersFunds: number;
    // 2. Non-Current Liabilities
    longTermBorrowings: number;
    deferredTaxLiabilities: number;
    otherLongTermLiabilities: number;
    totalNonCurrentLiabilities: number;
    // 3. Current Liabilities
    shortTermBorrowings: number;
    tradePayables: number;
    tradePayablesMsme: number;
    otherCurrentLiabilities: number;
    shortTermProvisions: number;
    totalCurrentLiabilities: number;
    // Total Equity & Liabilities
    totalEquityAndLiabilities: number;
  };
  assets: {
    // 1. Non-Current Assets
    propertyPlantEquipment: number;
    accumulatedDepreciation: number;
    netPpe: number;
    capitalWorkInProgress: number;
    intangibleAssets: number;
    nonCurrentInvestments: number;
    longTermLoansAndAdvances: number;
    totalNonCurrentAssets: number;
    // 2. Current Assets
    inventories: number;
    tradeReceivables: number;
    allowanceForDoubtfulDebts: number;
    netTradeReceivables: number;
    cashAndCashEquivalents: number;
    bankBalancesOther: number;
    shortTermLoansAndAdvances: number;
    otherCurrentAssets: number;
    totalCurrentAssets: number;
    // Total Assets
    totalAssets: number;
  };
  previousYearComparison?: {
    totalEquityAndLiabilities: number;
    totalAssets: number;
    workingCapital: number;
    netWorth: number;
  };
}

export interface PnlLineItem {
  id: string;
  particulars: string;
  noteRef?: string;
  currentMonth: number;
  previousMonth: number;
  ytdCurrentYear: number;
  momGrowthPct?: number;
  pctOfRevenue: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
}

export interface PnlStatementData {
  period: string;
  comparisonPeriod: string;
  financialYear: string;
  income: {
    revenueFromOperations: number;
    otherIncome: number;
    totalIncome: number;
  };
  expenses: {
    costOfMaterialsOrDirectCosts: number;
    employeeBenefitsExpense: number;
    financeCosts: number;
    depreciationAndAmortization: number;
    cloudAndInfrastructureCosts?: number;
    salesAndMarketingCosts?: number;
    otherExpenses: number;
    totalExpenses: number;
  };
  profitability: {
    grossProfit: number;
    grossMarginPercent: number;
    ebitda: number;
    ebitdaMarginPercent: number;
    pbt: number;
    pbtMarginPercent: number;
    currentTax: number;
    deferredTax: number;
    pat: number;
    patMarginPercent: number;
  };
  lineItems: PnlLineItem[];
}

export interface DebtorRecord {
  id: string;
  customerName: string;
  entityType?: string;
  gstin?: string;
  creditPeriodDays: number;
  totalOutstanding: number;
  bucket0to30: number;
  bucket31to60: number;
  bucket61to90: number;
  bucket91to180: number;
  bucketAbove180: number;
  lastPaymentDate: string;
  lastPaymentAmount?: number;
  dsoDays: number;
  riskRating: 'Low' | 'Medium' | 'High';
  status: 'Current' | 'Reminder Sent' | 'Escalated to CFO' | 'Promise to Pay' | 'Legal Notice' | 'Audit Confirmation Reconciled';
  followUpNotes?: string;
  assignedManager?: string;
}

export interface DebtorAgeingData {
  asOfDate: string;
  totalReceivables: number;
  daysSalesOutstanding: number;
  overduePercentage: number;
  provisionForBadDebts: number;
  buckets: {
    days0to30: { amount: number; percentage: number; count: number };
    days31to60: { amount: number; percentage: number; count: number };
    days61to90: { amount: number; percentage: number; count: number };
    days91to180: { amount: number; percentage: number; count: number };
    daysAbove180: { amount: number; percentage: number; count: number };
  };
  topDebtors: DebtorRecord[];
}

export interface WorkingCapitalChangeItem {
  id: string;
  particulars: string;
  category: 'Current Asset' | 'Current Liability';
  previousPeriod: number;
  currentPeriod: number;
  effect: 'Increase in Working Capital' | 'Decrease in Working Capital';
  effectAmount: number;
}

export interface FundFlowData {
  period: string;
  sources: {
    fundsFromOperations: number; // Net Profit + Non cash adjustments
    issueOfShareCapital: number;
    longTermBorrowingsRaised: number;
    saleOfFixedAssets: number;
    decreaseInWorkingCapital?: number;
    totalSources: number;
  };
  applications: {
    purchaseOfFixedAssets: number; // Capex
    repaymentOfLongTermBorrowings: number;
    paymentOfTaxAndAdvanceTax: number;
    paymentOfDividendsOrDrawings: number;
    increaseInWorkingCapital?: number;
    totalApplications: number;
  };
  netMovementOfFunds: number;
  openingCashAndBank: number;
  closingCashAndBank: number;
  workingCapitalSchedule: {
    totalCurrentAssetsPrevious: number;
    totalCurrentAssetsCurrent: number;
    totalCurrentLiabilitiesPrevious: number;
    totalCurrentLiabilitiesCurrent: number;
    workingCapitalPrevious: number;
    workingCapitalCurrent: number;
    netChangeInWorkingCapital: number;
    netChangeType: 'Increase' | 'Decrease';
    items: WorkingCapitalChangeItem[];
  };
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
  // Broad Balance Sheet, PnL, Debtor Ageing, and Fund Flow
  balanceSheet?: BalanceSheetData;
  pnlStatement?: PnlStatementData;
  debtorAgeing?: DebtorAgeingData;
  fundFlow?: FundFlowData;
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

export interface CriticalDelayedItem {
  id: string;
  type: 'compliance' | 'action' | 'invoice';
  companyId: string;
  companyName: string;
  title: string;
  category: string;
  severity: 'Critical' | 'Delayed' | 'Overdue';
  deadlineOrAge: string;
  assigneeOrDept: string;
  penaltyOrRisk: string;
  financialAmount?: number;
  stageInfo?: string;
  cfoReviewPending?: boolean;
}

export type InvoiceCategory = 
  | 'Fabric'
  | 'Job Work External'
  | 'Job Work Internal'
  | 'Admin / Utility';

export type InvoiceStage = 
  | 'guard'             // 1. Receipt by Guard / Gatekeeper
  | 'grn_qc'            // 2. GRN & Quality Check Dept
  | 'erp'               // 3. ERP Person (SAP/Tally/Matching)
  | 'account_head'      // 4. Account Head Approval
  | 'accounts_booking'  // 5. In Accounts for Booking
  | 'booked';           // Completed & Booked in Ledger

export type SlaStatus = 'on_track' | 'warning' | 'critical';

export interface InvoiceHistoryEvent {
  id: string;
  stage: InvoiceStage;
  stageTitle: string;
  action: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  daysSpent: number;
  notes?: string;
}

export interface TrackedInvoice {
  id: string;
  companyId: string;
  companyName?: string;
  gateEntryNo: string;
  
  // Basic AI Extracted & Verified Data
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  taxAmount: number;
  totalAmount: number;
  gstin?: string;
  poNumber?: string;
  category: InvoiceCategory | string; // Fabric, Job Work External, Job Work Internal, Admin / Utility
  
  // Image & Guard Data
  invoiceImageUrl?: string;
  guardName: string;
  receivedAt: string; // ISO string
  vehicleOrChallanNo?: string;
  guardRemarks?: string;
  aiExtracted?: boolean;
  aiConfidence?: number;

  // Pipeline & SLA State
  currentStage: InvoiceStage;
  stageEnteredAt: string; // ISO string
  daysInCurrentStage: number;
  slaStatus: SlaStatus;
  isCritical: boolean; // true if > 2 days in current stage
  criticalReason?: string;

  // Departmental Stage Progress Data
  grnDetails?: {
    grnNumber: string;
    grnDate: string;
    qcInspectorName: string;
    qcStatus: 'Approved' | 'Rejected' | 'Partially Accepted' | 'Pending Inspection';
    acceptedQuantity?: string;
    rejectedQuantity?: string;
    qcRemarks?: string;
    completedAt?: string;
  };

  erpDetails?: {
    erpVoucherNo: string;
    erpOperatorName: string;
    matchingStatus: '3-Way Matched' | 'Price Variance' | 'Qty Variance' | 'Pending';
    tdsRateApplicable?: string;
    hsnSacCode?: string;
    erpEnteredAt?: string;
    erpRemarks?: string;
  };

  accountHeadDetails?: {
    accountHeadName: string;
    approvalStatus: 'Approved' | 'Query Raised' | 'Rejected' | 'Pending';
    paymentTerms: string; // e.g. "Immediate", "30 Days Net", "45 Days MSME Priority"
    approvedAt?: string;
    approvalRemarks?: string;
  };

  bookingDetails?: {
    bookedBy: string;
    voucherNumber: string;
    financialLedger: string;
    scheduledPaymentDate?: string;
    paymentStatus: 'Booked' | 'Scheduled for Payment' | 'Paid';
    bookedAt?: string;
    bookingRemarks?: string;
  };

  history: InvoiceHistoryEvent[];
}

// ==========================================
// MONTHWISE BUDGET & VARIANCE ANALYSIS TYPES
// ==========================================

export type BudgetCategory = 
  | 'sales' 
  | 'direct_cost' 
  | 'fixed_factory' 
  | 'salary_wages' 
  | 'admin_cost';

export type BudgetMonthKey = 
  | 'apr' 
  | 'may' 
  | 'jun' 
  | 'jul' 
  | 'aug' 
  | 'sep' 
  | 'oct' 
  | 'nov' 
  | 'dec' 
  | 'jan' 
  | 'feb' 
  | 'mar';

export interface BudgetMonthMeta {
  key: BudgetMonthKey;
  label: string;
  shortLabel: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  calendarMonth: number; // 4 for April, 1 for Jan
  year: number; // 2026 or 2027
  isActualsUploaded: boolean;
}

export interface MonthBudgetValue {
  budget: number;
  actual: number;
  notes?: string;
}

export interface BudgetLineItem {
  id: string;
  code: string;
  name: string;
  category: BudgetCategory;
  subCategory?: string;
  description?: string;
  monthly: Record<BudgetMonthKey, MonthBudgetValue>;
}

export type VarianceType = 'favorable' | 'adverse' | 'neutral';

export interface LineItemVarianceResult {
  item: BudgetLineItem;
  budget: number;
  actual: number;
  varianceAmount: number; // actual - budget
  variancePercent: number; // ((actual - budget) / budget) * 100
  isExceeding5Percent: boolean;
  varianceType: VarianceType; // adverse if overspending/shortfall, favorable if saving/surplus
  alertSeverity: 'critical_adverse' | 'favorable' | 'on_track';
  alertBadgeText: string;
}

export interface CategoryVarianceSummary {
  category: BudgetCategory;
  categoryTitle: string;
  budget: number;
  actual: number;
  varianceAmount: number;
  variancePercent: number;
  itemsCount: number;
  exceeding5PercentCount: number;
  adverse5PercentCount: number;
  favorable5PercentCount: number;
}

export interface MonthVarianceGrandSummary {
  monthKey: BudgetMonthKey;
  monthLabel: string;
  sales: CategoryVarianceSummary;
  directCost: CategoryVarianceSummary;
  grossProfitBudget: number;
  grossProfitActual: number;
  grossProfitVariance: number;
  grossProfitMarginBudget: number;
  grossProfitMarginActual: number;
  fixedFactory: CategoryVarianceSummary;
  salaryWages: CategoryVarianceSummary;
  adminCost: CategoryVarianceSummary;
  totalExpensesBudget: number;
  totalExpensesActual: number;
  totalExpensesVariance: number;
  ebitdaBudget: number;
  ebitdaActual: number;
  ebitdaVariance: number;
  ebitdaMarginBudget: number;
  ebitdaMarginActual: number;
  totalItemsBreaching5Percent: number;
  totalAdverseBreaches: number;
}


