import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TrackedInvoice, InvoiceStage, InvoiceCategory } from '../../types';
import { GuardInvoiceScannerModal } from './GuardInvoiceScannerModal';
import { StageTransitionModal } from './StageTransitionModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { 
  ReceiptText, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Columns3, 
  Table, 
  ArrowRight, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  Layers, 
  CheckSquare, 
  DollarSign,
  Tag,
  BarChart3,
  ChevronDown,
  ChevronUp,
  X,
  PieChart
} from 'lucide-react';

// Explicit categories requested by user
export const SUPPORTED_CATEGORIES: InvoiceCategory[] = [
  'Fabric',
  'Job Work External',
  'Job Work Internal',
  'Admin / Utility'
];

export const CATEGORY_STYLES: Record<string, {
  label: string;
  badge: string;
  dot: string;
  iconBg: string;
  border: string;
  bgLight: string;
  textDark: string;
  accentBar: string;
}> = {
  'Fabric': {
    label: 'Fabric',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200/90 ring-indigo-500/20',
    dot: 'bg-indigo-600',
    iconBg: 'bg-indigo-600 text-white',
    border: 'border-indigo-300',
    bgLight: 'bg-indigo-50/50',
    textDark: 'text-indigo-950',
    accentBar: 'bg-indigo-500'
  },
  'Job Work External': {
    label: 'Job Work External',
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90 ring-amber-500/20',
    dot: 'bg-amber-600',
    iconBg: 'bg-amber-600 text-white',
    border: 'border-amber-300',
    bgLight: 'bg-amber-50/50',
    textDark: 'text-amber-950',
    accentBar: 'bg-amber-500'
  },
  'Job Work Internal': {
    label: 'Job Work Internal',
    badge: 'bg-teal-50 text-teal-800 border-teal-200/90 ring-teal-500/20',
    dot: 'bg-teal-600',
    iconBg: 'bg-teal-600 text-white',
    border: 'border-teal-300',
    bgLight: 'bg-teal-50/50',
    textDark: 'text-teal-950',
    accentBar: 'bg-teal-500'
  },
  'Admin / Utility': {
    label: 'Admin / Utility',
    badge: 'bg-purple-50 text-purple-800 border-purple-200/90 ring-purple-500/20',
    dot: 'bg-purple-600',
    iconBg: 'bg-purple-600 text-white',
    border: 'border-purple-300',
    bgLight: 'bg-purple-50/50',
    textDark: 'text-purple-950',
    accentBar: 'bg-purple-500'
  }
};

export const getCategoryStyle = (category?: string) => {
  if (!category) return CATEGORY_STYLES['Admin / Utility'];
  if (CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];
  
  const lower = category.toLowerCase();
  if (lower.includes('fabric')) return CATEGORY_STYLES['Fabric'];
  if (lower.includes('external')) return CATEGORY_STYLES['Job Work External'];
  if (lower.includes('internal')) return CATEGORY_STYLES['Job Work Internal'];
  return CATEGORY_STYLES['Admin / Utility'];
};

