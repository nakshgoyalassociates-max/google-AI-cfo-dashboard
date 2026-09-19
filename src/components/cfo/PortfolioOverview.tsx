import React, { useState, useMemo } from 'react';
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
  Layers,
  AlertOctagon,
  Check,
  Edit3,
  Filter,
  ReceiptText,
  AlertCircle,
  LayoutGrid,
  List,
  Search,
  X,
  Compass,
  Boxes,
  Activity,
  SlidersHorizontal
} from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';
import { formatINR, formatLakhs, formatCrores } from '../../utils/format';
import { CompanySquareWindow } from './CompanySquareWindow';
import { StreamSquareWindow, StreamCategoryItem } from './StreamSquareWindow';

export const PortfolioOverview: React.FC = () => {
  const { 
    allCompaniesOverview, 
    drillDownToCompany, 
    clientProfile,
    criticalDelayedItems,
    approveCfoComplianceReview,
    switchCompanyAndTab,
    allCompliancesMap,
    allActionsMap,
    allMISMap,
    allBudgetMap
  } = useApp();

  // Top Master View Mode:
  // 'both': Combined Master View (One Box Per Kind + One Box Per Company)
  // 'company_boxes': One Box Per Company Focus
  // 'stream_boxes': One Box Per Kind of Compliance, Action, MIS Focus
  const [masterView, setMasterView] = useState<'both' | 'stream_boxes' | 'company_boxes'>('both');

  // Stream Kind Filter: ALL | compliance | action | mis
  const [streamFilter, setStreamFilter] = useState<'ALL' | 'compliance' | 'action' | 'mis'>('ALL');

  // Company Triage Filter
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'critical' | 'attention' | 'smooth'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companyViewMode, setCompanyViewMode] = useState<'grid' | 'table'>('grid');

  // Critical Incidents Filter
  const [activeCritFilter, setActiveCritFilter] = useState<'ALL' | 'compliance' | 'action'>('ALL');

  // Aggregate stats across all companies
  const totalCompanies = allCompaniesOverview.length;
  const totalPendingCfoSignoffs = allCompaniesOverview.reduce((acc, c) => acc + (c.pendingCfoReviews || 0), 0);
  const totalCompliancesAll = allCompaniesOverview.reduce((acc, c) => acc + (c.totalCompliances || 0), 0);
  const totalCompletedAll = allCompaniesOverview.reduce((acc, c) => acc + (c.fullyCompletedCompliances || 0), 0);
  const avgComplianceRate = totalCompliancesAll > 0 ? Math.round((totalCompletedAll / totalCompliancesAll) * 100) : 0;
  const totalRevenue = allCompaniesOverview.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);
  const totalTaxQueued = allCompaniesOverview.reduce((acc, c) => acc + (c.taxPending || 0), 0);

  // Health counts for quick triage buttons
  const criticalCompaniesCount = allCompaniesOverview.filter(c => c.overallHealth === 'critical').length;
  const attentionCompaniesCount = allCompaniesOverview.filter(c => c.overallHealth === 'attention').length;
  const smoothCompaniesCount = allCompaniesOverview.filter(c => c.overallHealth === 'smooth').length;

  // Filtered companies
  const filteredCompanies = allCompaniesOverview.filter(c => {
    if (healthFilter === 'critical' && c.overallHealth !== 'critical') return false;
    if (healthFilter === 'attention' && c.overallHealth !== 'attention') return false;
    if (healthFilter === 'smooth' && c.overallHealth !== 'smooth') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.companyName.toLowerCase().includes(q);
      const matchGstin = c.gstin.toLowerCase().includes(q);
      const matchSector = c.sector.toLowerCase().includes(q);
      const matchEntity = c.entityType.toLowerCase().includes(q);
      if (!matchName && !matchGstin && !matchSector && !matchEntity) return false;
    }
    return true;
  });

  // ----------------------------------------------------------------------------------
  // 🌐 ONE BOX PER KIND OF COMPLIANCE, ACTION & MIS (FOR ALL CLIENTS TOGETHER)
  // Dynamic aggregation showing the actual picture of delay / non-compliance across all clients
  // ----------------------------------------------------------------------------------
  const portfolioStreams = useMemo<StreamCategoryItem[]>(() => {
    const streams: StreamCategoryItem[] = [
      // ==========================================
      // KIND OF COMPLIANCE (5 Streams)
      // ==========================================
      {
        id: 'stream-gst',
        kind: 'compliance',
        title: 'GST Filings & Returns',
        subtitle: 'GSTR-1, GSTR-3B, QRMP & 2B ITC Reco',
        iconType: 'gst',
        totalMonitored: 30, // 10 per company x 3
        delayedOrAtRiskCount: 2,
        status: 'attention',
        headlineStat: '1 CFO Review • 1 Overdue Reco',
        headlineLabel: 'Statutory GST Status',
        affectedClients: [
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'GSTR-3B August 2026 pending CFO review sign-off',
            severity: 'delayed',
            delayText: 'Due 20 Sep',
            amountText: 'Tax ₹3.84L'
          },
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'GSTR-1 Interstate transport e-way bill reco variance',
            severity: 'delayed',
            delayText: 'Pending Sign-off',
            amountText: '₹4.8 Cr Reco'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'All GSTR-1 & 3B filed on time without delay',
            severity: 'smooth',
            delayText: 'Filed',
            amountText: '0 Dues'
          }
        ],
        remediationNote: 'Execute CA Manish Goyal dual authorization on GSTR-3B draft before 20th Sep 18:00.',
        primaryTargetTab: 'compliances'
      },
      {
        id: 'stream-tds',
        kind: 'compliance',
        title: 'TDS / TCS Challans & Returns',
        subtitle: 'Form 26Q, 27Q, Sec 194C, 194J & Challan 281',
        iconType: 'tds',
        totalMonitored: 24,
        delayedOrAtRiskCount: 1,
        status: 'attention',
        headlineStat: '1 Transporter PAN Validation Pending',
        headlineLabel: 'TDS Withholding Status',
        affectedClients: [
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Fleet sub-contractor Sec 194C lower deduction PAN audit',
            severity: 'critical',
            delayText: 'Action Overdue',
            amountText: 'TDS ₹1.85L'
          },
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'Monthly Challan 281 deposited on 7th Sep',
            severity: 'smooth',
            delayText: 'Discharged',
            amountText: '₹2.10L Paid'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'Consultant TDS Section 194J deposited on time',
            severity: 'smooth',
            delayText: 'Discharged',
            amountText: '₹85K Paid'
          }
        ],
        remediationNote: 'Validate 3 fleet transporter PANs on IT portal to prevent 20% penal deduction under 206AA.',
        primaryTargetTab: 'compliances'
      },
      {
        id: 'stream-roc',
        kind: 'compliance',
        title: 'ROC / MCA Secretarial Compliance',
        subtitle: 'AOC-4, MGT-7, LLP Form 8, DIR-3 KYC',
        iconType: 'roc',
        totalMonitored: 18,
        delayedOrAtRiskCount: 1,
        status: 'attention',
        headlineStat: '1 Secretarial Draft in Review',
        headlineLabel: 'MCA Statutory Governance',
        affectedClients: [
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'LLP Form 8 Statement of Account & Solvency draft',
            severity: 'delayed',
            delayText: 'Due 28 Sep',
            amountText: 'FY 25-26 Solvency'
          },
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'DIR-3 KYC completed for all 3 Directors',
            severity: 'smooth',
            delayText: 'Compliant',
            amountText: 'Zero Penalty'
          },
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Annual General Meeting board resolution passed',
            severity: 'smooth',
            delayText: 'Compliant',
            amountText: 'AGM Minuted'
          }
        ],
        remediationNote: 'CS Alok Mehta and CA Manish Goyal dual signature required on LLP Form 8 before 28th Sep.',
        primaryTargetTab: 'compliances'
      },
      {
        id: 'stream-incometax',
        kind: 'compliance',
        title: 'Income Tax & Advance Tax',
        subtitle: 'Sec 44AB Tax Audit Form 3CD, Q2 Advance Tax, ITR-6',
        iconType: 'incometax',
        totalMonitored: 15,
        delayedOrAtRiskCount: 1,
        status: 'critical',
        headlineStat: 'Form 3CD Tax Audit Due in 12 Days',
        headlineLabel: 'Direct Tax Compliance',
        affectedClients: [
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'Form 3CD Tax Audit schedules final review with CA Singhal',
            severity: 'critical',
            delayText: 'Due 30 Sep',
            amountText: '44AB Audit'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'Sec 35(2AB) R&D patent incentive documentation',
            severity: 'delayed',
            delayText: 'Due 05 Oct',
            amountText: '100% Deduction'
          },
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Q2 Advance tax 2nd installment of ₹24L paid on 15 Sep',
            severity: 'smooth',
            delayText: 'Paid',
            amountText: 'Challan 280'
          }
        ],
        remediationNote: 'Schedule mandatory 20th Sep 3CD audit file sign-off session to avoid section 271B penalty.',
        primaryTargetTab: 'compliances'
      },
      {
        id: 'stream-payroll',
        kind: 'compliance',
        title: 'Payroll & Labor Laws',
        subtitle: 'PF ECR, ESIC Monthly Challan, Profession Tax (PT)',
        iconType: 'payroll',
        totalMonitored: 21,
        delayedOrAtRiskCount: 0,
        status: 'smooth',
        headlineStat: '100% Discharged Portfolio-Wide',
        headlineLabel: 'Labor & Social Security',
        affectedClients: [
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'August PF ECR (₹3.45L) & PT deposited on 14th Sep',
            severity: 'smooth',
            delayText: 'Cleared',
            amountText: '100% on time'
          },
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Warehouse staff ESIC & driver PF challans cleared',
            severity: 'smooth',
            delayText: 'Cleared',
            amountText: 'TRRN Validated'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'Lab biochemist PF & medical coverage dues filed',
            severity: 'smooth',
            delayText: 'Cleared',
            amountText: '0 Dues'
          }
        ],
        remediationNote: 'All September payroll cutoff master sheets locked for next month end.',
        primaryTargetTab: 'compliances'
      },

      // ==========================================
      // KIND OF ACTION (4 Streams)
      // ==========================================
      {
        id: 'stream-audit-act',
        kind: 'action',
        title: 'Statutory Audit & Tax Ops Actions',
        subtitle: 'TDS 26Q schedules, GSTR-2B reco, audit confirmations',
        iconType: 'audit_act',
        totalMonitored: 8,
        delayedOrAtRiskCount: 1,
        status: 'critical',
        headlineStat: '1 Action Breached SLA Deadline',
        headlineLabel: 'Statutory Action Deliverables',
        affectedClients: [
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Fleet sub-contractor TDS lower deduction audit past SLA',
            severity: 'critical',
            delayText: 'SLA Overdue',
            amountText: 'Rahul Verma'
          },
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'Customer ledger balance confirmations (> ₹5 Lakhs)',
            severity: 'delayed',
            delayText: 'Due 22 Sep',
            amountText: '6/10 Replied'
          }
        ],
        remediationNote: 'Direct Tax team to expedite transporter verification before challan upload deadline.',
        primaryTargetTab: 'actions'
      },
      {
        id: 'stream-banking-act',
        kind: 'action',
        title: 'Banking & Working Capital CC Actions',
        subtitle: 'Drawing power certificates, stock audit statements, CC limits',
        iconType: 'banking_act',
        totalMonitored: 4,
        delayedOrAtRiskCount: 1,
        status: 'attention',
        headlineStat: '1 Bank DP Submission Due in 2 Days',
        headlineLabel: 'Treasury & Bank Facilities',
        affectedClients: [
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Axis Bank CC Stock & Book Debts Drawing Power Statement',
            severity: 'delayed',
            delayText: 'Due 20 Sep',
            amountText: 'Vikram Singhania'
          }
        ],
        remediationNote: 'Issue Virtual CFO signed Drawing Power calculation certificate to Axis Bank SME desk.',
        primaryTargetTab: 'actions'
      },
      {
        id: 'stream-vendor-act',
        kind: 'action',
        title: 'Vendor Dues & MSME Actions',
        subtitle: 'MSME Section 43B(h) 45-day payment batches & reconciliation',
        iconType: 'vendor_act',
        totalMonitored: 5,
        delayedOrAtRiskCount: 1,
        status: 'critical',
        headlineStat: '2 Micro Invoices Nearing 45-Day Limit',
        headlineLabel: 'AP & Vendor Compliance',
        affectedClients: [
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'Verify 2 MSME vendor bills (FabTech & CloudPrint) nearing limit',
            severity: 'critical',
            delayText: 'Due 19 Sep',
            amountText: '₹2.80L Exposure'
          }
        ],
        remediationNote: 'Authorize HDFC corporate netbanking payment batch #PAY-MSME-88 immediately.',
        primaryTargetTab: 'actions'
      },
      {
        id: 'stream-control-act',
        kind: 'action',
        title: 'Internal Audit & Governance Actions',
        subtitle: 'Physical FAR tagging, travel vouchers spot audit, SOP controls',
        iconType: 'control_act',
        totalMonitored: 6,
        delayedOrAtRiskCount: 1,
        status: 'attention',
        headlineStat: '1 Asset Verification Under CFO Review',
        headlineLabel: 'Internal Controls & SOP',
        affectedClients: [
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'FAR barcode tagging for 45 newly procured Apple MacBooks',
            severity: 'delayed',
            delayText: 'Under Review',
            amountText: '44 Tagged'
          },
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'E-way bill vs GSTR-1 interstate freight audit completed',
            severity: 'smooth',
            delayText: 'Closed',
            amountText: '0 Variances'
          }
        ],
        remediationNote: 'Review depreciation rate Schedule II life span with controller before balance sheet sign-off.',
        primaryTargetTab: 'actions'
      },

      // ==========================================
      // KIND OF FINANCIAL MIS (4 Streams)
      // ==========================================
      {
        id: 'stream-runway-mis',
        kind: 'mis',
        title: 'Cash Runway & Burn Surveillance',
        subtitle: 'Cash runway duration, monthly burn escalation, liquidity watch',
        iconType: 'runway_mis',
        totalMonitored: 3,
        delayedOrAtRiskCount: 1,
        status: 'attention',
        headlineStat: '1 Client with Runway < 7 Months',
        headlineLabel: 'Portfolio Liquidity Watch',
        affectedClients: [
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Runway at 6.9 months (Monthly burn rate ₹31.0L)',
            severity: 'delayed',
            delayText: '6.9 Mo Runway',
            amountText: 'Cash ₹2.15 Cr'
          },
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'Runway at 7.7 months (Monthly burn rate ₹28.5L)',
            severity: 'smooth',
            delayText: '7.7 Mo Runway',
            amountText: 'Cash ₹1.42 Cr'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'Runway comfortable at 8.2 months (Monthly burn ₹14.2L)',
            severity: 'smooth',
            delayText: '8.2 Mo Runway',
            amountText: 'Cash ₹95L'
          }
        ],
        remediationNote: 'Monitor Apex freight fleet receivable recoveries to extend runway beyond 9 months.',
        primaryTargetTab: 'mis'
      },
      {
        id: 'stream-budget-mis',
        kind: 'mis',
        title: 'Budget Variance & Cost Overruns',
        subtitle: 'Expense line items exceeding sanctioned budget by > 8%',
        iconType: 'budget_mis',
        totalMonitored: 36, // across all budget items
        delayedOrAtRiskCount: 2,
        status: 'critical',
        headlineStat: '2 Companies Exceeding Budget Threshold',
        headlineLabel: 'Cost Deviation Surveillance',
        affectedClients: [
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'Direct Cloud Hosting & AWS infrastructure overrun (+18.4%)',
            severity: 'critical',
            delayText: '+18.4% Overrun',
            amountText: 'Dev Variance'
          },
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Fleet Fuel & Highway Maintenance overrun (+12.2%)',
            severity: 'critical',
            delayText: '+12.2% Overrun',
            amountText: 'Op Variance'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'Operating costs aligned with plan (Variance < 3%)',
            severity: 'smooth',
            delayText: 'On Budget',
            amountText: 'Stable'
          }
        ],
        remediationNote: 'Table departmental opex variance memo with CEO & Founders in upcoming monthly MIS deck.',
        primaryTargetTab: 'mis'
      },
      {
        id: 'stream-msme-mis',
        kind: 'mis',
        title: 'MSME Section 43B(h) Payables > 45d',
        subtitle: 'Unpaid dues to registered Micro & Small Enterprises risking tax disallowance',
        iconType: 'msme_mis',
        totalMonitored: 3,
        delayedOrAtRiskCount: 2,
        status: 'critical',
        headlineStat: '₹7.30 Lakhs Tax Disallowance Exposure',
        headlineLabel: 'Section 43B(h) Surveillance',
        affectedClients: [
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'Transporter payables > 45 days requiring urgent clearance',
            severity: 'critical',
            delayText: 'Exposure Risk',
            amountText: '₹4.50L Overdue'
          },
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'FabTech & CloudPrint balances due within 4 days',
            severity: 'critical',
            delayText: '4 Days Left',
            amountText: '₹2.80L Overdue'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'Zero MSME payables exceeding 30-day revolving credit',
            severity: 'smooth',
            delayText: 'Zero Risk',
            amountText: 'Compliant'
          }
        ],
        remediationNote: 'Release payments before month-end statutory cutoff to preserve 100% tax deductibility.',
        primaryTargetTab: 'mis'
      },
      {
        id: 'stream-debtor-mis',
        kind: 'mis',
        title: 'Debtors DSO & Aging Overdue > 90d',
        subtitle: 'Receivables collection cycle, Days Sales Outstanding, aged debt',
        iconType: 'debtor_mis',
        totalMonitored: 3,
        delayedOrAtRiskCount: 1,
        status: 'attention',
        headlineStat: 'Portfolio DSO at 48 Days (₹24.3L > 90d)',
        headlineLabel: 'Working Capital Inflow',
        affectedClients: [
          {
            companyId: 'client-102',
            companyName: 'Apex Global Logistics',
            shortIssue: 'DSO at 51 days with ₹14.5L tied up in container freight debts',
            severity: 'delayed',
            delayText: 'DSO 51d',
            amountText: '₹14.5L >90d'
          },
          {
            companyId: 'client-101',
            companyName: 'Nexora Innovations Tech',
            shortIssue: 'DSO at 44 days with ₹9.8L tied in enterprise client renewals',
            severity: 'delayed',
            delayText: 'DSO 44d',
            amountText: '₹9.8L >90d'
          },
          {
            companyId: 'client-103',
            companyName: 'Zenith HealthTech',
            shortIssue: 'Healthy hospital billing cycle (DSO 31 days, zero >90d)',
            severity: 'smooth',
            delayText: 'DSO 31d',
            amountText: 'Fast Turn'
          }
        ],
        remediationNote: 'Issue formal legal balance reconciliation letters to clients with balances > 60 days.',
        primaryTargetTab: 'mis'
      }
    ];

    return streams;
  }, []);

  // Filtered streams based on streamFilter
  const filteredStreams = useMemo(() => {
    if (streamFilter === 'ALL') return portfolioStreams;
    return portfolioStreams.filter(s => s.kind === streamFilter);
  }, [portfolioStreams, streamFilter]);

  // Critical stream count
  const criticalStreamsCount = portfolioStreams.filter(s => s.status === 'critical').length;
  const delayedStreamsCount = portfolioStreams.filter(s => s.status === 'attention').length;

  return (
    <div className="space-y-6">
      
      {/* 🌟 Portfolio Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Virtual CFO Master Control & Surveillance
              </span>
              <span className="text-xs text-slate-400">
                {clientProfile.cfoFirm}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Cross-Entity Governance: Companies & Streams Surveillance
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Consolidated command for Virtual CFO. Access one square box per client company highlighting all details and critical parts, alongside square boxes per statutory compliance, action, and financial MIS stream to pinpoint delays across all clients simultaneously.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs text-slate-400">Virtual CFO</span>
              <p className="text-sm font-bold text-white">{clientProfile.cfoName}</p>
              <span className="text-[10px] text-emerald-400 font-medium">Practice Master Authority</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              MG
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Aggregate Macro KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Client Entities</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{totalCompanies}</span>
            <span className="text-[11px] text-slate-500">Managed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Avg Compliance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{avgComplianceRate}%</span>
            <span className="text-[11px] text-slate-500">({totalCompletedAll}/{totalCompliancesAll} filed)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Pending CFO Sign-Off</span>
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-indigo-600">{totalPendingCfoSignoffs}</span>
            <span className="text-[11px] text-slate-500">Awaiting Sign-off</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Portfolio Revenue</span>
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{formatCrores(totalRevenue)}</span>
            <span className="text-[11px] text-slate-500">/ month</span>
          </div>
        </div>

      </div>

      {/* 🧭 MASTER SURVEILLANCE VIEW SWITCHER */}
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            Surveillance Perspective:
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Toggle between Company-Centric boxes and Cross-Client Stream boxes
          </span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setMasterView('both')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              masterView === 'both'
                ? 'bg-white text-indigo-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Show both Stream-Wise and Company-Wise square windows"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Combined Dual View</span>
          </button>

          <button
            onClick={() => setMasterView('stream_boxes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              masterView === 'stream_boxes'
                ? 'bg-white text-indigo-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="One square box per kind of compliance, action, and MIS across all clients"
          >
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            <span>By Kind / Stream (All Clients)</span>
          </button>

          <button
            onClick={() => setMasterView('company_boxes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              masterView === 'company_boxes'
                ? 'bg-white text-indigo-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="One square box per company having all details and critical parts"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>By Company (One Box / Client)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌐 SECTION A: ONE BOX PER KIND OF COMPLIANCE, ACTION & MIS (ALL CLIENTS)  */}
      {/* ========================================================================= */}
      {(masterView === 'both' || masterView === 'stream_boxes') && (
        <div className="space-y-3.5">
          {/* Section Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Stream Surveillance
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {portfolioStreams.length} Core Statutory & Management Disciplines Across All {totalCompanies} Clients
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                All Clients Combined: Delay & Non-Compliance Picture by Kind
              </h2>
            </div>

            {/* Stream Kind Filter Chips */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setStreamFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  streamFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Kinds ({portfolioStreams.length})
              </button>
              <button
                onClick={() => setStreamFilter('compliance')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  streamFilter === 'compliance'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Compliances (5)
              </button>
              <button
                onClick={() => setStreamFilter('action')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  streamFilter === 'action'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Actions (4)
              </button>
              <button
                onClick={() => setStreamFilter('mis')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  streamFilter === 'mis'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                MIS & Budgets (4)
              </button>
            </div>
          </div>

          {/* Grid of Square Boxes: ONE BOX PER KIND */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredStreams.map(stream => (
              <StreamSquareWindow key={stream.id} stream={stream} />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏢 SECTION B: ONE BOX PER COMPANY (ALL DETAILS MAINLY CRITICAL PART)      */}
      {/* ========================================================================= */}
      {(masterView === 'both' || masterView === 'company_boxes') && (
        <div className="space-y-3.5">
          {/* Header & Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <LayoutGrid className="w-3 h-3" />
                  Entity Windows
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {allCompaniesOverview.length} Companies Under CFO Retainer
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Client Companies: One Box Per Company (Full Details & Critical Spotlight)
              </h2>
            </div>

            {/* Quick Triage Filters & Search */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-6 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px]">
                <button
                  onClick={() => setCompanyViewMode('grid')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    companyViewMode === 'grid' 
                      ? 'bg-white text-indigo-900 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View as Square Windows"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>Square</span>
                </button>
                <button
                  onClick={() => setCompanyViewMode('table')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    companyViewMode === 'table' 
                      ? 'bg-white text-indigo-900 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View as Comparison Matrix Table"
                >
                  <List className="w-3 h-3" />
                  <span>Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* Time-Saving Triage Filter Chips Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setHealthFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                healthFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>All Entities</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${healthFilter === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                {allCompaniesOverview.length}
              </span>
            </button>

            <button
              onClick={() => setHealthFilter('critical')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                healthFilter === 'critical'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-50'
              }`}
              title="Show only companies with critical issues or major deviations"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Critical Alerts</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${healthFilter === 'critical' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800 font-bold'}`}>
                {criticalCompaniesCount}
              </span>
            </button>

            <button
              onClick={() => setHealthFilter('attention')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                healthFilter === 'attention'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
              title="Show companies awaiting CFO review sign-offs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Review Sign-Off</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${healthFilter === 'attention' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                {attentionCompaniesCount}
              </span>
            </button>

            <button
              onClick={() => setHealthFilter('smooth')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                healthFilter === 'smooth'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'
              }`}
              title="Show companies operating smoothly on schedule"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Smooth</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${healthFilter === 'smooth' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800 font-bold'}`}>
                {smoothCompaniesCount}
              </span>
            </button>

            {healthFilter !== 'ALL' && (
              <button
                onClick={() => setHealthFilter('ALL')}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-1 cursor-pointer font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Display: ONE BOX PER COMPANY */}
          {companyViewMode === 'grid' ? (
            filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {filteredCompanies.map((company) => (
                  <CompanySquareWindow key={company.companyId} company={company} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">No companies found</p>
                <p className="text-xs text-slate-500">
                  No company matched the current filter ({healthFilter}) or search query &quot;{searchQuery}&quot;.
                </p>
                <button
                  onClick={() => {
                    setHealthFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-indigo-600 transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )
          ) : (
            /* MASTER CLIENT OVERVIEW TABLE (ALL COMPANY NAMES & BROAD STATUS) */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-700" />
                    Comparative Entity Status Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredCompanies.length} of {allCompaniesOverview.length} managed client companies
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Company Name & Legal Entity</th>
                      <th className="py-3.5 px-4 min-w-[170px]">Statutory Compliance</th>
                      <th className="py-3.5 px-4 text-center">CFO Sign-Off Queue</th>
                      <th className="py-3.5 px-4 text-center">Action Status</th>
                      <th className="py-3.5 px-4">Financial MIS & Variance</th>
                      <th className="py-3.5 px-4">Next Filing Due</th>
                      <th className="py-3.5 px-4 text-right">Active Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCompanies.map((company) => {
                      return (
                        <tr 
                          key={company.companyId}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Company info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl font-bold text-xs text-white flex items-center justify-center shrink-0 shadow-2xs ${
                                company.overallHealth === 'critical' ? 'bg-rose-600' : company.overallHealth === 'attention' ? 'bg-amber-600' : 'bg-slate-900'
                              }`}>
                                {(company.companyName || 'CO').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs">
                                    {company.companyName}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600">
                                    {company.entityType.includes('LLP') ? 'LLP' : 'Pvt Ltd'}
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
                          <td className="py-4 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800">{company.compliancePercentage}% Compliant</span>
                                <span className="text-slate-500">
                                  {company.fullyCompletedCompliances}/{company.totalCompliances} Closed
                                </span>
                              </div>
                              <ProgressBar 
                                percentage={company.compliancePercentage}
                                height="h-2"
                                color={company.compliancePercentage >= 80 ? 'bg-emerald-600' : 'bg-indigo-600'}
                              />
                            </div>
                          </td>

                          {/* CFO Sign-off queue */}
                          <td className="py-4 px-4 text-center">
                            {company.pendingCfoReviews > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3" />
                                {company.pendingCfoReviews} Review Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                All Clear
                              </span>
                            )}
                          </td>

                          {/* Action pendencies */}
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-semibold text-slate-900">
                                {company.pendingActions} Open
                              </span>
                              {company.overdueActions > 0 ? (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 mt-0.5">
                                  {company.overdueActions} Overdue
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                  On Schedule
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Financial MIS */}
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-semibold text-slate-900">
                                {formatLakhs(company.monthlyRevenue, 1)} / mo
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Runway: <span className="font-medium text-slate-700">{company.cashRunwayMonths} Mo</span>
                              </div>
                              <div className="mt-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                  company.misVarianceStatus === 'critical' 
                                    ? 'bg-rose-50 text-rose-800 border-rose-200' 
                                    : company.misVarianceStatus === 'moderate' 
                                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                  {company.misStatusSummary}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Next deadline */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium text-xs">{company.nextUpcomingDeadline}</span>
                            </div>
                          </td>

                          {/* Active Amendment & Control Shortcuts */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => switchCompanyAndTab(company.companyId, 'compliances')}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
                                title="Amend compliance filings and subtasks"
                              >
                                Compliance
                              </button>
                              <button
                                onClick={() => switchCompanyAndTab(company.companyId, 'actions')}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
                                title="Amend action items and deadlines"
                              >
                                Actions
                              </button>
                              <button
                                onClick={() => switchCompanyAndTab(company.companyId, 'mis')}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
                                title="Amend financial figures and commentary"
                              >
                                MIS
                              </button>
                              <button
                                onClick={() => drillDownToCompany(company.companyId)}
                                className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-900 hover:bg-indigo-600 text-white transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Open full company workspace"
                              >
                                <span>Drill Down</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
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
      )}

      {/* 🚨 SECTION C: CRITICAL & DELAYED INCIDENTS QUEUE (SURVEILLANCE ACTION DESK) */}
      <div className="bg-rose-50/40 rounded-xl border border-rose-300 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-rose-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <h2 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
              Critical & Delayed Incidents Desk
            </h2>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
              {criticalDelayedItems.length} Active
            </span>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveCritFilter('ALL')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeCritFilter === 'ALL'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              All ({criticalDelayedItems.length})
            </button>
            <button
              onClick={() => setActiveCritFilter('compliance')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeCritFilter === 'compliance'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Statutory ({criticalDelayedItems.filter(i => i.type === 'compliance').length})
            </button>
            <button
              onClick={() => setActiveCritFilter('action')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeCritFilter === 'action'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Actions ({criticalDelayedItems.filter(i => i.type === 'action').length})
            </button>
          </div>
        </div>

        {/* Highlighted Critical Cards Grid - Compact Square Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {criticalDelayedItems.filter(item => activeCritFilter === 'ALL' || item.type === activeCritFilter).map((item) => {
            const isCompliance = item.type === 'compliance';
            const isAction = item.type === 'action';

            return (
              <div
                key={`${item.companyId}-${item.id}`}
                className="bg-white rounded-lg border border-rose-200 shadow-2xs hover:border-rose-400 transition-all aspect-square flex flex-col justify-between p-2 overflow-hidden group select-none"
              >
                {/* Micro Top Strip */}
                <div className="flex items-center justify-between gap-1 shrink-0">
                  <span className="text-[9px] font-bold text-slate-700 truncate max-w-[85px]" title={item.companyName}>
                    {item.companyName.split(' ')[0]}
                  </span>
                  <span className={`px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${
                    item.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                {/* Micro Core Title & Issue */}
                <div className="flex-1 flex flex-col justify-center py-1 min-h-0">
                  <h4 className="font-bold text-slate-900 text-[10px] leading-tight line-clamp-2" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1 text-[8px] font-semibold text-rose-700 truncate">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{item.reason}</span>
                  </div>
                </div>

                {/* Micro Action Buttons */}
                <div className="pt-1 border-t border-slate-100 flex items-center gap-1 shrink-0">
                  {isCompliance && item.cfoActionRequired && (
                    <button
                      onClick={() => approveCfoComplianceReview(item.companyId, item.id)}
                      className="px-1 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold transition-colors flex items-center gap-0.5 cursor-pointer flex-1 justify-center shadow-2xs"
                      title="Approve CFO Review Sign-off"
                    >
                      <Check className="w-2.5 h-2.5" />
                      <span>Sign</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (isCompliance) {
                        switchCompanyAndTab(item.companyId, 'compliances');
                      } else {
                        switchCompanyAndTab(item.companyId, 'actions');
                      }
                    }}
                    className="px-1 py-0.5 rounded bg-slate-900 hover:bg-indigo-600 text-white text-[9px] font-bold transition-colors flex items-center gap-0.5 cursor-pointer flex-1 justify-center shadow-2xs"
                    title="Control & Amend this item"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Go</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
