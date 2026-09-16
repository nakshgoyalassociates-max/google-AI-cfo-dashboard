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
  CompanyOverviewSummary
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
  activeTab: 'dashboard' | 'compliances' | 'actions' | 'mis';
  setActiveTab: (tab: 'dashboard' | 'compliances' | 'actions' | 'mis') => void;
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compliances' | 'actions' | 'mis'>('dashboard');
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

  const clientProfile = useMemo(() => {
    return companies.find(c => c.id === activeCompanyId) || companies[0];
  }, [companies, activeCompanyId]);

  // Safe role & user switcher
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    const targetUser = DEFAULT_USERS.find(u => u.role === newRole) || DEFAULT_USERS[0];
    setCurrentUser(targetUser);
    if (newRole !== 'cfo') {
      setSelectedCompanyIdState('client-101');
      setCfoViewMode('single_company');
    }
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
    setActiveTab('dashboard');
    const comp = companies.find(c => c.id === companyId);
    showToast(`Viewing workspace: ${comp?.companyName || 'Company'}`);
  };

  const returnToPortfolio = () => {
    setCfoViewMode('portfolio');
    setActiveTab('dashboard');
  };

  const loginAs = (newRole: Role, targetCompanyId?: string) => {
    const user = DEFAULT_USERS.find(u => u.role === newRole) || DEFAULT_USERS[0];
    setCurrentUser(user);
    setRoleState(newRole);
    if (newRole === 'cfo') {
      setSelectedCompanyIdState(targetCompanyId || 'client-101');
      setCfoViewMode('portfolio');
    } else {
      setSelectedCompanyIdState('client-101');
      setCfoViewMode('single_company');
    }
    setActiveTab('dashboard');
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

      const pendingCompliances = compList.filter(c => !c.subtasks || !c.subtasks[2] || c.subtasks[2].status !== 'completed');
      const nextUpcomingDeadline = pendingCompliances.length > 0 
        ? pendingCompliances[0].statutoryDueDate 
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
        activeTab,
        setActiveTab,
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
