import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Users,
  CheckSquare, 
  BarChart3, 
  CalendarClock, 
  RotateCcw,
  LayoutDashboard,
  Lock,
  LogIn,
  ChevronDown,
  Layers,
  ReceiptText,
  Calculator
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    role, 
    setRole, 
    activeTab, 
    setActiveTab, 
    clientProfile, 
    stats, 
    invoiceStats,
    resetToDefaultData,
    currentUser,
    setIsAuthModalOpen,
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    cfoViewMode,
    setCfoViewMode,
    criticalDelayedItems
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header: Company Identity & Role / Auth Bar */}
        <div className="py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
          
          {/* Company Profile & Company Selector */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs ${
              role === 'cfo' ? 'bg-indigo-700' : role === 'client' ? 'bg-emerald-700' : 'bg-sky-700'
            }`}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {role === 'cfo' ? (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={cfoViewMode === 'portfolio' ? 'portfolio' : selectedCompanyId}
                      onChange={(e) => {
                        if (e.target.value === 'portfolio') {
                          setCfoViewMode('portfolio');
                        } else {
                          setCfoViewMode('single_company');
                          setSelectedCompanyId(e.target.value);
                        }
                      }}
                      className="font-bold text-slate-900 text-sm tracking-tight bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 cursor-pointer focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="portfolio">🌐 All Companies (Portfolio Overview)</option>
                      <optgroup label="Single Company Workspaces">
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>
                            🏢 {c.companyName} ({c.legalEntity})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-sm tracking-tight">
                      {clientProfile.companyName}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-emerald-600" />
                      Single-Company Access
                    </span>
                  </div>
                )}
                
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  FY {clientProfile.financialYear}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>GSTIN: <span className="font-mono text-slate-700">{clientProfile.gstin}</span></span>
                <span>•</span>
                <span>PAN: <span className="font-mono text-slate-700">{clientProfile.pan}</span></span>
                <span>•</span>
                <span>CFO: <span className="text-slate-700">{clientProfile.cfoName}</span></span>
              </div>
            </div>
          </div>

          {/* User Profile & 3-Way Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
            
            {/* 3-Way Role Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              {/* CFO */}
              <button
                onClick={() => {
                  setRole('cfo');
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  role === 'cfo'
                    ? 'bg-white text-indigo-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${role === 'cfo' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>CFO View</span>
              </button>

              {/* Client */}
              <button
                onClick={() => {
                  setRole('client');
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-white text-emerald-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className={`w-3.5 h-3.5 ${role === 'client' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Client View</span>
              </button>

              {/* Client Team */}
              <button
                onClick={() => {
                  setRole('client_team');
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  role === 'client_team'
                    ? 'bg-white text-sky-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${role === 'client_team' ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>Client Team</span>
              </button>
            </div>

            {/* Login / Switch Account Portal Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Open Role Login & Authentication Gateway"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Switch Login</span>
            </button>

            {/* Sample data reset */}
            <button
              onClick={() => {
                if (window.confirm('Reset sample data to initial state?')) {
                  resetToDefaultData();
                }
              }}
              title="Reset sample data"
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between overflow-x-auto py-1.5">
          <nav className="flex items-center gap-1">
            {/* Dashboard Tab - Hidden for Client Team, Available for Client (Executive Summary) and CFO (Portfolio/Surveillance) */}
            {role !== 'client_team' && (
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>
                  {role === 'cfo' 
                    ? (cfoViewMode === 'portfolio' ? 'CFO Dashboard (All Companies)' : 'CFO Company Workspace') 
                    : 'Executive Summary Dashboard'}
                </span>
                {role === 'cfo' && criticalDelayedItems.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                    {criticalDelayedItems.length} Critical
                  </span>
                )}
              </button>
            )}

            {/* Compliance Master - Accessible to All Roles */}
            <button
              id="nav-tab-compliances"
              onClick={() => setActiveTab('compliances')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'compliances'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Compliance Master</span>
              <span className={`ml-1 text-[10px] font-normal ${activeTab === 'compliances' ? 'text-slate-300' : 'text-slate-400'}`}>
                ({stats.fullyCompletedCompliances}/{stats.totalCompliances})
              </span>
            </button>

            {/* Action Items - Accessible to All Roles */}
            <button
              id="nav-tab-actions"
              onClick={() => setActiveTab('actions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'actions'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Action Items</span>
              {stats.pendingActions > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-medium ${
                  activeTab === 'actions' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {stats.pendingActions}
                </span>
              )}
            </button>

            {/* Financial MIS - Hidden for Client Team, Available for Client & CFO */}
            {role !== 'client_team' && (
              <button
                id="nav-tab-mis"
                onClick={() => setActiveTab('mis')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'mis'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Financial MIS</span>
              </button>
            )}

            {/* Complete Budget & Variance Analysis - Hidden for Client Team, Available for Client & CFO */}
            {role !== 'client_team' && (
              <button
                id="nav-tab-budget"
                onClick={() => setActiveTab('budget')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'budget'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Budget & Variance</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  activeTab === 'budget' 
                    ? 'bg-amber-400 text-slate-950' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  ±5% Alerts
                </span>
              </button>
            )}

            {/* Invoice Tracking - Hidden for Client Team, Available for Client & CFO */}
            {role !== 'client_team' && (
              <button
                id="nav-tab-invoices"
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'invoices'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>Invoice Tracking</span>
                {invoiceStats.critical > 0 ? (
                  <span 
                    className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse flex items-center gap-0.5" 
                    title={`${invoiceStats.critical} invoices pending >2 days (SLA Breached)`}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white"></span>
                    {invoiceStats.critical} Critical
                  </span>
                ) : (
                  <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-medium ${
                    activeTab === 'invoices' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {invoiceStats.total}
                  </span>
                )}
              </button>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            {role === 'client_team' ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                Operational Access: Compliance Master & Action Items
              </span>
            ) : role === 'client' ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Client Executive View (Full Access Excl. CFO Dashboard)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Virtual CFO Master Control (All Tabs & All Companies)
              </span>
            )}
            <span className="font-semibold text-slate-800 ml-1">
              {currentUser.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

