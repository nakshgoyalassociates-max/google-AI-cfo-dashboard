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

        {/* Navigation Tabs / Client Single Dashboard Bar */}
        <div className="flex items-center justify-between overflow-x-auto py-1.5">
          {role === 'client' ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs shadow-xs">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Executive All-in-One Dashboard</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 pl-1">
                  <span className="text-slate-300">•</span>
                  <span>Unified view of MIS, Compliance, Actions, Ratios & Company Health</span>
                </div>
              </div>

              {/* Quick in-page section jumps */}
              <div className="flex items-center gap-1 text-xs">
                <a
                  href="#health-charts"
                  className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-[11px] transition-colors"
                >
                  Health & Trends
                </a>
                <a
                  href="#financial-ratios"
                  className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-[11px] transition-colors"
                >
                  MIS Ratios
                </a>
                <a
                  href="#compliance-status"
                  className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-[11px] transition-colors"
                >
                  Compliances
                </a>
                <a
                  href="#action-status"
                  className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-[11px] transition-colors"
                >
                  Actions
                </a>
                <a
                  href="#core-statements"
                  className="px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-[11px] transition-colors"
                >
                  Statements
                </a>
              </div>
            </div>
          ) : (
            <nav className="flex items-center gap-1">
              {/* Dashboard / Workstation Tab */}
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
                    : role === 'client_team'
                      ? 'Team Workstation'
                      : 'Executive Summary Dashboard'}
                </span>
                {role === 'cfo' && criticalDelayedItems.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                    {criticalDelayedItems.length} Critical
                  </span>
                )}
              </button>

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

              {/* Financial MIS - Encompassing Statements, Working Capital & Budget/Variance (CFO & Client Team) */}
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
                <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-medium ${
                  activeTab === 'mis' 
                    ? 'bg-slate-800 text-slate-200' 
                    : role === 'client_team' 
                      ? 'bg-sky-100 text-sky-700 font-semibold' 
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {role === 'client_team' ? 'Update & Variance' : 'MIS & Budget'}
                </span>
              </button>
            </nav>
          )}

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            {role === 'client_team' ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                Client Team
              </span>
            ) : role === 'client' ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Client Executive
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Virtual CFO
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

