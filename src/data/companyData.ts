import { ComplianceItem, ActionItem, FinancialMIS, ClientProfile, CompanyOverviewSummary } from '../types';
import { COMPLIANCE_MASTER_LIST } from './complianceMaster';
import { CLIENT_COMPANIES, INITIAL_ACTION_ITEMS, COMPANY_FINANCIAL_MIS } from './mockInitialData';

// Generate simulated compliances for Apex Logistics (client-102)
const APEX_COMPLIANCES: ComplianceItem[] = COMPLIANCE_MASTER_LIST.map((c, idx) => {
  const isFiled = idx % 2 === 0; // alternate filed
  const isCfoPending = idx % 5 === 1;

  return {
    ...c,
    id: `apex-${c.id}`,
    companyId: 'client-102',
    arnOrChallanNo: isFiled ? `APEX-CHL-${9200 + idx}` : undefined,
    subtasks: [
      {
        ...c.subtasks[0],
        status: (isFiled || isCfoPending) ? 'completed' : 'pending',
        completedAt: (isFiled || isCfoPending) ? '2026-09-12 11:00' : undefined,
        completedBy: (isFiled || isCfoPending) ? 'Apex Accounts Team' : undefined
      },
      {
        ...c.subtasks[1],
        status: isFiled ? 'completed' : 'pending',
        completedAt: isFiled ? '2026-09-14 16:30' : undefined,
        completedBy: isFiled ? 'CA Manish Goyal (CFO)' : undefined
      },
      {
        ...c.subtasks[2],
        status: isFiled ? 'completed' : 'pending',
        completedAt: isFiled ? '2026-09-15 10:45' : undefined,
        completedBy: isFiled ? 'Apex Tax Filing Desk' : undefined
      }
    ] as any
  };
});

// Generate simulated compliances for Zenith HealthTech (client-103)
const ZENITH_COMPLIANCES: ComplianceItem[] = COMPLIANCE_MASTER_LIST.map((c, idx) => {
  const isFiled = idx % 3 !== 1; // 66% filed

  return {
    ...c,
    id: `zenith-${c.id}`,
    companyId: 'client-103',
    arnOrChallanNo: isFiled ? `ZENITH-ARN-${8100 + idx}` : undefined,
    subtasks: [
      {
        ...c.subtasks[0],
        status: isFiled ? 'completed' : 'pending',
        completedAt: isFiled ? '2026-09-10 14:00' : undefined,
        completedBy: isFiled ? 'Zenith Finance Team' : undefined
      },
      {
        ...c.subtasks[1],
        status: isFiled ? 'completed' : 'pending',
        completedAt: isFiled ? '2026-09-12 17:00' : undefined,
        completedBy: isFiled ? 'CA Manish Goyal (CFO)' : undefined
      },
      {
        ...c.subtasks[2],
        status: isFiled ? 'completed' : 'pending',
        completedAt: isFiled ? '2026-09-13 11:15' : undefined,
        completedBy: isFiled ? 'Zenith Filing Team' : undefined
      }
    ] as any
  };
});

