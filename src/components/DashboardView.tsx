import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { MemberAvatarIcon } from './MemberAvatarIcon';
import { AdvisorView } from './AdvisorView';
import { DebtCalculatorModal } from './DebtCalculatorModal';
import {
  TrendingUp,
  CreditCard,
  Wallet,
  CalendarPlus,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lightbulb,
  Calculator,
  LayoutDashboard,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: 'dashboard' | 'debts' | 'cashflow' | 'family') => void;
  onOpenAddModal: (type?: 'income' | 'debt' | 'expense') => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onShowToast,
}) => {
  const {
    activeMonthLabel,
    activeMonthKey,
    isNextMonth,
    metrics,
    filteredDebts,
    filteredIncomes,
    filteredExpenses,
    toggleDebtPaid,
    syncDebtToCalendar,
    syncAllDebtsToCalendar,
    isCalendarSyncing,
    members,
    theme,
  } = useFinance();

  const isLight = theme === 'light';
  const [subView, setSubView] = useState<'overview' | 'advisor'>('overview');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const upcomingDebts = [...filteredDebts].sort((a, b) => a.dueDay - b.dueDay);
  const currentDay = new Date().getDate();

  const handleSyncSingle = async (debtId: string, title: string) => {
    setSyncingId(debtId);
    try {
      const res = await syncDebtToCalendar(debtId);
      if (res.success) {
        onShowToast(`ตั้งเตือน "${title}" ในปฏิทินแล้ว`, 'success');
      } else {
        onShowToast(res.error || 'ไม่สามารถซิงค์ได้', 'error');
      }
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    const res = await syncAllDebtsToCalendar();
    if (res.successCount > 0) {
      onShowToast(`ตั้งเตือน ${res.successCount} รายการในปฏิทินแล้ว`, 'success');
    } else {
      onShowToast('ไม่มีรายการใหม่ที่ต้องเตือน', 'info');
    }
  };

  const memberMap = new Map(members.map((m) => [m.id, m]));

  return (
    <div className="space-y-3 pb-24">
      {/* 0. Top View Switcher (เข้ามุม เป็นระเบียบ) */}
      <div
        className={`p-1 rounded-2xl border flex items-center justify-between gap-1 shadow-2xs ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex-1 grid grid-cols-2 gap-1">
          <button
            onClick={() => setSubView('overview')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'overview'
                ? isLight
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>ภาพรวม</span>
          </button>

          <button
            onClick={() => setSubView('advisor')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'advisor'
                ? isLight
                  ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200'
                  : 'bg-emerald-500/20 text-emerald-300 shadow-xs border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
            <span>แนะนำ</span>
          </button>
        </div>

        <button
          onClick={() => setIsCalcOpen(true)}
          className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 shrink-0 ${
            isLight
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              : 'bg-indigo-950/40 text-indigo-300 border-indigo-900/50 hover:bg-indigo-900/40'
          }`}
          title="เครื่องคำนวณงวดหนี้"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="text-[11px]">คำนวณ</span>
        </button>
      </div>

      {/* Render selected view */}
      {subView === 'advisor' ? (
        <AdvisorView
          onOpenCalculator={() => setIsCalcOpen(true)}
          onShowToast={onShowToast}
        />
      ) : (
        <>
          {/* 1. Main Forecast Hero Card (เข้าใจง่าย ไม่ซับซ้อน) */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-500">
                  {isNextMonth ? 'คาดการณ์เดือนหน้า' : 'สรุปเดือนนี้'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  metrics.healthStatus === 'healthy'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : metrics.healthStatus === 'moderate'
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                }`}
              >
                {metrics.healthLabel}
              </span>
            </div>

            {/* Big Surplus */}
            <div className="mb-3">
              <div className="text-[11px] text-slate-400 font-medium">เงินเหลือ</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-3xl sm:text-4xl font-black tracking-tight font-['Plus_Jakarta_Sans',sans-serif] ${
                    metrics.netSurplus >= 0
                      ? isLight
                        ? 'text-slate-900'
                        : 'text-white'
                      : 'text-rose-500'
                  }`}
                >
                  ฿{Math.abs(metrics.netSurplus).toLocaleString()}
                </span>
                {metrics.netSurplus >= 0 ? (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" /> มีเงินเก็บ
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" /> ติดลบ
                  </span>
                )}
              </div>
            </div>

            {/* 3 Metrics Mini Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Incomes */}
              <div
                onClick={() => onNavigateTab('cashflow')}
                className={`p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-100'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>รายรับ</span>
                </div>
                <div
                  className={`text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  ฿{metrics.totalIncome.toLocaleString()}
                </div>
              </div>

              {/* Debts */}
              <div
                onClick={() => onNavigateTab('debts')}
                className={`p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-100/60'
                    : 'bg-rose-950/20 hover:bg-rose-950/40 border-rose-900/40'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-rose-500 mb-0.5">
                  <CreditCard className="w-3 h-3" />
                  <span>หนี้สิน</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 font-['Plus_Jakarta_Sans',sans-serif]">
                  ฿{metrics.totalDebts.toLocaleString()}
                </div>
              </div>

              {/* Expenses */}
              <div
                onClick={() => onNavigateTab('cashflow')}
                className={`p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-100'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
                  <Wallet className="w-3 h-3 text-amber-500" />
                  <span>ค่าใช้จ่าย</span>
                </div>
                <div
                  className={`text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  ฿{(metrics.totalFixedExpenses + metrics.totalVariableExpenses).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Minimal Debt Ratio Bar */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>หนี้เทียบรายได้</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {metrics.debtToIncomeRatio.toFixed(0)}% (
                  {metrics.debtToIncomeRatio <= 35
                    ? 'ปลอดภัย'
                    : metrics.debtToIncomeRatio <= 50
                    ? 'ปานกลาง'
                    : 'สูง'}
                  )
                </span>
              </div>
              <div
                className={`w-full h-2 rounded-full overflow-hidden flex ${
                  isLight ? 'bg-slate-100' : 'bg-slate-800'
                }`}
              >
                <div
                  style={{ width: `${Math.min(metrics.debtToIncomeRatio, 100)}%` }}
                  className={`h-full ${
                    metrics.debtToIncomeRatio <= 35
                      ? 'bg-emerald-500'
                      : metrics.debtToIncomeRatio <= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 2. Due Dates List (เข้ามุม สะอาดตา) */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">รายการต้องจ่าย</span>
                <span className="text-[11px] text-slate-400">({upcomingDebts.length})</span>
              </div>

              <button
                onClick={handleSyncAll}
                disabled={isCalendarSyncing || upcomingDebts.length === 0}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
                  isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border-teal-500/30'
                }`}
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isCalendarSyncing ? '...' : 'เตือนปฏิทิน'}</span>
              </button>
            </div>

            {upcomingDebts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">ไม่มีรายการหนี้สิน</div>
            ) : (
              <div className="space-y-2">
                {upcomingDebts.map((debt) => {
                  const isPaid = debt.paidMonths.includes(activeMonthKey);
                  const isPastDue = !isPaid && !isNextMonth && currentDay > debt.dueDay;
                  const isToday = !isPaid && !isNextMonth && currentDay === debt.dueDay;
                  const member = memberMap.get(debt.memberId);
                  const isSyncingThis = syncingId === debt.id;

                  return (
                    <div
                      key={debt.id}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                        isLight
                          ? isPaid
                            ? 'bg-slate-50 border-slate-100 opacity-60'
                            : isPastDue
                            ? 'bg-rose-50/60 border-rose-200'
                            : isToday
                            ? 'bg-amber-50/60 border-amber-200'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                          : isPaid
                          ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                          : isPastDue
                          ? 'bg-rose-950/20 border-rose-800/40'
                          : isToday
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Day & Title */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 border ${
                            isPaid
                              ? isLight
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-slate-800 text-slate-500 border-slate-700'
                              : isPastDue
                              ? 'bg-rose-500 text-white border-rose-500'
                              : isToday
                              ? 'bg-amber-500 text-white border-amber-500'
                              : isLight
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                        >
                          <span className="text-[8px] uppercase -mb-0.5">วันที่</span>
                          <span className="text-sm font-extrabold leading-none">{debt.dueDay}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`text-xs sm:text-sm font-semibold truncate ${
                                isPaid
                                  ? 'line-through text-slate-400'
                                  : isLight
                                  ? 'text-slate-900'
                                  : 'text-white'
                              }`}
                            >
                              {debt.title}
                            </span>
                            {isPaid && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-1 rounded font-semibold shrink-0">
                                จ่ายแล้ว
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            {member && (
                              <span className="flex items-center gap-1">
                                <MemberAvatarIcon icon={member.avatarIcon} className="w-3 h-3" />
                                <span>{member.name.split(' ')[0]} •</span>
                              </span>
                            )}
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              ฿{debt.monthlyAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions (เข้ามุม) */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={() => handleSyncSingle(debt.id, debt.title)}
                          disabled={isSyncingThis}
                          title={debt.calendarEventId ? 'อยู่ในปฏิทินแล้ว' : 'เตือนในปฏิทิน'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            debt.calendarEventId
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                              : isLight
                              ? 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleDebtPaid(debt.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isPaid
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[11px]">{isPaid ? 'จ่ายแล้ว' : 'จ่าย'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Debt Calculator Modal */}
      <DebtCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />
    </div>
  );
};
