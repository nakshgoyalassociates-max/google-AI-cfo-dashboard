import React from 'react';
import { CompanyOverviewSummary } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  ArrowRight, 
  CheckSquare, 
  TrendingUp,
  AlertCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';
import { formatLakhs, formatINR } from '../../utils/format';

interface CompanySquareWindowProps {
  company: CompanyOverviewSummary;
}

export const CompanySquareWindow: React.FC<CompanySquareWindowProps> = ({ company }) => {
  const { drillDownToCompany, switchCompanyAndTab } = useApp();

  // Overall Health styling configurations
  const healthConfig = {
    smooth: {
      border: 'border-slate-200 hover:border-emerald-400',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeIcon: CheckCircle2,
      badgeText: 'Smooth Health',
      avatarBg: 'bg-slate-900',
      dotColor: 'bg-emerald-500'
    },
    attention: {
      border: 'border-amber-300 hover:border-amber-400',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      badgeIcon: Clock,
      badgeText: 'Review Required',
      avatarBg: 'bg-amber-600',
      dotColor: 'bg-amber-500'
    },
    critical: {
      border: 'border-rose-300 hover:border-rose-500',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
      badgeIcon: AlertOctagon,
      badgeText: 'Critical Delays',
      avatarBg: 'bg-rose-600',
      dotColor: 'bg-rose-500 animate-pulse'
    }
  }[company.overallHealth || 'smooth'];

  const BadgeIcon = healthConfig.badgeIcon;
  const criticalPoints = company.criticalPoints || [];

  return (
    <div 
      className={`bg-white rounded-xl border ${healthConfig.border} shadow-2xs hover:shadow-xs transition-all aspect-square flex flex-col justify-between p-3 overflow-hidden group select-none`}
    >
      {/* Top Strip: Monogram + Company Name & Sector + Health Status Pill */}
      <div className="flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg font-bold text-white text-xs flex items-center justify-center shrink-0 shadow-2xs ${healthConfig.avatarBg}`}>
            {(company.companyName || 'CO').substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 
              onClick={() => drillDownToCompany(company.companyId)}
              className="font-bold text-slate-900 text-xs tracking-tight truncate cursor-pointer hover:text-indigo-600 transition-colors"
              title={company.companyName}
            >
              {company.companyName}
            </h3>
            <p className="text-[9px] text-slate-400 truncate">
              {company.sector} • {company.entityType}
            </p>
          </div>
        </div>

        {/* Health Status Indicator */}
        <div 
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${healthConfig.badgeBg}`}
          title={`Overall Health: ${healthConfig.badgeText}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${healthConfig.dotColor}`} />
          <span>{healthConfig.badgeText}</span>
        </div>
      </div>

      {/* Middle Core: MAINLY CRITICAL PART + ALL METRICS BREAKDOWN */}
      <div className="flex-1 flex flex-col justify-between py-1.5 min-h-0 space-y-1.5">
        
        {/* 🚨 MAINLY CRITICAL & DELAY PART (Top Executive Focus) */}
        <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100 flex-1 flex flex-col justify-between min-h-0">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 shrink-0">
            <span>Critical & Delay Points</span>
            <span className={criticalPoints.length > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              {criticalPoints.length > 0 ? `${criticalPoints.length} Alert${criticalPoints.length > 1 ? 's' : ''}` : 'Zero Alerts'}
            </span>
          </div>

          <div className="overflow-y-auto space-y-1 pr-0.5 flex-1 min-h-0">
            {criticalPoints.length > 0 ? (
              criticalPoints.map((point, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-1 p-1 rounded bg-white border border-rose-100 text-[9px] text-rose-900 leading-tight"
                  title={point}
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 font-medium">{point}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium h-full justify-center text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Compliances, actions & MIS running smoothly on track.</span>
              </div>
            )}
          </div>

          {/* Upcoming Deadline Tracker */}
          <div className="pt-1 mt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 shrink-0">
            <span className="text-slate-400">Next Due:</span>
            <span className="font-semibold text-slate-800 truncate ml-1 max-w-[150px]">
              {company.nextUpcomingDeadline}
            </span>
          </div>
        </div>

        {/* 📊 ALL DETAILS METRIC SYNOPSIS (Statutory, Actions, MIS) */}
        <div className="grid grid-cols-3 gap-1.5 text-center shrink-0">
          
          {/* Statutory Compliance Tile */}
          <div 
            onClick={() => switchCompanyAndTab(company.companyId, 'compliances')}
            className="bg-slate-50 hover:bg-indigo-50/70 rounded-lg p-1.5 border border-slate-100 transition-colors cursor-pointer text-left"
            title={`Statutory Compliance: ${company.compliancePercentage}% (${company.fullyCompletedCompliances}/${company.totalCompliances} filings closed)`}
          >
            <div className="text-[8px] font-semibold text-slate-400 flex items-center gap-0.5 truncate">
              <ShieldCheck className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
              <span>Compliance</span>
            </div>
            <div className="font-bold text-slate-900 text-xs leading-tight mt-0.5">
              {company.compliancePercentage}%
            </div>
            <div className="text-[8px] text-slate-500 truncate mt-0.5">
              {company.fullyCompletedCompliances}/{company.totalCompliances} closed
            </div>
          </div>

          {/* Action Deliverables Tile */}
          <div 
            onClick={() => switchCompanyAndTab(company.companyId, 'actions')}
            className="bg-slate-50 hover:bg-indigo-50/70 rounded-lg p-1.5 border border-slate-100 transition-colors cursor-pointer text-left"
            title={`Action Deliverables: ${company.pendingActions} Open, ${company.overdueActions} Overdue`}
          >
            <div className="text-[8px] font-semibold text-slate-400 flex items-center gap-0.5 truncate">
              <CheckSquare className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
              <span>Actions</span>
            </div>
            <div className="font-bold text-slate-900 text-xs leading-tight mt-0.5">
              {company.pendingActions} Open
            </div>
            <div className="text-[8px] mt-0.5 truncate">
              {company.overdueActions > 0 ? (
                <span className="font-bold text-rose-600">
                  {company.overdueActions} Overdue
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">
                  0 Overdue
                </span>
              )}
            </div>
          </div>

          {/* Financial Runway & Revenue Tile */}
          <div 
            onClick={() => switchCompanyAndTab(company.companyId, 'mis')}
            className="bg-slate-50 hover:bg-indigo-50/70 rounded-lg p-1.5 border border-slate-100 transition-colors cursor-pointer text-left"
            title={`Financial MIS: ${company.cashRunwayMonths} Mo Runway • Revenue: ${formatLakhs(company.monthlyRevenue, 1)}/mo`}
          >
            <div className="text-[8px] font-semibold text-slate-400 flex items-center gap-0.5 truncate">
              <TrendingUp className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
              <span>Runway</span>
            </div>
            <div className={`font-bold text-xs leading-tight mt-0.5 truncate ${
              company.cashRunwayMonths < 8 ? 'text-amber-700' : 'text-slate-900'
            }`}>
              {company.cashRunwayMonths} Mo
            </div>
            <div className="text-[8px] text-slate-500 truncate mt-0.5">
              {formatLakhs(company.monthlyRevenue, 1)}/m
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer: Direct Workspace Drill-Down + Module Shortcuts */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 shrink-0">
        <button
          onClick={() => drillDownToCompany(company.companyId)}
          className="py-1 px-2.5 rounded-md bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {/* 3 Direct Jump Shortcuts */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchCompanyAndTab(company.companyId, 'compliances')}
            className="px-1.5 py-0.5 rounded bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 text-[9px] font-bold transition-colors cursor-pointer"
            title="Open Compliance Master"
          >
            CMP
          </button>
          <button
            onClick={() => switchCompanyAndTab(company.companyId, 'actions')}
            className="px-1.5 py-0.5 rounded bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 text-[9px] font-bold transition-colors cursor-pointer"
            title="Open Action Deliverables"
          >
            ACT
          </button>
          <button
            onClick={() => switchCompanyAndTab(company.companyId, 'mis')}
            className="px-1.5 py-0.5 rounded bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 text-[9px] font-bold transition-colors cursor-pointer"
            title="Open Financial MIS"
          >
            MIS
          </button>
        </div>
      </div>
    </div>
  );
};
