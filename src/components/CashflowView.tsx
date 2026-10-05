import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { MemberAvatarIcon } from './MemberAvatarIcon';
import {
  TrendingUp,
  Wallet,
  Briefcase,
  Laptop,
  ShoppingBag,
  Coins,
  Gift,
  Zap,
  Utensils,
  Home,
  Car,
  GraduationCap,
  Shield,
  HeartPulse,
  PiggyBank,
  Plus,
  Trash2,
  Calendar,
  Check,
} from 'lucide-react';
import { IncomeCategory, ExpenseCategory } from '../types/finance';

interface CashflowViewProps {
  initialSubTab?: 'income' | 'expense';
  onOpenAddModal: (type: 'income' | 'expense') => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const CashflowView: React.FC<CashflowViewProps> = ({
  initialSubTab = 'expense',
  onOpenAddModal,
  onShowToast,
}) => {
  const {
    filteredIncomes,
    filteredExpenses,
    activeMonthKey,
    toggleExpensePaid,
    deleteIncome,
    deleteExpense,
    members,
    metrics,
    theme,
  } = useFinance();

  const isLight = theme === 'light';
  const [subTab, setSubTab] = useState<'expense' | 'income'>(initialSubTab);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const getIncomeCategoryIcon = (cat: IncomeCategory) => {
    switch (cat) {
      case 'salary':
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case 'freelance':
        return <Laptop className="w-4 h-4 text-sky-500" />;
      case 'business':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case 'investment':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-rose-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-teal-500" />;
    }
  };

  const getExpenseCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'utilities':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-emerald-500" />;
      case 'living':
        return <Home className="w-4 h-4 text-sky-500" />;
      case 'travel':
        return <Car className="w-4 h-4 text-indigo-500" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case 'insurance':
        return <Shield className="w-4 h-4 text-teal-500" />;
      case 'medical':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-pink-500" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4 text-emerald-500" />;
      default:
        return <Wallet className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleDeleteIncome = (id: string, title: string) => {
    deleteIncome(id);
    setDeleteConfirmId(null);
    onShowToast(`ลบรายการ "${title}" แล้ว`, 'info');
  };

  const handleDeleteExpense = (id: string, title: string) => {
    deleteExpense(id);
    setDeleteConfirmId(null);
    onShowToast(`ลบรายการ "${title}" แล้ว`, 'info');
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* 1. Header Segmented Switcher */}
      <div
        className={`p-1.5 rounded-2xl border flex items-center justify-between gap-2 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setSubTab('expense')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-w-0 ${
              subTab === 'expense'
                ? isLight
                  ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-200/80'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">ค่าใช้จ่าย</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
              (฿{(metrics.totalFixedExpenses + metrics.totalVariableExpenses).toLocaleString()})
            </span>
          </button>

          <button
            onClick={() => setSubTab('income')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-w-0 ${
              subTab === 'income'
                ? isLight
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200/80'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">รายรับ</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
              (฿{metrics.totalIncome.toLocaleString()})
            </span>
          </button>
        </div>

        <button
          onClick={() => onOpenAddModal(subTab)}
          className="p-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-2xs flex items-center gap-1 font-bold text-xs"
          title={`เพิ่ม${subTab === 'income' ? 'รายรับ' : 'ค่าใช้จ่าย'}`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="text-[11px]">เพิ่ม</span>
        </button>
      </div>

      {/* 2. List Items */}
      {subTab === 'expense' ? (
        <div className="space-y-2.5">
          {filteredExpenses.length === 0 ? (
            <div
              className={`text-center py-10 rounded-2xl border text-xs ${
                isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              ไม่มีรายการค่าใช้จ่าย
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const isPaid = exp.paidMonths.includes(activeMonthKey);
              const member = memberMap.get(exp.memberId);
              const isConfirming = deleteConfirmId === exp.id;

              return (
                <div
                  key={exp.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight
                      ? isPaid
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : isPaid
                      ? 'bg-slate-900/50 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {getExpenseCategoryIcon(exp.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isPaid
                                ? 'line-through text-slate-400'
                                : isLight
                                ? 'text-slate-800'
                                : 'text-slate-100'
                            }`}
                          >
                            {exp.title}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ${
                              exp.isFixed
                                ? isLight
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-sky-500/20 text-sky-300'
                              : isLight
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {exp.isFixed ? 'คงที่' : 'กินอยู่'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          {exp.dueDay && <span>วันที่ {exp.dueDay}</span>}
                          {member && (
                            <>
                              {exp.dueDay && <span>•</span>}
                              <span className="flex items-center gap-1">
                                <MemberAvatarIcon icon={member.avatarIcon} className="w-3 h-3" />
                                <span>{member.name.split(' ')[0]}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                          isLight ? 'text-slate-900' : 'text-slate-100'
                        }`}
                      >
                        ฿{exp.amount.toLocaleString()}
                      </span>

                      {exp.isFixed && (
                        <button
                          onClick={() => toggleExpensePaid(exp.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isPaid
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : isLight
                              ? 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          title={isPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteExpense(exp.id, exp.title)}
                            className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold text-[10px]"
                          >
                            ลบ
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] text-slate-400"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredIncomes.length === 0 ? (
            <div
              className={`text-center py-10 rounded-2xl border text-xs ${
                isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              ไม่มีข้อมูลรายรับ
            </div>
          ) : (
            filteredIncomes.map((inc) => {
              const member = memberMap.get(inc.memberId);
              const isConfirming = deleteConfirmId === inc.id;

              return (
                <div
                  key={inc.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        {getIncomeCategoryIcon(inc.category)}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isLight ? 'text-slate-800' : 'text-slate-100'
                          }`}
                        >
                          {inc.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span>วันที่ {inc.expectedDay}</span>
                          {member && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MemberAvatarIcon icon={member.avatarIcon} className="w-3 h-3" />
                                <span>{member.name.split(' ')[0]}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm sm:text-base font-bold text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">
                        +฿{inc.amount.toLocaleString()}
                      </span>

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteIncome(inc.id, inc.title)}
                            className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold text-[10px]"
                          >
                            ลบ
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] text-slate-400"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(inc.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
