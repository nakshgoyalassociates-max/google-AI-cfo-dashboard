import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { DueDateBadge } from '../common/DueDateBadge';
import { compareDueDates } from '../../utils/dueDate';
import { formatLakhs, formatCrores, formatINR } from '../../utils/format';
import { ProgressBar } from '../common/ProgressBar';
import { 
  getComplianceFourColorStatus, 
  getActionFourColorStatus, 
  getLineItemRowClasses 
} from '../../utils/statusColors';
import { ComplianceSubtaskProgressIcons } from '../common/ComplianceSubtaskProgressIcons';
import { ActionSubtaskProgressIcons } from '../common/ActionSubtaskProgressIcons';
import { ClientHealthVisuals } from './ClientHealthVisuals';
import { ClientFinancialRatios } from './ClientFinancialRatios';
import { BalanceSheetView } from '../mis/BalanceSheetView';
import { PnlAccountView } from '../mis/PnlAccountView';
import { DebtorAgeingView } from '../mis/DebtorAgeingView';
import { FundFlowView } from '../mis/FundFlowView';
import { BudgetTab } from '../mis/BudgetTab';
import { 
  NEXORA_BALANCE_SHEET, 
  NEXORA_PNL_STATEMENT, 
  NEXORA_DEBTOR_AGEING, 
  NEXORA_FUND_FLOW,
  COMPANY_MIS_DETAILED 
} from '../../data/mockMisFinancials';
import { 
  ShieldCheck, 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  FileText, 
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  Lock,
  Building2,
  CheckSquare,
  BarChart3,
  Layers,
  ArrowRight,
  AlertTriangle,
  ReceiptText,
  Scale,
  ArrowRightLeft,
  Users,
  Calculator,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';
import { ComplianceItem, ActionItem } from '../../types';

type StatementTab = 'balance-sheet' | 'pnl' | 'debtor-ageing' | 'fund-flow' | 'budget';

export const ClientDashboard: React.FC = () => {
  const { 
    clientProfile, 
    financialMIS, 
    compliances, 
    actions, 
    stats,
    setSelectedCompliance
  } = useApp();

  const handlePrint = () => {
    window.print();
  };

  // Active detailed statement datasets for selected company
  const detailedCompanyData = COMPANY_MIS_DETAILED[clientProfile.id] || COMPANY_MIS_DETAILED['client-101'];
  const activeBalanceSheet = financialMIS.balanceSheet || detailedCompanyData.balanceSheet || NEXORA_BALANCE_SHEET;
  const activePnl = financialMIS.pnlStatement || detailedCompanyData.pnlStatement || NEXORA_PNL_STATEMENT;
  const activeDebtorAgeing = financialMIS.debtorAgeing || detailedCompanyData.debtorAgeing || NEXORA_DEBTOR_AGEING;
  const activeFundFlow = financialMIS.fundFlow || detailedCompanyData.fundFlow || NEXORA_FUND_FLOW;

  // Statement navigation within this single dashboard
  const [activeStatementTab, setActiveStatementTab] = useState<StatementTab>('balance-sheet');
  const [isStatementExpanded, setIsStatementExpanded] = useState<boolean>(true);

  // Compliance search and category filters
  const [complianceSearch, setComplianceSearch] = useState<string>('');
  const [selectedComplianceCategory, setSelectedComplianceCategory] = useState<string>('all');
  const [showAllCompliances, setShowAllCompliances] = useState<boolean>(false);

  // Action search and filters
  const [actionSearch, setActionSearch] = useState<string>('');
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('all');
  const [showAllActions, setShowAllActions] = useState<boolean>(false);

  // 1. Broad Compliance Statistics & Categories
  const categories = [
    { name: 'GST', label: 'Goods & Services Tax', code: 'GST' },
    { name: 'TDS / TCS', label: 'Tax Deducted at Source', code: 'TDS / TCS' },
    { name: 'Income Tax', label: 'Corporate Income & Advance Tax', code: 'Income Tax' },
    { name: 'ROC / MCA', label: 'Ministry of Corporate Affairs', code: 'ROC / MCA' },
    { name: 'PF / ESI', label: 'Labor Laws & Employee Benefits', code: 'PF / ESI' }
  ];

  const categorySummaries = categories.map(cat => {
    const items = compliances.filter(c => c.category === cat.code);
    const completed = items.filter(c => c.subtasks && c.subtasks[2]?.status === 'completed').length;
    const pendingReview = items.filter(c => c.subtasks && c.subtasks[0]?.status === 'completed' && c.subtasks[1]?.status === 'pending').length;
    const totalSubtasks = items.length * 3;
    let completedSubtasks = 0;
    items.forEach(c => {
      completedSubtasks += (c.subtasks || []).filter(s => s && s.status === 'completed').length;
    });
    const pct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return {
      ...cat,
      totalItems: items.length,
      completedItems: completed,
      pendingReviewItems: pendingReview,
      progressPct: pct,
      status: pct === 100 ? 'Fully Filed' : pct >= 66 ? 'CFO Verified' : 'In Progress'
    };
  });

  // Upcoming statutory deadlines (sorted by nextDueDate ascending)
  const upcomingFilings = useMemo(() => {
    return (compliances || [])
      .filter(c => c && (!c.subtasks || c.subtasks[2]?.status !== 'completed'))
      .sort(compareDueDates)
      .slice(0, 4);
  }, [compliances]);

  // Filtered Compliances list
  const filteredCompliances = useMemo(() => {
    return (compliances || []).filter(c => {
      if (!c) return false;
      const matchCat = selectedComplianceCategory === 'all' || c.category === selectedComplianceCategory;
      const matchSearch = complianceSearch.trim() === '' || 
        (c.title && c.title.toLowerCase().includes(complianceSearch.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(complianceSearch.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(complianceSearch.toLowerCase())) ||
        (c.formOrReturn && c.formOrReturn.toLowerCase().includes(complianceSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [compliances, selectedComplianceCategory, complianceSearch]);

  // 2. Broad Action Items Breakdown
  const openActions = (actions || []).filter(a => a && a.status !== 'Completed');
  const overdueActions = (actions || []).filter(a => {
    if (!a || a.status === 'Completed') return false;
    const d = new Date(a.fixedDeadline);
    return !isNaN(d.getTime()) && d < new Date();
  });
  const urgentActions = (actions || []).filter(a => a && a.status !== 'Completed' && a.priority === 'Urgent');
  const completedActions = (actions || []).filter(a => a && a.status === 'Completed');

  // Filtered Actions list
  const filteredActions = useMemo(() => {
    return (actions || []).filter(a => {
      if (!a) return false;
      const matchStatus = actionStatusFilter === 'all' 
        ? true 
        : actionStatusFilter === 'open' 
          ? a.status !== 'Completed' 
          : a.status === actionStatusFilter;
      const matchSearch = actionSearch.trim() === '' ||
        (a.title && a.title.toLowerCase().includes(actionSearch.toLowerCase())) ||
        (a.category && a.category.toLowerCase().includes(actionSearch.toLowerCase())) ||
        (a.assignedRole && a.assignedRole.toLowerCase().includes(actionSearch.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [actions, actionStatusFilter, actionSearch]);

  // Handler from Financial Ratios to switch statement tab
  const handleSelectStatementTab = (tab: StatementTab) => {
    setActiveStatementTab(tab);
    setIsStatementExpanded(true);
    const elem = document.getElementById('core-statements');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-7 pb-12">
      
      {/* 1. Executive Master Header */}
      <div id="overview" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Executive Client Briefing
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                Period: {financialMIS.period}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                Managed by {clientProfile.cfoName} • {clientProfile.cfoFirm}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                FY 2026-27 (Q2)
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {clientProfile.companyName} • Consolidated Executive Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Unified broad overview presenting monthly financial MIS performance, statutory compliance filings standing, active operational action items, key financial ratios, and graphical company health analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Briefing</span>
            </button>
            <a
              href="#health-charts"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Company Health</span>
            </a>
            <a
              href="#core-statements"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Core Statements</span>
            </a>
          </div>
        </div>

        {/* Quick In-Page Anchor Navigation Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
            Quick Section Navigation:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { href: '#kpis', label: 'Executive KPIs' },
              { href: '#health-charts', label: 'Company Health & Trajectory' },
              { href: '#financial-ratios', label: 'MIS Financial Ratios' },
              { href: '#compliance-status', label: 'Compliance Status' },
              { href: '#action-status', label: 'Action Items' },
              { href: '#core-statements', label: 'Core MIS Statements' },
              { href: '#cfo-alerts', label: 'CFO Strategic Notes' }
            ].map(anchor => (
              <a
                key={anchor.href}
                href={anchor.href}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/60 font-medium text-[11px] transition-colors"
              >
                {anchor.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Executive Key Performance Indicators (Broad MIS Strip) */}
      <div id="kpis" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          id="metric-revenue"
          title="Gross Monthly Revenue"
          value={formatLakhs(activePnl.income.totalIncome || financialMIS.monthlyRevenue)}
          trend={`${financialMIS.revenueGrowthMoM >= 0 ? '+' : ''}${financialMIS.revenueGrowthMoM}% MoM`}
          trendDirection={financialMIS.revenueGrowthMoM >= 0 ? 'up' : 'down'}
          colorScheme="blue"
          icon={<IndianRupee className="w-4 h-4" />}
          subtitle={`GP Margin: ${activePnl.profitability.grossMarginPercent || financialMIS.grossMarginPercent}%`}
        />

        <MetricCard
          id="metric-ebitda"
          title="Operating EBITDA"
          value={formatLakhs(activePnl.profitability.ebitda || financialMIS.ebitda)}
          trend={`${activePnl.profitability.ebitdaMarginPercent || financialMIS.ebitdaMarginPercent}% Margin`}
          trendDirection="up"
          colorScheme="indigo"
          icon={<TrendingUp className="w-4 h-4" />}
          subtitle="Core operational cashflow"
        />

        <MetricCard
          id="metric-pat"
          title="Net Profit (PAT)"
          value={formatLakhs(activePnl.profitability.pat || financialMIS.netProfit)}
          trend={`${activePnl.profitability.patMarginPercent || ((financialMIS.netProfit / financialMIS.monthlyRevenue) * 100).toFixed(1)}% PAT`}
          trendDirection="up"
          colorScheme="emerald"
          icon={<Sparkles className="w-4 h-4" />}
          subtitle="Bottom-line accretion"
        />

        <MetricCard
          id="metric-treasury"
          title="Liquid Treasury"
          value={formatCrores(financialMIS.cashAndBankBalance)}
          trend={`${financialMIS.cashRunwayMonths.toFixed(1)} Mo Runway`}
          trendDirection="up"
          colorScheme="emerald"
          icon={<Building2 className="w-4 h-4" />}
          subtitle="Current & FD accounts"
        />

        <MetricCard
          id="metric-working-capital"
          title="Net Working Capital"
          value={formatCrores(financialMIS.workingCapital)}
          trend="Current Ratio 4.14x"
          trendDirection="neutral"
          colorScheme="blue"
          icon={<Scale className="w-4 h-4" />}
          subtitle={`Debtor DSO: ${financialMIS.debtorDaysDSO}d`}
        />

        <MetricCard
          id="metric-compliance-pct"
          title="Statutory Health"
          value={`${stats.overallCompliancePercentage}%`}
          trend={`${stats.fullyCompletedCompliances} / ${stats.totalCompliances} Filed`}
          trendDirection="up"
          colorScheme="emerald"
          icon={<ShieldCheck className="w-4 h-4" />}
          subtitle="0 statutory penalties"
        />
      </div>

      {/* 3. Graphical Representation of Company Health (Rich Charts & Composite Index) */}
      <ClientHealthVisuals
        balanceSheet={activeBalanceSheet}
        pnl={activePnl}
        debtorAgeing={activeDebtorAgeing}
        financialMIS={financialMIS}
        compliances={compliances}
      />

      {/* 4. Important Financial Ratios Linked with MIS */}
      <ClientFinancialRatios
        balanceSheet={activeBalanceSheet}
        pnl={activePnl}
        debtorAgeing={activeDebtorAgeing}
        financialMIS={financialMIS}
        compliances={compliances}
        onSelectStatementTab={handleSelectStatementTab}
      />

      {/* 5. Broad View of Statutory Compliance Status */}
      <div id="compliance-status" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Statutory Compliance Standing & Filing Status
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                {stats.overallCompliancePercentage}% Health
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Overview of 35 master compliance obligations across GST, TDS, Corporate Tax, ROC/MCA, and Labor Laws, verified through the 3-step CFO review framework.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllCompliances(!showAllCompliances)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAllCompliances ? 'Collapse Master List' : 'View All 35 Master Compliances'}</span>
              {showAllCompliances ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Five Statutory Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categorySummaries.map(cat => (
            <div 
              key={cat.code} 
              className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{cat.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{cat.label}</span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  cat.progressPct === 100 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : cat.progressPct >= 66 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {cat.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px] font-sans">Progress:</span>
                <span className="font-bold text-slate-800">{cat.progressPct}%</span>
              </div>

              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    cat.progressPct === 100 ? 'bg-emerald-500' : cat.progressPct >= 66 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${cat.progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>{cat.totalItems} Filings</span>
                <span>{cat.completedItems} Portal Filed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Immediate Upcoming Statutory Deadlines (Next 7-15 Days) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Immediate Statutory Deadlines (Next 7–15 Days)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">3-Stage Verification Icons</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingFilings.map(compliance => (
              <div 
                key={compliance.id}
                onClick={() => setSelectedCompliance(compliance)}
                className="group p-3.5 bg-slate-50/90 hover:bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xs cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                        {compliance.category}
                      </span>
                      <DueDateBadge item={compliance} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {compliance.title}
                    </span>
                  </div>
                  {compliance.estimatedTaxAmount && (
                    <div className="text-right shrink-0 font-mono">
                      <span className="text-xs font-bold text-slate-900 block">
                        ₹{(compliance.estimatedTaxAmount / 1000).toFixed(0)}k
                      </span>
                      <span className="text-[9px] text-slate-400 block font-sans">Est. Outflow</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Stage:</span>
                    <ComplianceSubtaskProgressIcons compliance={compliance} />
                  </div>
                  <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
                    <span>View Filing Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable All 35 Master Compliances Register */}
        {showAllCompliances && (
          <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search compliance by title, form (GSTR-3B, 24Q, MGT-7)..."
                  value={complianceSearch}
                  onChange={(e) => setComplianceSearch(e.target.value)}
                  className="text-xs bg-transparent focus:outline-none w-64 text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1">
                {['all', 'GST', 'TDS / TCS', 'Income Tax', 'ROC / MCA', 'PF / ESI'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedComplianceCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      selectedComplianceCategory === cat 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? 'All (35)' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Compliance Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Statutory Obligation & Description</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">3-Stage Verification</th>
                    <th className="py-2.5 px-3 text-right">Est. Tax</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompliances.map((c, index) => {
                    const rowStatus = getComplianceFourColorStatus(c);
                    const isFullyDone = c.subtasks && c.subtasks[2]?.status === 'completed';
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedCompliance(c)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-700">
                            {c.title}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">
                            {c.formOrReturn ? `${c.formOrReturn} • ` : ''}{c.description}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <DueDateBadge item={c} />
                        </td>
                        <td className="py-2.5 px-3">
                          <ComplianceSubtaskProgressIcons compliance={c} />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 font-medium">
                          {c.estimatedTaxAmount ? `₹${(c.estimatedTaxAmount / 1000).toFixed(0)}k` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompliance(c);
                            }}
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Open filing details & challan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 6. Broad View of Operational Action Items Status */}
      <div id="action-status" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Operational Action Items & Departmental Pendencies
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full">
                {openActions.length} Pending Actions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tracking internal finance workflows, bank reconciliations, vendor MSME clearance, and audit deliverables across departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllActions(!showAllActions)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAllActions ? 'Collapse Action Register' : `View All Actions (${actions.length})`}</span>
              {showAllActions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 4 Action Status KPI Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Total Action Tasks</span>
            <div className="text-2xl font-bold font-mono text-slate-900">{actions.length}</div>
            <span className="text-[10px] text-slate-400">Assigned across team</span>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-1">
            <span className="text-[11px] text-amber-800 font-medium">Open Pendencies</span>
            <div className="text-2xl font-bold font-mono text-amber-900">{openActions.length}</div>
            <span className="text-[10px] text-amber-700 font-medium">In active execution</span>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 space-y-1">
            <span className="text-[11px] text-rose-800 font-medium">Urgent Deliverables</span>
            <div className="text-2xl font-bold font-mono text-rose-900">{urgentActions.length}</div>
            <span className="text-[10px] text-rose-700 font-medium">Priority SLA tracking</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-1">
            <span className="text-[11px] text-emerald-800 font-medium">Completed & Verified</span>
            <div className="text-2xl font-bold font-mono text-emerald-900">{completedActions.length}</div>
            <span className="text-[10px] text-emerald-700 font-medium">Sign-off approved</span>
          </div>
        </div>

        {/* Priority Active Tasks Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Priority Operational Tasks
            </span>
            <span className="text-[11px] text-slate-400 font-mono">3-Stage Verification Icons</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openActions.slice(0, 4).map(action => (
              <div 
                key={action.id}
                className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        action.priority === 'Urgent' 
                          ? 'bg-rose-100 text-rose-800' 
                          : action.priority === 'High' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {action.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {action.category}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {action.title}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-medium text-slate-600 shrink-0">
                    Due: {action.fixedDeadline}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Stage:</span>
                    <ActionSubtaskProgressIcons action={action} />
                  </div>
                  <span className="text-slate-600 font-medium">
                    Assignee: <strong className="text-slate-900">{action.assignedRole}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable All Action Items Register */}
        {showAllActions && (
          <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search actions by title, department, assignee..."
                  value={actionSearch}
                  onChange={(e) => setActionSearch(e.target.value)}
                  className="text-xs bg-transparent focus:outline-none w-64 text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { key: 'all', label: `All (${actions.length})` },
                  { key: 'open', label: `Open (${openActions.length})` },
                  { key: 'Completed', label: `Completed (${completedActions.length})` }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setActionStatusFilter(filter.key)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      actionStatusFilter === filter.key 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Operational Task</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActions.map((a, index) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          a.priority === 'Urgent' 
                            ? 'bg-rose-100 text-rose-800' 
                            : a.priority === 'High' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {a.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{a.title}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{a.category}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{a.assignedRole}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{a.fixedDeadline}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          a.status === 'Completed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 7. Overall Broad View of Company MIS Core Statements & Budget */}
      <div id="core-statements" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Header & Statement Nav Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Company MIS Core Statements & FP&A Budget
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                Single Unified View
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct access to detailed corporate financial records: Balance Sheet, Profit & Loss Statement, Debtor Ageing analysis, Fund Flow, and Budget Variance tracker.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStatementExpanded(!isStatementExpanded)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isStatementExpanded ? 'Collapse Detailed View' : 'Expand Detailed View'}</span>
              {isStatementExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Integrated Statement Switcher Bar */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl">
          {[
            { key: 'balance-sheet', label: '1. Balance Sheet', icon: Scale, summary: `Assets: ${formatCrores(activeBalanceSheet.assets.totalAssets)}` },
            { key: 'pnl', label: '2. Profit & Loss (P&L)', icon: TrendingUp, summary: `Revenue: ${formatLakhs(activePnl.income.totalIncome || financialMIS.monthlyRevenue)}` },
            { key: 'debtor-ageing', label: '3. Debtor Ageing', icon: Users, summary: `DSO: ${financialMIS.debtorDaysDSO}d` },
            { key: 'fund-flow', label: '4. Fund Flow', icon: ArrowRightLeft, summary: 'Cash Movement' },
            { key: 'budget', label: '5. Budget & Variance', icon: Calculator, summary: '±5% Alerts' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeStatementTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveStatementTab(tab.key as StatementTab);
                  setIsStatementExpanded(true);
                }}
                className={`flex-1 min-w-[150px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                <span className={`text-[10px] font-mono ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                  {tab.summary}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Statement Content */}
        {isStatementExpanded && (
          <div className="pt-2 animate-in fade-in duration-200">
            {activeStatementTab === 'balance-sheet' && (
              <BalanceSheetView
                balanceSheet={activeBalanceSheet}
                clientProfile={clientProfile}
              />
            )}

            {activeStatementTab === 'pnl' && (
              <PnlAccountView
                pnlStatement={activePnl}
                clientProfile={clientProfile}
              />
            )}

            {activeStatementTab === 'debtor-ageing' && (
              <DebtorAgeingView
                debtorAgeing={activeDebtorAgeing}
                clientProfile={clientProfile}
              />
            )}

            {activeStatementTab === 'fund-flow' && (
              <FundFlowView
                fundFlow={activeFundFlow}
                clientProfile={clientProfile}
              />
            )}

            {activeStatementTab === 'budget' && (
              <BudgetTab />
            )}
          </div>
        )}

      </div>

      {/* 8. Virtual CFO Strategic Advisory & Key Alerts */}
      <div id="cfo-alerts" className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight text-white">
              Virtual CFO Strategic Advisory & Action Directives
            </h3>
          </div>
          <span className="text-[10px] font-mono text-indigo-300">
            Prepared by {clientProfile.cfoName} • {clientProfile.cfoFirm}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          {financialMIS.cfoExecutiveSummary || 
            `Healthy financial run-rate maintained in August 2026. Top-line revenue increased 7.8% MoM with strong 23.5% operating EBITDA margins. Treasury reserves provide over 8.2 months of runway. Compliance standing remains robust with 91.4% of filings completed on-schedule.`}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>MSME Section 43B(h) Payment Mandate</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ensure remaining MSME vendor balances of ₹2.80L due beyond 45 days are cleared prior to month-end to preserve tax deductibility.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>GSTR-2B Input Tax Credit Reconciliation</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              100% matched input tax credits eligible for GSTR-3B offset. Zero mismatched supplier invoices detected for August 2026 filing.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
