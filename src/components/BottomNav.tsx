import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  ArrowUpDown,
  Users,
  Plus,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export type ActiveTab = 'dashboard' | 'debts' | 'cashflow' | 'family';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
}) => {
  const { filteredDebts, activeMonthKey, theme } = useFinance();
  const isLight = theme === 'light';

  const unpaidDebtCount = filteredDebts.filter(
    (d) => !d.paidMonths.includes(activeMonthKey)
  ).length;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t select-none transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-lg shadow-slate-200/50'
          : 'bg-slate-950/95 border-slate-800'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center py-1.5 px-2">
        {/* 1. Dashboard (Col 1) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? isLight
                ? 'text-emerald-600 font-bold'
                : 'text-emerald-400 font-bold'
              : isLight
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? isLight
                  ? 'bg-emerald-50'
                  : 'bg-emerald-500/15'
                : ''
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">ภาพรวม</span>
        </button>

        {/* 2. Debts (Col 2) */}
        <button
          onClick={() => setActiveTab('debts')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all relative ${
            activeTab === 'debts'
              ? isLight
                ? 'text-rose-600 font-bold'
                : 'text-rose-400 font-bold'
              : isLight
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'debts'
                ? isLight
                  ? 'bg-rose-50'
                  : 'bg-rose-500/15'
                : ''
            }`}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">หนี้สิน</span>
          {unpaidDebtCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
              {unpaidDebtCount}
            </span>
          )}
        </button>

        {/* 3. Center Action [+] (Col 3 - Perfectly Dead-Center) */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center w-11 h-11 -mt-5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
            title="เพิ่มรายการใหม่"
            aria-label="เพิ่มรายการ"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Cashflow (Col 4) */}
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
            activeTab === 'cashflow'
              ? isLight
                ? 'text-amber-600 font-bold'
                : 'text-amber-400 font-bold'
              : isLight
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'cashflow'
                ? isLight
                  ? 'bg-amber-50'
                  : 'bg-amber-500/15'
                : ''
            }`}
          >
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">รับ-จ่าย</span>
        </button>

        {/* 5. Family (Col 5) */}
        <button
          onClick={() => setActiveTab('family')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
            activeTab === 'family'
              ? isLight
                ? 'text-sky-600 font-bold'
                : 'text-sky-400 font-bold'
              : isLight
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'family'
                ? isLight
                  ? 'bg-sky-50'
                  : 'bg-sky-500/15'
                : ''
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">ครอบครัว</span>
        </button>
      </div>
    </nav>
  );
};
