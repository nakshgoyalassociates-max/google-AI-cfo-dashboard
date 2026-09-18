import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { TrackedInvoice, InvoiceStage } from '../types';
import { INITIAL_TRACKED_INVOICES } from '../data/mockInvoices';

interface InvoiceContextType {
  invoices: TrackedInvoice[];
  addInvoice: (invoice: TrackedInvoice) => void;
  updateInvoice: (invoice: TrackedInvoice) => void;
  advanceInvoiceStage: (invoiceId: string, nextStage: InvoiceStage, stageData?: Record<string, any>) => void;
  deleteInvoice: (invoiceId: string) => void;
  invoiceStats: {
    total: number;
    critical: number;
    guard: number;
    grnQc: number;
    erp: number;
    accountHead: number;
    accountsBooking: number;
    booked: number;
    totalAmount: number;
    criticalAmount: number;
  };
  currentUser: {
    id: string;
    name: string;
    roleTitle: string;
  };
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetToDefaultData: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);
const STORAGE_KEY = 'standalone_tracked_invoices_v1';

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState({
    id: 'user-01',
    name: 'Manish Goyal',
    roleTitle: 'Chief Financial Officer'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const [invoices, setInvoices] = useState<TrackedInvoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: TrackedInvoice[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TRACKED_INVOICES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    } catch (err) {
      console.error('Failed saving invoices:', err);
    }
  }, [invoices]);

  const addInvoice = (newInvoice: TrackedInvoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    showToast(`Invoice #${newInvoice.invoiceNumber} logged at Gate Entry`);
  };

  const updateInvoice = (updated: TrackedInvoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    showToast(`Invoice #${updated.invoiceNumber} updated`);
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    showToast('Invoice entry deleted');
  };

  const advanceInvoiceStage = (
    invoiceId: string, 
    nextStage: InvoiceStage, 
    stageData?: Record<string, any>
  ) => {
    setInvoices(prev => {
      return prev.map(inv => {
        if (inv.id !== invoiceId) return inv;

        const nowIso = new Date().toISOString();
        const stageTitles: Record<InvoiceStage, string> = {
          guard: 'Gate Receipt (Guard)',
          grn_qc: 'GRN & Quality Check Dept',
          erp: 'ERP Person Entry',
          account_head: 'Account Head Approval',
          accounts_booking: 'In Accounts for Booking',
          booked: 'Completed & Booked in Ledger'
        };

        const newHistoryItem = {
          id: `hist-${Date.now()}`,
          stage: nextStage,
          stageTitle: stageTitles[nextStage] || nextStage,
          action: stageData?.actionSummary || `Moved to ${stageTitles[nextStage]}`,
          actorName: currentUser.name,
          actorRole: currentUser.roleTitle,
          timestamp: nowIso,
          daysSpent: inv.daysInCurrentStage,
          notes: stageData?.notes || stageData?.qcRemarks || stageData?.erpRemarks || stageData?.approvalRemarks || stageData?.bookingRemarks || ''
        };

        const updated: TrackedInvoice = {
          ...inv,
          currentStage: nextStage,
          stageEnteredAt: nowIso,
          daysInCurrentStage: 0,
          slaStatus: 'on_track',
          isCritical: false,
          criticalReason: undefined,
          history: [...inv.history, newHistoryItem]
        };

        if (stageData?.grnDetails) {
          updated.grnDetails = { ...(updated.grnDetails || {}), ...stageData.grnDetails };
        }
        if (stageData?.erpDetails) {
          updated.erpDetails = { ...(updated.erpDetails || {}), ...stageData.erpDetails };
        }
        if (stageData?.accountHeadDetails) {
          updated.accountHeadDetails = { ...(updated.accountHeadDetails || {}), ...stageData.accountHeadDetails };
        }
        if (stageData?.bookingDetails) {
          updated.bookingDetails = { ...(updated.bookingDetails || {}), ...stageData.bookingDetails };
        }

        return updated;
      });
    });

    if (nextStage === 'booked') {
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}
      showToast('🎉 Invoice successfully booked in ledger and payment scheduled!');
    } else {
      showToast(`Invoice progressed to ${nextStage.replace('_', ' ').toUpperCase()} successfully`);
    }
  };

  const invoiceStats = useMemo(() => {
    const list = invoices || [];
    let critical = 0;
    let guard = 0;
    let grnQc = 0;
    let erp = 0;
    let accountHead = 0;
    let accountsBooking = 0;
    let booked = 0;
    let totalAmount = 0;
    let criticalAmount = 0;

    list.forEach(inv => {
      totalAmount += inv.totalAmount || 0;
      if (inv.isCritical || inv.daysInCurrentStage > 2.0) {
        critical++;
        criticalAmount += inv.totalAmount || 0;
      }
      if (inv.currentStage === 'guard') guard++;
      else if (inv.currentStage === 'grn_qc') grnQc++;
      else if (inv.currentStage === 'erp') erp++;
      else if (inv.currentStage === 'account_head') accountHead++;
      else if (inv.currentStage === 'accounts_booking') accountsBooking++;
      else if (inv.currentStage === 'booked') booked++;
    });

    return {
      total: list.length,
      critical,
      guard,
      grnQc,
      erp,
      accountHead,
      accountsBooking,
      booked,
      totalAmount,
      criticalAmount
    };
  }, [invoices]);

  const resetToDefaultData = () => {
    setInvoices(INITIAL_TRACKED_INVOICES);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset to default sample invoices successfully.');
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        addInvoice,
        updateInvoice,
        advanceInvoiceStage,
        deleteInvoice,
        invoiceStats,
        currentUser,
        toastMessage,
        showToast,
        resetToDefaultData
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceApp = () => {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoiceApp must be used within InvoiceProvider');
  return ctx;
};
