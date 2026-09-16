import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { 
  ShieldCheck, 
  Briefcase, 
  Users, 
  Lock, 
  ArrowRight, 
  X, 
  Building2, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { DEFAULT_USERS } from '../../data/mockInitialData';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    currentUser, 
    loginAs, 
    companies 
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<Role>(currentUser.role);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('client-101');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (roleToSign: Role) => {
    loginAs(roleToSign, roleToSign === 'cfo' ? selectedCompanyId : 'client-101');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Governance & Role Access Gateway
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">Select User Persona & Portal</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose an authentication profile to switch dashboards and operational permissions
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Available Portals & Access Scopes
          </p>

          {/* 1. CFO Portal */}
          <div 
            onClick={() => setSelectedRole('cfo')}
            className={`border rounded-xl p-4 transition-all cursor-pointer relative ${
              selectedRole === 'cfo' 
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 shadow-xs' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  MG
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Virtual CFO Portal</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                      Cross-Company Access
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">
                    CA Manish Goyal, FCA, DISA • Goyal & Associates
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Full surveillance across all client companies, Step 2 statutory review & approvals, cash runway oversight, and drill-down into individual client workspaces.
                  </p>
                </div>
              </div>
              {selectedRole === 'cfo' && (
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              )}
            </div>

            {selectedRole === 'cfo' && (
              <div className="mt-3 pt-3 border-t border-indigo-100/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Portfolio Scope: All 3 Client Entities
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignIn('cfo');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Sign In as CFO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Client Management / Promoter Portal */}
          <div 
            onClick={() => setSelectedRole('client')}
            className={`border rounded-xl p-4 transition-all cursor-pointer relative ${
              selectedRole === 'client' 
                ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-xs' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  AV
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Client Management / Promoter Portal</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Single-Company Restricted
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">
                    Anand Verma • Managing Director & Promoter
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Executive briefing on entity health, revenue growth, cash runway, Section 43B(h) MSME alerts, and statutory clearance status for Nexora Innovations.
                  </p>
                </div>
              </div>
              {selectedRole === 'client' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
            </div>

            {selectedRole === 'client' && (
              <div className="mt-3 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Locked to: Nexora Innovations Tech Pvt Ltd
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignIn('client');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Sign In as Client Director</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 3. Client Accounts Team Portal */}
          <div 
            onClick={() => setSelectedRole('client_team')}
            className={`border rounded-xl p-4 transition-all cursor-pointer relative ${
              selectedRole === 'client_team' 
                ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-600/20 shadow-xs' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  SR
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Client Accounts & Finance Team Portal</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
                      Operations Workstation
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">
                    Sneha Roy & Finance Operations Team
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Dedicated operations workstation for data collation (Step 1), final tax challans & filing submissions (Step 3), daily BRS reconciliations, and vendor expense vouchers.
                  </p>
                </div>
              </div>
              {selectedRole === 'client_team' && (
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              )}
            </div>

            {selectedRole === 'client_team' && (
              <div className="mt-3 pt-3 border-t border-sky-100/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  Locked to: Nexora Innovations Tech Pvt Ltd
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignIn('client_team');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Sign In as Accounts Team</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Strict Company Isolation Enforced: Client & Team cannot access other corporate entities.</span>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
