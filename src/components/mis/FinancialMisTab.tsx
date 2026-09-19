import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { formatINR, formatLakhs, formatCrores } from '../../utils/format';
import { FinancialMIS, MisSubTab } from '../../types';
import { BalanceSheetView } from './BalanceSheetView';
import { PnlAccountView } from './PnlAccountView';
import { DebtorAgeingView } from './DebtorAgeingView';
import { FundFlowView } from './FundFlowView';
import { BudgetTab } from './BudgetTab';
import { MisVisualBroadPicture } from './MisVisualBroadPicture';
import { 
  NEXORA_BALANCE_SHEET, 
  NEXORA_PNL_STATEMENT, 
  NEXORA_DEBTOR_AGEING, 
  NEXORA_FUND_FLOW,
  COMPANY_MIS_DETAILED 
} from '../../data/mockMisFinancials';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Wallet, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  FileCheck,
  Check,
  X,
  Sparkles,
  Info,
  Scale,
  ArrowRightLeft,
  ArrowRight,
  Users,
  LayoutDashboard,
  FileText,
  Calculator,
  PieChart
} from 'lucide-react';

interface ParsedMetricRow {
  code: string;
  name: string;
  currentValue: string | number;
  newValue: string | number;
  isChanged: boolean;
  unit: string;
}

