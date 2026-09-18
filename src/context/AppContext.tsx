import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Role, 
  ComplianceItem, 
  ActionItem, 
  FinancialMIS, 
  ClientProfile, 
  FilterOptions,
  SubTask,
  UserAccount,
  CompanyOverviewSummary,
  CriticalDelayedItem,
  BudgetLineItem,
  BudgetMonthKey,
  MisSubTab
} from '../types';
import { COMPLIANCE_MASTER_LIST } from '../data/complianceMaster';
import { 
  INITIAL_ACTION_ITEMS, 
  INITIAL_CLIENT_PROFILE, 
  INITIAL_FINANCIAL_MIS,
  CLIENT_COMPANIES,
  DEFAULT_USERS,
  COMPANY_FINANCIAL_MIS
} from '../data/mockInitialData';
import {
  ALL_COMPANIES_COMPLIANCES,
  ALL_COMPANIES_ACTIONS
} from '../data/companyData';
import { INITIAL_NEXORA_BUDGET_ITEMS } from '../data/mockBudgetData';
import { nextDueDate, daysUntilDue, formatDueDate, compareDueDates } from '../utils/dueDate';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  loginAs: (role: Role, companyId?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  companies: ClientProfile[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  cfoViewMode: 'portfolio' | 'single_company';
  setCfoViewMode: (mode: 'portfolio' | 'single_company') => void;
  drillDownToCompany: (companyId: string) => void;
  returnToPortfolio: () => void;
  allCompaniesOverview: CompanyOverviewSummary[];
  criticalDelayedItems: CriticalDelayedItem[];
  approveCfoComplianceReview: (companyId: string, complianceId: string) => void;
  switchCompanyAndTab: (companyId: string, tab: 'dashboard' | 'compliances' | 'actions' | 'mis', subTab?: MisSubTab) => void;
  activeTab: 'dashboard' | 'compliances' | 'actions' | 'mis';
  setActiveTab: (tab: 'dashboard' | 'compliances' | 'actions' | 'mis') => void;
  misSubTab: MisSubTab;
  setMisSubTab: (subTab: MisSubTab) => void;
  openMisWithSubTab: (subTab: MisSubTab) => void;
  budgetItems: BudgetLineItem[];
  selectedBudgetMonth: BudgetMonthKey;
  setSelectedBudgetMonth: (month: BudgetMonthKey) => void;
  updateLineItemActual: (itemId: string, monthKey: BudgetMonthKey, actual: number, notes?: string) => void;
  updateLineItemBudget: (itemId: string, monthKey: BudgetMonthKey, budget: number) => void;
  bulkUpdateActualsFromExcel: (
    monthKey: BudgetMonthKey, 
    parsedRows: Array<{ code?: string; name?: string; actual: number; notes?: string }>
  ) => { updatedCount: number; notFoundCount: number };
  resetBudgetData: () => void;
  compliances: ComplianceItem[];
  toggleSubtask: (complianceId: string, subtaskNumber: 1 | 2 | 3, notes?: string, docRef?: string) => void;
  updateCompliance: (item: ComplianceItem) => void;
  updateComplianceRemarks: (complianceId: string, remarksType: 'cfo' | 'client', text: string) => void;
  actions: ActionItem[];
  addAction: (item: Omit<ActionItem, 'id' | 'createdAt'>) => void;
  updateAction: (item: ActionItem) => void;
  deleteAction: (id: string) => void;
  toggleActionSubtask: (actionId: string, subtaskNumber: number, notes?: string) => void;
  addActionSubtask: (actionId: string, title: string) => void;
  financialMIS: FinancialMIS;
  updateFinancialMIS: (data: Partial<FinancialMIS>) => void;
  clientProfile: ClientProfile;
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  stats: {
    totalCompliances: number;
    fullyCompletedCompliances: number;
    inProgressCompliances: number;
    notStartedCompliances: number;
    overallCompliancePercentage: number;
    cfoReviewPendingCount: number;
    totalActions: number;
    pendingActions: number;
    inProgressActions: number;
    underReviewActions: number;
    completedActions: number;
    overdueActions: number;
    totalTaxPaid: number;
    totalTaxPending: number;
  };
  selectedCompliance: ComplianceItem | null;
  setSelectedCompliance: (item: ComplianceItem | null) => void;
  isNewActionModalOpen: boolean;
  setIsNewActionModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const COMPLIANCES_KEY = 'vcfo_compliances_v1';
const ACTIONS_KEY = 'vcfo_actions_v1';
const MIS_KEY = 'vcfo_mis_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user & authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem('vcfo_user_account_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USERS[0];
  });

  const [role, setRoleState] = useState<Role>(currentUser.role);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'compliances' | 'actions' | 'mis'>('dashboard');
  const [misSubTab, setMisSubTab] = useState<MisSubTab>('overview');
  const [companies] = useState<ClientProfile[]>(CLIENT_COMPANIES);

  // Selected company ID (strictly enforced for non-CFO roles)
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string>(() => {
    if (currentUser.role !== 'cfo') return 'client-101';
    try {
      const saved = localStorage.getItem('vcfo_active_company_v2');
      if (saved) return saved;
    } catch {}
    return 'client-101';
  });

  // CFO view mode: 'portfolio' (All Companies Overview) or 'single_company'
  const [cfoViewMode, setCfoViewMode] = useState<'portfolio' | 'single_company'>(() => {
    return currentUser.role === 'cfo' ? 'portfolio' : 'single_company';
  });

  // Active company ID (strictly locked to client-101 for client and client_team)
  const activeCompanyId = useMemo(() => {
    if (currentUser.role !== 'cfo') {
      return 'client-101';
    }
    return selectedCompanyId;
  }, [currentUser.role, selectedCompanyId]);

  const [selectedCompliance, setSelectedCompliance] = useState<ComplianceItem | null>(null);
  const [isNewActionModalOpen, setIsNewActionModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category: 'ALL',
    status: 'ALL',
    assignee: 'ALL',
    searchQuery: '',
    frequency: 'ALL'
  });

  const resetFilters = () => {
    setFilterOptions({
      category: 'ALL',
      status: 'ALL',
      assignee: 'ALL',
      searchQuery: '',
      frequency: 'ALL'
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Multi-company compliances state with local storage
  const [allCompliancesMap, setAllCompliancesMap] = useState<Record<string, ComplianceItem[]>>(() => {
    try {
      const saved = localStorage.getItem('vcfo_multi_compliances_v2');
      if (saved) return JSON.parse(saved);
      const old = localStorage.getItem(COMPLIANCES_KEY);
      if (old) {
        const parsed = JSON.parse(old);
        return {
          ...ALL_COMPANIES_COMPLIANCES,
          'client-101': parsed
        };
      }
    } catch {}
    return ALL_COMPANIES_COMPLIANCES;
  });

  // Multi-company action items state with local storage
  const [allActionsMap, setAllActionsMap] = useState<Record<string, ActionItem[]>>(() => {
    try {
      const saved = localStorage.getItem('vcfo_multi_actions_v2');
      if (saved) return JSON.parse(saved);
      const old = localStorage.getItem(ACTIONS_KEY);
      if (old) {
        const parsed = JSON.parse(old);
        return {
          ...ALL_COMPANIES_ACTIONS,
          'client-101': parsed
        };
      }
    } catch {}
    return ALL_COMPANIES_ACTIONS;
  });

  // Multi-company MIS state with local storage
  const [allMISMap, setAllMISMap] = useState<Record<string, FinancialMIS>>(() => {
    try {
      const saved = localStorage.getItem('vcfo_multi_mis_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return COMPANY_FINANCIAL_MIS;
  });

  // Multi-company Budget & Variance state with local storage
  const [allBudgetMap, setAllBudgetMap] = useState<Record<string, BudgetLineItem[]>>(() => {
    try {
      const saved = localStorage.getItem('vcfo_multi_budget_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'client-101': INITIAL_NEXORA_BUDGET_ITEMS,
      'client-102': INITIAL_NEXORA_BUDGET_ITEMS,
      'client-103': INITIAL_NEXORA_BUDGET_ITEMS
    };
  });

  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState<BudgetMonthKey>('sep');

  // Persist multi-company states
  useEffect(() => {
    try {
      localStorage.setItem('vcfo_multi_compliances_v2', JSON.stringify(allCompliancesMap));
    } catch (err) {
      console.error('Failed saving multi compliances:', err);
    }
  }, [allCompliancesMap]);

  useEffect(() => {
    try {
      localStorage.setItem('vcfo_multi_actions_v2', JSON.stringify(allActionsMap));
    } catch (err) {
      console.error('Failed saving multi actions:', err);
    }
  }, [allActionsMap]);

  useEffect(() => {
    try {
      localStorage.setItem('vcfo_multi_mis_v2', JSON.stringify(allMISMap));
    } catch (err) {
      console.error('Failed saving multi MIS:', err);
    }
  }, [allMISMap]);

  useEffect(() => {
    try {
      localStorage.setItem('vcfo_multi_budget_v1', JSON.stringify(allBudgetMap));
    } catch (err) {
      console.error('Failed saving multi budget:', err);
    }
  }, [allBudgetMap]);

  useEffect(() => {
    try {
      localStorage.setItem('vcfo_user_account_v2', JSON.stringify(currentUser));
    } catch (err) {
      console.error('Failed saving user account:', err);
    }
  }, [currentUser]);

  // Derived active items for current company workspace
  const compliances = useMemo(() => {
    return allCompliancesMap[activeCompanyId] || allCompliancesMap['client-101'] || COMPLIANCE_MASTER_LIST;
  }, [allCompliancesMap, activeCompanyId]);

  const actions = useMemo(() => {
    return allActionsMap[activeCompanyId] || allActionsMap['client-101'] || INITIAL_ACTION_ITEMS;
  }, [allActionsMap, activeCompanyId]);

  const financialMIS = useMemo(() => {
    return allMISMap[activeCompanyId] || allMISMap['client-101'] || INITIAL_FINANCIAL_MIS;
  }, [allMISMap, activeCompanyId]);

  const budgetItems = useMemo(() => {
    return allBudgetMap[activeCompanyId] || allBudgetMap['client-101'] || INITIAL_NEXORA_BUDGET_ITEMS;
  }, [allBudgetMap, activeCompanyId]);

  const updateLineItemActual = (itemId: string, monthKey: BudgetMonthKey, actual: number, notes?: string) => {
    setAllBudgetMap(prev => {
      const currentList = prev[activeCompanyId] || prev['client-101'] || INITIAL_NEXORA_BUDGET_ITEMS;
      const updated = currentList.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            monthly: {
              ...item.monthly,
              [monthKey]: {
                ...item.monthly[monthKey],
                actual,
                ...(notes !== undefined ? { notes } : {})
              }
            }
          };
        }
        return item;
      });
      return { ...prev, [activeCompanyId]: updated };
    });
    showToast(`Updated actual figure for ${monthKey.toUpperCase()}`);
  };

  const updateLineItemBudget = (itemId: string, monthKey: BudgetMonthKey, budget: number) => {
    setAllBudgetMap(prev => {
      const currentList = prev[activeCompanyId] || prev['client-101'] || INITIAL_NEXORA_BUDGET_ITEMS;
      const updated = currentList.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            monthly: {
              ...item.monthly,
              [monthKey]: {
                ...item.monthly[monthKey],
                budget
              }
            }
          };
        }
        return item;
      });
      return { ...prev, [activeCompanyId]: updated };
    });
    showToast(`Updated budget figure for ${monthKey.toUpperCase()}`);
  };

  const bulkUpdateActualsFromExcel = (
    monthKey: BudgetMonthKey,
    parsedRows: Array<{ code?: string; name?: string; actual: number; notes?: string }>
  ) => {
    let updatedCount = 0;

    setAllBudgetMap(prev => {
      const currentList = prev[activeCompanyId] || prev['client-101'] || INITIAL_NEXORA_BUDGET_ITEMS;
      const updated = currentList.map(item => {
        // Find matching row by exact code or fuzzy name
        const match = parsedRows.find(r => {
          if (r.code && r.code.trim().toUpperCase() === item.code.trim().toUpperCase()) {
            return true;
          }
          if (r.name && r.name.trim().toLowerCase() === item.name.trim().toLowerCase()) {
            return true;
          }
          if (r.name && item.name.toLowerCase().includes(r.name.trim().toLowerCase())) {
            return true;
          }
          return false;
        });

        if (match && typeof match.actual === 'number' && !isNaN(match.actual)) {
          updatedCount++;
          return {
            ...item,
            monthly: {
              ...item.monthly,
              [monthKey]: {
                ...item.monthly[monthKey],
                actual: match.actual,
                notes: match.notes || item.monthly[monthKey]?.notes
              }
            }
          };
        }
        return item;
      });

      return { ...prev, [activeCompanyId]: updated };
    });

    const notFoundCount = Math.max(0, parsedRows.length - updatedCount);
    showToast(`Excel uploaded: ${updatedCount} actuals updated for ${monthKey.toUpperCase()}`);
    return { updatedCount, notFoundCount };
  };

  const resetBudgetData = () => {
    setAllBudgetMap(prev => ({
      ...prev,
      [activeCompanyId]: INITIAL_NEXORA_BUDGET_ITEMS
    }));
    showToast('Reset budget & actual numbers to default financial model');
  };

  const clientProfile = useMemo(() => {
    return companies.find(c => c.id === activeCompanyId) || companies[0];
  }, [companies, activeCompanyId]);

  // Safe role & user switcher
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    const targetUser = DEFAULT_USERS.find(u => u.role === newRole) || DEFAULT_USERS[0];
    setCurrentUser(targetUser);
    if (newRole === 'client_team') {
      setSelectedCompanyIdState('client-101');
      setCfoViewMode('single_company');
      setActiveTabState('compliances');
    } else if (newRole === 'client') {
      setSelectedCompanyIdState('client-101');
      setCfoViewMode('single_company');
      setActiveTabState('dashboard');
    } else {
      setCfoViewMode('portfolio');
      setActiveTabState('dashboard');
    }
  };

  const setActiveTab = (tab: 'dashboard' | 'compliances' | 'actions' | 'mis') => {
    if (role === 'client_team' && tab !== 'compliances' && tab !== 'actions') {
      showToast('Client team has operational access only to Compliance Master and Action Items.');
      setActiveTabState('compliances');
      return;
    }
    setActiveTabState(tab);
  };

  const openMisWithSubTab = (subTab: MisSubTab) => {
    if (role === 'client_team') {
      showToast('Client team has operational access only to Compliance Master and Action Items.');
      return;
    }
    setMisSubTab(subTab);
    setActiveTabState('mis');
  };

  const setSelectedCompanyId = (companyId: string) => {
    if (currentUser.role !== 'cfo') {
      setSelectedCompanyIdState('client-101');
      showToast('Notice: Client & Client Team views are strictly restricted to own company workspace.');
      return;
    }
    setSelectedCompanyIdState(companyId);
    try {
      localStorage.setItem('vcfo_active_company_v2', companyId);
    } catch {}
  };

  const drillDownToCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCfoViewMode('single_company');
    setActiveTabState('dashboard');
    const comp = companies.find(c => c.id === companyId);
    showToast(`Viewing workspace: ${comp?.companyName || 'Company'}`);
  };

  const returnToPortfolio = () => {
    setCfoViewMode('portfolio');
    setActiveTabState('dashboard');
  };

  const switchCompanyAndTab = (companyId: string, tab: 'dashboard' | 'compliances' | 'actions' | 'mis', subTab?: MisSubTab) => {
    setSelectedCompanyId(companyId);
    setCfoViewMode('single_company');
    if (subTab) {
      setMisSubTab(subTab);
    }
    setActiveTabState(tab);
    const comp = companies.find(c => c.id === companyId);
    showToast(`Workspace switched to ${comp?.companyName || 'Company'}: viewing ${tab.toUpperCase()}`);
  };

  const approveCfoComplianceReview = (companyId: string, complianceId: string) => {
    setAllCompliancesMap(prevMap => {
      const list = prevMap[companyId] || ALL_COMPANIES_COMPLIANCES[companyId] || [];
      const updated = list.map(comp => {
        if (comp.id !== complianceId) return comp;
        const nowFormatted = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const updatedSubtasks = comp.subtasks.map(st => {
          if (st.subtaskNumber === 2) {
            return {
              ...st,
              status: 'completed',
              completedAt: nowFormatted,
              completedBy: 'CA Manish Goyal (CFO)'
            } as SubTask;
          }
          return st;
        }) as [SubTask, SubTask, SubTask];

        return {
          ...comp,
          subtasks: updatedSubtasks
        };
      });
      return {
        ...prevMap,
        [companyId]: updated
      };
    });
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch {}
    showToast('CFO Sign-Off Approved: Compliance moved to Portal Filing queue.');
  };

  const loginAs = (newRole: Role, targetCompanyId?: string) => {
    const user = DEFAULT_USERS.find(u => u.role === newRole) || DEFAULT_USERS[0];
    setCurrentUser(user);
    setRoleState(newRole);
    if (newRole === 'cfo') {
      setSelectedCompanyIdState(targetCompanyId || 'client-101');
      setCfoViewMode('portfolio');
      setActiveTabState('dashboard');
    } else if (newRole === 'client_team') {
      setSelectedCompanyIdState('client-101');
      setCfoViewMode('single_company');
      setActiveTabState('compliances');
    } else {
      setSelectedCompanyIdState('client-101');
      setCfoViewMode('single_company');
      setActiveTabState('dashboard');
    }
    setIsAuthModalOpen(false);
    showToast(`Signed in as ${user.name} (${user.roleTitle})`);
  };

  const logout = () => {
    setIsAuthModalOpen(true);
    showToast('Select an account to sign in.');
  };

  const resetToDefaultData = () => {
    setAllCompliancesMap(ALL_COMPANIES_COMPLIANCES);
    setAllActionsMap(ALL_COMPANIES_ACTIONS);
    setAllMISMap(COMPANY_FINANCIAL_MIS);
    localStorage.removeItem('vcfo_multi_compliances_v2');
    localStorage.removeItem('vcfo_multi_actions_v2');
    localStorage.removeItem('vcfo_multi_mis_v2');
    localStorage.removeItem(COMPLIANCES_KEY);
    localStorage.removeItem(ACTIONS_KEY);
    localStorage.removeItem(MIS_KEY);
    showToast('Reset to master template data successfully.');
  };

  // Cross-company portfolio summary for CFO All Companies Overview
  const allCompaniesOverview = useMemo<CompanyOverviewSummary[]>(() => {
    return companies.map(company => {
      const compList = allCompliancesMap[company.id] || ALL_COMPANIES_COMPLIANCES[company.id] || [];
      const actList = allActionsMap[company.id] || ALL_COMPANIES_ACTIONS[company.id] || [];
      const mis = allMISMap[company.id] || COMPANY_FINANCIAL_MIS[company.id] || INITIAL_FINANCIAL_MIS;

      let fullyCompleted = 0;
      let totalSubtasksDone = 0;
      let cfoReviewPending = 0;
      let taxPaid = 0;
      let taxPending = 0;

      compList.forEach(comp => {
        const subtasks = comp?.subtasks || [];
        const doneCount = subtasks.filter(s => s && s.status === 'completed').length;
        totalSubtasksDone += doneCount;
        if (doneCount === 3) fullyCompleted++;
        if (subtasks[0]?.status === 'completed' && subtasks[1]?.status === 'pending') {
          cfoReviewPending++;
        }
        if (comp.taxAmount) {
          if (subtasks[2]?.status === 'completed') taxPaid += comp.taxAmount;
          else taxPending += comp.taxAmount;
        }
      });

      const totalSubtasks = compList.length * 3;
      const overallPct = totalSubtasks > 0 ? Math.round((totalSubtasksDone / totalSubtasks) * 100) : 0;
      const openActions = (actList || []).filter(a => a && a.status !== 'Completed').length;
      const now = new Date();
      const overdueActions = (actList || []).filter(a => {
        if (!a || a.status === 'Completed') return false;
        const d = new Date(a.fixedDeadline);
        return !isNaN(d.getTime()) && d < now;
      }).length;

      const pendingCompliances = compList
        .filter(c => !c.subtasks || !c.subtasks[2] || c.subtasks[2].status !== 'completed')
        .sort(compareDueDates);
      const earliestPending = pendingCompliances[0];
      const nextUpcomingDeadline = earliestPending 
        ? `${earliestPending.name} (${formatDueDate(nextDueDate(earliestPending))})` 
        : 'All filings up to date';

      return {
        companyId: company.id,
        companyName: company.companyName || 'Corporate Entity',
        entityType: company.legalEntity || 'Private Limited Company',
        gstin: company.gstin || '27AAACN4921E1ZQ',
        sector: company.sector || 'Enterprise Services',
        compliancePercentage: overallPct,
        fullyCompletedCompliances: fullyCompleted,
        totalCompliances: compList.length,
        pendingCfoReviews: cfoReviewPending,
        pendingActions: openActions,
        overdueActions,
        monthlyRevenue: mis.monthlyRevenue || 0,
        cashRunwayMonths: mis.cashRunwayMonths || 0,
        taxPaid,
        taxPending,
        nextUpcomingDeadline,
        company,
        complianceStats: {
          overallCompliancePercentage: overallPct,
          fullyCompletedCompliances: fullyCompleted,
          totalCompliances: compList.length,
          cfoReviewPendingCount: cfoReviewPending,
          openActionsCount: openActions,
          overdueActionsCount: overdueActions,
          taxPaid,
          taxPending
        },
        mis
      };
    });
  }, [companies, allCompliancesMap, allActionsMap, allMISMap]);

  // Consolidated critical or delayed items across all companies
  const criticalDelayedItems = useMemo<CriticalDelayedItem[]>(() => {
    const list: CriticalDelayedItem[] = [];
    const now = new Date();

    // 1. Statutory compliances across all companies
    companies.forEach(company => {
      const compList = allCompliancesMap[company.id] || ALL_COMPANIES_COMPLIANCES[company.id] || [];
      compList.forEach(comp => {
        const subtasks = comp?.subtasks || [];
        const isFiled = subtasks[2]?.status === 'completed';
        const isCfoReviewPending = subtasks[0]?.status === 'completed' && subtasks[1]?.status === 'pending';
        
        // Critical or CFO Review pending
        if (!isFiled && (comp.criticality === 'Critical' || isCfoReviewPending)) {
          const dueIso = nextDueDate(comp);
          const days = daysUntilDue(comp);
          const formatted = dueIso ? formatDueDate(dueIso) : comp.statutoryDueDate.split(';')[0];
          const daysTag = days !== null 
            ? (days < 0 ? ` (${Math.abs(days)}d overdue)` : days === 0 ? ' (Today)' : ` (${days}d left)`)
            : '';

          list.push({
            id: `crit-comp-${company.id}-${comp.id}`,
            type: 'compliance',
            companyId: company.id,
            companyName: company.companyName,
            title: `${comp.name} (${comp.category})`,
            category: comp.category,
            severity: (days !== null && days < 0) ? 'Overdue' : isCfoReviewPending ? 'Critical' : 'Delayed',
            deadlineOrAge: `Due: ${formatted}${daysTag}`,
            assigneeOrDept: isCfoReviewPending ? 'CFO Review Pending' : (subtasks[0]?.status === 'pending' ? 'Team Collation' : 'Filing Desk'),
            penaltyOrRisk: comp.penaltyClause || 'Statutory late fees, penalty notice, and interest under relevant Act',
            financialAmount: comp.taxAmount,
            stageInfo: isCfoReviewPending ? 'Subtask 2 awaiting CFO Sign-Off' : 'Draft collation in progress',
            cfoReviewPending: isCfoReviewPending,
            rawDueDate: dueIso || '9999-12-31'
          });
        }
      });
    });

    // 2. Action items across all companies
    companies.forEach(company => {
      const actList = allActionsMap[company.id] || ALL_COMPANIES_ACTIONS[company.id] || [];
      actList.forEach(act => {
        if (act && act.status !== 'Completed') {
          const d = new Date(act.fixedDeadline);
          const isOverdue = !isNaN(d.getTime()) && d < now;
          const isUrgent = act.priority === 'Urgent';

          if (isOverdue || isUrgent) {
            const iso = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '9999-12-31';
            list.push({
              id: `crit-act-${company.id}-${act.id}`,
              type: 'action',
              companyId: company.id,
              companyName: company.companyName,
              title: act.title,
              category: act.category,
              severity: isOverdue ? 'Overdue' : 'Critical',
              deadlineOrAge: `Target: ${act.fixedDeadline.split(' ')[0]}`,
              assigneeOrDept: `${act.assignedTo} (${act.assignedRole || 'Finance Team'})`,
              penaltyOrRisk: act.remarks || act.description,
              stageInfo: `${act.status} • Priority: ${act.priority}`,
              cfoReviewPending: false,
              rawDueDate: iso
            });
          }
        }
      });
    });

    // Sort every deadline list by nextDueDate / deadline ascending
    return list.sort((a, b) => {
      const dateA = a.rawDueDate || '9999-12-31';
      const dateB = b.rawDueDate || '9999-12-31';
      return dateA.localeCompare(dateB);
    });
  }, [companies, allCompliancesMap, allActionsMap, clientProfile]);

  const toggleSubtask = (
    complianceId: string, 
    subtaskNumber: 1 | 2 | 3, 
    notes?: string, 
    docRef?: string
  ) => {
    setAllCompliancesMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || COMPLIANCE_MASTER_LIST;
      const updatedList = currentList.map(comp => {
        if (comp.id !== complianceId) return comp;

        const updatedSubtasks = comp.subtasks.map(st => {
          if (st.subtaskNumber !== subtaskNumber) return st;

          const isNowCompleted = st.status !== 'completed';
          const nowFormatted = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return {
            ...st,
            status: isNowCompleted ? 'completed' : 'pending',
            completedAt: isNowCompleted ? (st.completedAt || nowFormatted) : undefined,
            completedBy: isNowCompleted ? (role === 'cfo' ? 'CA Manish Goyal (CFO)' : 'Accounting Team') : undefined,
            notes: notes !== undefined ? notes : st.notes,
            documentRef: docRef !== undefined ? docRef : st.documentRef
          } as SubTask;
        }) as [SubTask, SubTask, SubTask];

        const completedCount = updatedSubtasks.filter(s => s.status === 'completed').length;
        
        if (completedCount === 3 && comp.subtasks.filter(s => s.status === 'completed').length < 3) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch {}
          showToast(`🎉 Compliance "${comp.name}" is 100% completed & filed!`);
        } else {
          const subtaskNames = ['Team Draft', 'CFO Review', 'Filing & Payment'];
          showToast(`Updated Sub-task ${subtaskNumber} (${subtaskNames[subtaskNumber - 1]}) for "${comp.name}"`);
        }

        return {
          ...comp,
          subtasks: updatedSubtasks
        };
      });

      return {
        ...prevMap,
        [activeCompanyId]: updatedList
      };
    });
  };

  const updateCompliance = (item: ComplianceItem) => {
    setAllCompliancesMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || COMPLIANCE_MASTER_LIST;
      return {
        ...prevMap,
        [activeCompanyId]: currentList.map(c => c.id === item.id ? item : c)
      };
    });
    showToast(`Compliance updated: ${item.name}`);
  };

  const updateComplianceRemarks = (
    complianceId: string, 
    remarksType: 'cfo' | 'client', 
    text: string
  ) => {
    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setAllCompliancesMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || COMPLIANCE_MASTER_LIST;
      return {
        ...prevMap,
        [activeCompanyId]: currentList.map(c => {
          if (c.id !== complianceId) return c;
          if (remarksType === 'cfo') {
            return {
              ...c,
              cfoRemarks: text,
              cfoRemarksAuthor: 'CA Manish Goyal (Virtual CFO)',
              cfoRemarksUpdatedAt: nowFormatted
            };
          } else {
            return {
              ...c,
              clientRemarks: text,
              clientRemarksAuthor: 'Client Accounts & Finance Team',
              clientRemarksUpdatedAt: nowFormatted
            };
          }
        })
      };
    });

    showToast(`Saved ${remarksType === 'cfo' ? 'CFO review remarks' : 'Client team remarks'}`);
  };

  const addAction = (item: Omit<ActionItem, 'id' | 'createdAt'>) => {
    const newId = `act-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newAction: ActionItem = {
      ...item,
      id: newId,
      companyId: activeCompanyId,
      createdAt: today,
      subtasks: item.subtasks && item.subtasks.length > 0 ? item.subtasks : [
        { id: `${newId}-s1`, subtaskNumber: 1, title: 'Data collation & initial ledger extraction', status: 'pending' },
        { id: `${newId}-s2`, subtaskNumber: 2, title: 'Reconciliation & computation verification', status: 'pending' },
        { id: `${newId}-s3`, subtaskNumber: 3, title: 'Final execution & management sign-off', status: 'pending' }
      ]
    };

    setAllActionsMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || INITIAL_ACTION_ITEMS;
      return {
        ...prevMap,
        [activeCompanyId]: [newAction, ...currentList]
      };
    });
    showToast(`New action pendency added: "${newAction.title}"`);
  };

  const updateAction = (item: ActionItem) => {
    setAllActionsMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || INITIAL_ACTION_ITEMS;
      return {
        ...prevMap,
        [activeCompanyId]: currentList.map(a => a.id === item.id ? item : a)
      };
    });
    if (item.status === 'Completed' && !item.completedAt) {
      item.completedAt = new Date().toISOString();
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 }
        });
      } catch {}
    }
    showToast(`Action task updated: "${item.title}"`);
  };

  const deleteAction = (id: string) => {
    setAllActionsMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || INITIAL_ACTION_ITEMS;
      return {
        ...prevMap,
        [activeCompanyId]: currentList.filter(a => a.id !== id)
      };
    });
    showToast('Action item removed.');
  };

  const toggleActionSubtask = (actionId: string, subtaskNumber: number, notes?: string) => {
    setAllActionsMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || INITIAL_ACTION_ITEMS;
      const updatedList = currentList.map(act => {
        if (act.id !== actionId) return act;
        const currentSubtasks = act.subtasks || [
          { id: `${act.id}-s1`, subtaskNumber: 1, title: 'Data collation & ledger extraction', status: 'pending' },
          { id: `${act.id}-s2`, subtaskNumber: 2, title: 'Reconciliation & computation verification', status: 'pending' },
          { id: `${act.id}-s3`, subtaskNumber: 3, title: 'Final execution & management sign-off', status: 'pending' }
        ];

        let willBeDone = false;
        const updatedSubtasks = currentSubtasks.map(st => {
          if (st.subtaskNumber !== subtaskNumber) return st;
          willBeDone = st.status !== 'completed';
          return {
            ...st,
            status: (willBeDone ? 'completed' : 'pending') as 'completed' | 'pending',
            completedAt: willBeDone ? new Date().toISOString() : undefined,
            notes: notes !== undefined ? notes : st.notes
          };
        });

        const allCompleted = updatedSubtasks.every(s => s.status === 'completed');
        const anyCompleted = updatedSubtasks.some(s => s.status === 'completed');
        let newStatus = act.status;
        if (allCompleted) {
          newStatus = 'Completed';
          try {
            confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
          } catch {}
        } else if (act.status === 'Completed' && !allCompleted) {
          newStatus = 'In Progress';
        } else if (anyCompleted && act.status === 'Pending') {
          newStatus = 'In Progress';
        }

        return {
          ...act,
          status: newStatus,
          subtasks: updatedSubtasks
        };
      });

      return {
        ...prevMap,
        [activeCompanyId]: updatedList
      };
    });
    showToast('Subtask updated');
  };

  const addActionSubtask = (actionId: string, title: string) => {
    if (!title.trim()) return;
    setAllActionsMap(prevMap => {
      const currentList = prevMap[activeCompanyId] || INITIAL_ACTION_ITEMS;
      return {
        ...prevMap,
        [activeCompanyId]: currentList.map(act => {
          if (act.id !== actionId) return act;
          const existing = act.subtasks || [];
          const newSubtask = {
            id: `${act.id}-s${Date.now()}`,
            subtaskNumber: existing.length + 1,
            title: title.trim(),
            status: 'pending' as const
          };
          return {
            ...act,
            subtasks: [...existing, newSubtask]
          };
        })
      };
    });
    showToast('New subtask milestone added');
  };

  const updateFinancialMIS = (data: Partial<FinancialMIS>) => {
    setAllMISMap(prevMap => {
      const currentMIS = prevMap[activeCompanyId] || INITIAL_FINANCIAL_MIS;
      return {
        ...prevMap,
        [activeCompanyId]: { ...currentMIS, ...data }
      };
    });
    showToast('Financial MIS metrics updated.');
  };

  // Computed statistics for active company
  const stats = useMemo(() => {
    let fullyCompleted = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalSubtasksDone = 0;
    let cfoReviewPending = 0;
    let taxPaid = 0;
    let taxPending = 0;

    compliances.forEach(comp => {
      const subtasks = comp?.subtasks || [];
      const doneCount = subtasks.filter(s => s && s.status === 'completed').length;
      totalSubtasksDone += doneCount;

      if (doneCount === 3) fullyCompleted++;
      else if (doneCount > 0) inProgress++;
      else notStarted++;

      if (subtasks[0]?.status === 'completed' && subtasks[1]?.status === 'pending') {
        cfoReviewPending++;
      }

      if (comp.taxAmount) {
        if (subtasks[2]?.status === 'completed') {
          taxPaid += comp.taxAmount;
        } else {
          taxPending += comp.taxAmount;
        }
      }
    });

    const totalSubtasks = compliances.length * 3;
    const overallPct = totalSubtasks > 0 ? Math.round((totalSubtasksDone / totalSubtasks) * 100) : 0;

    const safeActions = actions || [];
    const totalActions = safeActions.length;
    const pendingActions = safeActions.filter(a => a && a.status === 'Pending').length;
    const inProgressActions = safeActions.filter(a => a && a.status === 'In Progress').length;
    const underReviewActions = safeActions.filter(a => a && a.status === 'Under Review').length;
    const completedActions = safeActions.filter(a => a && a.status === 'Completed').length;

    const now = new Date();
    const overdueActions = safeActions.filter(a => {
      if (!a || a.status === 'Completed') return false;
      const deadlineDate = new Date(a.fixedDeadline);
      return !isNaN(deadlineDate.getTime()) && deadlineDate < now;
    }).length;

    return {
      totalCompliances: compliances.length,
      fullyCompletedCompliances: fullyCompleted,
      inProgressCompliances: inProgress,
      notStartedCompliances: notStarted,
      overallCompliancePercentage: overallPct,
      cfoReviewPendingCount: cfoReviewPending,
      totalActions,
      pendingActions,
      inProgressActions,
      underReviewActions,
      completedActions,
      overdueActions,
      totalTaxPaid: taxPaid,
      totalTaxPending: taxPending
    };
  }, [compliances, actions]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        loginAs,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        companies,
        selectedCompanyId,
        setSelectedCompanyId,
        cfoViewMode,
        setCfoViewMode,
        drillDownToCompany,
        returnToPortfolio,
        allCompaniesOverview,
        criticalDelayedItems,
        approveCfoComplianceReview,
        switchCompanyAndTab,
        activeTab,
        setActiveTab,
        misSubTab,
        setMisSubTab,
        openMisWithSubTab,
        compliances,
        toggleSubtask,
        updateCompliance,
        updateComplianceRemarks,
        actions,
        addAction,
        updateAction,
        deleteAction,
        toggleActionSubtask,
        addActionSubtask,
        financialMIS,
        updateFinancialMIS,
        budgetItems,
        selectedBudgetMonth,
        setSelectedBudgetMonth,
        updateLineItemActual,
        updateLineItemBudget,
        bulkUpdateActualsFromExcel,
        resetBudgetData,
        clientProfile,
        filterOptions,
        setFilterOptions,
        resetFilters,
        stats,
        selectedCompliance,
        setSelectedCompliance,
        isNewActionModalOpen,
        setIsNewActionModalOpen,
        toastMessage,
        showToast,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
