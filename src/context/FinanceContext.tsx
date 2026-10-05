import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  FamilyMember,
  MemberIconType,
  IncomeItem,
  DebtItem,
  ExpenseItem,
  FinancialHealthMetrics,
} from '../types/finance';
import { DEFAULT_MEMBERS, DEFAULT_INCOMES, DEFAULT_DEBTS, DEFAULT_EXPENSES } from '../data/defaultData';
import { initAuth, googleSignIn, logout, getAccessToken } from '../services/firebase';
import { addDebtPaymentToCalendar } from '../services/calendarService';
import { exportToGoogleSheets } from '../services/sheetsService';
import { User } from 'firebase/auth';

interface FinanceContextType {
  // Members
  members: FamilyMember[];
  selectedMemberId: string; // 'all' or specific member ID
  setSelectedMemberId: (id: string) => void;
  addMember: (name: string, roleLabel: string, icon?: MemberIconType) => void;
  removeMember: (id: string) => void;

  // Month navigation
  monthOffset: number; // 0 = current month, 1 = next month, etc.
  setMonthOffset: (offset: number) => void;
  activeMonthKey: string; // "2026-10"
  activeMonthLabel: string; // "ตุลาคม 2569" or "พฤศจิกายน 2569 (เดือนหน้า)"
  isNextMonth: boolean;

  // Data items
  incomes: IncomeItem[];
  debts: DebtItem[];
  expenses: ExpenseItem[];

  // Filtered by selected member
  filteredIncomes: IncomeItem[];
  filteredDebts: DebtItem[];
  filteredExpenses: ExpenseItem[];

  // Metrics
  metrics: FinancialHealthMetrics;

  // Actions
  addIncome: (item: Omit<IncomeItem, 'id'>) => void;
  updateIncome: (id: string, item: Partial<IncomeItem>) => void;
  deleteIncome: (id: string) => void;

  addDebt: (item: Omit<DebtItem, 'id' | 'paidMonths'>) => void;
  updateDebt: (id: string, item: Partial<DebtItem>) => void;
  deleteDebt: (id: string) => void;

