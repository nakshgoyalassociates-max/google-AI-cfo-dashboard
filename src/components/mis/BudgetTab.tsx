import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BudgetCategory, 
  BudgetMonthKey, 
  BudgetLineItem 
} from '../../types';
import { 
  BUDGET_MONTHS, 
  CATEGORY_DEFINITIONS, 
  calculateItemVariance, 
  computeCategoryVariance, 
  computeMonthGrandSummary 
} from '../../data/mockBudgetData';
import { ExcelUploadBudgetModal } from './ExcelUploadBudgetModal';
import { exportVarianceReportExcel, generateBudgetTemplateExcel } from '../../utils/excelBudgetHelper';
import { 
  Calculator, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Calendar, 
  DollarSign, 
  RotateCcw, 
  Edit3, 
  Layers, 
  HelpCircle,
  ChevronDown,
  Info,
  Building,
  Check,
  X
} from 'lucide-react';

export const BudgetTab: React.FC = () => {
  const { 
    budgetItems, 
    selectedBudgetMonth, 
    setSelectedBudgetMonth,
    updateLineItemActual,
    updateLineItemBudget,
    bulkUpdateActualsFromExcel,
    resetBudgetData,
    clientProfile,
    role
  } = useApp();

  // View Controls
  const [viewMode, setViewMode] = useState<'single_month' | 'annual_matrix'>('single_month');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | BudgetCategory>('ALL');
  const [varianceFilter, setVarianceFilter] = useState<'ALL' | 'EXCEEDING_5' | 'ADVERSE_ONLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);

  // Inline editing state for fast manual adjustments
  const [editingCell, setEditingCell] = useState<{
    itemId: string;
    field: 'budget' | 'actual';
    value: string;
  } | null>(null);

  const activeMonthMeta = useMemo(() => {
    return BUDGET_MONTHS.find(m => m.key === selectedBudgetMonth) || BUDGET_MONTHS[5]; // Default Sep 26
  }, [selectedBudgetMonth]);

  // Grand summary for selected month
  const monthSummary = useMemo(() => {
    return computeMonthGrandSummary(budgetItems, selectedBudgetMonth);
  }, [budgetItems, selectedBudgetMonth]);

  // Filtered line items
  const filteredItems = useMemo(() => {
    return budgetItems.filter(item => {
      // 1. Category Filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesSub = item.subCategory.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesSub) return false;
      }

      // 3. Variance Filter (Threshold > 5%)
      const vr = calculateItemVariance(item, selectedBudgetMonth);
      if (varianceFilter === 'EXCEEDING_5') {
        if (!vr.isExceeding5Percent) return false;
      } else if (varianceFilter === 'ADVERSE_ONLY') {
        if (!vr.isExceeding5Percent || vr.varianceType !== 'adverse') return false;
      }

      return true;
    });
  }, [budgetItems, categoryFilter, varianceFilter, searchQuery, selectedBudgetMonth]);

  // Handle inline cell edit submission
  const handleSaveInlineEdit = () => {
    if (!editingCell) return;
    const num = parseFloat(editingCell.value.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(num)) {
      if (editingCell.field === 'actual') {
        updateLineItemActual(editingCell.itemId, selectedBudgetMonth, num);
      } else {
        updateLineItemBudget(editingCell.itemId, selectedBudgetMonth, num);
      }
    }
    setEditingCell(null);
  };

  const categoriesOrder: BudgetCategory[] = [
    'sales',
    'direct_cost',
    'fixed_factory',
    'salary_wages',
    'admin_cost'
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wide uppercase">
                Financial Planning & Analysis (FP&A)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Automatic &gt; 5% Variance Alerts
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Comprehensive Budget & Monthly Variance Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Track month-wise budgetary allocation across <strong className="text-slate-700">Sales, Direct Cost, Fixed Factory Expenses, Salary & Wages, and Admin Cost</strong>. 
              Upload monthly actuals from Excel to immediately compute deviations and highlight accounts breaching the 5% threshold.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Download Template */}
            <button
              onClick={() => generateBudgetTemplateExcel(budgetItems, selectedBudgetMonth, activeMonthMeta.label, clientProfile.companyName)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
              title="Download pre-formatted Excel template for entering monthly actual figures"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Excel Template</span>
            </button>

            {/* Export Variance Report */}
            <button
              onClick={() => exportVarianceReportExcel(budgetItems, selectedBudgetMonth, activeMonthMeta.label, clientProfile.companyName)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer border border-emerald-200 shadow-2xs"
              title="Export complete monthly variance report with breaches to Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export Variance (.xlsx)</span>
            </button>

            {/* Upload Excel Button */}
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Monthly Actuals</span>
            </button>
          </div>
        </div>

        {/* 2. Month Selector Navigation Strip */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              FY 26-27:
            </span>
            {BUDGET_MONTHS.map(m => {
              const isSelected = selectedBudgetMonth === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedBudgetMonth(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <span>{m.shortLabel}</span>
                  {m.isActualsUploaded ? (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`} 
                      title="Actuals Realized & Uploaded"
                    />
                  ) : (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-400' : 'bg-slate-300'}`} 
                      title="Actuals Pending"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Single Month Drilldown vs 12-Month Matrix */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('single_month')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'single_month'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month Drilldown ({activeMonthMeta.shortLabel})
            </button>
            <button
              onClick={() => setViewMode('annual_matrix')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'annual_matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full 12-Month Annual View
            </button>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Sales Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-800">1. Sales (Revenue)</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 font-mono">
              {monthSummary.sales.variancePercent >= 0 ? '+' : ''}{monthSummary.sales.variancePercent.toFixed(1)}%
            </span>
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            ₹{(monthSummary.sales.actual / 100000).toFixed(2)}L
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Budget: ₹{(monthSummary.sales.budget / 100000).toFixed(2)}L</span>
            <span className={monthSummary.sales.varianceAmount >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {monthSummary.sales.varianceAmount >= 0 ? '+' : ''}₹{(monthSummary.sales.varianceAmount / 100000).toFixed(2)}L
            </span>
          </div>
        </div>

        {/* Direct Cost Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-amber-800">2. Direct Cost (COGS)</span>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200 font-mono">
              {monthSummary.directCost.variancePercent >= 0 ? '+' : ''}{monthSummary.directCost.variancePercent.toFixed(1)}%
            </span>
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            ₹{(monthSummary.directCost.actual / 100000).toFixed(2)}L
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Budget: ₹{(monthSummary.directCost.budget / 100000).toFixed(2)}L</span>
            <span className={monthSummary.directCost.varianceAmount <= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {monthSummary.directCost.varianceAmount > 0 ? '+' : ''}₹{(monthSummary.directCost.varianceAmount / 100000).toFixed(2)}L
            </span>
          </div>
        </div>

        {/* Fixed Factory Expenses Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-800">3. Fixed Factory Exp</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200 font-mono">
              {monthSummary.fixedFactory.variancePercent >= 0 ? '+' : ''}{monthSummary.fixedFactory.variancePercent.toFixed(1)}%
            </span>
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            ₹{(monthSummary.fixedFactory.actual / 100000).toFixed(2)}L
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Budget: ₹{(monthSummary.fixedFactory.budget / 100000).toFixed(2)}L</span>
            <span className={monthSummary.fixedFactory.varianceAmount <= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {monthSummary.fixedFactory.varianceAmount > 0 ? '+' : ''}₹{(monthSummary.fixedFactory.varianceAmount / 100000).toFixed(2)}L
            </span>
          </div>
        </div>

        {/* Salary & Wages Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-purple-800">4. Salary & Wages</span>
            <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200 font-mono">
              {monthSummary.salaryWages.variancePercent >= 0 ? '+' : ''}{monthSummary.salaryWages.variancePercent.toFixed(1)}%
            </span>
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            ₹{(monthSummary.salaryWages.actual / 100000).toFixed(2)}L
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Budget: ₹{(monthSummary.salaryWages.budget / 100000).toFixed(2)}L</span>
            <span className={monthSummary.salaryWages.varianceAmount <= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {monthSummary.salaryWages.varianceAmount > 0 ? '+' : ''}₹{(monthSummary.salaryWages.varianceAmount / 100000).toFixed(2)}L
            </span>
          </div>
        </div>

        {/* Admin Cost Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-800">5. Admin Cost</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 font-mono">
              {monthSummary.adminCost.variancePercent >= 0 ? '+' : ''}{monthSummary.adminCost.variancePercent.toFixed(1)}%
            </span>
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            ₹{(monthSummary.adminCost.actual / 100000).toFixed(2)}L
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Budget: ₹{(monthSummary.adminCost.budget / 100000).toFixed(2)}L</span>
            <span className={monthSummary.adminCost.varianceAmount <= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {monthSummary.adminCost.varianceAmount > 0 ? '+' : ''}₹{(monthSummary.adminCost.varianceAmount / 100000).toFixed(2)}L
            </span>
          </div>
        </div>

        {/* Highlight Alert: > 5% Breaches Card */}
        <div className={`rounded-xl p-4 border shadow-2xs ${
          monthSummary.totalItemsBreaching5Percent > 0
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-emerald-50/70 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-amber-900 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              &gt; 5% Breaches
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900">
              Threshold ±5%
            </span>
          </div>
          <div className="text-lg font-black text-amber-950 font-mono">
            {monthSummary.totalItemsBreaching5Percent} Line Items
          </div>
          <div className="text-[11px] text-amber-900 mt-1 flex items-center justify-between">
            <span>{monthSummary.totalAdverseBreaches} Adverse Overruns</span>
            <button
              onClick={() => setVarianceFilter(varianceFilter === 'EXCEEDING_5' ? 'ALL' : 'EXCEEDING_5')}
              className="text-[10px] font-bold underline hover:text-amber-950 cursor-pointer"
            >
              {varianceFilter === 'EXCEEDING_5' ? 'Show All' : 'Filter &gt; 5%'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Search code, line item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Categories ({budgetItems.length})
            </button>

            {categoriesOrder.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {CATEGORY_DEFINITIONS[cat].shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Variance Breach Toggle Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Variance Filter:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setVarianceFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                varianceFilter === 'ALL'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({budgetItems.length})
            </button>
            <button
              onClick={() => setVarianceFilter('EXCEEDING_5')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer flex items-center gap-1 ${
                varianceFilter === 'EXCEEDING_5'
                  ? 'bg-amber-500 text-white font-bold shadow-2xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>&gt; 5% Breaches ({monthSummary.totalItemsBreaching5Percent})</span>
            </button>
            <button
              onClick={() => setVarianceFilter('ADVERSE_ONLY')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer flex items-center gap-1 ${
                varianceFilter === 'ADVERSE_ONLY'
                  ? 'bg-rose-600 text-white font-bold shadow-2xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <span>Adverse Only ({monthSummary.totalAdverseBreaches})</span>
            </button>
          </div>

          <button
            onClick={resetBudgetData}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Reset to default baseline financial model"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. Main Content: Single Month Drilldown View OR 12-Month Matrix */}
      {viewMode === 'single_month' ? (
        <div className="space-y-6">
          {/* Table grouped by the 5 Categories */}
          {categoriesOrder.map(cat => {
            if (categoryFilter !== 'ALL' && categoryFilter !== cat) {
              return null;
            }

            const itemsInCat = filteredItems.filter(it => it.category === cat);
            if (itemsInCat.length === 0 && (categoryFilter !== 'ALL' || varianceFilter !== 'ALL' || searchQuery)) {
              return null;
            }

            const catSummary = computeCategoryVariance(budgetItems, cat, selectedBudgetMonth);
            const catMeta = CATEGORY_DEFINITIONS[cat];

            return (
              <div 
                key={cat} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                {/* Category Header Strip */}
                <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 ${
                  cat === 'sales' ? 'bg-emerald-950 text-emerald-100' :
                  cat === 'direct_cost' ? 'bg-amber-950 text-amber-100' :
                  cat === 'fixed_factory' ? 'bg-indigo-950 text-indigo-100' :
                  cat === 'salary_wages' ? 'bg-purple-950 text-purple-100' :
                  'bg-slate-900 text-slate-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 uppercase tracking-widest font-bold">
                      {cat.replace('_', ' ')}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-white">
                        {catMeta.name}
                      </h3>
                      <p className="text-[11px] text-white/70">
                        {catMeta.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-white/60 block">Budget</span>
                      <span className="font-bold text-white">
                        ₹{catSummary.budget.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-white/60 block">Actual</span>
                      <span className="font-bold text-white">
                        ₹{catSummary.actual.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-white/60 block">Variance</span>
                      <span className={`font-bold ${
                        cat === 'sales'
                          ? (catSummary.varianceAmount >= 0 ? 'text-emerald-300' : 'text-rose-300')
                          : (catSummary.varianceAmount <= 0 ? 'text-emerald-300' : 'text-rose-300')
                      }`}>
                        {catSummary.varianceAmount >= 0 ? '+' : ''}₹{catSummary.varianceAmount.toLocaleString('en-IN')} ({catSummary.variancePercent.toFixed(1)}%)
                      </span>
                    </div>

                    {catSummary.exceeding5PercentCount > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-slate-950" />
                        {catSummary.exceeding5PercentCount} Breaches (&gt;5%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 w-24">Code</th>
                        <th className="py-2.5 px-4">Line Item Description</th>
                        <th className="py-2.5 px-4 w-36">Sub-Category</th>
                        <th className="py-2.5 px-4 text-right w-36">
                          Budget ({activeMonthMeta.shortLabel})
                        </th>
                        <th className="py-2.5 px-4 text-right w-40">
                          Actual ({activeMonthMeta.shortLabel})
                        </th>
                        <th className="py-2.5 px-4 text-right w-36">
                          Variance (₹)
                        </th>
                        <th className="py-2.5 px-4 text-right w-28">
                          Variance %
                        </th>
                        <th className="py-2.5 px-4 w-44">
                          Alert Status (&gt; 5%)
                        </th>
                        <th className="py-2.5 px-4 w-60">
                          Reason / Operational Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {itemsInCat.map(item => {
                        const vr = calculateItemVariance(item, selectedBudgetMonth);
                        const isBreach = vr.isExceeding5Percent;
                        const isEditingBudget = editingCell?.itemId === item.id && editingCell?.field === 'budget';
                        const isEditingActual = editingCell?.itemId === item.id && editingCell?.field === 'actual';

                        return (
                          <tr 
                            key={item.id}
                            className={`transition-colors group ${
                              isBreach
                                ? (vr.varianceType === 'adverse' 
                                    ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500' 
                                    : 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500')
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Code */}
                            <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                              {item.code}
                            </td>

                            {/* Name & Description */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">
                                {item.name}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                  {item.description}
                                </div>
                              )}
                            </td>

                            {/* Sub Category */}
                            <td className="py-3 px-4 text-slate-500 font-medium">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700">
                                {item.subCategory}
                              </span>
                            </td>

                            {/* Budget Amount (Click to inline edit) */}
                            <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                              {isEditingBudget ? (
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="text"
                                    value={editingCell?.value}
                                    onChange={(e) => setEditingCell({ ...editingCell!, value: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineEdit();
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    autoFocus
                                    className="w-24 text-right border border-indigo-400 rounded px-1.5 py-0.5 text-xs font-mono bg-white shadow-2xs"
                                  />
                                  <button onClick={handleSaveInlineEdit} className="text-emerald-600 hover:text-emerald-700">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => setEditingCell({ itemId: item.id, field: 'budget', value: vr.budget.toString() })}
                                  className="cursor-pointer hover:text-indigo-600 hover:underline flex items-center justify-end gap-1 group/btn"
                                  title="Click to edit budget figure"
                                >
                                  <span>₹{vr.budget.toLocaleString('en-IN')}</span>
                                  <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-100 text-slate-400" />
                                </div>
                              )}
                            </td>

                            {/* Actual Amount (Click to inline edit) */}
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {isEditingActual ? (
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="text"
                                    value={editingCell?.value}
                                    onChange={(e) => setEditingCell({ ...editingCell!, value: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineEdit();
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    autoFocus
                                    className="w-28 text-right border border-indigo-400 rounded px-1.5 py-0.5 text-xs font-mono bg-white shadow-2xs"
                                  />
                                  <button onClick={handleSaveInlineEdit} className="text-emerald-600 hover:text-emerald-700">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => setEditingCell({ itemId: item.id, field: 'actual', value: vr.actual.toString() })}
                                  className="cursor-pointer hover:text-indigo-600 hover:underline flex items-center justify-end gap-1 group/btn"
                                  title="Click to edit actual figure or upload via Excel"
                                >
                                  <span>₹{vr.actual.toLocaleString('en-IN')}</span>
                                  <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-100 text-slate-400" />
                                </div>
                              )}
                            </td>

                            {/* Variance Amount (Actual - Budget) */}
                            <td className={`py-3 px-4 text-right font-mono font-bold ${
                              vr.varianceType === 'adverse' 
                                ? 'text-rose-600' 
                                : vr.varianceType === 'favorable'
                                ? 'text-emerald-600'
                                : 'text-slate-600'
                            }`}>
                              {vr.varianceAmount >= 0 ? '+' : ''}₹{vr.varianceAmount.toLocaleString('en-IN')}
                            </td>

                            {/* Variance % */}
                            <td className={`py-3 px-4 text-right font-mono font-black ${
                              isBreach 
                                ? (vr.varianceType === 'adverse' ? 'text-rose-700' : 'text-emerald-700')
                                : 'text-slate-600'
                            }`}>
                              {vr.variancePercent !== 0 
                                ? `${vr.variancePercent > 0 ? '+' : ''}${vr.variancePercent.toFixed(1)}%`
                                : '0.0%'}
                            </td>

                            {/* Alert Status (> 5% Threshold) */}
                            <td className="py-3 px-4">
                              {isBreach ? (
                                <div className="flex items-center gap-1.5">
                                  {vr.varianceType === 'adverse' ? (
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                      {vr.alertBadgeText}
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                      {vr.alertBadgeText}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  On Track (±5%)
                                </span>
                              )}
                            </td>

                            {/* Reason / Notes */}
                            <td className="py-3 px-4 text-slate-600">
                              {item.monthly[selectedBudgetMonth]?.notes ? (
                                <span className="text-[11px] italic text-slate-700 font-medium">
                                  "{item.monthly[selectedBudgetMonth]?.notes}"
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  Standard operations
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Category Sub-Total Row */}
                    <tfoot className="bg-slate-100/80 font-bold border-t border-slate-300 text-slate-900">
                      <tr>
                        <td colSpan={3} className="py-3 px-4 text-slate-900">
                          Total {catMeta.shortName} ({activeMonthMeta.label})
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          ₹{catSummary.budget.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          ₹{catSummary.actual.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono ${
                          cat === 'sales'
                            ? (catSummary.varianceAmount >= 0 ? 'text-emerald-700' : 'text-rose-700')
                            : (catSummary.varianceAmount <= 0 ? 'text-emerald-700' : 'text-rose-700')
                        }`}>
                          {catSummary.varianceAmount >= 0 ? '+' : ''}₹{catSummary.varianceAmount.toLocaleString('en-IN')}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono ${
                          cat === 'sales'
                            ? (catSummary.variancePercent >= 0 ? 'text-emerald-700' : 'text-rose-700')
                            : (catSummary.variancePercent <= 0 ? 'text-emerald-700' : 'text-rose-700')
                        }`}>
                          {catSummary.variancePercent >= 0 ? '+' : ''}{catSummary.variancePercent.toFixed(1)}%
                        </td>
                        <td colSpan={2} className="py-3 px-4 text-slate-500 font-normal text-[11px]">
                          {catSummary.exceeding5PercentCount > 0 ? (
                            <strong className="text-amber-800">
                              {catSummary.exceeding5PercentCount} accounts exceed 5.0% threshold
                            </strong>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              All items within allowable 5% variance band
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}

          {/* 6. Grand Financial Statement Summary (EBITDA & Net Profit) */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Operating Summary & Bottomline Performance</span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {activeMonthMeta.label}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consolidated variance across all 5 operational categories (Sales, Direct Cost, Fixed Factory, Salary & Wages, Admin Cost).
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Overall Breaches</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {monthSummary.totalItemsBreaching5Percent} Items Exceeding 5%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              {/* Gross Margin Box */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                <span className="text-xs font-semibold text-slate-400 block">Gross Profit (Sales - Direct Cost)</span>
                <div className="text-lg font-black text-white font-mono mt-1">
                  ₹{monthSummary.grossProfitActual.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between text-xs mt-2 text-slate-300">
                  <span>Budget: ₹{monthSummary.grossProfitBudget.toLocaleString('en-IN')}</span>
                  <span className={monthSummary.grossProfitVariance >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {monthSummary.grossProfitVariance >= 0 ? '+' : ''}₹{monthSummary.grossProfitVariance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Gross Margin: <strong>{monthSummary.grossProfitMarginActual.toFixed(1)}%</strong> (vs {monthSummary.grossProfitMarginBudget.toFixed(1)}% Bgt)
                </div>
              </div>

              {/* Total Operating Expenses Box */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                <span className="text-xs font-semibold text-slate-400 block">Total Expenses (Opex + Direct Cost)</span>
                <div className="text-lg font-black text-white font-mono mt-1">
                  ₹{monthSummary.totalExpensesActual.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between text-xs mt-2 text-slate-300">
                  <span>Budget: ₹{monthSummary.totalExpensesBudget.toLocaleString('en-IN')}</span>
                  <span className={monthSummary.totalExpensesVariance <= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {monthSummary.totalExpensesVariance > 0 ? '+' : ''}₹{monthSummary.totalExpensesVariance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Expense Delta: <strong>{((monthSummary.totalExpensesVariance / monthSummary.totalExpensesBudget) * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {/* Operating EBITDA Box */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                <span className="text-xs font-semibold text-slate-400 block">Operating Surplus / EBITDA</span>
                <div className="text-lg font-black text-white font-mono mt-1">
                  ₹{monthSummary.ebitdaActual.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between text-xs mt-2 text-slate-300">
                  <span>Budget: ₹{monthSummary.ebitdaBudget.toLocaleString('en-IN')}</span>
                  <span className={monthSummary.ebitdaVariance >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {monthSummary.ebitdaVariance >= 0 ? '+' : ''}₹{monthSummary.ebitdaVariance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  EBITDA Margin: <strong>{monthSummary.ebitdaMarginActual.toFixed(1)}%</strong>
                </div>
              </div>

              {/* Virtual CFO Recommendation Alert */}
              <div className="bg-indigo-950/70 rounded-xl p-4 border border-indigo-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    Virtual CFO Action Recommendation
                  </span>
                  <p className="text-[11px] text-indigo-100 mt-1.5 leading-relaxed">
                    {monthSummary.totalAdverseBreaches > 0 ? (
                      <>
                        <strong className="text-amber-300">{monthSummary.totalAdverseBreaches} expense accounts</strong> breached the 5% threshold in {activeMonthMeta.shortLabel}. CFO review recommended for GPU Hosting (DC-01) and Legal Retainers (ADM-02).
                      </>
                    ) : (
                      <>
                        Excellent cost control across all operational categories in {activeMonthMeta.shortLabel}. No critical adverse overruns identified.
                      </>
                    )}
                  </p>
                </div>
                <div className="text-[10px] text-indigo-400 font-mono mt-2">
                  Virtual CFO: {clientProfile.cfoName}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 7. Full 12-Month Annual View Matrix (Apr 2026 - Mar 2027) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span>12-Month Annual Financial Budget & Actuals Matrix</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-white/10 text-white">
                  FY 2026-27 (All Months)
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Horizontal month-by-month trajectory showing Budget (B) vs Actual (A) vs Variance % (V%) across all 5 financial categories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                Cells with &gt; 5% variance highlighted in amber/rose
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 w-20 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    Code
                  </th>
                  <th className="py-2.5 px-3 min-w-[200px] sticky left-20 bg-slate-50 z-10 border-r border-slate-200">
                    Line Item
                  </th>
                  <th className="py-2.5 px-3 w-28 border-r border-slate-200">Category</th>
                  {BUDGET_MONTHS.map(m => (
                    <th key={m.key} className="py-2.5 px-3 text-center border-r border-slate-200 min-w-[120px]">
                      <div>{m.shortLabel}</div>
                      <div className="text-[10px] font-normal text-slate-400 flex items-center justify-around mt-0.5">
                        <span>Bgt</span>
                        <span>Act</span>
                        <span>Var%</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map(item => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200">
                        {item.code}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[220px] sticky left-20 bg-white z-10 border-r border-slate-200">
                        {item.name}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${CATEGORY_DEFINITIONS[item.category].badgeColor}`}>
                          {CATEGORY_DEFINITIONS[item.category].shortName}
                        </span>
                      </td>

                      {/* 12 Month columns */}
                      {BUDGET_MONTHS.map(m => {
                        const mData = item.monthly[m.key] || { budget: 0, actual: 0 };
                        const bgt = mData.budget;
                        const act = mData.actual;
                        const varPct = bgt > 0 && act > 0 ? ((act - bgt) / bgt) * 100 : 0;
                        const isBreach = act > 0 && Math.abs(varPct) > 5;

                        return (
                          <td 
                            key={m.key} 
                            className={`py-2 px-2 text-right font-mono text-[11px] border-r border-slate-200 ${
                              isBreach
                                ? (item.category === 'sales'
                                    ? (varPct > 0 ? 'bg-emerald-50/70 text-emerald-900 font-bold' : 'bg-rose-50/70 text-rose-900 font-bold')
                                    : (varPct > 0 ? 'bg-rose-50/70 text-rose-900 font-bold' : 'bg-emerald-50/70 text-emerald-900 font-bold'))
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-slate-500">{(bgt / 1000).toFixed(0)}k</span>
                              <span className="font-semibold text-slate-800">
                                {act > 0 ? `${(act / 1000).toFixed(0)}k` : '-'}
                              </span>
                              <span className={`font-bold ${
                                isBreach 
                                  ? (item.category === 'sales'
                                      ? (varPct > 0 ? 'text-emerald-600' : 'text-rose-600')
                                      : (varPct > 0 ? 'text-rose-600' : 'text-emerald-600'))
                                  : 'text-slate-400'
                              }`}>
                                {act > 0 ? `${varPct > 0 ? '+' : ''}${varPct.toFixed(0)}%` : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Excel Upload Modal */}
      <ExcelUploadBudgetModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        targetMonthKey={selectedBudgetMonth}
        onMonthChange={(m) => setSelectedBudgetMonth(m)}
        budgetItems={budgetItems}
        companyName={clientProfile.companyName}
        onApplyActuals={(monthKey, rows) => {
          bulkUpdateActualsFromExcel(monthKey, rows);
        }}
      />
    </div>
  );
};
