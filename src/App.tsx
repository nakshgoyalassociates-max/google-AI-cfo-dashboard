import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CfoDashboard } from './components/cfo/CfoDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { ClientTeamDashboard } from './components/client/ClientTeamDashboard';
import { ComplianceMasterTab } from './components/compliances/ComplianceMasterTab';
import { ActionPendenciesTab } from './components/actions/ActionPendenciesTab';
import { FinancialMisTab } from './components/mis/FinancialMisTab';
import { NewActionModal } from './components/modals/NewActionModal';
import { AuthModal } from './components/auth/AuthModal';
import { ShieldCheck, CheckCircle, AlertCircle, Info, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, role, toastMessage, clientProfile } = useApp();

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      if (role === 'client') return <ClientDashboard />;
      if (role === 'client_team') return <ClientTeamDashboard />;
      return <CfoDashboard />;
    }
    if (activeTab === 'compliances') return <ComplianceMasterTab />;
    if (activeTab === 'actions') return <ActionPendenciesTab />;
    if (activeTab === 'mis') return <FinancialMisTab />;
    return <CfoDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Navigation Bar with Role and Tab Controls */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Modals */}
      <NewActionModal />
      <AuthModal />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-xs font-medium max-w-md bg-slate-900 text-slate-100 border-slate-800">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Professional Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              V
            </div>
            <span className="font-bold text-slate-800">Virtual CFO Suite</span>
            <span>•</span>
            <span>Client: <strong className="text-slate-700">{clientProfile.companyName}</strong></span>
            <span>•</span>
            <span className="font-mono">GSTIN: {clientProfile.gstin}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Virtual CFO: <strong className="text-slate-600">{clientProfile.cfoName}</strong> ({clientProfile.cfoFirm})</span>
            <span>•</span>
            <span>FY 2026-27 Master Compliances (35 Items)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
