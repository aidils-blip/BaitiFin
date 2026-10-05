import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  CreditCard,
  PiggyBank,
  HeartHandshake,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Calculator,
  Compass,
} from 'lucide-react';

interface AdvisorViewProps {
  onOpenCalculator: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdvisorView: React.FC<AdvisorViewProps> = ({
  onOpenCalculator,
}) => {
  const { metrics, filteredDebts, filteredExpenses, theme } = useFinance();
  const isLight = theme === 'light';

  // 1. Health Score (0 - 100)
  const healthScore = useMemo(() => {
    let score = 50;

    // DTI factor
    if (metrics.debtToIncomeRatio <= 25) score += 30;
    else if (metrics.debtToIncomeRatio <= 35) score += 20;
    else if (metrics.debtToIncomeRatio <= 45) score += 5;
    else if (metrics.debtToIncomeRatio <= 55) score -= 15;
    else score -= 30;

    // Surplus factor
    const surplusRate = metrics.totalIncome > 0 ? (metrics.netSurplus / metrics.totalIncome) * 100 : 0;
    if (surplusRate >= 20) score += 25;
    else if (surplusRate >= 10) score += 15;
    else if (surplusRate >= 0) score += 5;
    else score -= 30;

    // Has savings
    const hasSavings = filteredExpenses.some((e) => e.category === 'savings' && e.amount > 0);
    if (hasSavings) score += 10;

    return Math.min(Math.max(score, 10), 100);
  }, [metrics, filteredExpenses]);

  // 2. Simple 4 Buckets
  const incomeTotal = metrics.totalIncome || 1;

  const buckets = useMemo(() => {
    const recommended = {
      debts: incomeTotal * 0.50,
      savings: incomeTotal * 0.10,
      living: incomeTotal * 0.20,
      family: incomeTotal * 0.20,
    };

    const actualDebts = metrics.totalDebts + metrics.totalFixedExpenses;
    const actualSavings = filteredExpenses
      .filter((e) => e.category === 'savings')
      .reduce((s, e) => s + e.amount, 0);
    const actualLiving = filteredExpenses
      .filter((e) => e.category === 'food' || e.category === 'utilities' || e.category === 'living')
      .reduce((s, e) => s + e.amount, 0);
    const actualFamily = filteredExpenses
      .filter((e) => e.category === 'education' || e.category === 'insurance' || e.category === 'shopping' || e.category === 'travel' || e.category === 'other')
      .reduce((s, e) => s + e.amount, 0);

    return [
      {
        id: 'debts',
        title: 'หนี้ & ค่าบ้านรถ',
        targetPercent: 50,
        targetAmount: Math.round(recommended.debts),
        actualAmount: actualDebts,
        actualPercent: Math.round((actualDebts / incomeTotal) * 100),
        isOver: actualDebts > recommended.debts,
        icon: <CreditCard className="w-3.5 h-3.5 text-rose-500" />,
      },
      {
        id: 'savings',
        title: 'เงินออม',
        targetPercent: 10,
        targetAmount: Math.round(recommended.savings),
        actualAmount: actualSavings,
        actualPercent: Math.round((actualSavings / incomeTotal) * 100),
        isOver: false,
        icon: <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />,
      },
      {
        id: 'living',
        title: 'กินอยู่ & ค่าใช้จ่ายในบ้าน',
        targetPercent: 20,
        targetAmount: Math.round(recommended.living),
        actualAmount: actualLiving,
        actualPercent: Math.round((actualLiving / incomeTotal) * 100),
        isOver: actualLiving > recommended.living,
        icon: <Coffee className="w-3.5 h-3.5 text-amber-500" />,
      },
      {
        id: 'family',
        title: 'ซะกาต บริจาค & ครอบครัว',
        targetPercent: 20,
        targetAmount: Math.round(recommended.family),
        actualAmount: actualFamily,
        actualPercent: Math.round((actualFamily / incomeTotal) * 100),
        isOver: actualFamily > recommended.family,
        icon: <HeartHandshake className="w-3.5 h-3.5 text-sky-500" />,
      },
    ];
  }, [incomeTotal, metrics, filteredExpenses]);

  // 3. Short & Practical Advice (No long essays)
  const shortTips = useMemo(() => {
    const tips: { title: string; ok: boolean }[] = [];

    if (metrics.netSurplus < 0) {
      tips.push({
        title: `เดือนนี้ติดลบ ฿${Math.abs(metrics.netSurplus).toLocaleString()} ให้ลดค่ากินอยู่นอกบ้านก่อน`,
        ok: false,
      });
    } else {
      tips.push({
        title: `เดือนนี้เหลือเก็บ ฿${metrics.netSurplus.toLocaleString()} แนะนำแบ่งเข้าบัญชีเงินออมทันที`,
        ok: true,
      });
    }

    if (metrics.debtToIncomeRatio > 40) {
      const highestDebt = [...filteredDebts].sort((a, b) => b.monthlyAmount - a.monthlyAmount)[0];
      tips.push({
        title: `ภาระหนี้ค่อนข้างสูง (${metrics.debtToIncomeRatio.toFixed(0)}%) แนะนำรีบปิดยอด "${highestDebt?.title || 'หนี้ก้อนเล็ก'}" ก่อน`,
        ok: false,
      });
    } else {
      tips.push({
        title: `ภาระหนี้ปลอดภัยดี (${metrics.debtToIncomeRatio.toFixed(0)}%) ไม่เกินครึ่งหนึ่งของรายได้`,
        ok: true,
      });
    }

    const emergencyTarget = (metrics.totalDebts + metrics.totalFixedExpenses) * 3;
    tips.push({
      title: `เป้าหมายเงินสำรองของบ้าน: ควรมีติดบัญชีไว้ ฿${emergencyTarget.toLocaleString()} (เผื่อ 3 เดือน)`,
      ok: true,
    });

    return tips;
  }, [metrics, filteredDebts]);

  return (
    <div className="space-y-3 pb-24">
      {/* 1. Health Score Card (Clean & Compact) */}
      <div
        className={`p-3.5 sm:p-4 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Compass className="w-3.5 h-3.5" />
              <span>สุขภาพการเงิน</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans',sans-serif]">
                {healthScore}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              <span
                className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  healthScore >= 75
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : healthScore >= 50
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                }`}
              >
                {healthScore >= 75 ? 'มั่นคงดี' : healthScore >= 50 ? 'พอไหว' : 'ตึงตัว'}
              </span>
            </div>
          </div>

          {/* Corner button */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shrink-0 shadow-2xs"
            title="เครื่องคำนวณงวดหนี้"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="text-[11px]">คำนวณหนี้</span>
          </button>
        </div>

        {/* Minimal Bar */}
        <div className="mt-2.5">
          <div
            className={`w-full h-2 rounded-full overflow-hidden flex ${
              isLight ? 'bg-slate-100' : 'bg-slate-800'
            }`}
          >
            <div
              style={{ width: `${healthScore}%` }}
              className={`h-full transition-all duration-500 ${
                healthScore >= 75
                  ? 'bg-emerald-500'
                  : healthScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 2. Simple 4 Income Buckets */}
      <div
        className={`p-3.5 sm:p-4 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold">แบ่งเก็บตามรายได้ (รายรับ ฿{incomeTotal.toLocaleString()})</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {buckets.map((b) => (
            <div
              key={b.id}
              className={`p-2.5 rounded-2xl border transition-all ${
                isLight ? 'bg-slate-50/80 border-slate-200/70' : 'bg-slate-850 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`p-1 rounded-lg ${
                      isLight ? 'bg-white' : 'bg-slate-800'
                    }`}
                  >
                    {b.icon}
                  </div>
                  <span className="text-xs font-semibold truncate">{b.title}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                    ฿{b.actualAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    (เป้า ฿{b.targetAmount.toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Mini progress */}
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden flex ${
                  isLight ? 'bg-slate-200' : 'bg-slate-700'
                }`}
              >
                <div
                  style={{ width: `${Math.min(b.actualPercent, 100)}%` }}
                  className={`h-full ${
                    b.isOver ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Short 3 Tips (Easy, No Essay) */}
      <div
        className={`p-3.5 sm:p-4 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-1.5 mb-2.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <h3 className="text-xs font-bold">คำแนะนำสรุป 3 ข้อ</h3>
        </div>

        <div className="space-y-1.5">
          {shortTips.map((tip, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                tip.ok
                  ? isLight
                    ? 'bg-emerald-50/50 border-emerald-100 text-slate-700'
                    : 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
                  : isLight
                  ? 'bg-amber-50/50 border-amber-100 text-slate-700'
                  : 'bg-amber-950/20 border-amber-900/40 text-slate-300'
              }`}
            >
              {tip.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className="leading-snug">{tip.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
