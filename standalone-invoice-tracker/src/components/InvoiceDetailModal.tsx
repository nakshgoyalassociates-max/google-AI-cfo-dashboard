import React, { useState } from 'react';
import { TrackedInvoice, InvoiceStage } from '../types';
import { getCategoryStyle } from './InvoiceTrackingTab';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Building, 
  Hash, 
  DollarSign, 
  FileText, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  UserCheck,
  Tag
} from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: TrackedInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceClick?: (invoice: TrackedInvoice) => void;
}

interface InvoiceDetailModalContentProps {
  invoice: TrackedInvoice;
  onClose: () => void;
  onAdvanceClick?: (invoice: TrackedInvoice) => void;
}

const InvoiceDetailModalContent: React.FC<InvoiceDetailModalContentProps> = ({
  invoice,
  onClose,
  onAdvanceClick
}) => {
  const [activeImageViewer, setActiveImageViewer] = useState<boolean>(false);

  const stageKeys: InvoiceStage[] = [
    'guard',
    'grn_qc',
    'erp',
    'account_head',
    'accounts_booking',
    'booked'
  ];

  const stageNames: Record<InvoiceStage, string> = {
    guard: 'Gate Receipt (Guard)',
    grn_qc: 'GRN & Quality Check',
    erp: 'ERP Person Entry',
    account_head: 'Account Head Approval',
    accounts_booking: 'In Accounts for Booking',
    booked: 'Booked in Ledger'
  };

  const currentStageIndex = stageKeys.indexOf(invoice.currentStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold tracking-tight">Invoice #{invoice.invoiceNumber}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Gate Pass: {invoice.gateEntryNo}
                </span>
                {(() => {
                  const catStyle = getCategoryStyle(invoice.category);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${catStyle.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                      {invoice.category || 'Admin / Utility'}
                    </span>
                  );
                })()}
                {invoice.isCritical && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Critical SLA Breached
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {invoice.vendorName} • Inward: {new Date(invoice.receivedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Day SLA Alert / Status Bar */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
          invoice.isCritical
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : invoice.daysInCurrentStage >= 1.5
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            {invoice.isCritical ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : invoice.daysInCurrentStage >= 1.5 ? (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div>
              <strong>Current Stage:</strong> {stageNames[invoice.currentStage]} — 
              <span className="ml-1">
                Spent <strong>{invoice.daysInCurrentStage} days</strong> (Target: ≤ 2.0 days).
              </span>
              {invoice.isCritical && (
                <span className="ml-1 font-semibold text-rose-700">
                  {invoice.criticalReason || 'Exceeded 2-day limit. Immediate clearance required.'}
                </span>
              )}
            </div>
          </div>

          {invoice.currentStage !== 'booked' && onAdvanceClick && (
            <button
              onClick={() => {
                onClose();
                onAdvanceClick(invoice);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Advance to Next Department</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Visual 5-Stage Progress Stepper */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
              5-Stage Department Lifecycle (Strict 2-Day SLA per Department)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['guard', 'grn_qc', 'erp', 'account_head', 'accounts_booking'] as InvoiceStage[]).map((stg, idx) => {
                const isCurrent = invoice.currentStage === stg;
                const isPassed = currentStageIndex > idx || invoice.currentStage === 'booked';
                const isBreached = isCurrent && invoice.isCritical;

                return (
                  <div
                    key={stg}
                    className={`p-3 rounded-lg border flex flex-col justify-between text-xs relative ${
                      isBreached
                        ? 'border-rose-400 bg-rose-50/80 text-rose-950 ring-2 ring-rose-500/20'
                        : isCurrent
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20 font-bold'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Stage {idx + 1}
                        </span>
                        {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {isBreached && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      </div>
                      <div className="font-semibold text-xs leading-tight">
                        {stageNames[stg]}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
                      {isCurrent ? (
                        <span className={`font-bold ${isBreached ? 'text-rose-700' : 'text-indigo-700'}`}>
                          {invoice.daysInCurrentStage}d / 2.0d SLA
                        </span>
                      ) : isPassed ? (
                        <span className="text-emerald-700 font-medium">Cleared</span>
                      ) : (
                        <span className="text-slate-400">Upcoming</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column Info: Invoice Financials & Document Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Scanned Photo & AI Stamp */}
            <div className="md:col-span-1 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Guard Camera Snapshot
              </span>
              
              <div 
                onClick={() => setActiveImageViewer(true)}
                className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer"
              >
                <img
                  src={invoice.invoiceImageUrl}
                  alt={`Invoice ${invoice.invoiceNumber}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Zoom Full Image
                  </span>
                </div>
              </div>

              {invoice.aiExtracted && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Vision Extracted</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Recognized vendor, invoice date, and monetary breakdown automatically from physical invoice photo.
                  </p>
                </div>
              )}
            </div>

            {/* Financials & Basic Data Card */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Recorded Invoice Details
              </span>

              {/* Amount Highlight Card */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-indigo-900 text-white shadow-xs">
                <div>
                  <span className="text-[10px] text-indigo-200 uppercase font-semibold">Subtotal (Pre-Tax)</span>
                  <div className="text-sm font-bold font-mono mt-0.5">
                    ₹{invoice.taxableValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-200 uppercase font-semibold">GST / Tax Amount</span>
                  <div className="text-sm font-bold font-mono mt-0.5 text-emerald-300">
                    ₹{invoice.taxAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-200 uppercase font-semibold">Total Invoice Value</span>
                  <div className="text-base font-extrabold font-mono mt-0.5 text-amber-300">
                    ₹{invoice.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Vendor Name</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{invoice.vendorName}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Supplier GSTIN</span>
                  <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{invoice.gstin || 'Not specified'}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Invoice Number</span>
                  <span className="font-mono font-bold text-indigo-900 text-xs mt-0.5 block">{invoice.invoiceNumber}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Invoice Date</span>
                  <span className="font-medium text-slate-800 text-xs mt-0.5 block">{invoice.invoiceDate}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Purchase Order (PO)</span>
                  <span className="font-mono text-slate-800 text-xs mt-0.5 block">{invoice.poNumber || 'Direct Supply'}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Invoice Category</span>
                  <div className="mt-1">
                    {(() => {
                      const catStyle = getCategoryStyle(invoice.category);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${catStyle.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                          {invoice.category || 'Admin / Utility'}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Vehicle / Courier Challan</span>
                  <span className="text-slate-800 text-xs mt-0.5 block">{invoice.vehicleOrChallanNo || 'Hand Delivery'}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-slate-400 text-[11px] block">Security Guard Name</span>
                  <span className="text-slate-800 text-xs mt-0.5 block">{invoice.guardName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Departmental Progress Specifics */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Department Clearance Records
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* GRN / QC Department */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                  <span>GRN & Quality Check Dept</span>
                  {invoice.grnDetails ? (
                    <span className="text-emerald-700 text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {invoice.grnDetails.qcStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Awaiting QC</span>
                  )}
                </div>
                {invoice.grnDetails ? (
                  <div className="text-slate-600 text-[11px] space-y-0.5">
                    <div>GRN No: <strong className="font-mono text-slate-800">{invoice.grnDetails.grnNumber}</strong></div>
                    <div>Inspector: {invoice.grnDetails.qcInspectorName}</div>
                    <div>Accepted Qty: {invoice.grnDetails.acceptedQuantity}</div>
                    {invoice.grnDetails.qcRemarks && (
                      <div className="text-slate-500 italic mt-1">{invoice.grnDetails.qcRemarks}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">Not reached or pending inspection.</p>
                )}
              </div>

              {/* ERP Person Entry */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                  <span>ERP Person Entry</span>
                  {invoice.erpDetails ? (
                    <span className="text-indigo-700 text-[11px] font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                      {invoice.erpDetails.matchingStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Awaiting ERP</span>
                  )}
                </div>
                {invoice.erpDetails ? (
                  <div className="text-slate-600 text-[11px] space-y-0.5">
                    <div>Voucher No: <strong className="font-mono text-slate-800">{invoice.erpDetails.erpVoucherNo}</strong></div>
                    <div>ERP Operator: {invoice.erpDetails.erpOperatorName}</div>
                    <div>TDS Section: {invoice.erpDetails.tdsRateApplicable}</div>
                    {invoice.erpDetails.erpRemarks && (
                      <div className="text-slate-500 italic mt-1">{invoice.erpDetails.erpRemarks}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">Not reached or awaiting 3-way matching.</p>
                )}
              </div>

              {/* Account Head Approval */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                  <span>Account Head Approval</span>
                  {invoice.accountHeadDetails ? (
                    <span className="text-emerald-700 text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {invoice.accountHeadDetails.approvalStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Awaiting Approval</span>
                  )}
                </div>
                {invoice.accountHeadDetails ? (
                  <div className="text-slate-600 text-[11px] space-y-0.5">
                    <div>Approved By: {invoice.accountHeadDetails.accountHeadName}</div>
                    <div>Credit Terms: {invoice.accountHeadDetails.paymentTerms}</div>
                    {invoice.accountHeadDetails.approvalRemarks && (
                      <div className="text-slate-500 italic mt-1">{invoice.accountHeadDetails.approvalRemarks}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">Not reached or awaiting sign-off.</p>
                )}
              </div>

              {/* In Accounts for Booking */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                  <span>Accounts Booking</span>
                  {invoice.bookingDetails ? (
                    <span className="text-emerald-700 text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {invoice.bookingDetails.paymentStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Awaiting Booking</span>
                  )}
                </div>
                {invoice.bookingDetails ? (
                  <div className="text-slate-600 text-[11px] space-y-0.5">
                    <div>GL Voucher: <strong className="font-mono text-slate-800">{invoice.bookingDetails.voucherNumber}</strong></div>
                    <div>Ledger: {invoice.bookingDetails.financialLedger}</div>
                    <div>Scheduled Date: {invoice.bookingDetails.scheduledPaymentDate}</div>
                    <div>Booked By: {invoice.bookingDetails.bookedBy}</div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">Not yet booked in financial ledger.</p>
                )}
              </div>
            </div>
          </div>

          {/* Audit History Log */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Audit Trail & Department Movement History
            </span>

            <div className="space-y-2">
              {invoice.history.map((hist, idx) => (
                <div
                  key={hist.id || idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                    {idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{hist.stageTitle}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(hist.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-slate-700 text-xs mt-0.5">{hist.action}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Operator: <strong>{hist.actorName}</strong> ({hist.actorRole})</span>
                      {hist.daysSpent !== undefined && hist.daysSpent > 0 && (
                        <span>Duration in stage: <strong>{hist.daysSpent} days</strong></span>
                      )}
                    </div>

                    {hist.notes && (
                      <p className="text-slate-500 text-[11px] italic mt-1 bg-slate-50 p-1.5 rounded">
                        "{hist.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Internal ID: <code className="text-slate-700 font-mono">{invoice.id}</code>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Full Image Zoom Modal */}
      {activeImageViewer && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveImageViewer(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={invoice.invoiceImageUrl}
              alt="Full Size Invoice"
              className="max-h-[85vh] w-auto rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setActiveImageViewer(false)}
              className="absolute top-2 right-2 text-white bg-slate-900/80 p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onAdvanceClick
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <InvoiceDetailModalContent
      key={invoice.id}
      invoice={invoice}
      onClose={onClose}
      onAdvanceClick={onAdvanceClick}
    />
  );
};