// Action items for Apex Logistics (client-102)
const APEX_ACTIONS: ActionItem[] = [
  {
    id: 'apex-act-1',
    companyId: 'client-102',
    title: 'Axis Bank Working Capital CC Stock & Receivables Statement',
    description: 'Submission of monthly DP (Drawing Power) statement audited by CA Manish Goyal to Axis Bank SME desk.',
    category: 'Banking & Treasury',
    assignedTo: 'Vikram Singhania',
    assignedRole: 'Finance Controller',
    priority: 'Urgent',
    status: 'In Progress',
    fixedDeadline: '2026-09-20',
    createdAt: '2026-09-14',
    remarks: 'Stock statements from 4 regional warehouses consolidated; debtors aging report ready for CFO sign-off.',
    subtasks: [
      { id: 'apex-act-1-s1', subtaskNumber: 1, title: 'Consolidate warehouse stock inventories & in-transit freight', status: 'completed' },
      { id: 'apex-act-1-s2', subtaskNumber: 2, title: 'Reconcile book debts aging (< 90 days vs > 90 days)', status: 'completed' },
      { id: 'apex-act-1-s3', subtaskNumber: 3, title: 'Issue Drawing Power calculation certificate signed by Virtual CFO', status: 'pending' }
    ]
  },
  {
    id: 'apex-act-2',
    companyId: 'client-102',
    title: 'Fleet Sub-Contractor TDS under Section 194C Lower Deduction Audit',
    description: 'Verify Form 26Q TDS schedules for 45 transport sub-contractors and cross-check PAN with valid 197 lower deduction orders.',
    category: 'Direct/Indirect Tax Ops',
    assignedTo: 'Rahul Verma',
    assignedRole: 'Tax Associate',
    priority: 'High',
    status: 'Pending',
    fixedDeadline: '2026-09-24',
    createdAt: '2026-09-15',
    remarks: 'TDS liability computed at ₹1.85L. Pending 3 transporter PAN validation on IT portal.',
    subtasks: [
      { id: 'apex-act-2-s1', subtaskNumber: 1, title: 'Verify transporter declarations under Sec 194C(6)', status: 'completed' },
      { id: 'apex-act-2-s2', subtaskNumber: 2, title: 'Upload challan 281 for monthly TDS deposit', status: 'pending' },
      { id: 'apex-act-2-s3', subtaskNumber: 3, title: 'Final filing review with CA Manish Goyal', status: 'pending' }
    ]
  },
  {
    id: 'apex-act-3',
    companyId: 'client-102',
    title: 'E-Way Bill vs GSTR-1 Interstate Freight Reconciliation',
    description: 'Match ₹4.8 Cr interstate consignment notes against generated E-way bills to eliminate GST notice risk.',
    category: 'Internal Audit & Controls',
    assignedTo: 'Pooja Sharma',
    assignedRole: 'Sr. Accountant',
    priority: 'Medium',
    status: 'Completed',
    fixedDeadline: '2026-09-17',
    createdAt: '2026-09-10',
    completedAt: '2026-09-16T10:00:00Z',
    remarks: 'Reconciliation completed. Zero discrepancies found between NIC portal e-way bills and sales register.',
    subtasks: [
      { id: 'apex-act-3-s1', subtaskNumber: 1, title: 'Export EWB-01 log from government e-way bill portal', status: 'completed' },
      { id: 'apex-act-3-s2', subtaskNumber: 2, title: 'Automated match with ERP sales register', status: 'completed' },
      { id: 'apex-act-3-s3', subtaskNumber: 3, title: 'CFO sign-off on variance analysis report', status: 'completed' }
    ]
  }
];

// Action items for Zenith HealthTech (client-103)
const ZENITH_ACTIONS: ActionItem[] = [
  {
    id: 'zenith-act-1',
    companyId: 'client-103',
    title: 'MCA LLP Form 8 (Statement of Account & Solvency) Filing Draft',
    description: 'Preparation of Statement of Solvency, partner contribution disclosures, and audit certification for FY 25-26.',
    category: 'Financial Reporting & MIS',
    assignedTo: 'CS Alok Mehta',
    assignedRole: 'Secretarial Advisor',
    priority: 'High',
    status: 'In Progress',
    fixedDeadline: '2026-09-28',
    createdAt: '2026-09-12',
    remarks: 'Balance sheet extract prepared. CA Manish Goyal certificate scheduled for signature.',
    subtasks: [
      { id: 'zenith-act-1-s1', subtaskNumber: 1, title: 'Prepare LLP Statement of Assets and Liabilities', status: 'completed' },
      { id: 'zenith-act-1-s2', subtaskNumber: 2, title: 'Draft Designated Partners Solvency Declaration', status: 'completed' },
      { id: 'zenith-act-1-s3', subtaskNumber: 3, title: 'Obtain digital signature and file on MCA V3 portal', status: 'pending' }
    ]
  },
  {
    id: 'zenith-act-2',
    companyId: 'client-103',
    title: 'R&D Bio-Sensor Patent Tax Incentive under Section 35(2AB)',
    description: 'Documentation of clinical trial R&D expenditures to claim 100% weighted deduction under Income Tax Act.',
    category: 'Direct/Indirect Tax Ops',
    assignedTo: 'CA Manish Goyal',
    assignedRole: 'Virtual CFO',
    priority: 'Medium',
    status: 'Pending',
    fixedDeadline: '2026-10-05',
    createdAt: '2026-09-14',
    remarks: 'Technical report received from CSIR accredited laboratory.',
    subtasks: [
      { id: 'zenith-act-2-s1', subtaskNumber: 1, title: 'Collate component purchase invoices & lab testing fees', status: 'completed' },
      { id: 'zenith-act-2-s2', subtaskNumber: 2, title: 'Prepare Form 3CLA auditor certificate', status: 'pending' },
      { id: 'zenith-act-2-s3', subtaskNumber: 3, title: 'File online application with DSIR approval wing', status: 'pending' }
    ]
  }
];

export const ALL_COMPANIES_COMPLIANCES: Record<string, ComplianceItem[]> = {
  'client-101': COMPLIANCE_MASTER_LIST.map(c => ({ ...c, companyId: 'client-101' })),
  'client-102': APEX_COMPLIANCES,
  'client-103': ZENITH_COMPLIANCES
};

export const ALL_COMPANIES_ACTIONS: Record<string, ActionItem[]> = {
  'client-101': INITIAL_ACTION_ITEMS.map(a => ({ ...a, companyId: 'client-101' })),
  'client-102': APEX_ACTIONS,
  'client-103': ZENITH_ACTIONS
};
