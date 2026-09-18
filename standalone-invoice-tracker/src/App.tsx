import React from 'react';
import { InvoiceProvider, useInvoiceApp } from './context/InvoiceContext';
import { InvoiceTrackingTab } from './components/InvoiceTrackingTab';
import { 
  ReceiptText, 
  ShieldCheck, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Building2,
  ExternalLink
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { invoiceStats, toastMessage, resetToDefaultData } = useInvoiceApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">
                    Invoice Track Pro
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full">
                    Gate-to-Ledger
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  Strict 48-Hour SLA Tracking Across 6 Departments
                </p>
              </div>
            </div>

            {/* SLA Badges & Quick Controls */}
            <div className="flex items-center gap-4">
              {/* Critical SLA counter */}
              {invoiceStats.critical > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>
                    <strong>{invoiceStats.critical}</strong> invoices breaching 48h SLA
                  </span>
                </div>
              )}

              {/* Reset Data button */}
              <button
                type="button"
                onClick={resetToDefaultData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Reset sample demonstration invoices"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <InvoiceTrackingTab />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-2">
          <p>© 2026 Invoice Track Pro. Decoupled Standalone Enterprise Invoice Tracking Application.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> All 6 Department Stages Active
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-xl border border-slate-700 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InvoiceProvider>
      <AppContent />
    </InvoiceProvider>
  );
};

export default App;
