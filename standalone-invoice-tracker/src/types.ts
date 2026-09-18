// ==========================================
// STANDALONE INVOICE TRACKING PIPELINE TYPES
// ==========================================

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
