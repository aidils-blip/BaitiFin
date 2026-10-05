import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { MemberAvatarIcon } from './MemberAvatarIcon';
import {
  Wallet,
  Zap,
  Utensils,
  Home,
  Car,
  GraduationCap,
  Shield,
  HeartPulse,
  ShoppingBag,
  PiggyBank,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { ExpenseCategory, ExpenseItem } from '../types/finance';

interface ExpensesViewProps {
  onOpenAddModal: (type: 'expense') => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddModal, onShowToast }) => {
  const {
    filteredExpenses,
    activeMonthKey,
    toggleExpensePaid,
    deleteExpense,
    members,
    metrics,
  } = useFinance();

  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'variable'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'utilities':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'living':
        return <Home className="w-4 h-4 text-sky-400" />;
      case 'travel':
        return <Car className="w-4 h-4 text-indigo-400" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      case 'insurance':
        return <Shield className="w-4 h-4 text-teal-400" />;
      case 'medical':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-pink-400" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4 text-emerald-400" />;
      default:
        return <Wallet className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'utilities':
        return 'ค่าน้ำ-ไฟ-เน็ต';
      case 'food':
        return 'อาหาร/กินอยู่';
      case 'living':
        return 'ของใช้ในบ้าน';
      case 'travel':
        return 'เดินทาง/น้ำมัน';
      case 'education':
        return 'การศึกษา/ลูก';
      case 'insurance':
        return 'ประกันภัย';
      case 'medical':
        return 'สุขภาพ/ยา';
      case 'shopping':
        return 'ช้อปปิ้ง/บันเทิง';
      case 'savings':
        return 'เงินออมฉุกเฉิน';
      default:
        return 'ค่าใช้จ่ายทั่วไป';
    }
  };

  const filtered = filteredExpenses.filter((e) => {
    if (filterType === 'fixed') return e.isFixed;
    if (filterType === 'variable') return !e.isFixed;
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    deleteExpense(id);
    setDeleteConfirmId(null);
    onShowToast(`ลบรายการ "${title}" แล้ว`, 'info');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Summary Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Wallet className="w-4 h-4" />
              <span>ค่าใช้จ่ายประจำ & กินอยู่</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                ฿{(metrics.totalFixedExpenses + metrics.totalVariableExpenses).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ เดือน</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>คงที่: ฿{metrics.totalFixedExpenses.toLocaleString()}</span>
              <span>•</span>
              <span>กินอยู่: ฿{metrics.totalVariableExpenses.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มค่าใช้จ่าย</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด ({filteredExpenses.length})
          </button>
          <button
            onClick={() => setFilterType('fixed')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'fixed'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ค่าใช้จ่ายคงที่ ({filteredExpenses.filter((e) => e.isFixed).length})
          </button>
          <button
            onClick={() => setFilterType('variable')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'variable'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ค่ากินอยู่/ผันแปร ({filteredExpenses.filter((e) => !e.isFixed).length})
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">ไม่พบรายการค่าใช้จ่าย</p>
          </div>
        ) : (
          filtered.map((exp) => {
            const isPaid = exp.paidMonths.includes(activeMonthKey);
            const member = memberMap.get(exp.memberId);
            const isConfirming = deleteConfirmId === exp.id;

            return (
              <div
                key={exp.id}
                className={`p-4 rounded-3xl border transition-all ${
                  isPaid
                    ? 'bg-slate-900/50 border-slate-800/60 opacity-70'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700/60 shrink-0">
                      {getCategoryIcon(exp.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-bold truncate ${
                            isPaid ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {exp.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50 font-medium">
                          {getCategoryLabel(exp.category)}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-medium border ${
                            exp.isFixed
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {exp.isFixed ? 'คงที่' : 'ผันแปร'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        {exp.dueDay && (
                          <span>ครบกำหนดวันที่ {exp.dueDay}</span>
                        )}
                        {member && (
                          <>
                            {exp.dueDay && <span>•</span>}
                            <span className="flex items-center gap-1 text-slate-300">
                              <MemberAvatarIcon icon={member.avatarIcon} className="w-3 h-3" />
                              <span>{member.name.split(' ')[0]}</span>
                            </span>
                          </>
                        )}
                      </div>
                      {exp.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 italic">"{exp.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Right side amount, check paid & delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-base sm:text-lg font-bold text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
                      ฿{exp.amount.toLocaleString()}
                    </span>

                    {/* Paid toggle */}
                    {exp.isFixed && (
                      <button
                        onClick={() => toggleExpensePaid(exp.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          isPaid
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title={isPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete */}
                    {isConfirming ? (
                      <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-800 px-2 py-1 rounded-xl text-xs">
                        <button
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
                        >
                          ลบ
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-slate-300 text-[11px]"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(exp.id)}
                        className="p-1.5 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-400 transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
