import { ActionItem, ClientProfile, FinancialMIS, UserAccount } from '../types';

export const CLIENT_COMPANIES: ClientProfile[] = [
  {
    id: 'client-101',
    companyName: 'Nexora Innovations Tech Pvt Ltd',
    legalEntity: 'Private Limited Company (India)',
    gstin: '27AAACN4921E1ZQ',
    pan: 'AAACN4921E',
    cin: 'U72900MH2021PTC358912',
    financialYear: 'FY 2026-27 (AY 2027-28)',
    cfoName: 'CA Manish Goyal, FCA, DISA',
    cfoFirm: 'Goyal & Associates, Virtual CFO Practice',
    sector: 'Information Technology & SaaS'
  },
  {
    id: 'client-102',
    companyName: 'Apex Global Logistics India Pvt Ltd',
    legalEntity: 'Private Limited Company (India)',
    gstin: '27AABCA3310F1ZT',
    pan: 'AABCA3310F',
    cin: 'U63090MH2019PTC319401',
    financialYear: 'FY 2026-27 (AY 2027-28)',
    cfoName: 'CA Manish Goyal, FCA, DISA',
    cfoFirm: 'Goyal & Associates, Virtual CFO Practice',
    sector: 'Interstate Logistics & Supply Chain'
  },
  {
    id: 'client-103',
    companyName: 'Zenith HealthTech Solutions LLP',
    legalEntity: 'Limited Liability Partnership (LLP)',
    gstin: '27AAHFZ9802P1Z5',
    pan: 'AAHFZ9802P',
    cin: 'AAA-9920',
    financialYear: 'FY 2026-27 (AY 2027-28)',
    cfoName: 'CA Manish Goyal, FCA, DISA',
    cfoFirm: 'Goyal & Associates, Virtual CFO Practice',
    sector: 'HealthTech & Bio-Diagnostics'
  }
];

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-cfo',
    name: 'CA Manish Goyal',
    email: 'cfo@goyalassociates.com',
    role: 'cfo',
    roleTitle: 'Virtual CFO & Practice Partner',
    companyId: 'all',
    companyName: 'Goyal & Associates (Virtual CFO Practice)',
    avatar: 'MG'
  },
  {
    id: 'user-client',
    name: 'Anand Verma',
    email: 'anand@nexora.io',
    role: 'client',
    roleTitle: 'Managing Director & Promoter',
    companyId: 'client-101',
    companyName: 'Nexora Innovations Tech Pvt Ltd',
    avatar: 'AV'
  },
  {
    id: 'user-client-team',
    name: 'Sneha Roy',
    email: 'accounts@nexora.io',
    role: 'client_team',
    roleTitle: 'Accounts Executive & Finance Operations',
    companyId: 'client-101',
    companyName: 'Nexora Innovations Tech Pvt Ltd',
    avatar: 'SR'
  }
];

export const INITIAL_CLIENT_PROFILE: ClientProfile = CLIENT_COMPANIES[0];

export const INITIAL_FINANCIAL_MIS: FinancialMIS = {
  period: 'August 2026 (Month-End MIS)',
  monthlyRevenue: 4850000, // ₹48.5 Lakhs
  revenueGrowthMoM: 12.4, // +12.4%
  grossMarginPercent: 68.2, // 68.2%
  ebitda: 1140000, // ₹11.4 Lakhs
  ebitdaMarginPercent: 23.5,
  netProfit: 865000, // ₹8.65 Lakhs
  cashAndBankBalance: 14250000, // ₹1.425 Crores
  monthlyBurnRate: 1850000, // ₹18.5 Lakhs
  cashRunwayMonths: 7.7, // 7.7 Months
  totalDebtors: 6240000, // ₹62.4 Lakhs
  debtorsOver90Days: 980000, // ₹9.8 Lakhs (Requires follow-up)
  debtorDaysDSO: 44, // 44 Days
  totalCreditors: 3410000, // ₹34.1 Lakhs
  creditorsOver45Days: 280000, // ₹2.8 Lakhs (MSME Section 43B(h) Risk alert!)
  workingCapital: 10840000, // ₹1.08 Cr
  quickRatio: 2.45,
  cfoExecutiveSummary: 'Operating margins improved by 210 bps this month driven by lower cloud infrastructure unit costs. Advance tax 2nd installment of ₹24 Lakhs was successfully discharged on 15th Sep. Priority action is recovering ₹9.8L overdue receivables from Enterprise Tier clients and clearing 2 MSME vendor bills to prevent Section 43B(h) tax disallowances.',
  cfoKeyAlerts: [
    'MSME 45-day threshold: 2 vendor balances totaling ₹2.80L are due in 4 days.',
    'GSTR-3B tax payment of ₹3.84L due on 20th Sep is pre-approved and queued.',
    'Form 3CD Tax Audit schedules final review scheduled with CA Singhal & Co on 20th Sep.'
  ]
};

