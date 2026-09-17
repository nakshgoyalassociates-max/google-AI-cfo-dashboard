import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrackedInvoice, InvoiceStage } from '../../types';
import { getCategoryStyle } from './InvoiceTrackingTab';
import { 
  ArrowRight, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  User, 
  Layers, 
  CreditCard,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';

interface StageTransitionModalProps {
  invoice: TrackedInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StageTransitionModalContentProps {
  invoice: TrackedInvoice;
  onClose: () => void;
}

const StageTransitionModalContent: React.FC<StageTransitionModalContentProps> = ({
  invoice,
  onClose
}) => {
  const { advanceInvoiceStage, currentUser } = useApp();

  // Determine target next stage
  const getNextStage = (curr: InvoiceStage): InvoiceStage | null => {
    switch (curr) {
      case 'guard': return 'grn_qc';
      case 'grn_qc': return 'erp';
      case 'erp': return 'account_head';
      case 'account_head': return 'accounts_booking';
      case 'accounts_booking': return 'booked';
      default: return null;
    }
  };

  const nextStage = getNextStage(invoice.currentStage);

  // Stage 2: GRN & QC Fields
  const [grnNumber, setGrnNumber] = useState<string>(
    invoice.grnDetails?.grnNumber || `GRN-NOV-${Math.floor(8000 + Math.random() * 1999)}`
  );
  const [grnDate, setGrnDate] = useState<string>(
    invoice.grnDetails?.grnDate || new Date().toISOString().split('T')[0]
  );
  const [qcInspectorName, setQcInspectorName] = useState<string>(
    invoice.grnDetails?.qcInspectorName || currentUser.name || 'Devendra Kulkarni'
  );
  const [qcStatus, setQcStatus] = useState<'Approved' | 'Rejected' | 'Partially Accepted'>(
    (invoice.grnDetails?.qcStatus as any) || 'Approved'
  );
  const [acceptedQuantity, setAcceptedQuantity] = useState<string>(
    invoice.grnDetails?.acceptedQuantity || '100% quantity inspected & verified'
  );
  const [qcRemarks, setQcRemarks] = useState<string>(
    invoice.grnDetails?.qcRemarks || 'Physical inspection and technical specs meet Purchase Order criteria.'
  );

  // Stage 3: ERP Person Fields
  const [erpVoucherNo, setErpVoucherNo] = useState<string>(
    invoice.erpDetails?.erpVoucherNo || `SAP-MIRO-${Math.floor(6000 + Math.random() * 3999)}`
  );
  const [erpOperatorName, setErpOperatorName] = useState<string>(
    invoice.erpDetails?.erpOperatorName || currentUser.name || 'Vikram Joshi (SAP Lead)'
  );
  const [matchingStatus, setMatchingStatus] = useState<'3-Way Matched' | 'Price Variance' | 'Qty Variance'>(
    (invoice.erpDetails?.matchingStatus as any) || '3-Way Matched'
  );
  const [tdsRateApplicable, setTdsRateApplicable] = useState<string>(
    invoice.erpDetails?.tdsRateApplicable || '194Q @ 0.1%'
  );
  const [hsnSacCode, setHsnSacCode] = useState<string>(
    invoice.erpDetails?.hsnSacCode || '7208'
  );
  const [erpRemarks, setErpRemarks] = useState<string>(
    invoice.erpDetails?.erpRemarks || 'Matched line items against GRN & PO in SAP MM. Ready for Account Head sign-off.'
  );

  // Stage 4: Account Head Approval Fields
  const [accountHeadName, setAccountHeadName] = useState<string>(
    invoice.accountHeadDetails?.accountHeadName || currentUser.name || 'Sunil Rao (GM Finance)'
  );
  const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Query Raised' | 'Rejected'>(
    (invoice.accountHeadDetails?.approvalStatus as any) || 'Approved'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    invoice.accountHeadDetails?.paymentTerms || '30 Days Net'
  );
  const [approvalRemarks, setApprovalRemarks] = useState<string>(
    invoice.accountHeadDetails?.approvalRemarks || 'Budget verified. Payment approved as per contract credit term.'
  );

  // Stage 5: Accounts for Booking Fields
  const [bookedBy, setBookedBy] = useState<string>(
    invoice.bookingDetails?.bookedBy || currentUser.name || 'Ananya Deshmukh (Sr. Accounts Officer)'
  );
  const [voucherNumber, setVoucherNumber] = useState<string>(
    invoice.bookingDetails?.voucherNumber || `VR-2026-09-${Math.floor(1000 + Math.random() * 8999)}`
  );
  const [financialLedger, setFinancialLedger] = useState<string>(
    invoice.bookingDetails?.financialLedger || 'Raw Material Purchases & Consumption A/c'
  );
  const [scheduledPaymentDate, setScheduledPaymentDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [bookingRemarks, setBookingRemarks] = useState<string>(
    invoice.bookingDetails?.bookingRemarks || 'Posted in ERP General Ledger. TDS & GST input tax credit allocated.'
  );

  const stageTitles: Record<InvoiceStage, string> = {
    guard: '1. Gate Receipt (Guard)',
    grn_qc: '2. GRN & Quality Check Dept',
    erp: '3. ERP Person Entry & 3-Way Matching',
    account_head: '4. Account Head Approval',
    accounts_booking: '5. In Accounts for Booking',
    booked: 'Booked in Ledger & Scheduled'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStage) return;

    let stageData: Record<string, any> = {};

    if (invoice.currentStage === 'guard' && nextStage === 'grn_qc') {
      stageData = {
        actionSummary: 'Consignment handed over to Stores / Quality Check Dept',
        grnDetails: {
          grnNumber,
          grnDate,
          qcInspectorName,
          qcStatus: 'Pending Inspection',
          acceptedQuantity: 'Awaiting QC bench inspection',
          qcRemarks: 'Received from security gate post.'
        }
      };
    } else if (invoice.currentStage === 'grn_qc' && nextStage === 'erp') {
      stageData = {
        actionSummary: `GRN #${grnNumber} issued (${qcStatus}). Passed to ERP team.`,
        grnDetails: {
          grnNumber,
          grnDate,
          qcInspectorName,
          qcStatus,
          acceptedQuantity,
          qcRemarks,
          completedAt: new Date().toISOString()
        },
        erpDetails: {
          erpVoucherNo,
          erpOperatorName,
          matchingStatus,
          tdsRateApplicable,
          hsnSacCode,
          erpRemarks: 'Under 3-way matching in ERP.'
        }
      };
    } else if (invoice.currentStage === 'erp' && nextStage === 'account_head') {
      stageData = {
        actionSummary: `ERP entry #${erpVoucherNo} posted. Submitted for Account Head sign-off.`,
        erpDetails: {
          erpVoucherNo,
          erpOperatorName,
          matchingStatus,
          tdsRateApplicable,
          hsnSacCode,
          erpEnteredAt: new Date().toISOString(),
          erpRemarks
        },
        accountHeadDetails: {
          accountHeadName,
          approvalStatus: 'Pending',
          paymentTerms,
          approvalRemarks: 'Awaiting financial review.'
        }
      };
    } else if (invoice.currentStage === 'account_head' && nextStage === 'accounts_booking') {
      stageData = {
        actionSummary: `Approved by Account Head (${accountHeadName}). Sent to Accounts for booking.`,
        accountHeadDetails: {
          accountHeadName,
          approvalStatus,
          paymentTerms,
          approvedAt: new Date().toISOString(),
          approvalRemarks
        },
        bookingDetails: {
          bookedBy,
          voucherNumber,
          financialLedger,
          scheduledPaymentDate,
          paymentStatus: 'Booked',
          bookingRemarks: 'Queued for final ledger posting.'
        }
      };
    } else if (invoice.currentStage === 'accounts_booking' && nextStage === 'booked') {
      stageData = {
        actionSummary: `Voucher #${voucherNumber} booked in General Ledger. Scheduled for payment.`,
        bookingDetails: {
          bookedBy,
          voucherNumber,
          financialLedger,
          scheduledPaymentDate,
          paymentStatus: 'Scheduled for Payment',
          bookedAt: new Date().toISOString(),
          bookingRemarks
        }
      };
    }

    advanceInvoiceStage(invoice.id, nextStage, stageData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold tracking-tight">Advance Invoice Stage</h3>
              <span className="font-mono text-xs text-indigo-300 font-semibold">
                #{invoice.invoiceNumber}
              </span>
              {(() => {
                const catStyle = getCategoryStyle(invoice.category);
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${catStyle.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                    {invoice.category || 'Admin / Utility'}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vendor: <strong className="text-slate-200">{invoice.vendorName}</strong> • Total Value: <strong className="text-emerald-300">₹{invoice.totalAmount.toLocaleString('en-IN')}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transition Visual Pathway */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-[11px]">
              Current Stage
            </span>
            <span className="font-bold text-slate-900">{stageTitles[invoice.currentStage]}</span>
          </div>

          <ArrowRight className="w-4 h-4 text-indigo-600" />

          <div className="flex items-center gap-2 text-indigo-700">
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold text-[11px]">
              Advancing To
            </span>
            <span className="font-bold text-indigo-950">{nextStage ? stageTitles[nextStage] : 'Completed'}</span>
          </div>
        </div>

        {/* SLA Status on Current Stage */}
        <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
          invoice.isCritical 
            ? 'bg-rose-50 border-rose-200 text-rose-900' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            {invoice.isCritical ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>
              Time spent in current stage: <strong>{invoice.daysInCurrentStage} days</strong> (Limit: 2.0 days max).
            </span>
          </div>
          {invoice.isCritical && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
              Critical SLA Overdue
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Transition 1: Guard -> GRN / QC */}
          {invoice.currentStage === 'guard' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950">
                <p className="font-semibold">Dispatching from Gate to Stores / Quality Check Dept:</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Physical goods and invoice document will be received by Stores Inspector for unloading, count verification, and quality sampling.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stores QC Inspector Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={qcInspectorName}
                    onChange={(e) => setQcInspectorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target GRN Number
                  </label>
                  <input
                    type="text"
                    value={grnNumber}
                    onChange={(e) => setGrnNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transition 2: GRN / QC -> ERP Person */}
          {invoice.currentStage === 'grn_qc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GRN Number (Goods Receipt Note) *
                  </label>
                  <input
                    type="text"
                    required
                    value={grnNumber}
                    onChange={(e) => setGrnNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GRN Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={grnDate}
                    onChange={(e) => setGrnDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    QC Inspection Status *
                  </label>
                  <select
                    value={qcStatus}
                    onChange={(e) => setQcStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold text-slate-800"
                  >
                    <option value="Approved">✅ Approved (100% Passed)</option>
                    <option value="Partially Accepted">⚠️ Partially Accepted (Deviation Note)</option>
                    <option value="Rejected">❌ Rejected (Return to Vendor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accepted Quantity / Weight *
                  </label>
                  <input
                    type="text"
                    required
                    value={acceptedQuantity}
                    onChange={(e) => setAcceptedQuantity(e.target.value)}
                    placeholder="e.g. 100% Units Verified"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    QC Inspection Remarks & Test Certificate Ref
                  </label>
                  <textarea
                    rows={2}
                    value={qcRemarks}
                    onChange={(e) => setQcRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transition 3: ERP Person -> Account Head Approval */}
          {invoice.currentStage === 'erp' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ERP Inward / Voucher Number (SAP/Tally) *
                  </label>
                  <input
                    type="text"
                    required
                    value={erpVoucherNo}
                    onChange={(e) => setErpVoucherNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ERP Operator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={erpOperatorName}
                    onChange={(e) => setErpOperatorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3-Way Matching Result (PO vs GRN vs Invoice) *
                  </label>
                  <select
                    value={matchingStatus}
                    onChange={(e) => setMatchingStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold text-slate-800"
                  >
                    <option value="3-Way Matched">✅ 3-Way Matched (No Variance)</option>
                    <option value="Price Variance">⚠️ Price Variance (Requires Head Exception)</option>
                    <option value="Qty Variance">⚠️ Quantity Variance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applicable TDS Section
                  </label>
                  <input
                    type="text"
                    value={tdsRateApplicable}
                    onChange={(e) => setTdsRateApplicable(e.target.value)}
                    placeholder="194Q @ 0.1% or 194C @ 2%"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ERP Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={erpRemarks}
                    onChange={(e) => setErpRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transition 4: Account Head Approval -> Accounts Booking */}
          {invoice.currentStage === 'account_head' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Head / Finance Lead Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHeadName}
                    onChange={(e) => setAccountHeadName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Terms & Priority *
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold text-slate-800"
                  >
                    <option value="30 Days Net">Standard 30 Days Net</option>
                    <option value="45 Days MSME Priority">⚡ 45 Days MSME Priority (Samadhaan)</option>
                    <option value="Immediate / Advance">Immediate Payment</option>
                    <option value="60 Days Credit">60 Days Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approval Decision *
                  </label>
                  <select
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold text-slate-900"
                  >
                    <option value="Approved">✅ Approved for Ledger Booking</option>
                    <option value="Query Raised">❓ Query Raised to Vendor / Buyer</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Head Approval Notes & Payment Instruction
                  </label>
                  <textarea
                    rows={2}
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transition 5: Accounts for Booking -> Booked in Ledger */}
          {invoice.currentStage === 'accounts_booking' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    General Ledger Voucher Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Financial Ledger Head *
                  </label>
                  <input
                    type="text"
                    required
                    value={financialLedger}
                    onChange={(e) => setFinancialLedger(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Booked By (Accounts Officer) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookedBy}
                    onChange={(e) => setBookedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled NEFT / RTGS Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledPaymentDate}
                    onChange={(e) => setScheduledPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Final Booking Remarks & Cheque/Batch Reference
                  </label>
                  <textarea
                    rows={2}
                    value={bookingRemarks}
                    onChange={(e) => setBookingRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Advance to {nextStage ? stageTitles[nextStage] : 'Booked'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const StageTransitionModal: React.FC<StageTransitionModalProps> = ({
  invoice,
  isOpen,
  onClose
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <StageTransitionModalContent
      key={invoice.id}
      invoice={invoice}
      onClose={onClose}
    />
  );
};
