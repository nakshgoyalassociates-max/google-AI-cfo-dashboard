import React from 'react';
import { 
  FileText, 
  Receipt, 
  Building, 
  CreditCard, 
  Users, 
  ShieldAlert, 
  Briefcase, 
  AlertTriangle, 
  Clock, 
  Flame, 
  TrendingDown, 
  DollarSign, 
  ChevronRight,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface AffectedClientIssue {
  companyId: string;
  companyName: string;
  shortIssue: string;
  severity: 'critical' | 'delayed' | 'pending' | 'smooth';
  delayText?: string;
  amountText?: string;
}

export interface StreamCategoryItem {
  id: string;
  kind: 'compliance' | 'action' | 'mis';
  title: string;
  subtitle: string;
  iconType: 'gst' | 'tds' | 'roc' | 'incometax' | 'payroll' | 'audit_act' | 'banking_act' | 'vendor_act' | 'control_act' | 'runway_mis' | 'budget_mis' | 'msme_mis' | 'debtor_mis';
  totalMonitored: number;
  delayedOrAtRiskCount: number;
  status: 'critical' | 'attention' | 'smooth';
  headlineStat: string;
  headlineLabel: string;
  affectedClients: AffectedClientIssue[];
  remediationNote: string;
  primaryTargetTab: 'compliances' | 'actions' | 'mis';
}

interface StreamSquareWindowProps {
  stream: StreamCategoryItem;
}

export const StreamSquareWindow: React.FC<StreamSquareWindowProps> = ({ stream }) => {
  const { switchCompanyAndTab, drillDownToCompany } = useApp();

  // Pick appropriate icon based on stream type
  const renderIcon = () => {
    const iconClass = "w-4 h-4";
    switch (stream.iconType) {
      case 'gst': return <Receipt className={iconClass} />;
      case 'tds': return <CreditCard className={iconClass} />;
      case 'roc': return <Building className={iconClass} />;
      case 'incometax': return <FileText className={iconClass} />;
      case 'payroll': return <Users className={iconClass} />;
      case 'audit_act': return <ShieldAlert className={iconClass} />;
      case 'banking_act': return <Briefcase className={iconClass} />;
      case 'vendor_act': return <AlertTriangle className={iconClass} />;
      case 'control_act': return <Clock className={iconClass} />;
      case 'runway_mis': return <Flame className={iconClass} />;
      case 'budget_mis': return <TrendingDown className={iconClass} />;
      case 'msme_mis': return <DollarSign className={iconClass} />;
      case 'debtor_mis': return <Clock className={iconClass} />;
      default: return <FileText className={iconClass} />;
    }
  };

  const statusConfig = {
    smooth: {
      border: 'border-slate-200 hover:border-emerald-400',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeIcon: CheckCircle2,
      badgeText: 'All On Track',
      dotColor: 'bg-emerald-500',
      headerBg: 'bg-emerald-50/40'
    },
    attention: {
      border: 'border-amber-300 hover:border-amber-400',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      badgeIcon: Clock,
      badgeText: 'Delays / Review',
      dotColor: 'bg-amber-500',
      headerBg: 'bg-amber-50/40'
    },
    critical: {
      border: 'border-rose-300 hover:border-rose-500',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
      badgeIcon: AlertOctagon,
      badgeText: 'Critical Breach',
      dotColor: 'bg-rose-500 animate-pulse',
      headerBg: 'bg-rose-50/40'
    }
  }[stream.status];

  return (
    <div 
      className={`bg-white rounded-xl border ${statusConfig.border} shadow-2xs hover:shadow-xs transition-all aspect-square flex flex-col justify-between p-3 overflow-hidden group select-none`}
    >
      {/* Top Header: Stream Icon, Title, Kind & Health Badge */}
      <div className="flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg font-bold text-white flex items-center justify-center shrink-0 shadow-2xs ${
            stream.status === 'critical' ? 'bg-rose-600' : stream.status === 'attention' ? 'bg-amber-600' : 'bg-slate-900'
          }`}>
            {renderIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {stream.kind.toUpperCase()}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs tracking-tight truncate" title={stream.title}>
              {stream.title}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <div 
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${statusConfig.badgeBg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
          <span>{statusConfig.badgeText}</span>
        </div>
      </div>

      {/* Middle Core: Big Metric & Comprehensive List of Delays Across All Clients */}
      <div className="flex-1 flex flex-col justify-between py-1.5 min-h-0 space-y-1.5">
        
        {/* Metric Banner: Aggregated count across all clients */}
        <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 block">{stream.headlineLabel}</span>
            <span className={`text-sm font-bold leading-tight ${
              stream.status === 'critical' ? 'text-rose-700' : stream.status === 'attention' ? 'text-amber-800' : 'text-slate-900'
            }`}>
              {stream.headlineStat}
            </span>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <span>Portfolio Load:</span>
            <span className="font-bold text-slate-800 ml-1">{stream.totalMonitored} items</span>
          </div>
        </div>

        {/* 🚨 Actual Picture of Delay / Non-Compliance for All Clients */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 min-h-0">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
            Client Delay & Friction Breakdown:
          </div>

          {stream.affectedClients.length > 0 ? (
            stream.affectedClients.map((client, idx) => (
              <div 
                key={`${client.companyId}-${idx}`}
                onClick={() => switchCompanyAndTab(client.companyId, stream.primaryTargetTab)}
                className={`p-1.5 rounded border transition-colors cursor-pointer flex flex-col justify-between gap-0.5 ${
                  client.severity === 'critical' 
                    ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 text-rose-900' 
                    : client.severity === 'delayed'
                    ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 text-amber-900'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-800'
                }`}
                title={`Click to control ${client.companyName} in ${stream.primaryTargetTab}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[10px] truncate max-w-[120px]">
                    {client.companyName}
                  </span>
                  {client.delayText && (
                    <span className="text-[9px] font-semibold text-rose-700 shrink-0">
                      {client.delayText}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-600 gap-1">
                  <span className="truncate">{client.shortIssue}</span>
                  {client.amountText && (
                    <span className="font-bold text-slate-900 shrink-0">{client.amountText}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 rounded bg-emerald-50 border border-emerald-100 text-center text-[10px] text-emerald-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
              <span>All client companies are compliant & on schedule with no delays.</span>
            </div>
          )}
        </div>

        {/* Micro Remediation / CFO Advisory Footnote */}
        <div className="text-[9px] text-slate-500 px-1 truncate shrink-0">
          <span className="font-semibold text-slate-700">Action:</span> {stream.remediationNote}
        </div>
      </div>

      {/* Action Footer: Quick jump to all affected clients in this stream */}
      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5 shrink-0">
        <span className="text-[9px] text-slate-400">
          {stream.affectedClients.length} {stream.affectedClients.length === 1 ? 'entity' : 'entities'} flagged
        </span>

        <button
          onClick={() => {
            const firstAffected = stream.affectedClients[0];
            if (firstAffected) {
              switchCompanyAndTab(firstAffected.companyId, stream.primaryTargetTab);
            } else {
              switchCompanyAndTab('client-101', stream.primaryTargetTab);
            }
          }}
          className="py-1 px-2 rounded-md bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <span>Examine Stream</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