export const COMPANY_FINANCIAL_MIS: Record<string, FinancialMIS> = {
  'client-101': INITIAL_FINANCIAL_MIS,
  'client-102': {
    period: 'August 2026 (Month-End MIS)',
    monthlyRevenue: 8200000, // ₹82.0 Lakhs
    revenueGrowthMoM: 8.6,
    grossMarginPercent: 44.5,
    ebitda: 1480000, // ₹14.8 Lakhs
    ebitdaMarginPercent: 18.0,
    netProfit: 980000, // ₹9.80 Lakhs
    cashAndBankBalance: 21500000, // ₹2.15 Crores
    monthlyBurnRate: 3100000, // ₹31.0 Lakhs
    cashRunwayMonths: 6.9,
    totalDebtors: 11200000, // ₹1.12 Cr
    debtorsOver90Days: 1450000,
    debtorDaysDSO: 51,
    totalCreditors: 6800000,
    creditorsOver45Days: 450000,
    workingCapital: 14700000,
    quickRatio: 1.82,
    cfoExecutiveSummary: 'Freight volume up 14% on Western corridor. GSTR-1 and E-way bill reconciliation completed without variances. Working capital utilization at 68% of sanction limit with Axis Bank. Focus area: recovery from 3 container freight stations.',
    cfoKeyAlerts: [
      'TDS payment under Sec 194C (Transporters) of ₹1.85L cleared on 7th Sep.',
      'Quarterly stock and receivables statement submission due for Axis Bank CC review.',
      'Vehicle tax and interstate permit renewals scheduled for 18 fleet units.'
    ]
  },
  'client-103': {
    period: 'August 2026 (Month-End MIS)',
    monthlyRevenue: 2940000, // ₹29.4 Lakhs
    revenueGrowthMoM: 18.2,
    grossMarginPercent: 74.0,
    ebitda: 820000, // ₹8.2 Lakhs
    ebitdaMarginPercent: 27.9,
    netProfit: 670000, // ₹6.70 Lakhs
    cashAndBankBalance: 9500000, // ₹95.0 Lakhs
    monthlyBurnRate: 1120000, // ₹11.2 Lakhs
    cashRunwayMonths: 8.5,
    totalDebtors: 3800000,
    debtorsOver90Days: 420000,
    debtorDaysDSO: 38,
    totalCreditors: 1950000,
    creditorsOver45Days: 110000,
    workingCapital: 7550000,
    quickRatio: 2.92,
    cfoExecutiveSummary: 'Diagnostic sensor kit sales gross margin maintained at 74%. LLP Form 11 annual return filed with MCA. Zero debt company with strong cash buffer of 8.5 months runway.',
    cfoKeyAlerts: [
      'Form 8 (Statement of Account & Solvency) documentation drafting in progress.',
      'Advance tax 2nd installment of ₹8.5L paid on 15th Sep.',
      'R&D tax incentive certificate application under Section 35(2AB) in preparation.'
    ]
  }
};

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-1',
    title: 'HDFC & ICICI Current Account Bank Reconciliation (BRS)',
    description: 'Reconcile all uncredited cheques, UPI gateway batch settlements, and direct debit charges for August 2026 books close.',
    category: 'Banking & Treasury',
    assignedTo: 'Sneha Roy',
    assignedRole: 'Accounts Executive',
    priority: 'High',
    status: 'In Progress',
    fixedDeadline: '2026-09-18 17:00',
    estimatedHours: 4,
    timeSpentHours: 2.5,
    createdAt: '2026-09-15',
    remarks: 'ICICI Razorpay settlement ledger reconciled. HDFC auto-debit charges for AWS pending invoice matching.',
    subtasks: [
      { id: 'act-1-s1', subtaskNumber: 1, title: 'Download bank statements & Razorpay gateway settlement logs', status: 'completed', completedAt: '2026-09-15 14:00', notes: 'HDFC Current A/c #502000 and ICICI A/c #0045 statements parsed.' },
      { id: 'act-1-s2', subtaskNumber: 2, title: 'Match auto-debit charges against AWS, Google & vendor bills', status: 'completed', completedAt: '2026-09-16 11:30', notes: 'AWS bill of ₹1.42L matched. Google Workspace ₹28k matched.' },
      { id: 'act-1-s3', subtaskNumber: 3, title: 'Post BRS reconciliation adjustment journal entries in ERP', status: 'pending', notes: 'Pending uncredited customer cheque clearance of ₹3.20L.' }
    ]
  },
  {
    id: 'act-2',
    title: 'MSME Vendor > 45 Days Payment Clearing under Sec 43B(h)',
    description: 'Verify 2 MSME vendor bills (FabTech Solutions ₹1.65L and CloudPrint India ₹1.15L) nearing 45-day credit limit to avoid tax disallowance.',
    category: 'Accounts Payable',
    assignedTo: 'Pooja Sharma',
    assignedRole: 'Sr. Accountant',
    priority: 'Urgent',
    status: 'Pending',
    fixedDeadline: '2026-09-19 14:00',
    estimatedHours: 2,
    timeSpentHours: 0.5,
    createdAt: '2026-09-14',
    remarks: 'Bank payout batch draft created in HDFC Corporate Net Banking awaiting CFO dual approval.',
    subtasks: [
      { id: 'act-2-s1', subtaskNumber: 1, title: 'Extract aging report & verify UDYAM registration certificate', status: 'completed', completedAt: '2026-09-14 16:00', notes: 'FabTech UDYAM-MH-02-00481 verified under Micro category.' },
      { id: 'act-2-s2', subtaskNumber: 2, title: 'Create net banking RTGS/NEFT payment batch queue', status: 'pending', notes: 'Draft batch #PAY-MSME-88 queued in HDFC netbanking.' },
      { id: 'act-2-s3', subtaskNumber: 3, title: 'Virtual CFO dual authorization & payment advice transmission', status: 'pending', notes: 'Sign-off pending by CA Manish Goyal.' }
    ]
  },
  {
    id: 'act-3',
    title: 'Customer Ledger Balance Confirmations (> ₹5 Lakhs)',
    description: 'Dispatch external balance confirmation letters to top 10 clients for Q2 statutory audit file readiness.',
    category: 'Accounts Receivable',
    assignedTo: 'Sneha Roy',
    assignedRole: 'Accounts Executive',
    priority: 'Medium',
    status: 'In Progress',
    fixedDeadline: '2026-09-22 18:00',
    estimatedHours: 6,
    timeSpentHours: 3,
    createdAt: '2026-09-13',
    remarks: '6 out of 10 clients have confirmed by email. Follow-up reminder sent to remaining 4 clients.',
    subtasks: [
      { id: 'act-3-s1', subtaskNumber: 1, title: 'Generate customer ledgers & ledger confirmation templates', status: 'completed', completedAt: '2026-09-13 17:00', notes: 'Statements generated for top 10 enterprise clients.' },
      { id: 'act-3-s2', subtaskNumber: 2, title: 'Dispatch confirmation emails with digital signature', status: 'completed', completedAt: '2026-09-14 12:00', notes: 'Sent to client finance heads. 6 confirmed, 4 reminders dispatched.' },
      { id: 'act-3-s3', subtaskNumber: 3, title: 'Compile reconciled confirmation pack for Statutory Auditors', status: 'pending', notes: 'Target completion post 4 pending replies.' }
    ]
  },
  {
    id: 'act-4',
    title: 'Physical Fixed Assets Tagging & Verification (Bengaluru Office)',
    description: 'Tag 45 newly procured Apple M3 MacBooks and conference room equipment with barcode stickers and update Fixed Asset Register (FAR).',
    category: 'General Ledger & Fixed Assets',
    assignedTo: 'Vikram Singhania',
    assignedRole: 'Compliance Lead',
    priority: 'Medium',
    status: 'Under Review',
    fixedDeadline: '2026-09-20 16:00',
    estimatedHours: 8,
    timeSpentHours: 7.5,
    createdAt: '2026-09-10',
    remarks: 'Physical count completed. 44 assets tagged, 1 laptop replacement pending from Dell vendor.',
    subtasks: [
      { id: 'act-4-s1', subtaskNumber: 1, title: 'Physical verification and barcode label affixing', status: 'completed', completedAt: '2026-09-12 18:00', notes: '44 hardware devices physically verified in office.' },
      { id: 'act-4-s2', subtaskNumber: 2, title: 'Cross-check serial numbers with vendor tax invoices', status: 'completed', completedAt: '2026-09-14 15:00', notes: 'Invoices matched with PO-2026-89.' },
      { id: 'act-4-s3', subtaskNumber: 3, title: 'Update Fixed Asset Register (FAR) & compute depreciation rates', status: 'pending', notes: 'Under CFO review for Companies Act Schedule II life span.' }
    ]
  },
  {
    id: 'act-5',
    title: 'Monthly Payroll Variance & Overtime Audit (Aug 2026)',
    description: 'Analyze MoM variance in gross salary vs net disbursal, verifying unpaid leaves, gratuity provision, and employee additions/exits.',
    category: 'Payroll & HR Ops',
    assignedTo: 'Amit Patel',
    assignedRole: 'Payroll Specialist',
    priority: 'High',
    status: 'Completed',
    fixedDeadline: '2026-09-07 18:00',
    estimatedHours: 5,
    timeSpentHours: 4.5,
    createdAt: '2026-09-02',
    completedAt: '2026-09-06 17:30',
    remarks: 'Variance of ₹1.12L explained due to 3 new hires in engineering and 2 performance incentives.',
    subtasks: [
      { id: 'act-5-s1', subtaskNumber: 1, title: 'Extract attendance logs and compute LOP (Loss of Pay) deductions', status: 'completed', completedAt: '2026-09-03 14:00', notes: 'Biometric swipe logs verified for 120 employees.' },
      { id: 'act-5-s2', subtaskNumber: 2, title: 'Verify statutory PF/ESIC/PT calculations against slab ceilings', status: 'completed', completedAt: '2026-09-04 17:00', notes: 'All statutory employer and employee shares reconciled.' },
      { id: 'act-5-s3', subtaskNumber: 3, title: 'Generate bank salary file & CFO sign-off authorization', status: 'completed', completedAt: '2026-09-06 17:30', notes: 'Salaries disbursed on 7th morning.' }
    ]
  },
  {
    id: 'act-6',
    title: 'GSTR-2B vs Purchase Register ITC Mismatch Notice to Vendors',
    description: 'Identify vendors whose invoices are missing in GSTR-2B resulting in ₹2.40L blocked ITC, and trigger automated follow-up notices.',
    category: 'Direct/Indirect Tax Ops',
    assignedTo: 'Rahul Verma',
    assignedRole: 'Tax Associate',
    priority: 'High',
    status: 'In Progress',
    fixedDeadline: '2026-09-19 19:00',
    estimatedHours: 3.5,
    timeSpentHours: 2,
    createdAt: '2026-09-14',
    remarks: 'List of 5 defaulting suppliers extracted. Email draft prepared for CFO review.',
    subtasks: [
      { id: 'act-6-s1', subtaskNumber: 1, title: 'Download August 2026 GSTR-2B and run automated reconciliation', status: 'completed', completedAt: '2026-09-14 18:00', notes: 'Mismatch report identified 5 vendors with ₹2.40L ITC.' },
      { id: 'act-6-s2', subtaskNumber: 2, title: 'Draft formal ITC deficiency warning notices to vendor accountants', status: 'completed', completedAt: '2026-09-15 15:30', notes: 'Email communications drafted with invoice numbers.' },
      { id: 'act-6-s3', subtaskNumber: 3, title: 'Mark accounts payable ledger hold for subsequent bill payouts', status: 'pending', notes: 'Holding ₹2.80L payments until GSTR-1 reflects our GSTIN.' }
    ]
  },
  {
    id: 'act-7',
    title: 'Monthly Financial MIS Deck & SaaS Unit Economics Presentation',
    description: 'Prepare August 2026 deck containing MRR, CAC, LTV, Burn Multiple, Departmental Opex Budget vs Actuals for Board & Founder.',
    category: 'Financial Reporting & MIS',
    assignedTo: 'Pooja Sharma',
    assignedRole: 'Sr. Accountant',
    priority: 'Urgent',
    status: 'Under Review',
    fixedDeadline: '2026-09-18 12:00',
    estimatedHours: 6,
    timeSpentHours: 5.5,
    createdAt: '2026-09-12',
    remarks: 'Draft slides compiled with revenue bridge analysis. CA Manish Goyal is performing final review.',
    subtasks: [
      { id: 'act-7-s1', subtaskNumber: 1, title: 'Collate Trial Balance, Revenue Cohorts, and Departmental Opex', status: 'completed', completedAt: '2026-09-13 16:00', notes: 'Trial balance closed with all accruals.' },
      { id: 'act-7-s2', subtaskNumber: 2, title: 'Model SaaS unit economics (CAC, LTV, Magic Number, Runway)', status: 'completed', completedAt: '2026-09-15 18:00', notes: 'Burn multiple improved to 1.4x; runway 7.7 months.' },
      { id: 'act-7-s3', subtaskNumber: 3, title: 'Virtual CFO Executive Summary and Board Deck Sign-off', status: 'pending', notes: 'CA Manish Goyal review in progress.' }
    ]
  },
  {
    id: 'act-8',
    title: 'Corporate Travel & Entertainment Expense Vouchers Spot Audit',
    description: 'Audit 38 reimbursement claims exceeding ₹10,000 for valid GST tax invoices with client GSTIN to maximize ITC claim.',
    category: 'Internal Audit & Controls',
    assignedTo: 'Sneha Roy',
    assignedRole: 'Accounts Executive',
    priority: 'Low',
    status: 'Pending',
    fixedDeadline: '2026-09-25 18:00',
    estimatedHours: 4,
    timeSpentHours: 0,
    createdAt: '2026-09-16',
    remarks: 'Vouchers collected in shared drive; audit checklist to be executed next week.',
    subtasks: [
      { id: 'act-8-s1', subtaskNumber: 1, title: 'Collate 38 travel and hotel invoices from expense portal', status: 'pending', notes: 'Drive folder created with scanned vouchers.' },
      { id: 'act-8-s2', subtaskNumber: 2, title: 'Verify company GSTIN on airline, hotel and meal bills', status: 'pending', notes: 'Confirm eligibility under section 16 of CGST Act.' },
      { id: 'act-8-s3', subtaskNumber: 3, title: 'Issue audit finding memo and process reimbursement release', status: 'pending', notes: 'Final sign-off by Finance controller.' }
    ]
  }
];

export const TEAM_MEMBERS = [
  { name: 'CA Manish Goyal', role: 'Virtual CFO', email: 'manish@goyalcfo.com', avatarBg: 'bg-indigo-600' },
  { name: 'Pooja Sharma', role: 'Sr. Accountant', email: 'pooja.s@client.com', avatarBg: 'bg-emerald-600' },
  { name: 'Rahul Verma', role: 'Tax Associate', email: 'rahul.v@client.com', avatarBg: 'bg-amber-600' },
  { name: 'Sneha Roy', role: 'Accounts Executive', email: 'sneha.r@client.com', avatarBg: 'bg-sky-600' },
  { name: 'Amit Patel', role: 'Payroll Specialist', email: 'amit.p@client.com', avatarBg: 'bg-purple-600' },
  { name: 'CS Alok Mehta', role: 'Secretarial Advisor', email: 'alok.cs@advisors.com', avatarBg: 'bg-rose-600' },
  { name: 'Vikram Singhania', role: 'Compliance Lead', email: 'vikram.s@client.com', avatarBg: 'bg-teal-600' },
];