export const FinancialMisTab: React.FC = () => {
  const { 
    financialMIS, 
    updateFinancialMIS, 
    role, 
    clientProfile, 
    showToast, 
    misSubTab, 
    setMisSubTab,
    budgetItems,
    selectedBudgetMonth 
  } = useApp();
  
  const activeSubTab = misSubTab;
  const setActiveSubTab = setMisSubTab;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FinancialMIS>(financialMIS);

  // Compute how many budget lines breach ±5% variance threshold in active month
  const budgetAlertCount = useMemo(() => {
    return budgetItems.filter(item => {
      const data = item.monthly[selectedBudgetMonth] || { budget: 0, actual: 0 };
      if (data.budget === 0 && data.actual === 0) return false;
      const bgt = data.budget;
      const act = data.actual;
      const diff = act - bgt;
      const pct = bgt !== 0 ? (diff / bgt) * 100 : 0;
      return Math.abs(pct) > 5;
    }).length;
  }, [budgetItems, selectedBudgetMonth]);

  // Active detailed statement datasets for selected company
  const detailedCompanyData = COMPANY_MIS_DETAILED[clientProfile.id] || COMPANY_MIS_DETAILED['client-101'];
  const activeBalanceSheet = financialMIS.balanceSheet || detailedCompanyData.balanceSheet || NEXORA_BALANCE_SHEET;
  const activePnl = financialMIS.pnlStatement || detailedCompanyData.pnlStatement || NEXORA_PNL_STATEMENT;
  const activeDebtorAgeing = financialMIS.debtorAgeing || detailedCompanyData.debtorAgeing || NEXORA_DEBTOR_AGEING;
  const activeFundFlow = financialMIS.fundFlow || detailedCompanyData.fundFlow || NEXORA_FUND_FLOW;

  // Excel upload & template manager states
  const [isExcelPanelOpen, setIsExcelPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedMetricRow[] | null>(null);
  const [stagedMIS, setStagedMIS] = useState<Partial<FinancialMIS> | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form submit for direct edits
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinancialMIS(formData);
    setIsEditing(false);
  };

  // Fixed template definitions
  const TEMPLATE_SCHEMA = [
    {
      'Metric Code': 'PERIOD',
      'Metric Name': 'Reporting MIS Period',
      'Value': 'September 2026 (Month-End MIS)',
      'Unit': 'Text',
      'Guidance': 'Format: Month YYYY (e.g., September 2026)'
    },
    {
      'Metric Code': 'REVENUE',
      'Metric Name': 'Gross Monthly Revenue (INR)',
      'Value': 5450000,
      'Unit': 'INR (₹)',
      'Guidance': 'Gross revenue from operations during the month'
    },
    {
      'Metric Code': 'REVENUE_GROWTH_MOM',
      'Metric Name': 'Revenue Growth MoM (%)',
      'Value': 14.8,
      'Unit': 'Percentage (%)',
      'Guidance': 'Month on month top-line revenue growth rate'
    },
    {
      'Metric Code': 'GROSS_MARGIN_PCT',
      'Metric Name': 'Gross Profit Margin (%)',
      'Value': 70.4,
      'Unit': 'Percentage (%)',
      'Guidance': '(Revenue - Direct Costs) / Revenue * 100'
    },
    {
      'Metric Code': 'EBITDA',
      'Metric Name': 'Operating EBITDA (INR)',
      'Value': 1320000,
      'Unit': 'INR (₹)',
      'Guidance': 'Earnings before interest, taxes, depreciation and amortization'
    },
    {
      'Metric Code': 'EBITDA_MARGIN_PCT',
      'Metric Name': 'EBITDA Margin (%)',
      'Value': 24.2,
      'Unit': 'Percentage (%)',
      'Guidance': 'EBITDA / Revenue * 100'
    },
    {
      'Metric Code': 'NET_PROFIT',
      'Metric Name': 'Net Profit After Tax - PAT (INR)',
      'Value': 985000,
      'Unit': 'INR (₹)',
      'Guidance': 'Final bottom-line net profit after all taxes and finance costs'
    },
    {
      'Metric Code': 'CASH_BANK_BALANCE',
      'Metric Name': 'Cash & Bank Liquid Treasury (INR)',
      'Value': 16200000,
      'Unit': 'INR (₹)',
      'Guidance': 'Total cash in bank current accounts, sweep accounts and fixed deposits'
    },
    {
      'Metric Code': 'MONTHLY_BURN_RATE',
      'Metric Name': 'Monthly Cash Burn Rate (INR)',
      'Value': 1950000,
      'Unit': 'INR (₹)',
      'Guidance': 'Average net operating cash outflow per month'
    },
    {
      'Metric Code': 'TOTAL_DEBTORS',
      'Metric Name': 'Total Trade Receivables / Debtors (INR)',
      'Value': 5850000,
      'Unit': 'INR (₹)',
      'Guidance': 'Gross outstanding customer invoices'
    },
    {
      'Metric Code': 'DEBTORS_OVER_90_DAYS',
      'Metric Name': 'Debtors Overdue > 90 Days (INR)',
      'Value': 680000,
      'Unit': 'INR (₹)',
      'Guidance': 'High risk receivables requiring immediate virtual CFO recovery follow-up'
    },
    {
      'Metric Code': 'DEBTOR_DAYS_DSO',
      'Metric Name': 'Days Sales Outstanding - DSO',
      'Value': 40,
      'Unit': 'Days',
      'Guidance': 'Average days taken by customers to settle invoices'
    },
    {
      'Metric Code': 'TOTAL_CREDITORS',
      'Metric Name': 'Total Trade Payables / Creditors (INR)',
      'Value': 2950000,
      'Unit': 'INR (₹)',
      'Guidance': 'Total vendor balances outstanding'
    },
    {
      'Metric Code': 'CREDITORS_MSME_OVER_45',
      'Metric Name': 'MSME Payables Due > 45 Days (Sec 43B(h)) (INR)',
      'Value': 165000,
      'Unit': 'INR (₹)',
      'Guidance': 'CRITICAL: Must clear within 45 days to avoid income tax disallowance'
    },
    {
      'Metric Code': 'WORKING_CAPITAL',
      'Metric Name': 'Net Working Capital (INR)',
      'Value': 12400000,
      'Unit': 'INR (₹)',
      'Guidance': 'Current Assets minus Current Liabilities'
    },
    {
      'Metric Code': 'QUICK_RATIO',
      'Metric Name': 'Quick Liquidity Ratio (x)',
      'Value': 2.72,
      'Unit': 'Ratio',
      'Guidance': '(Current Assets - Inventory) / Current Liabilities'
    },
    {
      'Metric Code': 'CFO_SUMMARY',
      'Metric Name': 'Virtual CFO Strategic Commentary',
      'Value': 'Operating margins strengthened by 70 bps. Cash runway remains healthy at 8.3 months. Advance Tax 2nd installment provision cleared. MSME Sec 43B(h) overdue was reduced to ₹1.65L and queued for release.',
      'Unit': 'Text',
      'Guidance': 'CFO monthly executive summary for promoter and board'
    },
    {
      'Metric Code': 'CFO_ALERT_1',
      'Metric Name': 'CFO Key Alert 1',
      'Value': 'MSME Section 43B(h): FabTech bill ₹1.65L due in 3 days; release approved.',
      'Unit': 'Text',
      'Guidance': 'Priority operational or tax alert'
    },
    {
      'Metric Code': 'CFO_ALERT_2',
      'Metric Name': 'CFO Key Alert 2',
      'Value': 'Debtor collections improved; ₹14.2L realized from enterprise clients.',
      'Unit': 'Text',
      'Guidance': 'Working capital or liquidity alert'
    },
    {
      'Metric Code': 'CFO_ALERT_3',
      'Metric Name': 'CFO Key Alert 3',
      'Value': 'GSTR-3B tax payment queued and reconciled with GSTR-2B input credit.',
      'Unit': 'Text',
      'Guidance': 'Compliance or audit milestone alert'
    }
  ];

  // 1. Download Fixed Template as .xlsx
  const downloadFixedTemplate = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      const ws = XLSX.utils.json_to_sheet(TEMPLATE_SCHEMA);
      ws['!cols'] = [
        { wch: 28 }, // Metric Code
        { wch: 45 }, // Metric Name
        { wch: 22 }, // Value
        { wch: 18 }, // Unit
        { wch: 55 }  // Guidance
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fixed_MIS_Template');

      const fileName = `Virtual_CFO_Financial_MIS_Fixed_Template.${format}`;
      if (format === 'csv') {
        XLSX.writeFile(wb, fileName, { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, fileName);
      }
      showToast(`Downloaded fixed template: ${fileName}`);
    } catch (err) {
      console.error('Template generation error:', err);
      showToast('Error downloading template');
    }
  };

  // Helper to map parsed JSON rows to FinancialMIS state
  const processExcelRows = (rows: any[], sourceName: string) => {
    try {
      setUploadError(null);
      const partialMIS: Partial<FinancialMIS> = {};
      const alerts: string[] = [];

      // Loop through rows and extract by Metric Code or Metric Name
      rows.forEach((row: any) => {
        const rawCode = (row['Metric Code'] || row['metric_code'] || row['Code'] || row['code'] || '').toString().trim().toUpperCase();
        const rawName = (row['Metric Name'] || row['metric_name'] || row['Name'] || row['Metric'] || '').toString().trim().toLowerCase();
        const rawVal = row['Value'] !== undefined ? row['Value'] : row['value'] !== undefined ? row['value'] : row['Amount'];

        if (rawVal === undefined || rawVal === null || rawVal === '') return;

        const numVal = Number(rawVal);
        const strVal = String(rawVal).trim();

        if (rawCode === 'PERIOD' || rawName.includes('reporting mis') || rawName.includes('period')) {
          partialMIS.period = strVal;
        } else if (rawCode === 'REVENUE' || rawName.includes('monthly revenue') || rawName.includes('gross revenue')) {
          partialMIS.monthlyRevenue = !isNaN(numVal) ? numVal : partialMIS.monthlyRevenue;
        } else if (rawCode === 'REVENUE_GROWTH_MOM' || rawName.includes('revenue growth')) {
          partialMIS.revenueGrowthMoM = !isNaN(numVal) ? numVal : partialMIS.revenueGrowthMoM;
        } else if (rawCode === 'GROSS_MARGIN_PCT' || rawName.includes('gross profit margin') || rawName.includes('gross margin')) {
          partialMIS.grossMarginPercent = !isNaN(numVal) ? numVal : partialMIS.grossMarginPercent;
        } else if (rawCode === 'EBITDA' || rawName === 'operating ebitda (inr)' || rawName === 'ebitda') {
          partialMIS.ebitda = !isNaN(numVal) ? numVal : partialMIS.ebitda;
        } else if (rawCode === 'EBITDA_MARGIN_PCT' || rawName.includes('ebitda margin')) {
          partialMIS.ebitdaMarginPercent = !isNaN(numVal) ? numVal : partialMIS.ebitdaMarginPercent;
        } else if (rawCode === 'NET_PROFIT' || rawName.includes('net profit') || rawName.includes('pat')) {
          partialMIS.netProfit = !isNaN(numVal) ? numVal : partialMIS.netProfit;
        } else if (rawCode === 'CASH_BANK_BALANCE' || rawName.includes('cash & bank') || rawName.includes('treasury')) {
          partialMIS.cashAndBankBalance = !isNaN(numVal) ? numVal : partialMIS.cashAndBankBalance;
        } else if (rawCode === 'MONTHLY_BURN_RATE' || rawName.includes('burn rate') || rawName.includes('burn')) {
          partialMIS.monthlyBurnRate = !isNaN(numVal) ? numVal : partialMIS.monthlyBurnRate;
        } else if (rawCode === 'TOTAL_DEBTORS' || rawName.includes('total trade receivables') || rawName.includes('total debtors')) {
          partialMIS.totalDebtors = !isNaN(numVal) ? numVal : partialMIS.totalDebtors;
        } else if (rawCode === 'DEBTORS_OVER_90_DAYS' || rawName.includes('debtors overdue > 90') || rawName.includes('> 90 days')) {
          partialMIS.debtorsOver90Days = !isNaN(numVal) ? numVal : partialMIS.debtorsOver90Days;
        } else if (rawCode === 'DEBTOR_DAYS_DSO' || rawName.includes('dso') || rawName.includes('days sales outstanding')) {
          partialMIS.debtorDaysDSO = !isNaN(numVal) ? numVal : partialMIS.debtorDaysDSO;
        } else if (rawCode === 'TOTAL_CREDITORS' || rawName.includes('total trade payables') || rawName.includes('total creditors')) {
          partialMIS.totalCreditors = !isNaN(numVal) ? numVal : partialMIS.totalCreditors;
        } else if (rawCode === 'CREDITORS_MSME_OVER_45' || rawName.includes('msme') || rawName.includes('43b(h)')) {
          partialMIS.creditorsOver45Days = !isNaN(numVal) ? numVal : partialMIS.creditorsOver45Days;
        } else if (rawCode === 'WORKING_CAPITAL' || rawName.includes('working capital')) {
          partialMIS.workingCapital = !isNaN(numVal) ? numVal : partialMIS.workingCapital;
        } else if (rawCode === 'QUICK_RATIO' || rawName.includes('quick liquidity') || rawName.includes('quick ratio')) {
          partialMIS.quickRatio = !isNaN(numVal) ? numVal : partialMIS.quickRatio;
        } else if (rawCode === 'CFO_SUMMARY' || rawName.includes('cfo strategic') || rawName.includes('executive summary')) {
          partialMIS.cfoExecutiveSummary = strVal;
        } else if (rawCode.startsWith('CFO_ALERT') || rawName.includes('alert')) {
          alerts.push(strVal);
        }
      });

      if (alerts.length > 0) {
        partialMIS.cfoKeyAlerts = alerts;
      }

      // Auto-compute runway if cash and burn rate provided
      const cash = partialMIS.cashAndBankBalance ?? financialMIS.cashAndBankBalance;
      const burn = partialMIS.monthlyBurnRate ?? financialMIS.monthlyBurnRate;
      if (burn > 0) {
        partialMIS.cashRunwayMonths = Number((cash / burn).toFixed(1));
      }

      // Prepare comparison rows for UI preview
      const preview: ParsedMetricRow[] = [
        {
          code: 'PERIOD',
          name: 'Reporting MIS Period',
          currentValue: financialMIS.period,
          newValue: partialMIS.period ?? financialMIS.period,
          isChanged: partialMIS.period !== undefined && partialMIS.period !== financialMIS.period,
          unit: 'Text'
        },
        {
          code: 'REVENUE',
          name: 'Monthly Revenue',
          currentValue: formatLakhs(financialMIS.monthlyRevenue),
          newValue: formatLakhs(partialMIS.monthlyRevenue ?? financialMIS.monthlyRevenue),
          isChanged: partialMIS.monthlyRevenue !== undefined && partialMIS.monthlyRevenue !== financialMIS.monthlyRevenue,
          unit: 'INR'
        },
        {
          code: 'EBITDA',
          name: 'Operating EBITDA',
          currentValue: formatLakhs(financialMIS.ebitda),
          newValue: formatLakhs(partialMIS.ebitda ?? financialMIS.ebitda),
          isChanged: partialMIS.ebitda !== undefined && partialMIS.ebitda !== financialMIS.ebitda,
          unit: 'INR'
        },
        {
          code: 'NET_PROFIT',
          name: 'Net Profit PAT',
          currentValue: formatLakhs(financialMIS.netProfit),
          newValue: formatLakhs(partialMIS.netProfit ?? financialMIS.netProfit),
          isChanged: partialMIS.netProfit !== undefined && partialMIS.netProfit !== financialMIS.netProfit,
          unit: 'INR'
        },
        {
          code: 'CASH_BANK_BALANCE',
          name: 'Cash & Bank Liquid Treasury',
          currentValue: formatCrores(financialMIS.cashAndBankBalance),
          newValue: formatCrores(partialMIS.cashAndBankBalance ?? financialMIS.cashAndBankBalance),
          isChanged: partialMIS.cashAndBankBalance !== undefined && partialMIS.cashAndBankBalance !== financialMIS.cashAndBankBalance,
          unit: 'INR'
        },
        {
          code: 'CASH_RUNWAY',
          name: 'Cash Runway',
          currentValue: `${financialMIS.cashRunwayMonths} Months`,
          newValue: `${partialMIS.cashRunwayMonths ?? financialMIS.cashRunwayMonths} Months`,
          isChanged: partialMIS.cashRunwayMonths !== undefined && partialMIS.cashRunwayMonths !== financialMIS.cashRunwayMonths,
          unit: 'Months'
        },
        {
          code: 'TOTAL_DEBTORS',
          name: 'Total Debtors',
          currentValue: formatLakhs(financialMIS.totalDebtors),
          newValue: formatLakhs(partialMIS.totalDebtors ?? financialMIS.totalDebtors),
          isChanged: partialMIS.totalDebtors !== undefined && partialMIS.totalDebtors !== financialMIS.totalDebtors,
          unit: 'INR'
        },
        {
          code: 'CREDITORS_MSME_OVER_45',
          name: 'MSME > 45 Days (Sec 43B(h))',
          currentValue: formatLakhs(financialMIS.creditorsOver45Days),
          newValue: formatLakhs(partialMIS.creditorsOver45Days ?? financialMIS.creditorsOver45Days),
          isChanged: partialMIS.creditorsOver45Days !== undefined && partialMIS.creditorsOver45Days !== financialMIS.creditorsOver45Days,
          unit: 'INR'
        }
      ];

      setUploadFileName(sourceName);
      setParsedRows(preview);
      setStagedMIS(partialMIS);
      setIsExcelPanelOpen(true);
      showToast(`Parsed ${rows.length} rows from ${sourceName}`);
    } catch (err: any) {
      console.error('Excel processing error:', err);
      setUploadError(err?.message || 'Failed to parse Excel file. Please ensure it follows the fixed template.');
    }
  };

  // 2. Read and parse any Excel / CSV file
  const readAndProcessFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          setUploadError('The uploaded sheet is empty. Please use the fixed template with populated rows.');
          return;
        }

        processExcelRows(rows, file.name);
      } catch (err: any) {
        setUploadError(`Failed to read file: ${err?.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndProcessFile(file);
    // reset input so the same file can be re-uploaded if modified
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 3. One-click Demo Sample Loader
  const loadDemoExcelData = () => {
    processExcelRows(TEMPLATE_SCHEMA, 'Demo_Fixed_Template_Sample.xlsx');
  };

  // 4. Apply parsed Excel data to Application State
  const applyExcelData = () => {
    if (!stagedMIS) return;
    updateFinancialMIS(stagedMIS);
    setParsedRows(null);
    setStagedMIS(null);
    setUploadFileName(null);
    setIsExcelPanelOpen(false);

    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    showToast('🎉 Financial MIS updated successfully from fixed Excel template!');
  };

  const cancelExcelStaging = () => {
    setParsedRows(null);
    setStagedMIS(null);
    setUploadFileName(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Formal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Financial MIS & Working Capital Health
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Period: {financialMIS.period}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            P&L performance, Balance Sheet liquidity, Cash Runway, MSME Sec 43B(h) creditor ageing, and fixed template Excel ingestion for {clientProfile.companyName}.
          </p>
        </div>

        {/* Action Buttons: Excel Template Download, Upload & Direct Edit */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => downloadFixedTemplate('xlsx')}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Download standard template with fixed column schema"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Template (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsExcelPanelOpen(!isExcelPanelOpen)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isExcelPanelOpen ? 'Hide Upload' : 'Upload Excel'}</span>
          </button>

          {(role === 'cfo' || role === 'client_team') && (
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                } else {
                  setFormData(financialMIS);
                  setIsEditing(true);
                }
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Metrics'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Operational Role Banner for Client Team */}
      {role === 'client_team' && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Client Finance Desk Operational Access</span>
                <span className="px-2 py-0.2 rounded-full bg-sky-200 text-sky-800 text-[10px] font-semibold">Data Upload & Variance Center</span>
              </div>
              <p className="text-[11px] text-sky-700 mt-0.5">
                You can upload monthly financials via Excel, update metric balances directly, and provide operational explanations for budget variances exceeding ±5%.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSubTab('budget')}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Review & Explain Variances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden File Input for Excel */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* DEDICATED EXCEL INTEGRATION PANEL (Fixed template updater) */}
      {isExcelPanelOpen && (
        <div className="bg-white rounded-2xl border-2 border-emerald-400/80 p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Excel MIS Upload & Fixed Template Synchronizer</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Fixed Template Supported
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Update entire Financial MIS dashboard in 1 step using standard spreadsheet format
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadDemoExcelData}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer flex items-center gap-1"
                title="Load sample data from the fixed template to test without uploading"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Test with Sample Data</span>
              </button>

              <button
                onClick={() => setIsExcelPanelOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3-Step Simple Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                1
              </span>
              <div>
                <strong className="text-slate-900 block">Download Template</strong>
                <span className="text-slate-500 text-[11px]">
                  Get the standardized{' '}
                  <button onClick={() => downloadFixedTemplate('xlsx')} className="text-emerald-700 font-semibold underline">
                    .xlsx
                  </button>{' '}
                  or{' '}
                  <button onClick={() => downloadFixedTemplate('csv')} className="text-emerald-700 font-semibold underline">
                    .csv
                  </button>{' '}
                  file.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                2
              </span>
              <div>
                <strong className="text-slate-900 block">Enter / Paste Figures</strong>
                <span className="text-slate-500 text-[11px]">
                  Input numbers in the <strong>Value</strong> column (Revenue, EBITDA, Bank Cash, Debtors).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                3
              </span>
              <div>
                <strong className="text-slate-900 block">Upload & Apply</strong>
                <span className="text-slate-500 text-[11px]">
                  Drop file below, review the side-by-side comparison table, and click Apply.
                </span>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all space-y-2 ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-100/60 scale-[1.01]' 
                : 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {isDragging ? 'Drop your Excel file here...' : 'Click to browse or drag and drop your completed Excel file (.xlsx, .xls, .csv)'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically maps: <strong>Metric Code</strong>, <strong>Metric Name</strong>, and <strong>Value</strong>
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1 text-[11px]">
              <span className="text-emerald-700 font-semibold underline" onClick={(e) => { e.stopPropagation(); downloadFixedTemplate('xlsx'); }}>
                Download .xlsx Template
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold underline" onClick={(e) => { e.stopPropagation(); downloadFixedTemplate('csv'); }}>
                Download .csv Template
              </span>
            </div>
          </div>

          {/* Error display */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Parsed Preview Table & Confirmation */}
          {parsedRows && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    File Parsed: <strong className="text-emerald-700 font-mono">{uploadFileName}</strong>
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Review values extracted from the fixed template before applying to the executive dashboard
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelExcelStaging}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={applyExcelData}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Financial MIS</span>
                  </button>
                </div>
              </div>

              {/* Table preview */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Metric Code</th>
                      <th className="px-3 py-2">Metric Name</th>
                      <th className="px-3 py-2">Current MIS Value</th>
                      <th className="px-3 py-2">Uploaded Excel Value</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedRows.map((row) => (
                      <tr key={row.code} className={row.isChanged ? 'bg-emerald-50/40' : ''}>
                        <td className="px-3 py-2 font-mono font-bold text-slate-700 text-[11px]">
                          {row.code}
                        </td>
                        <td className="px-3 py-2 text-slate-900 font-medium">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 text-slate-500 font-mono">
                          {String(row.currentValue)}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                          {String(row.newValue)}
                        </td>
                        <td className="px-3 py-2">
                          {row.isChanged ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Updated ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              Unchanged
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Quick Edit Form Modal for CFO */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-md space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Update Client Financial MIS Parameters (CFO Workstation)
            </h3>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Revenue (₹)</label>
              <input
                type="number"
                value={formData.monthlyRevenue}
                onChange={(e) => setFormData({ ...formData, monthlyRevenue: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">EBITDA (₹)</label>
              <input
                type="number"
                value={formData.ebitda}
                onChange={(e) => setFormData({ ...formData, ebitda: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cash in Bank (₹)</label>
              <input
                type="number"
                value={formData.cashAndBankBalance}
                onChange={(e) => setFormData({ ...formData, cashAndBankBalance: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Burn Rate (₹)</label>
              <input
                type="number"
                value={formData.monthlyBurnRate}
                onChange={(e) => {
                  const burn = Number(e.target.value);
                  const runway = burn > 0 ? Number((formData.cashAndBankBalance / burn).toFixed(1)) : 0;
                  setFormData({ ...formData, monthlyBurnRate: burn, cashRunwayMonths: runway });
                }}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Debtors (₹)</label>
              <input
                type="number"
                value={formData.totalDebtors}
                onChange={(e) => setFormData({ ...formData, totalDebtors: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Debtors &gt; 90 Days (₹)</label>
              <input
                type="number"
                value={formData.debtorsOver90Days}
                onChange={(e) => setFormData({ ...formData, debtorsOver90Days: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Creditors (₹)</label>
              <input
                type="number"
                value={formData.totalCreditors}
                onChange={(e) => setFormData({ ...formData, totalCreditors: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">MSME Dues &gt; 45 Days (₹)</label>
              <input
                type="number"
                value={formData.creditorsOver45Days}
                onChange={(e) => setFormData({ ...formData, creditorsOver45Days: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">CFO Executive Summary & Guidance</label>
            <textarea
              rows={3}
              value={formData.cfoExecutiveSummary}
              onChange={(e) => setFormData({ ...formData, cfoExecutiveSummary: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </form>
      )}

      {/* Sub-Navigation Tabs for Detailed Financial Statements */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto gap-2 pt-1 pb-1">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-indigo-400" />
            <span>Broad Picture & Vitals</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeSubTab === 'overview'
                ? 'bg-indigo-500/40 text-indigo-100'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              Pie Charts
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('balance-sheet')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'balance-sheet'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Broad Balance Sheet</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-white font-mono">
              Ind AS
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('pnl')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'pnl'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>P&L Account</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-white font-mono">
              PAT: {activePnl.profitability.patMarginPercent}%
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('debtor-ageing')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'debtor-ageing'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Debtor Ageing</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-600/30 text-white font-mono">
              DSO: {activeDebtorAgeing.daysSalesOutstanding}d
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('fund-flow')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'fund-flow'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Fund Flow</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/30 text-white font-mono">
              Working Capital
            </span>
          </button>

          <button
            id="mis-subtab-budget"
            onClick={() => setActiveSubTab('budget')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'budget'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Budget & Variance</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
              activeSubTab === 'budget' 
                ? 'bg-amber-500/30 text-white' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {budgetAlertCount > 0 ? `${budgetAlertCount} Alerts (±5%)` : '±5% Alerts'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Consolidated Financial Dossier</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: OVERVIEW & VITALS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Row 1: Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Monthly Revenue"
              value={formatLakhs(financialMIS.monthlyRevenue)}
              subtitle={`${financialMIS.period}`}
              trend={{ value: `${financialMIS.revenueGrowthMoM}% MoM`, isPositive: financialMIS.revenueGrowthMoM > 0 }}
              icon={IndianRupee}
              badge={{ text: 'Top-Line', variant: 'info' }}
              iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200"
            />

            <MetricCard
              title="Operating EBITDA"
              value={formatLakhs(financialMIS.ebitda)}
              subtitle={`Margin: ${financialMIS.ebitdaMarginPercent}%`}
              trend={{ value: `Net PAT: ${formatLakhs(financialMIS.netProfit, 1)}`, isPositive: true }}
              icon={TrendingUp}
              badge={{ text: 'Profitability', variant: 'success' }}
              iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
            />

            <MetricCard
              title="Liquid Treasury"
              value={formatCrores(financialMIS.cashAndBankBalance)}
              subtitle={`Burn: ${formatLakhs(financialMIS.monthlyBurnRate, 1)}/mo`}
              trend={{ value: `${financialMIS.cashRunwayMonths} Mo. Runway`, isPositive: financialMIS.cashRunwayMonths >= 6 }}
              icon={Wallet}
              badge={{ text: 'Runway', variant: 'info' }}
              iconBgColor="bg-sky-50 text-sky-600 border-sky-200"
            />

            <MetricCard
              title="MSME Sec 43B(h) Risk"
              value={formatLakhs(financialMIS.creditorsOver45Days)}
              subtitle="Vendor dues > 45 days"
              trend={{ value: "Tax disallowance risk", isPositive: false }}
              icon={AlertTriangle}
              badge={{ text: 'Statutory', variant: 'danger' }}
              iconBgColor="bg-rose-50 text-rose-600 border-rose-200"
            />
          </div>

          {/* Row 2: Broad Picture in Pie Chart (Reveals Complete MIS Quickly) */}
          <MisVisualBroadPicture
            pnl={activePnl}
            balanceSheet={activeBalanceSheet}
            debtorAgeing={activeDebtorAgeing}
            financialMIS={financialMIS}
            onNavigateSubTab={(subTab) => setActiveSubTab(subTab)}
          />

          {/* Row 3: Working Capital Dynamics & Receivables / Payables Ageing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Trade Receivables & DSO Radar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Trade Receivables & DSO Radar
                  </h2>
                </div>
                <button
                  onClick={() => setActiveSubTab('debtor-ageing')}
                  className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 cursor-pointer"
                >
                  <span>DSO: {financialMIS.debtorDaysDSO} Days</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Total Receivables:</span>
                  <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                    {formatLakhs(financialMIS.totalDebtors)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Across 48 customer ledgers</p>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-medium">Overdue &gt; 90 Days:</span>
                  <p className="text-lg font-bold text-amber-900 mt-1 font-mono">
                    {formatLakhs(financialMIS.debtorsOver90Days)}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Assigned to team for follow-up</p>
                </div>
              </div>

              {/* Ageing Breakdown Bar */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-600">
                  <span>Receivables Ageing Distribution:</span>
                  <button 
                    onClick={() => setActiveSubTab('debtor-ageing')} 
                    className="text-indigo-600 text-[11px] hover:underline cursor-pointer"
                  >
                    View Ledger Breakdown →
                  </button>
                </div>
                <div className="h-3 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                  <div style={{ width: '60%' }} className="bg-emerald-500" title="0-30 Days (60%)" />
                  <div style={{ width: '25%' }} className="bg-sky-500" title="31-60 Days (25%)" />
                  <div style={{ width: '15%' }} className="bg-rose-500" title="90+ Days (15%)" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 0-30 Days (60%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> 31-60 Days (25%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 90+ Days (15%)
                  </span>
                </div>
              </div>
            </div>

            {/* Trade Payables & Section 43B(h) MSME Alert */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Trade Payables & MSME Sec 43B(h) Radar
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  Statutory 45-Day Vigilance
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Total Trade Payables:</span>
                  <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                    {formatLakhs(financialMIS.totalCreditors)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">34 vendor accounts</p>
                </div>

                <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200">
                  <span className="text-rose-800 font-medium">MSME &gt; 45 Days Risk:</span>
                  <p className="text-lg font-bold text-rose-900 mt-1 font-mono">
                    {formatLakhs(financialMIS.creditorsOver45Days)}
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5">Subject to income tax disallowance</p>
                </div>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Section 43B(h) Income Tax Compliance Note:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Any payment to registered MSME suppliers pending beyond 45 days (or 15 days without agreement) cannot be claimed as tax deduction until actual payment is made. An action item is currently assigned to Pooja Sharma to clear ₹2.80L before month-end.
                </p>
              </div>
            </div>

          </div>

          {/* Executive Broad Picture MIS Visualizer in Pie Charts */}
          <MisVisualBroadPicture
            pnl={activePnl}
            balanceSheet={activeBalanceSheet}
            debtorAgeing={activeDebtorAgeing}
            financialMIS={financialMIS}
            onNavigateSubTab={(sub) => setActiveSubTab(sub)}
          />

          {/* Quick FP&A Budget & Variance Highlight Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-2xl border border-amber-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      FP&A: Month-wise Budget & Variance Pulse
                    </h2>
                    <span className="text-[10px] uppercase font-mono font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                      {selectedBudgetMonth.toUpperCase()} Fiscal Analysis
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Comprehensive line-item tracking across Sales, Direct Costs, Factory Overheads & Opex with ±5% tolerance threshold.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('budget')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <span>Full Variance Analysis Sheet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Budgeted Line Items:</span>
                <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
                  {budgetItems.length} Master Codes
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">5 cost heads mapped to P&L</p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Threshold Breach Alerts:</span>
                <p className="text-lg font-bold text-amber-900 mt-1 font-mono">
                  {budgetAlertCount} Items &gt; ±5%
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">Flagged for CFO and management variance review</p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Data Ingestion:</span>
                <p className="text-base font-bold text-emerald-800 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Excel Import Ready
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Bulk uploads supported with instant row-by-row mapping</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: BROAD BALANCE SHEET */}
      {activeSubTab === 'balance-sheet' && (
        <BalanceSheetView
          balanceSheet={activeBalanceSheet}
          clientProfile={clientProfile}
        />
      )}

      {/* SUB-VIEW 3: PROFIT & LOSS ACCOUNT */}
      {activeSubTab === 'pnl' && (
        <PnlAccountView
          pnlStatement={activePnl}
          clientProfile={clientProfile}
        />
      )}

      {/* SUB-VIEW 4: DEBTOR AGEING */}
      {activeSubTab === 'debtor-ageing' && (
        <DebtorAgeingView
          debtorAgeing={activeDebtorAgeing}
          clientProfile={clientProfile}
        />
      )}

      {/* SUB-VIEW 5: FUND FLOW STATEMENT */}
      {activeSubTab === 'fund-flow' && (
        <FundFlowView
          fundFlow={activeFundFlow}
          clientProfile={clientProfile}
        />
      )}

      {/* SUB-VIEW 6: BUDGET & VARIANCE ANALYSIS */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <BudgetTab />
        </div>
      )}

      {/* SUB-VIEW 7: CONSOLIDATED ALL STATEMENTS */}
      {activeSubTab === 'all' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Comprehensive Financial MIS Dossier</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Full 5-Module Package (Statements & FP&A)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {clientProfile.companyName} • Balance Sheet, P&L Account, Debtor Ageing, Fund Flow & Budget/Variance
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
            >
              Print / Save as PDF
            </button>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Section I: Broad Balance Sheet</span>
              </h3>
              <BalanceSheetView
                balanceSheet={activeBalanceSheet}
                clientProfile={clientProfile}
              />
            </section>

            <section className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Section II: Executive Profit & Loss Account (P&L)</span>
              </h3>
              <PnlAccountView
                pnlStatement={activePnl}
                clientProfile={clientProfile}
              />
            </section>

            <section className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-700"></span>
                <span>Section III: Debtor Ageing & Receivables Schedule</span>
              </h3>
              <DebtorAgeingView
                debtorAgeing={activeDebtorAgeing}
                clientProfile={clientProfile}
              />
            </section>

            <section className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span>Section IV: Fund Flow Statement & Working Capital Analysis</span>
              </h3>
              <FundFlowView
                fundFlow={activeFundFlow}
                clientProfile={clientProfile}
              />
            </section>

            <section className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Section V: Month-wise Budget & Variance Analysis (FP&A)</span>
              </h3>
              <BudgetTab />
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
