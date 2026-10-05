import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { MemberAvatarIcon } from './MemberAvatarIcon';
import { DebtCalculatorModal } from './DebtCalculatorModal';
import {
  CreditCard,
  Home,
  Car,
  Landmark,
  Banknote,
  CalendarPlus,
  Plus,
  Trash2,
  CheckCircle2,
  Calculator,
} from 'lucide-react';
import { DebtCategory, DebtItem } from '../types/finance';

interface DebtsViewProps {
  onOpenAddModal: (type: 'debt', initialData?: DebtItem) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({ onOpenAddModal, onShowToast }) => {
  const {
    filteredDebts,
    activeMonthKey,
    toggleDebtPaid,
    deleteDebt,
    syncDebtToCalendar,
    syncAllDebtsToCalendar,
    isCalendarSyncing,
    members,
    metrics,
    theme,
  } = useFinance();

  const isLight = theme === 'light';
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcDebt, setCalcDebt] = useState<DebtItem | undefined>(undefined);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const getCategoryIcon = (cat: DebtCategory) => {
    switch (cat) {
      case 'home':
        return <Home className="w-4 h-4 text-sky-500" />;
      case 'car':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'personal_loan':
        return <Landmark className="w-4 h-4 text-rose-500" />;
      case 'student_loan':
        return <Banknote className="w-4 h-4 text-teal-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (cat: DebtCategory) => {
    switch (cat) {
      case 'home':
        return 'บ้าน';
      case 'car':
        return 'รถ';
      case 'credit_card':
        return 'บัตรเครดิต';
      case 'personal_loan':
        return 'สินเชื่อ';
      case 'student_loan':
        return 'กยศ.';
      case 'informal':
        return 'ยืมญาติ';
      default:
        return 'หนี้สิน';
    }
  };

  const handleSync = async (debt: DebtItem) => {
    setSyncingId(debt.id);
    try {
      const res = await syncDebtToCalendar(debt.id);
      if (res.success) {
        onShowToast(`ตั้งเตือน "${debt.title}" ใน Google Calendar แล้ว`, 'success');
      } else {
        onShowToast(res.error || 'ซิงค์ไม่สำเร็จ', 'error');
      }
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    const res = await syncAllDebtsToCalendar();
    if (res.successCount > 0) {
      onShowToast(`ตั้งเตือนหนี้ ${res.successCount} รายการใน Calendar เรียบร้อย`, 'success');
    } else {
      onShowToast('ไม่มีรายการใหม่ที่ซิงค์', 'info');
    }
  };

  const handleDeleteWithConfirm = (id: string, title: string) => {
    deleteDebt(id);
    setDeleteConfirmId(null);
    onShowToast(`ลบ "${title}" แล้ว`, 'info');
  };

  const totalPrincipalAll = filteredDebts.reduce((sum, d) => sum + (d.totalPrincipal || 0), 0);

  return (
    <div className="space-y-3 pb-24">
      {/* Debt Summary Header */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>หนี้สินต่อเดือน</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
                ฿{metrics.totalDebts.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">
                (DTI {metrics.debtToIncomeRatio.toFixed(0)}%)
              </span>
            </div>
            {totalPrincipalAll > 0 && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                ยอดคงเหลือรวม ฿{totalPrincipalAll.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setCalcDebt(undefined);
                setIsCalcOpen(true);
              }}
              className={`p-1.5 px-2 rounded-xl border text-xs font-semibold flex items-center gap-1 ${
                isLight
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border-indigo-900/50'
              }`}
              title="เครื่องคำนวณงวดหนี้"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="text-[11px]">คำนวณ</span>
            </button>
            <button
              onClick={handleSyncAll}
              disabled={isCalendarSyncing || filteredDebts.length === 0}
              className={`p-1.5 px-2 rounded-xl border text-xs font-semibold flex items-center gap-1 ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border-teal-500/30'
              }`}
              title="ตั้งเตือนในปฏิทินทั้งหมด"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span className="text-[11px]">เตือน</span>
            </button>
            <button
              onClick={() => onOpenAddModal('debt')}
              className="p-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[11px]">เพิ่ม</span>
            </button>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="space-y-2.5">
        {filteredDebts.length === 0 ? (
          <div
            className={`text-center py-10 rounded-2xl border text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            ไม่มีรายการหนี้สิน
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const isPaid = debt.paidMonths.includes(activeMonthKey);
            const member = memberMap.get(debt.memberId);
            const isSyncing = syncingId === debt.id;
            const isConfirmingDelete = deleteConfirmId === debt.id;

            return (
              <div
                key={debt.id}
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
                        isLight ? 'bg-slate-100' : 'bg-slate-800'
                      }`}
                    >
                      {getCategoryIcon(debt.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isPaid
                              ? 'line-through text-slate-400'
                              : isLight
                              ? 'text-slate-900'
                              : 'text-white'
                          }`}
                        >
                          {debt.title}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {getCategoryLabel(debt.category)}
                        </span>
                        {isPaid && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 px-1 rounded font-semibold shrink-0">
                            จ่ายแล้ว
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span>วันที่ {debt.dueDay}</span>
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

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans',sans-serif] block ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      ฿{debt.monthlyAmount.toLocaleString()}
                    </span>
                    {debt.totalPrincipal ? (
                      <span className="text-[10px] text-slate-400 block">
                        เหลือ ฿{debt.totalPrincipal.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSync(debt)}
                      disabled={isSyncing}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        debt.calendarEventId
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span className="text-[11px]">
                        {debt.calendarEventId ? 'ใน Calendar' : 'เตือนใน Calendar'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setCalcDebt(debt);
                        setIsCalcOpen(true);
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isLight
                          ? 'bg-slate-100 hover:bg-indigo-50 text-indigo-600 border-slate-200'
                          : 'bg-slate-800 hover:bg-indigo-950/40 text-indigo-300 border-slate-700'
                      }`}
                      title="คำนวณงวดหนี้รายการนี้"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleDebtPaid(debt.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isPaid
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[11px]">{isPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}</span>
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteWithConfirm(debt.id, debt.title)}
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
                        onClick={() => setDeleteConfirmId(debt.id)}
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

      {/* Debt Calculator Modal */}
      <DebtCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        initialDebt={calcDebt}
      />
    </div>
  );
};
