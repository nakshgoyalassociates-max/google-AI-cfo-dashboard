import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  FileCheck, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  Layers
} from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const PortfolioOverview: React.FC = () => {
  const { 
    allCompaniesOverview, 
    drillDownToCompany, 
    clientProfile 
  } = useApp();

  // Aggregate stats across all companies
  const totalCompanies = allCompaniesOverview.length;
  const totalPendingCfoSignoffs = allCompaniesOverview.reduce((acc, c) => acc + (c.pendingCfoReviews || 0), 0);
  const totalCompliancesAll = allCompaniesOverview.reduce((acc, c) => acc + (c.totalCompliances || 0), 0);
  const totalCompletedAll = allCompaniesOverview.reduce((acc, c) => acc + (c.fullyCompletedCompliances || 0), 0);
  const avgComplianceRate = totalCompliancesAll > 0 ? Math.round((totalCompletedAll / totalCompliancesAll) * 100) : 0;
  const totalRevenue = allCompaniesOverview.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);
  const totalTaxQueued = allCompaniesOverview.reduce((acc, c) => acc + (c.taxPending || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Portfolio Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Virtual CFO Practice Portfolio
              </span>
              <span className="text-xs text-slate-400">
                {clientProfile.cfoFirm}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              All Client Companies Overview & Surveillance
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consolidated governance across all active client entities. Inspect compliance progress, review pending sign-offs, and drill down into individual company workspaces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">Practicing CFO</span>
              <p className="text-sm font-bold text-white">{clientProfile.cfoName}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              MG
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Macro KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Client Entities</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalCompanies}</span>
            <span className="text-xs text-slate-500">Active Companies</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tech, Logistics & Healthcare
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Portfolio Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgComplianceRate}%</span>
            <span className="text-xs text-slate-500">Avg Progress</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalCompletedAll} of {totalCompliancesAll} filings closed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending CFO Sign-Offs</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{totalPendingCfoSignoffs}</span>
            <span className="text-xs text-slate-500">Awaiting Sign-off</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Drafts ready across all clients
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Aggregate MoM Revenue</span>
            <IndianRupee className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">₹{(totalRevenue / 10000000).toFixed(2)} Cr</span>
            <span className="text-xs text-slate-500">/ month</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ₹{(totalTaxQueued / 100000).toFixed(2)}L tax queued
          </p>
        </div>

      </div>

      {/* Master Client Overview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              All Client Companies Status & Drill-Down
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any company to inspect detailed ledgers, approve filings, and review operational pendencies
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {allCompaniesOverview.length} Corporate Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Company & Entity Details</th>
                <th className="py-3 px-4 min-w-[170px]">Statutory Compliance</th>
                <th className="py-3 px-4 text-center">CFO Sign-Off Queue</th>
                <th className="py-3 px-4 text-center">Action Pendencies</th>
                <th className="py-3 px-4">Revenue & Runway</th>
                <th className="py-3 px-4">Next Deadline</th>
                <th className="py-3 px-4 text-right">Workspace Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCompaniesOverview.map((company) => {
                return (
                  <tr 
                    key={company.companyId}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => drillDownToCompany(company.companyId)}
                  >
                    {/* Company info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 transition-colors">
                          {(company.companyName || 'CO').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs">
                              {company.companyName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                              {company.entityType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>GSTIN: <span className="font-mono text-slate-700">{company.gstin}</span></span>
                            <span>•</span>
                            <span>{company.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Statutory compliance progress */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{company.compliancePercentage}%</span>
                          <span className="text-slate-500">
                            {company.fullyCompletedCompliances}/{company.totalCompliances} Filed
                          </span>
                        </div>
                        <ProgressBar 
                          percentage={company.compliancePercentage}
                          height="h-1.5"
                          color={company.compliancePercentage >= 80 ? 'bg-emerald-600' : 'bg-indigo-600'}
                        />
                      </div>
                    </td>

                    {/* CFO Sign-off queue */}
                    <td className="py-3.5 px-4 text-center">
                      {company.pendingCfoReviews > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          {company.pendingCfoReviews} Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          All Clear
                        </span>
                      )}
                    </td>

                    {/* Action pendencies */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-semibold text-slate-900">
                          {company.pendingActions} Open
                        </span>
                        {company.overdueActions > 0 && (
                          <span className="text-[10px] font-bold text-red-600">
                            ({company.overdueActions} Overdue)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Financial MIS */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-900">
                          ₹{(company.monthlyRevenue / 100000).toFixed(1)}L / mo
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Runway: <span className="font-medium text-slate-700">{company.cashRunwayMonths} Mo</span>
                        </div>
                      </div>
                    </td>

                    {/* Next deadline */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-xs">{company.nextUpcomingDeadline}</span>
                      </div>
                    </td>

                    {/* Action Drill down */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          drillDownToCompany(company.companyId);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <span>Drill Down</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Company Statutory Calendar Summary */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          Critical Monthly Statutory Filing Milestones Across Portfolio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Nexora Innovations</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-700 font-semibold">
                Due 20th Sep
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              GSTR-3B Filing & Form 3CD Tax Audit Finalization
            </p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Tax: ₹4.85L</span>
              <span className="text-indigo-600 font-medium cursor-pointer hover:underline" onClick={() => drillDownToCompany('client-101')}>
                Open Workspace →
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Apex Global Logistics</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-semibold">
                Due 20th Sep
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Monthly GSTR-3B & Interstate Transport RCM Reconciliation
            </p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Tax: ₹6.10L</span>
              <span className="text-indigo-600 font-medium cursor-pointer hover:underline" onClick={() => drillDownToCompany('client-102')}>
                Open Workspace →
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Zenith HealthTech</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 font-semibold">
                Due 28th Sep
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              ROC Annual Return Form 8 & R&D Payroll PF
            </p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Tax: ₹2.40L</span>
              <span className="text-indigo-600 font-medium cursor-pointer hover:underline" onClick={() => drillDownToCompany('client-103')}>
                Open Workspace →
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