export const InvoiceTrackingTab: React.FC = () => {
  const { 
    invoices, 
    invoiceStats, 
    deleteInvoice
  } = useApp();

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [transitioningInvoice, setTransitioningInvoice] = useState<TrackedInvoice | null>(null);
  const [inspectingInvoice, setInspectingInvoice] = useState<TrackedInvoice | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<'all' | 'critical' | 'warning' | 'on_track'>('all');
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('table');
  
  // Summary view state
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(true);
  const [summaryViewType, setSummaryViewType] = useState<'matrix' | 'cards'>('matrix');

  // Department Stages Definition
  const PIPELINE_COLUMNS: { stage: InvoiceStage; shortCode: string; label: string; title: string; roleDesc: string; icon: React.ReactNode; color: string }[] = [
    {
      stage: 'guard',
      shortCode: '1. Guard',
      label: 'Guard / Gate',
      title: '1. Gate Receipt (Guard)',
      roleDesc: 'Security Gatekeeper',
      icon: <ShieldCheck className="w-4 h-4 text-slate-700" />,
      color: 'border-slate-300 bg-slate-50'
    },
    {
      stage: 'grn_qc',
      shortCode: '2. Stores/QC',
      label: 'GRN & QC',
      title: '2. GRN & Quality Check',
      roleDesc: 'Stores / QC Department',
      icon: <Truck className="w-4 h-4 text-blue-700" />,
      color: 'border-blue-300 bg-blue-50/50'
    },
    {
      stage: 'erp',
      shortCode: '3. ERP',
      label: 'ERP Operator',
      title: '3. ERP Person Entry',
      roleDesc: 'ERP / SAP Operator',
      icon: <Layers className="w-4 h-4 text-indigo-700" />,
      color: 'border-indigo-300 bg-indigo-50/50'
    },
    {
      stage: 'account_head',
      shortCode: '4. Acct Head',
      label: 'Account Head',
      title: '4. Account Head Approval',
      roleDesc: 'Finance Head / CFO',
      icon: <CheckSquare className="w-4 h-4 text-purple-700" />,
      color: 'border-purple-300 bg-purple-50/50'
    },
    {
      stage: 'accounts_booking',
      shortCode: '5. Booking',
      label: 'Accts Booking',
      title: '5. In Accounts for Booking',
      roleDesc: 'Accounts Team',
      icon: <ReceiptText className="w-4 h-4 text-amber-700" />,
      color: 'border-amber-300 bg-amber-50/50'
    },
    {
      stage: 'booked',
      shortCode: '6. Booked',
      label: 'Booked in Ledger',
      title: 'Completed & Booked',
      roleDesc: 'Ledger Posted & Scheduled',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
      color: 'border-emerald-300 bg-emerald-50/50'
    }
  ];

  const STAGE_ORDER: InvoiceStage[] = ['guard', 'grn_qc', 'erp', 'account_head', 'accounts_booking', 'booked'];

  const getStageIndex = (stage: InvoiceStage): number => {
    return STAGE_ORDER.indexOf(stage);
  };

  // Helper to match category cleanly
  const matchesCategory = (invCategory: string | undefined, selectedCategory: string): boolean => {
    if (selectedCategory === 'all') return true;
    if (!invCategory) return selectedCategory === 'Admin / Utility';
    if (invCategory === selectedCategory) return true;
    
    const lower = invCategory.toLowerCase();
    if (selectedCategory === 'Fabric' && lower.includes('fabric')) return true;
    if (selectedCategory === 'Job Work External' && lower.includes('external')) return true;
    if (selectedCategory === 'Job Work Internal' && lower.includes('internal')) return true;
    if (selectedCategory === 'Admin / Utility' && (lower.includes('admin') || lower.includes('utility') || lower.includes('logistics') || lower.includes('it'))) return true;

    return false;
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter(inv => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesVendor = inv.vendorName?.toLowerCase().includes(q);
        const matchesInvNo = inv.invoiceNumber?.toLowerCase().includes(q);
        const matchesGatePass = inv.gateEntryNo?.toLowerCase().includes(q);
        const matchesGrn = inv.grnDetails?.grnNumber?.toLowerCase().includes(q);
        const matchesPo = inv.poNumber?.toLowerCase().includes(q);
        const matchesCat = inv.category?.toLowerCase().includes(q);
        if (!matchesVendor && !matchesInvNo && !matchesGatePass && !matchesGrn && !matchesPo && !matchesCat) {
          return false;
        }
      }

      // Stage Filter
      if (stageFilter !== 'all' && inv.currentStage !== stageFilter) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && !matchesCategory(inv.category, categoryFilter)) {
        return false;
      }

      // SLA Filter
      if (slaFilter === 'critical') {
        if (!inv.isCritical && inv.daysInCurrentStage <= 2.0) return false;
      } else if (slaFilter === 'warning') {
        if (inv.daysInCurrentStage < 1.5 || inv.daysInCurrentStage > 2.0) return false;
      } else if (slaFilter === 'on_track') {
        if (inv.daysInCurrentStage >= 1.5 || inv.isCritical) return false;
      }

      return true;
    });
  }, [invoices, searchQuery, stageFilter, categoryFilter, slaFilter]);

  // Comprehensive Category-wise and Stage-wise Aggregation (Count, Taxable Value, Tax, Gross Value)
  const summaryData = useMemo(() => {
    const categories: InvoiceCategory[] = [
      'Fabric',
      'Job Work External',
      'Job Work Internal',
      'Admin / Utility'
    ];

    const categoryMap: Record<string, {
      category: InvoiceCategory;
      count: number;
      taxableValue: number;
      taxAmount: number;
      totalAmount: number;
      criticalCount: number;
      stageCounts: Record<InvoiceStage, number>;
      stageValues: Record<InvoiceStage, number>;
    }> = {};

    categories.forEach(cat => {
      categoryMap[cat] = {
        category: cat,
        count: 0,
        taxableValue: 0,
        taxAmount: 0,
        totalAmount: 0,
        criticalCount: 0,
        stageCounts: { guard: 0, grn_qc: 0, erp: 0, account_head: 0, accounts_booking: 0, booked: 0 },
        stageValues: { guard: 0, grn_qc: 0, erp: 0, account_head: 0, accounts_booking: 0, booked: 0 }
      };
    });

    const grandTotals = {
      count: 0,
      taxableValue: 0,
      taxAmount: 0,
      totalAmount: 0,
      criticalCount: 0,
      stageCounts: { guard: 0, grn_qc: 0, erp: 0, account_head: 0, accounts_booking: 0, booked: 0 } as Record<InvoiceStage, number>,
      stageValues: { guard: 0, grn_qc: 0, erp: 0, account_head: 0, accounts_booking: 0, booked: 0 } as Record<InvoiceStage, number>
    };

    (invoices || []).forEach(inv => {
      // Find resolved category
      let resolvedCategory: InvoiceCategory = 'Admin / Utility';
      for (const cat of categories) {
        if (matchesCategory(inv.category, cat)) {
          resolvedCategory = cat;
          break;
        }
      }

      const cObj = categoryMap[resolvedCategory];
      const stage = inv.currentStage;
      const isCrit = inv.isCritical || inv.daysInCurrentStage > 2.0;
      const taxable = inv.taxableValue || 0;
      const tax = inv.taxAmount || 0;
      const total = inv.totalAmount || 0;

      // Category totals
      cObj.count += 1;
      cObj.taxableValue += taxable;
      cObj.taxAmount += tax;
      cObj.totalAmount += total;
      if (isCrit) cObj.criticalCount += 1;

      if (cObj.stageCounts[stage] !== undefined) {
        cObj.stageCounts[stage] += 1;
        cObj.stageValues[stage] += total;
      }

      // Grand totals
      grandTotals.count += 1;
      grandTotals.taxableValue += taxable;
      grandTotals.taxAmount += tax;
      grandTotals.totalAmount += total;
      if (isCrit) grandTotals.criticalCount += 1;

      if (grandTotals.stageCounts[stage] !== undefined) {
        grandTotals.stageCounts[stage] += 1;
        grandTotals.stageValues[stage] += total;
      }
    });

    return {
      categoryRows: categories.map(cat => categoryMap[cat]),
      grandTotals
    };
  }, [invoices]);

  const hasActiveFilters = searchQuery.trim() !== '' || stageFilter !== 'all' || categoryFilter !== 'all' || slaFilter !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setCategoryFilter('all');
    setSlaFilter('all');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ReceiptText className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Invoice Tracking & 5-Stage Department Pipeline
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end invoice progression with in-line department visibility, category tagging (<strong>Fabric, Job Work External, Job Work Internal, Admin / Utility</strong>), and stage-wise financial tax summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-gate-ai-scanner"
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>+ Gate Receipt (Guard AI Scanner)</span>
          </button>
        </div>
      </div>

      {/* 2-Day SLA Policy Banner */}
      <div className="bg-linear-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-300/80 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 text-amber-950">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 font-bold">Strict 2-Day SLA Department Policy:</strong>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                SLA: ≤ 2.0 Days / Dept
              </span>
            </div>
            <p className="text-slate-700 text-[11px] mt-0.5">
              Each department (<strong>1. Gate Guard ➔ 2. GRN/QC Dept ➔ 3. ERP Person ➔ 4. Account Head Approval ➔ 5. Accounts Booking</strong>) has exactly 2 days to clear and release an invoice. Any stage pending &gt;2 days is automatically escalated to <strong>Critical</strong>.
            </p>
          </div>
        </div>

        {invoiceStats.critical > 0 && (
          <div className="bg-rose-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs animate-pulse">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>{invoiceStats.critical} Invoices Overdue &gt; 2 Days!</span>
          </div>
        )}
      </div>

      {/* Primary Pipeline Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Invoices */}
        <div 
          onClick={() => { setStageFilter('all'); setSlaFilter('all'); setCategoryFilter('all'); }}
          className={`p-3 bg-white rounded-xl border shadow-2xs cursor-pointer hover:border-slate-400 transition-all ${
            stageFilter === 'all' && slaFilter === 'all' && categoryFilter === 'all' ? 'ring-2 ring-indigo-500/40 border-indigo-400' : 'border-slate-200'
          }`}
          title="Click to view all invoices in pipeline"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Pipeline</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{invoiceStats.total}</div>
          <span className="text-[10px] text-slate-500 font-mono">₹{(invoiceStats.totalAmount / 100000).toFixed(2)}L Gross</span>
        </div>

        {/* Critical SLA Breached */}
        <div 
          onClick={() => { setSlaFilter(slaFilter === 'critical' ? 'all' : 'critical'); }}
          className={`p-3 rounded-xl border shadow-2xs cursor-pointer hover:shadow-md transition-all ${
            slaFilter === 'critical'
              ? 'bg-rose-100/90 border-rose-500 ring-2 ring-rose-500/40 text-rose-950'
              : invoiceStats.critical > 0 
              ? 'bg-rose-50/80 border-rose-300 text-rose-950' 
              : 'bg-white border-slate-200'
          }`}
          title="Click to filter invoices stuck & overdue > 2 days"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">🚨 Overdue &gt; 2d</span>
            {invoiceStats.critical > 0 && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>}
          </div>
          <div className="text-xl font-extrabold text-rose-700 mt-0.5">{invoiceStats.critical}</div>
          <span className="text-[10px] text-rose-800 font-semibold font-mono">
            {invoiceStats.critical > 0 ? `₹${(invoiceStats.criticalAmount / 100000).toFixed(2)}L At Risk` : '100% SLA Compliant'}
          </span>
        </div>

        {/* Stage 1: Guard */}
        <div 
          onClick={() => setStageFilter(stageFilter === 'guard' ? 'all' : 'guard')}
          className={`p-3 bg-white rounded-xl border shadow-2xs cursor-pointer hover:border-slate-400 transition-all ${
            stageFilter === 'guard' ? 'ring-2 ring-slate-700 border-slate-700 bg-slate-50' : 'border-slate-200'
          }`}
          title="Click to filter invoices at Gate Guard"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Gate Guard</span>
          <div className="text-xl font-extrabold text-slate-800 mt-0.5">{invoiceStats.guard}</div>
          <span className="text-[10px] text-slate-400">At Security Post</span>
        </div>

        {/* Stage 2: GRN / QC */}
        <div 
          onClick={() => setStageFilter(stageFilter === 'grn_qc' ? 'all' : 'grn_qc')}
          className={`p-3 bg-white rounded-xl border shadow-2xs cursor-pointer hover:border-blue-400 transition-all ${
            stageFilter === 'grn_qc' ? 'ring-2 ring-blue-600 border-blue-500 bg-blue-50/60' : 'border-slate-200'
          }`}
          title="Click to filter invoices in GRN & QC inspection"
        >
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">2. GRN & QC</span>
          <div className="text-xl font-extrabold text-blue-900 mt-0.5">{invoiceStats.grnQc}</div>
          <span className="text-[10px] text-blue-600 font-medium">In Stores Inspection</span>
        </div>

        {/* Stage 3: ERP Person */}
        <div 
          onClick={() => setStageFilter(stageFilter === 'erp' ? 'all' : 'erp')}
          className={`p-3 bg-white rounded-xl border shadow-2xs cursor-pointer hover:border-indigo-400 transition-all ${
            stageFilter === 'erp' ? 'ring-2 ring-indigo-600 border-indigo-500 bg-indigo-50/60' : 'border-slate-200'
          }`}
          title="Click to filter invoices at ERP 3-Way Match & Entry"
        >
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">3. ERP Person</span>
          <div className="text-xl font-extrabold text-indigo-900 mt-0.5">{invoiceStats.erp}</div>
          <span className="text-[10px] text-indigo-600 font-medium">3-Way Match & Entry</span>
        </div>

        {/* Stage 4: Account Head */}
        <div 
          onClick={() => setStageFilter(stageFilter === 'account_head' ? 'all' : 'account_head')}
          className={`p-3 bg-white rounded-xl border shadow-2xs cursor-pointer hover:border-purple-400 transition-all ${
            stageFilter === 'account_head' ? 'ring-2 ring-purple-600 border-purple-500 bg-purple-50/60' : 'border-slate-200'
          }`}
          title="Click to filter invoices pending Account Head sign-off"
        >
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">4. Account Head</span>
          <div className="text-xl font-extrabold text-purple-900 mt-0.5">{invoiceStats.accountHead}</div>
          <span className="text-[10px] text-purple-600 font-medium">Pending Sign-off</span>
        </div>

        {/* Stage 5: In Accounts Booking */}
        <div 
          onClick={() => setStageFilter(stageFilter === 'accounts_booking' ? 'all' : 'accounts_booking')}
          className={`p-3 bg-white rounded-xl border shadow-2xs cursor-pointer hover:border-amber-400 transition-all ${
            stageFilter === 'accounts_booking' ? 'ring-2 ring-amber-600 border-amber-500 bg-amber-50/60' : 'border-slate-200'
          }`}
          title="Click to filter invoices in Accounts Booking"
        >
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">5. Accounts Booking</span>
          <div className="text-xl font-extrabold text-amber-900 mt-0.5">{invoiceStats.accountsBooking}</div>
          <span className="text-[10px] text-emerald-700 font-medium">{invoiceStats.booked} Booked</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXECUTIVE SUMMARY: STAGE & CATEGORY-WISE INVOICE COUNT, VALUE & TAX TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Summary Card Header */}
        <div className="px-5 py-3.5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Stage & Category Financial Summary
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/40 text-indigo-200 border border-indigo-400/40">
                  Category Breakdown × Department Stages
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Number of invoices at each department stage, categorywise with aggregated Taxable Value & Tax (GST) summary.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View switcher between Matrix table & Category cards */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setSummaryViewType('matrix')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  summaryViewType === 'matrix' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Matrix Table
              </button>
              <button
                onClick={() => setSummaryViewType('cards')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  summaryViewType === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Category Cards
              </button>
            </div>

            {/* Toggle collapse */}
            <button
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isSummaryExpanded ? "Collapse summary" : "Expand summary"}
            >
              {isSummaryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isSummaryExpanded && (
          <div className="p-4 space-y-4">
            
            {/* 1. Quick Financial Highlights Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Invoices Logged</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">{summaryData.grandTotals.count} Invoices</div>
                <span className="text-[10px] text-slate-400">Across 4 standard categories</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/80">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Total Taxable Value (Pre-Tax)</span>
                <div className="text-lg font-black font-mono text-blue-950 mt-0.5">
                  ₹{summaryData.grandTotals.taxableValue.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-blue-600 font-mono">
                  ₹{(summaryData.grandTotals.taxableValue / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Total Tax Amount (GST)</span>
                <div className="text-lg font-black font-mono text-emerald-900 mt-0.5">
                  ₹{summaryData.grandTotals.taxAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">
                  {summaryData.grandTotals.taxableValue > 0 
                    ? `${((summaryData.grandTotals.taxAmount / summaryData.grandTotals.taxableValue) * 100).toFixed(1)}% Avg GST rate` 
                    : 'GST Breakdown'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200/80">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Total Gross Invoice Value</span>
                <div className="text-lg font-black font-mono text-indigo-950 mt-0.5">
                  ₹{summaryData.grandTotals.totalAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-indigo-700 font-mono font-bold">
                  ₹{(summaryData.grandTotals.totalAmount / 100000).toFixed(2)} Lakhs Total
                </span>
              </div>
            </div>

            {/* 2. MATRIX VIEW: Stage x Category Table */}
            {summaryViewType === 'matrix' && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5 min-w-[150px]">Category</th>
                        <th 
                          onClick={() => setStageFilter(stageFilter === 'guard' ? 'all' : 'guard')}
                          className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                          title="Filter Guard stage"
                        >
                          1. Guard
                        </th>
                        <th 
                          onClick={() => setStageFilter(stageFilter === 'grn_qc' ? 'all' : 'grn_qc')}
                          className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                          title="Filter GRN & QC stage"
                        >
                          2. GRN/QC
                        </th>
                        <th 
                          onClick={() => setStageFilter(stageFilter === 'erp' ? 'all' : 'erp')}
                          className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                          title="Filter ERP stage"
                        >
                          3. ERP
                        </th>
                        <th 
                          onClick={() => setStageFilter(stageFilter === 'account_head' ? 'all' : 'account_head')}
                          className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                          title="Filter Account Head stage"
                        >
                          4. Acct Head
                        </th>
                        <th 
                          onClick={() => setStageFilter(stageFilter === 'accounts_booking' ? 'all' : 'accounts_booking')}
                          className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                          title="Filter Booking stage"
                        >
                          5. Booking
                        </th>
                        <th 
                          onClick={() => setStageFilter(stageFilter === 'booked' ? 'all' : 'booked')}
                          className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                          title="Filter Booked stage"
                        >
                          6. Booked
                        </th>
                        <th className="px-3 py-2.5 text-center font-extrabold bg-slate-200/60">Total Invoices</th>
                        <th className="px-3 py-2.5 text-right">Taxable Value</th>
                        <th className="px-3 py-2.5 text-right text-emerald-800">Tax (GST)</th>
                        <th className="px-3 py-2.5 text-right font-extrabold bg-indigo-50/50 text-indigo-950">Total Gross Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {summaryData.categoryRows.map(row => {
                        const style = getCategoryStyle(row.category);
                        const isRowSelected = categoryFilter === row.category;

                        return (
                          <tr 
                            key={row.category}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isRowSelected ? 'bg-indigo-50/40 font-medium' : ''
                            }`}
                          >
                            {/* Category Tag Badge */}
                            <td className="px-3 py-2.5">
                              <button
                                onClick={() => setCategoryFilter(categoryFilter === row.category ? 'all' : row.category)}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                                  style.badge
                                } ${isRowSelected ? 'ring-2 shadow-xs' : 'hover:opacity-90'}`}
                                title={`Click to filter by ${row.category}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                <span className="truncate">{row.category}</span>
                                {isRowSelected && <X className="w-3 h-3 ml-0.5 text-indigo-700" />}
                              </button>
                            </td>

                            {/* 1. Guard */}
                            <td 
                              onClick={() => { setCategoryFilter(row.category); setStageFilter('guard'); }}
                              className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-indigo-50/70 transition-colors"
                              title={`View ${row.category} invoices at Guard stage`}
                            >
                              {row.stageCounts.guard > 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-slate-100 text-slate-900 font-bold text-[11px] border border-slate-300">
                                  {row.stageCounts.guard}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono">-</span>
                              )}
                            </td>

                            {/* 2. GRN / QC */}
                            <td 
                              onClick={() => { setCategoryFilter(row.category); setStageFilter('grn_qc'); }}
                              className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-blue-50/70 transition-colors"
                              title={`View ${row.category} invoices at GRN/QC stage`}
                            >
                              {row.stageCounts.grn_qc > 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-blue-100 text-blue-900 font-bold text-[11px] border border-blue-300">
                                  {row.stageCounts.grn_qc}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono">-</span>
                              )}
                            </td>

                            {/* 3. ERP */}
                            <td 
                              onClick={() => { setCategoryFilter(row.category); setStageFilter('erp'); }}
                              className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-indigo-50/70 transition-colors"
                              title={`View ${row.category} invoices at ERP stage`}
                            >
                              {row.stageCounts.erp > 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-indigo-100 text-indigo-900 font-bold text-[11px] border border-indigo-300">
                                  {row.stageCounts.erp}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono">-</span>
                              )}
                            </td>

                            {/* 4. Account Head */}
                            <td 
                              onClick={() => { setCategoryFilter(row.category); setStageFilter('account_head'); }}
                              className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-purple-50/70 transition-colors"
                              title={`View ${row.category} invoices at Account Head stage`}
                            >
                              {row.stageCounts.account_head > 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-purple-100 text-purple-900 font-bold text-[11px] border border-purple-300">
                                  {row.stageCounts.account_head}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono">-</span>
                              )}
                            </td>

                            {/* 5. Booking */}
                            <td 
                              onClick={() => { setCategoryFilter(row.category); setStageFilter('accounts_booking'); }}
                              className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-amber-50/70 transition-colors"
                              title={`View ${row.category} invoices at Booking stage`}
                            >
                              {row.stageCounts.accounts_booking > 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300">
                                  {row.stageCounts.accounts_booking}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono">-</span>
                              )}
                            </td>

                            {/* 6. Booked */}
                            <td 
                              onClick={() => { setCategoryFilter(row.category); setStageFilter('booked'); }}
                              className="px-2.5 py-2.5 text-center cursor-pointer hover:bg-emerald-50/70 transition-colors"
                              title={`View ${row.category} invoices completed/booked`}
                            >
                              {row.stageCounts.booked > 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-300">
                                  {row.stageCounts.booked}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono">-</span>
                              )}
                            </td>

                            {/* Total Invoices */}
                            <td className="px-3 py-2.5 text-center font-bold font-mono bg-slate-100/50">
                              {row.count}
                            </td>

                            {/* Taxable Value */}
                            <td className="px-3 py-2.5 text-right font-mono font-medium">
                              ₹{row.taxableValue.toLocaleString('en-IN')}
                            </td>

                            {/* Tax (GST) */}
                            <td className="px-3 py-2.5 text-right font-mono font-medium text-emerald-700">
                              ₹{row.taxAmount.toLocaleString('en-IN')}
                            </td>

                            {/* Total Gross Value */}
                            <td className="px-3 py-2.5 text-right font-mono font-extrabold text-slate-900 bg-indigo-50/40">
                              ₹{row.totalAmount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Summary Totals Row */}
                    <tfoot className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                      <tr>
                        <td className="px-3 py-2.5 text-slate-900 uppercase text-[10px] tracking-wider font-extrabold">
                          Grand Total ({summaryData.grandTotals.count} Invoices)
                        </td>
                        <td className="px-2.5 py-2.5 text-center font-mono font-extrabold">
                          {summaryData.grandTotals.stageCounts.guard}
                        </td>
                        <td className="px-2.5 py-2.5 text-center font-mono font-extrabold text-blue-900">
                          {summaryData.grandTotals.stageCounts.grn_qc}
                        </td>
                        <td className="px-2.5 py-2.5 text-center font-mono font-extrabold text-indigo-900">
                          {summaryData.grandTotals.stageCounts.erp}
                        </td>
                        <td className="px-2.5 py-2.5 text-center font-mono font-extrabold text-purple-900">
                          {summaryData.grandTotals.stageCounts.account_head}
                        </td>
                        <td className="px-2.5 py-2.5 text-center font-mono font-extrabold text-amber-900">
                          {summaryData.grandTotals.stageCounts.accounts_booking}
                        </td>
                        <td className="px-2.5 py-2.5 text-center font-mono font-extrabold text-emerald-900">
                          {summaryData.grandTotals.stageCounts.booked}
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono font-black bg-slate-200">
                          {summaryData.grandTotals.count}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-extrabold text-blue-950">
                          ₹{summaryData.grandTotals.taxableValue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-extrabold text-emerald-800">
                          ₹{summaryData.grandTotals.taxAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-black text-indigo-950 bg-indigo-100/70">
                          ₹{summaryData.grandTotals.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* 3. CARDS VIEW: 4 Category Deep-Dive Cards */}
            {summaryViewType === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {summaryData.categoryRows.map(row => {
                  const style = getCategoryStyle(row.category);
                  const isSelected = categoryFilter === row.category;

                  return (
                    <div 
                      key={row.category}
                      onClick={() => setCategoryFilter(categoryFilter === row.category ? 'all' : row.category)}
                      className={`p-3.5 rounded-xl border bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                        isSelected 
                          ? `${style.border} ring-2 ring-indigo-500/40 bg-indigo-50/20` 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1 ${style.accentBar}`} />

                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {row.category}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {row.count} Invoices
                        </span>
                      </div>

                      {/* Financial Amounts */}
                      <div className="space-y-1.5 py-2 border-y border-slate-100 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Taxable:</span>
                          <span className="font-mono font-semibold text-slate-800">
                            ₹{row.taxableValue.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-700 text-[11px] font-medium">Tax (GST):</span>
                          <span className="font-mono font-semibold text-emerald-700">
                            ₹{row.taxAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-900 text-xs font-bold">Gross Total:</span>
                          <span className="font-mono font-extrabold text-slate-900 text-sm">
                            ₹{row.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Mini Stage Progression Bar */}
                      <div className="mt-2.5 pt-1">
                        <div className="text-[10px] text-slate-400 font-medium mb-1">
                          Stage Distribution ({row.count} items):
                        </div>
                        <div className="grid grid-cols-6 gap-0.5 text-center text-[9px] font-mono">
                          {STAGE_ORDER.map((stg, sIdx) => {
                            const cnt = row.stageCounts[stg];
                            return (
                              <div
                                key={stg}
                                title={`${PIPELINE_COLUMNS[sIdx].title}: ${cnt} invoices`}
                                className={`py-0.5 rounded ${
                                  cnt > 0 
                                    ? sIdx === 5 
                                      ? 'bg-emerald-100 text-emerald-800 font-bold' 
                                      : 'bg-indigo-100 text-indigo-800 font-bold' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {cnt}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 px-0.5">
                          <span>1. Guard</span>
                          <span>6. Booked</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FILTER & CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor, invoice #, category, gate pass..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Filters and View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-700 font-medium"
            >
              <option value="all">All Categories ({invoices.length})</option>
              <option value="Fabric">Fabric</option>
              <option value="Job Work External">Job Work External</option>
              <option value="Job Work Internal">Job Work Internal</option>
              <option value="Admin / Utility">Admin / Utility</option>
            </select>
          </div>

          {/* Department Stage Filter Dropdown */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-700 font-medium"
          >
            <option value="all">All Departments ({invoices.length})</option>
            <option value="guard">1. Gate Guard ({invoiceStats.guard})</option>
            <option value="grn_qc">2. GRN & QC Dept ({invoiceStats.grnQc})</option>
            <option value="erp">3. ERP Person ({invoiceStats.erp})</option>
            <option value="account_head">4. Account Head ({invoiceStats.accountHead})</option>
            <option value="accounts_booking">5. Accounts Booking ({invoiceStats.accountsBooking})</option>
            <option value="booked">Booked in Ledger ({invoiceStats.booked})</option>
          </select>

          {/* SLA Filter Toggle Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSlaFilter('all')}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                slaFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All SLA
            </button>
            <button
              onClick={() => setSlaFilter('critical')}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                slaFilter === 'critical' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              🚨 Overdue &gt;2d ({invoiceStats.critical})
            </button>
            <button
              onClick={() => setSlaFilter('on_track')}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                slaFilter === 'on_track' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              ✅ On Track
            </button>
          </div>

          {/* Reset Filters Chip */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-2 py-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset all search and filters"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* View Mode Toggle: Table vs Pipeline Columns */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="view-mode-table-btn"
              onClick={() => setViewMode('table')}
              title="Table Audit View with all departments displayed in line"
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table (Depts In-Line)</span>
            </button>
            <button
              id="view-mode-pipeline-btn"
              onClick={() => setViewMode('pipeline')}
              title="Kanban Board View (6 Stage Columns)"
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'pipeline' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Pipeline Columns</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Banner */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs flex-wrap px-1">
          <span className="text-slate-400 text-[11px] font-medium">Active Filters:</span>
          {categoryFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter('all')} className="hover:text-indigo-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {stageFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
              Stage: {stageFilter.replace('_', ' ').toUpperCase()}
              <button onClick={() => setStageFilter('all')} className="hover:text-slate-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {slaFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              SLA: {slaFilter}
              <button onClick={() => setSlaFilter('all')} className="hover:text-amber-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-slate-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <span className="text-slate-400 text-[11px]">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DETAILED TABLE AUDIT VIEW WITH ALL DEPTS IN-LINE & CATEGORY TAGS */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Gate Pass / Date</th>
                  <th className="px-4 py-3">Vendor & Invoice #</th>
                  <th className="px-4 py-3">Category Tag</th>
                  <th className="px-4 py-3">Taxable Value</th>
                  <th className="px-4 py-3 text-emerald-800">Tax (GST)</th>
                  <th className="px-4 py-3 font-black">Gross Total</th>
                  <th className="px-4 py-3 min-w-[340px]">
                    <div className="flex items-center justify-between">
                      <span>Department Pipeline Tracking (All in line)</span>
                      <span className="text-[9px] font-normal text-slate-400 normal-case">Stuck / Active Dept highlighted</span>
                    </div>
                  </th>
                  <th className="px-4 py-3">SLA Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <ReceiptText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <div className="text-sm font-semibold text-slate-600">No invoices match selected filters</div>
                      <p className="text-xs text-slate-400 mt-1">Try resetting the category, stage, or search query.</p>
                      <button
                        onClick={resetAllFilters}
                        className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const isOverdue = inv.isCritical || inv.daysInCurrentStage > 2.0;
                    const catStyle = getCategoryStyle(inv.category);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Gate Pass & Inward Date */}
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-slate-900 block">{inv.gateEntryNo}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(inv.receivedAt).toLocaleDateString('en-IN')}
                          </span>
                        </td>

                        {/* Vendor & Invoice Number */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{inv.vendorName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Inv: #{inv.invoiceNumber} • PO: {inv.poNumber || 'Direct'}
                          </div>
                        </td>

                        {/* Category Tag (User Request) */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setCategoryFilter(inv.category as string)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                              catStyle.badge
                            }`}
                            title={`Filter all invoices categorized under ${inv.category}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                            <span>{inv.category || 'Admin / Utility'}</span>
                          </button>
                        </td>

                        {/* Taxable Value */}
                        <td className="px-4 py-3 font-mono font-medium">
                          ₹{inv.taxableValue.toLocaleString('en-IN')}
                        </td>

                        {/* Tax (GST) */}
                        <td className="px-4 py-3 font-mono text-emerald-700 font-medium">
                          ₹{inv.taxAmount.toLocaleString('en-IN')}
                        </td>

                        {/* Gross Total Amount */}
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          ₹{inv.totalAmount.toLocaleString('en-IN')}
                        </td>

                        {/* Department Pipeline Stepper (All in line) */}
                        <td className="px-4 py-3">
                          <div className="space-y-1.5 min-w-[320px]">
                            {/* Active Stage Header & Days */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">Current Dept:</span>
                                <strong className={`px-1.5 py-0.5 rounded text-[11px] ${
                                  isOverdue 
                                    ? 'bg-rose-100 text-rose-800 font-extrabold border border-rose-300' 
                                    : 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                                }`}>
                                  {inv.currentStage.replace('_', ' ').toUpperCase()}
                                </strong>
                              </span>

                              <span className={`text-[10px] font-mono font-bold ${
                                isOverdue ? 'text-rose-600' : 'text-slate-600'
                              }`}>
                                {inv.currentStage === 'booked' 
                                  ? 'Completed' 
                                  : `Stuck for ${inv.daysInCurrentStage}d`}
                              </span>
                            </div>

                            {/* All Departments In-Line Stepper */}
                            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              {PIPELINE_COLUMNS.map((colItem, idx) => {
                                const currIdx = getStageIndex(inv.currentStage);
                                const isCurrent = colItem.stage === inv.currentStage;
                                const isPassed = idx < currIdx;

                                return (
                                  <div key={colItem.stage} className="flex-1 flex items-center">
                                    {/* Department Step Chip */}
                                    <div
                                      title={`${colItem.title}\nRole: ${colItem.roleDesc}\nStatus: ${
                                        isCurrent 
                                          ? `Currently Stuck Here (${inv.daysInCurrentStage} days)` 
                                          : isPassed 
                                          ? 'Cleared & Passed' 
                                          : 'Pending / Not Started'
                                      }`}
                                      className={`w-full py-1 px-1 rounded text-center text-[9px] leading-tight font-medium transition-all ${
                                        isCurrent
                                          ? isOverdue
                                            ? 'bg-rose-600 text-white font-extrabold shadow-xs ring-2 ring-rose-400 animate-pulse'
                                            : 'bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-300'
                                          : isPassed
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                                          : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60'
                                      }`}
                                    >
                                      <div className="truncate font-mono font-bold">
                                        {idx + 1}. {colItem.shortCode.split('. ')[1]}
                                      </div>
                                      <div className="text-[8px] truncate mt-0.5 opacity-90">
                                        {isCurrent 
                                          ? `${inv.daysInCurrentStage}d` 
                                          : isPassed 
                                          ? '✓ Done' 
                                          : 'Pending'}
                                      </div>
                                    </div>

                                    {/* Connector Arrow between steps */}
                                    {idx < PIPELINE_COLUMNS.length - 1 && (
                                      <span className={`text-[9px] px-0.5 shrink-0 ${
                                        idx < currIdx ? 'text-emerald-500 font-bold' : 'text-slate-300'
                                      }`}>
                                        ›
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>

                        {/* SLA Status */}
                        <td className="px-4 py-3">
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1 w-fit animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              {inv.daysInCurrentStage}d (Critical Overdue)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {inv.daysInCurrentStage}d / 2d Limit
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setInspectingInvoice(inv)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Inspect full details & history"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {inv.currentStage !== 'booked' && (
                              <button
                                onClick={() => setTransitioningInvoice(inv)}
                                className="px-2.5 py-1 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Advance
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Delete invoice #${inv.invoiceNumber}?`)) {
                                  deleteInvoice(inv.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PIPELINE KANBAN COLUMNS VIEW (WITH CATEGORY TAG ON EACH CARD) */}
      {/* ========================================================================= */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-start">
          {PIPELINE_COLUMNS.map((col) => {
            const stageInvoices = filteredInvoices.filter(inv => inv.currentStage === col.stage);
            const criticalInStage = stageInvoices.filter(inv => inv.isCritical || inv.daysInCurrentStage > 2.0).length;

            return (
              <div 
                key={col.stage}
                className="bg-slate-100/70 rounded-xl border border-slate-200 p-2.5 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="pb-2.5 mb-2 border-b border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {col.icon}
                      <h3 className="font-bold text-xs text-slate-800 truncate" title={col.title}>
                        {col.title}
                      </h3>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {stageInvoices.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>{col.roleDesc}</span>
                    {criticalInStage > 0 && (
                      <span className="px-1.5 py-0.2 rounded font-bold bg-rose-600 text-white animate-pulse">
                        {criticalInStage} Critical
                      </span>
                    )}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stageInvoices.length === 0 ? (
                    <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs mt-2">
                      No invoices in this stage
                    </div>
                  ) : (
                    stageInvoices.map(inv => {
                      const isOverdue = inv.isCritical || inv.daysInCurrentStage > 2.0;
                      const isWarning = !isOverdue && inv.daysInCurrentStage >= 1.5;
                      const catStyle = getCategoryStyle(inv.category);

                      return (
                        <div
                          key={inv.id}
                          className={`p-3 rounded-xl border bg-white shadow-2xs hover:shadow-md transition-all relative ${
                            isOverdue
                              ? 'border-rose-400 ring-2 ring-rose-500/20'
                              : isWarning
                              ? 'border-amber-300 ring-1 ring-amber-400/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Top: Category Tag Badge & AI badge */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${catStyle.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                              <span className="truncate max-w-[110px]">{inv.category || 'Admin / Utility'}</span>
                            </span>

                            {inv.aiExtracted && (
                              <span title="Scanned via AI Vision" className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI
                              </span>
                            )}
                          </div>

                          {/* SLA Status Badge */}
                          <div className="mb-2">
                            {isOverdue ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                {inv.daysInCurrentStage}d / 2d SLA (CRITICAL)
                              </span>
                            ) : isWarning ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                {inv.daysInCurrentStage}d / 2d SLA (Warning)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {inv.daysInCurrentStage}d / 2d SLA (On Track)
                              </span>
                            )}
                          </div>

                          {/* Vendor & Invoice Number */}
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-xs text-slate-900 truncate" title={inv.vendorName}>
                              {inv.vendorName}
                            </h4>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono font-semibold text-slate-600 truncate">
                                #{inv.invoiceNumber}
                              </span>
                              <span className="text-slate-400 text-[10px]">{inv.invoiceDate}</span>
                            </div>
                          </div>

                          {/* Image Thumbnail & Amount */}
                          <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-100">
                            <div 
                              onClick={() => setInspectingInvoice(inv)}
                              className="w-12 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group relative"
                            >
                              <img
                                src={inv.invoiceImageUrl}
                                alt="thumb"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] text-slate-400 block truncate">Total Amount</span>
                              <span className="font-extrabold text-xs text-slate-900 font-mono block truncate">
                                ₹{inv.totalAmount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-mono block truncate">
                                Tax: ₹{inv.taxAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* In-line Department Progress Stepper */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-slate-400 font-medium">Department Progress</span>
                              <span className="font-bold text-slate-700">
                                {getStageIndex(inv.currentStage) + 1} of 6
                              </span>
                            </div>
                            <div className="grid grid-cols-6 gap-0.5 p-1 rounded-md bg-slate-50 border border-slate-200/80">
                              {PIPELINE_COLUMNS.map((colItem, idx) => {
                                const currIdx = getStageIndex(inv.currentStage);
                                const isCurrent = colItem.stage === inv.currentStage;
                                const isPassed = idx < currIdx;

                                let dotColor = 'bg-slate-200 text-slate-400';
                                if (isCurrent) {
                                  dotColor = isOverdue 
                                    ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-400 animate-pulse' 
                                    : isWarning
                                    ? 'bg-amber-500 text-white font-bold ring-2 ring-amber-300'
                                    : 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-300';
                                } else if (isPassed) {
                                  dotColor = 'bg-emerald-500 text-white';
                                }

                                return (
                                  <div
                                    key={colItem.stage}
                                    title={`${colItem.title}: ${isCurrent ? `STUCK HERE (${inv.daysInCurrentStage}d)` : isPassed ? 'Completed' : 'Upcoming'}`}
                                    className={`py-0.5 text-center rounded text-[9px] truncate transition-colors ${dotColor}`}
                                  >
                                    {idx + 1}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <button
                              onClick={() => setInspectingInvoice(inv)}
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                              title="View full timeline and invoice details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            {col.stage !== 'booked' && (
                              <button
                                onClick={() => setTransitioningInvoice(inv)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* 1. Guard AI Scanner Modal */}
      <GuardInvoiceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* 2. Advance Department Stage Transition Modal */}
      <StageTransitionModal
        invoice={transitioningInvoice}
        isOpen={!!transitioningInvoice}
        onClose={() => setTransitioningInvoice(null)}
      />

      {/* 3. Detailed Invoice & Timeline Inspector Modal */}
      <InvoiceDetailModal
        invoice={inspectingInvoice}
        isOpen={!!inspectingInvoice}
        onClose={() => setInspectingInvoice(null)}
        onAdvanceClick={(inv) => setTransitioningInvoice(inv)}
      />
    </div>
  );
};