  addExpense: (item: Omit<ExpenseItem, 'id' | 'paidMonths'>) => void;
  updateExpense: (id: string, item: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  // Status toggles
  toggleDebtPaid: (debtId: string) => void;
  toggleExpensePaid: (expenseId: string) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Google Auth & Workspace Sync
  user: User | null;
  isLoggingIn: boolean;
  handleGoogleLogin: () => Promise<boolean>;
  handleGoogleLogout: () => Promise<void>;

  // Calendar
  syncDebtToCalendar: (debtId: string) => Promise<{ success: boolean; error?: string }>;
  syncAllDebtsToCalendar: () => Promise<{ successCount: number; failCount: number }>;
  isCalendarSyncing: boolean;

  // Sheets
  exportPlanToSheets: () => Promise<{ success: boolean; url?: string; error?: string }>;
  isExportingSheets: boolean;

  // Family code Sync / Backup
  exportFamilySyncCode: () => string;
  importFamilySyncCode: (code: string) => boolean;
  resetAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MEMBERS: 'homefin_members_v1',
  INCOMES: 'homefin_incomes_v1',
  DEBTS: 'homefin_debts_v1',
  EXPENSES: 'homefin_expenses_v1',
};

const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Data States with LocalStorage backup
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          avatarIcon: m.avatarIcon || (m.role === 'spouse' ? 'heart' : m.role === 'household' ? 'home' : 'user'),
        }));
      }
      return DEFAULT_MEMBERS;
    } catch {
      return DEFAULT_MEMBERS;
    }
  });

  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
      return saved ? JSON.parse(saved) : DEFAULT_INCOMES;
    } catch {
      return DEFAULT_INCOMES;
    }
  });

  const [debts, setDebts] = useState<DebtItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
      return saved ? JSON.parse(saved) : DEFAULT_DEBTS;
    } catch {
      return DEFAULT_DEBTS;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [members, incomes, debts, expenses]);

  // 2. Theme State (light/dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('homefin_theme');
      return savedTheme === 'dark' ? 'dark' : 'light'; // Default to light mode as requested!
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('homefin_theme', next);
      } catch {}
      return next;
    });
  };

  // 3. Active filters & Navigation
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [monthOffset, setMonthOffset] = useState<number>(0); // 0 = current, 1 = next month

  // 3. User & Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async (): Promise<boolean> => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        return true;
      }
      return false;
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request' &&
        !err?.message?.includes('popup-closed-by-user') &&
        !err?.message?.includes('cancelled-popup-request')
      ) {
        console.warn('Login issue:', err?.message || err);
      }
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
  };

  // 4. Calculate active dates
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonthNum = targetDate.getMonth() + 1; // 1-12
  const activeMonthKey = `${targetYear}-${String(targetMonthNum).padStart(2, '0')}`;
  const thaiYear = targetYear + 543;
  const monthName = THAI_MONTH_NAMES[targetDate.getMonth()];
  const isNextMonth = monthOffset === 1;
  const activeMonthLabel = `${monthName} ${thaiYear}${monthOffset === 1 ? ' (เดือนหน้า)' : monthOffset === 0 ? ' (เดือนนี้)' : ''}`;

  // 5. Filtered items
  const filteredIncomes = useMemo(() => {
    if (selectedMemberId === 'all') return incomes;
    return incomes.filter((item) => item.memberId === selectedMemberId);
  }, [incomes, selectedMemberId]);

  const filteredDebts = useMemo(() => {
    if (selectedMemberId === 'all') return debts;
    return debts.filter((item) => item.memberId === selectedMemberId);
  }, [debts, selectedMemberId]);

  const filteredExpenses = useMemo(() => {
    if (selectedMemberId === 'all') return expenses;
    return expenses.filter((item) => item.memberId === selectedMemberId);
  }, [expenses, selectedMemberId]);

  // 6. Metrics & Analysis
  const metrics: FinancialHealthMetrics = useMemo(() => {
    const totalIncome = filteredIncomes.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDebts = filteredDebts.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);

    const totalFixedExpenses = filteredExpenses
      .filter((e) => e.isFixed)
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalVariableExpenses = filteredExpenses
      .filter((e) => !e.isFixed)
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalCommittedExpenses = totalDebts + totalFixedExpenses;
    const totalAllExpenses = totalDebts + totalFixedExpenses + totalVariableExpenses;
    const netSurplus = totalIncome - totalAllExpenses;

    const debtToIncomeRatio = totalIncome > 0 ? (totalDebts / totalIncome) * 100 : 0;
    const fixedRatio = totalIncome > 0 ? (totalFixedExpenses / totalIncome) * 100 : 0;

    let healthStatus: 'healthy' | 'moderate' | 'warning' | 'danger' = 'healthy';
    let healthLabel = 'ยอดเยี่ยม';
    let shortAdvice = 'การเงินคล่องตัว มีเงินเหลือเก็บ';

    if (netSurplus < 0) {
      healthStatus = 'danger';
      healthLabel = 'รายรับไม่พอรายจ่าย';
      shortAdvice = 'เดือนนี้ขาดดุล ต้องลดค่าใช้จ่ายทันที';
    } else if (debtToIncomeRatio > 50) {
      healthStatus = 'danger';
      healthLabel = 'ภาระหนี้สูงมาก';
      shortAdvice = 'หนี้เกิน 50% ของรายรับ ระวังสะดุด';
    } else if (debtToIncomeRatio > 35 || netSurplus < totalIncome * 0.1) {
      healthStatus = 'warning';
      healthLabel = 'ตึงตัวปานกลาง';
      shortAdvice = 'หนี้ค่อนข้างสูง ควรคุมค่าใช้จ่ายผันแปร';
    } else if (debtToIncomeRatio > 25) {
      healthStatus = 'moderate';
      healthLabel = 'สมดุลดี';
      shortAdvice = 'สัดส่วนหนี้อยู่ในเกณฑ์มาตรฐาน';
    }

    return {
      totalIncome,
      totalDebts,
      totalFixedExpenses,
      totalVariableExpenses,
      totalCommittedExpenses,
      netSurplus,
      debtToIncomeRatio,
      fixedRatio,
      healthStatus,
      healthLabel,
      shortAdvice,
    };
  }, [filteredIncomes, filteredDebts, filteredExpenses]);

  // 7. Actions CRUD
  const addIncome = (item: Omit<IncomeItem, 'id'>) => {
    const newItem: IncomeItem = {
      ...item,
      id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    setIncomes((prev) => [newItem, ...prev]);
  };

  const updateIncome = (id: string, item: Partial<IncomeItem>) => {
    setIncomes((prev) => prev.map((inc) => (inc.id === id ? { ...inc, ...item } : inc)));
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((inc) => inc.id !== id));
  };

  const addDebt = (item: Omit<DebtItem, 'id' | 'paidMonths'>) => {
    const newItem: DebtItem = {
      ...item,
      id: `debt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      paidMonths: [],
    };
    setDebts((prev) => [...prev, newItem]);
  };

  const updateDebt = (id: string, item: Partial<DebtItem>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...item } : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const addExpense = (item: Omit<ExpenseItem, 'id' | 'paidMonths'>) => {
    const newItem: ExpenseItem = {
      ...item,
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      paidMonths: [],
    };
    setExpenses((prev) => [...prev, newItem]);
  };

  const updateExpense = (id: string, item: Partial<ExpenseItem>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...item } : e)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Toggle paid status
  const toggleDebtPaid = (debtId: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const isPaid = d.paidMonths.includes(activeMonthKey);
        const updated = isPaid
          ? d.paidMonths.filter((m) => m !== activeMonthKey)
          : [...d.paidMonths, activeMonthKey];

        // Trigger confetti celebration when marking as paid!
        if (!isPaid) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#10B981', '#064E3B', '#34D399', '#FBBF24'],
            });
          } catch {
            // ignore
          }
        }

        return { ...d, paidMonths: updated };
      })
    );
  };

  const toggleExpensePaid = (expenseId: string) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== expenseId) return e;
        const isPaid = e.paidMonths.includes(activeMonthKey);
        const updated = isPaid
          ? e.paidMonths.filter((m) => m !== activeMonthKey)
          : [...e.paidMonths, activeMonthKey];
        return { ...e, paidMonths: updated };
      })
    );
  };

  // Family Members
  const addMember = (name: string, roleLabel: string, icon: MemberIconType = 'user') => {
    const newMember: FamilyMember = {
      id: `m_${Date.now()}`,
      name,
      role: 'other',
      roleLabel,
      avatarIcon: icon,
      avatarColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemberId === id) setSelectedMemberId('all');
  };

  // Google Calendar integration
  const syncDebtToCalendar = async (debtId: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return { success: false, error: 'ไม่พบรายการหนี้' };

    const token = await getAccessToken();
    if (!token) {
      const loggedIn = await handleGoogleLogin();
      if (!loggedIn) {
        return { success: false, error: 'กรุณาเชื่อมต่อบัญชี Google ก่อน' };
      }
    }

    setIsCalendarSyncing(true);
    try {
      const result = await addDebtPaymentToCalendar(debt, targetYear, targetMonthNum);
      if (result.success && result.eventId) {
        updateDebt(debtId, { calendarEventId: result.eventId });
      }
      return result;
    } finally {
      setIsCalendarSyncing(false);
    }
  };

  const syncAllDebtsToCalendar = async () => {
    const token = await getAccessToken();
    if (!token) {
      const loggedIn = await handleGoogleLogin();
      if (!loggedIn) {
        return { successCount: 0, failCount: debts.length };
      }
    }

    setIsCalendarSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (const debt of debts) {
      try {
        const res = await addDebtPaymentToCalendar(debt, targetYear, targetMonthNum);
        if (res.success && res.eventId) {
          updateDebt(debt.id, { calendarEventId: res.eventId });
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsCalendarSyncing(false);
    return { successCount, failCount };
  };

  // Google Sheets Export
  const exportPlanToSheets = async () => {
    const token = await getAccessToken();
    if (!token) {
      const loggedIn = await handleGoogleLogin();
      if (!loggedIn) {
        return { success: false, error: 'กรุณาเข้าสู่ระบบ Google เพื่อเปิดชีต' };
      }
    }

    setIsExportingSheets(true);
    try {
      const result = await exportToGoogleSheets(
        activeMonthLabel,
        metrics,
        members,
        incomes,
        debts,
        expenses
      );
      return { success: result.success, url: result.spreadsheetUrl, error: result.error };
    } finally {
      setIsExportingSheets(false);
    }
  };

  // Family Sync Code
  const exportFamilySyncCode = (): string => {
    const payload = {
      version: 1,
      timestamp: Date.now(),
      members,
      incomes,
      debts,
      expenses,
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  };

  const importFamilySyncCode = (code: string): boolean => {
    try {
      const decoded = decodeURIComponent(escape(atob(code.trim())));
      const parsed = JSON.parse(decoded);
      if (parsed.members && parsed.debts && parsed.incomes && parsed.expenses) {
        setMembers(parsed.members);
        setIncomes(parsed.incomes);
        setDebts(parsed.debts);
        setExpenses(parsed.expenses);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import sync code failed:', e);
      return false;
    }
  };

  const resetAllData = () => {
    setMembers(DEFAULT_MEMBERS);
    setIncomes(DEFAULT_INCOMES);
    setDebts(DEFAULT_DEBTS);
    setExpenses(DEFAULT_EXPENSES);
    setSelectedMemberId('all');
    setMonthOffset(0);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.INCOMES);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  };

  return (
    <FinanceContext.Provider
      value={{
        members,
        selectedMemberId,
        setSelectedMemberId,
        addMember,
        removeMember,
        monthOffset,
        setMonthOffset,
        activeMonthKey,
        activeMonthLabel,
        isNextMonth,
        incomes,
        debts,
        expenses,
        filteredIncomes,
        filteredDebts,
        filteredExpenses,
        metrics,
        addIncome,
        updateIncome,
        deleteIncome,
        addDebt,
        updateDebt,
        deleteDebt,
        addExpense,
        updateExpense,
        deleteExpense,
        toggleDebtPaid,
        toggleExpensePaid,
        theme,
        toggleTheme,
        user,
        isLoggingIn,
        handleGoogleLogin,
        handleGoogleLogout,
        syncDebtToCalendar,
        syncAllDebtsToCalendar,
        isCalendarSyncing,
        exportPlanToSheets,
        isExportingSheets,
        exportFamilySyncCode,
        importFamilySyncCode,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
