import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Calculator,
  X,
  Sparkles,
  Zap,
  TrendingDown,
  Clock,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
} from 'lucide-react';
import { DebtItem } from '../types/finance';

interface DebtCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDebt?: DebtItem;
}

export const DebtCalculatorModal: React.FC<DebtCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialDebt,
}) => {
  const { debts, theme } = useFinance();
  const isLight = theme === 'light';

  // Calculator mode:
  // 'calc_periods' = รู้ค่างวด อยากรู้ว่าจะหมดในกี่งวด
  // 'calc_payment' = รู้งวดที่ต้องการ อยากรู้ว่าต้องจ่ายงวดละเท่าไหร่
  const [calcMode, setCalcMode] = useState<'calc_periods' | 'calc_payment'>('calc_periods');

  // Input states
  const [selectedDebtId, setSelectedDebtId] = useState<string>(initialDebt?.id || 'custom');
  const [balance, setBalance] = useState<string>(
    initialDebt?.totalPrincipal ? initialDebt.totalPrincipal.toString() : '100000'
  );
  const [interestRate, setInterestRate] = useState<string>(
    initialDebt?.interestRate ? initialDebt.interestRate.toString() : '5.5'
  );
  const [monthlyPayment, setMonthlyPayment] = useState<string>(
    initialDebt?.monthlyAmount ? initialDebt.monthlyAmount.toString() : '5000'
  );
  const [targetMonths, setTargetMonths] = useState<string>('24');
  const [extraPayment, setExtraPayment] = useState<number>(0); // โปะเพิ่ม

  // Handle debt selection change
  const handleSelectDebt = (debtId: string) => {
    setSelectedDebtId(debtId);
    if (debtId === 'custom') return;
    const debt = debts.find((d) => d.id === debtId);
    if (debt) {
      if (debt.totalPrincipal) setBalance(debt.totalPrincipal.toString());
      if (debt.interestRate) setInterestRate(debt.interestRate.toString());
      setMonthlyPayment(debt.monthlyAmount.toString());
    }
  };

  // Calculations
  const results = useMemo(() => {
    const P = parseFloat(balance.replace(/,/g, '')) || 0;
    const annualRate = (parseFloat(interestRate) || 0) / 100;
    const r = annualRate / 12; // monthly rate
    const extra = extraPayment;

    if (P <= 0) return null;

    if (calcMode === 'calc_periods') {
      const basePay = parseFloat(monthlyPayment.replace(/,/g, '')) || 0;
      const totalPay = basePay + extra;

      if (totalPay <= 0) return null;

      // Check if payment covers profit rate
      const monthlyInterestOnly = P * r;
      if (totalPay <= monthlyInterestOnly && r > 0) {
        return {
          impossible: true,
          message: `ค่างวด ฿${totalPay.toLocaleString()} น้อยกว่าอัตรากำไรต่อเดือน หนี้จะไม่ลดลง`,
        };
      }

      let remainingBalance = P;
      let months = 0;
      let totalInterestPaid = 0;

      // Simulate month by month
      while (remainingBalance > 0 && months < 600) {
        months++;
        const interestThisMonth = remainingBalance * r;
        totalInterestPaid += interestThisMonth;
        const principalPaid = Math.min(totalPay - interestThisMonth, remainingBalance);
        remainingBalance -= principalPaid;
      }

      // Calculate without extra payment to show savings
      let monthsNormal = 0;
      let totalInterestNormal = 0;
      if (extra > 0 && basePay > monthlyInterestOnly) {
        let b = P;
        while (b > 0 && monthsNormal < 600) {
          monthsNormal++;
          const interestM = b * r;
          totalInterestNormal += interestM;
          const pPaid = Math.min(basePay - interestM, b);
          b -= pPaid;
        }
      }

      const years = Math.floor(months / 12);
      const remMonths = months % 12;

      return {
        impossible: false,
        months,
        years,
        remMonths,
        totalInterestPaid: Math.round(totalInterestPaid),
        totalAmountPaid: Math.round(P + totalInterestPaid),
        savedMonths: monthsNormal > months ? monthsNormal - months : 0,
        savedInterest: totalInterestNormal > totalInterestPaid ? Math.round(totalInterestNormal - totalInterestPaid) : 0,
      };
    } else {
      // Calc payment needed for target months
      const N = parseInt(targetMonths, 10) || 12;
      let requiredMonthly = 0;

      if (r === 0) {
        requiredMonthly = P / N;
      } else {
        // Amortization formula: M = P * [r(1+r)^N] / [(1+r)^N - 1]
        requiredMonthly = (P * (r * Math.pow(1 + r, N))) / (Math.pow(1 + r, N) - 1);
      }

      const totalAmountPaid = requiredMonthly * N;
      const totalInterestPaid = totalAmountPaid - P;

      return {
        impossible: false,
        requiredMonthly: Math.round(requiredMonthly),
        targetMonths: N,
        totalInterestPaid: Math.round(totalInterestPaid),
        totalAmountPaid: Math.round(totalAmountPaid),
      };
    }
  }, [balance, interestRate, monthlyPayment, targetMonths, extraPayment, calcMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">คำนวณงวดหนี้</h2>
              <p className="text-[10px] text-slate-400">ดูระยะเวลาและแผนปิดหนี้</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-3 text-xs">
          {/* Quick Select from existing debts */}
          {debts.length > 0 && (
            <div>
              <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                เลือกหนี้ในระบบ
              </label>
              <select
                value={selectedDebtId}
                onChange={(e) => handleSelectDebt(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="custom">-- ป้อนยอดเอง --</option>
                {debts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} (เดือนละ ฿{d.monthlyAmount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Switcher */}
          <div
            className={`grid grid-cols-2 gap-1 p-1 rounded-2xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <button
              onClick={() => setCalcMode('calc_periods')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                calcMode === 'calc_periods'
                  ? isLight
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              อีกกี่งวดจะหมด?
            </button>
            <button
              onClick={() => setCalcMode('calc_payment')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                calcMode === 'calc_payment'
                  ? isLight
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              อยากหมดไว จ่ายเท่าไหร่?
            </button>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                ยอดหนี้คงเหลือ (บาท)
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border font-bold text-xs focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-850 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                อัตรากำไร % ต่อปี (Profit Rate)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border font-bold text-xs focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-850 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* Mode Specific Input */}
          {calcMode === 'calc_periods' ? (
            <div>
              <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                ค่างวดที่จ่ายต่อเดือน (บาท)
              </label>
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border font-bold text-xs focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-850 border-slate-700 text-white'
                }`}
              />
            </div>
          ) : (
            <div>
              <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                จำนวนงวดที่ต้องการปิดหนี้ให้หมด
              </label>
              <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                {['12', '24', '36', '60'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMonths(m)}
                    className={`py-1 rounded-lg border text-xs font-semibold ${
                      targetMonths === m
                        ? isLight
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {m} งวด ({parseInt(m, 10) / 12} ปี)
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={targetMonths}
                onChange={(e) => setTargetMonths(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border font-bold text-xs focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-850 border-slate-700 text-white'
                }`}
                placeholder="ระบุจำนวนงวด เช่น 18"
              />
            </div>
          )}

          {/* Accelerated Payoff Simulator Slider (ลูกเล่นจำลองการโปะหนี้) */}
          {calcMode === 'calc_periods' && (
            <div
              className={`p-3 rounded-2xl border space-y-2 ${
                isLight ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ลองโปะเงินเพิ่มต่อเดือน</span>
                </span>
                <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                  +฿{extraPayment.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-1.5">
                {[0, 500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setExtraPayment(val)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      extraPayment === val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : isLight
                        ? 'bg-white text-slate-600 border-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {val === 0 ? 'ไม่โปะ' : `+${val.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Card */}
          {results && !results.impossible ? (
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-850 border-slate-750'
              }`}
            >
              <div className="text-[11px] font-semibold text-slate-400 mb-2">
                สรุปผลการคำนวณ
              </div>

              {calcMode === 'calc_periods' ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ต้องจ่ายทั้งหมด:
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-['Plus_Jakarta_Sans',sans-serif]">
                        {results.months} งวด
                      </span>
                      <span className="text-xs text-slate-500 block">
                        ({(results.years ?? 0) > 0 ? `${results.years} ปี ` : ''}
                        {(results.remMonths ?? 0) > 0 ? `${results.remMonths} เดือน` : ''})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ส่วนต่างกำไรรวม</span>
                      <span className="font-bold text-rose-500 font-['Plus_Jakarta_Sans',sans-serif]">
                        ฿{results.totalInterestPaid?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">ยอดรวมที่ต้องจ่ายจริง</span>
                      <span className="font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                        ฿{results.totalAmountPaid?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Benefit of Extra Payment */}
                  {results.savedMonths && results.savedMonths > 0 ? (
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold">
                        <Zap className="w-3.5 h-3.5 text-emerald-500" />
                        <span>หมดหนี้เร็วขึ้น {results.savedMonths} งวด!</span>
                      </span>
                      <span className="font-bold">
                        ประหยัดส่วนต่าง ฿{results.savedInterest?.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ค่างวดที่ควรจ่ายต่อเดือน:
                    </span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-['Plus_Jakarta_Sans',sans-serif]">
                      ฿{results.requiredMonthly?.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-400">/ งวด</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">กำไรรวมตลอดสัญญา</span>
                      <span className="font-bold text-rose-500 font-['Plus_Jakarta_Sans',sans-serif]">
                        ฿{results.totalInterestPaid?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">ยอดรวมทั้งหมด</span>
                      <span className="font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                        ฿{results.totalAmountPaid?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : results?.impossible ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-600">
              {results.message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
