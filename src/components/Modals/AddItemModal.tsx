import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X } from 'lucide-react';
import { DebtCategory, ExpenseCategory, IncomeCategory } from '../../types/finance';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'debt' | 'expense';
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'debt',
  onShowToast,
}) => {
  const { members, addIncome, addDebt, addExpense, theme } = useFinance();
  const isLight = theme === 'light';

  const [tabType, setTabType] = useState<'debt' | 'income' | 'expense'>(defaultType);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || 'm1');
  const [notes, setNotes] = useState('');

  const [debtCategory, setDebtCategory] = useState<DebtCategory>('home');
  const [dueDay, setDueDay] = useState('5');
  const [totalPrincipal, setTotalPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');

  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('salary');
  const [expectedDay, setExpectedDay] = useState('28');

  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('utilities');
  const [isFixed, setIsFixed] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      onShowToast('กรุณากรอกชื่อและจำนวนเงินให้ถูกต้อง', 'error');
      return;
    }

    if (tabType === 'debt') {
      const dayNum = parseInt(dueDay, 10) || 1;
      const principalNum = totalPrincipal ? parseFloat(totalPrincipal.replace(/,/g, '')) : undefined;
      const rateNum = interestRate ? parseFloat(interestRate) : undefined;

      addDebt({
        title: title.trim(),
        monthlyAmount: numAmount,
        totalPrincipal: principalNum,
        interestRate: rateNum,
        dueDay: Math.min(Math.max(dayNum, 1), 31),
        category: debtCategory,
        memberId: selectedMemberId,
        reminderDaysBefore: 1,
        notes: notes.trim() || undefined,
      });
      onShowToast(`เพิ่มหนี้สิน "${title}" แล้ว`, 'success');
    } else if (tabType === 'income') {
      const expDayNum = parseInt(expectedDay, 10) || 28;
      addIncome({
        title: title.trim(),
        amount: numAmount,
        category: incomeCategory,
        memberId: selectedMemberId,
        expectedDay: Math.min(Math.max(expDayNum, 1), 31),
        isRecurring: true,
        notes: notes.trim() || undefined,
      });
      onShowToast(`เพิ่มรายรับ "${title}" แล้ว`, 'success');
    } else {
      const expDueDay = dueDay ? parseInt(dueDay, 10) : undefined;
      addExpense({
        title: title.trim(),
        amount: numAmount,
        category: expenseCategory,
        isFixed,
        dueDay: expDueDay,
        memberId: selectedMemberId,
        notes: notes.trim() || undefined,
      });
      onShowToast(`เพิ่มค่าใช้จ่าย "${title}" แล้ว`, 'success');
    }

    setTitle('');
    setAmount('');
    setNotes('');
    setTotalPrincipal('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div
            className={`flex items-center gap-1 p-1 rounded-2xl ${
              isLight ? 'bg-slate-100' : 'bg-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => setTabType('debt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tabType === 'debt'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              หนี้สิน
            </button>
            <button
              type="button"
              onClick={() => setTabType('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tabType === 'expense'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              ค่าใช้จ่าย
            </button>
            <button
              type="button"
              onClick={() => setTabType('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tabType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              รายรับ
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 text-xs">
          {/* Title */}
          <div>
            <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
              ชื่อรายการ
            </label>
            <input
              type="text"
              required
              placeholder={
                tabType === 'debt'
                  ? 'เช่น ผ่อนบ้าน, ผ่อนรถ, บัตร KTC'
                  : tabType === 'income'
                  ? 'เช่น เงินเดือน, งานเสริม'
                  : 'เช่น ค่าน้ำไฟ, ประกัน'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
              จำนวนเงิน (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ฿
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-7 pr-3 py-2 rounded-xl border font-bold text-base focus:outline-none font-['Plus_Jakarta_Sans',sans-serif] ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                    : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Member */}
          <div>
            <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
              สมาชิก
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.roleLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Fields by tab */}
          {tabType === 'debt' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  ประเภท
                </label>
                <select
                  value={debtCategory}
                  onChange={(e) => setDebtCategory(e.target.value as DebtCategory)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="home">ผ่อนบ้าน</option>
                  <option value="car">ผ่อนรถ</option>
                  <option value="credit_card">บัตรเครดิต</option>
                  <option value="personal_loan">สินเชื่อ</option>
                  <option value="student_loan">กยศ.</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  วันครบกำหนด (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          )}

          {tabType === 'expense' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  ประเภท
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="utilities">ค่าน้ำ-ไฟ-เน็ต</option>
                  <option value="food">อาหาร/กินอยู่</option>
                  <option value="living">ของใช้ในบ้าน</option>
                  <option value="travel">เดินทาง/น้ำมัน</option>
                  <option value="insurance">ประกันภัย</option>
                  <option value="education">การศึกษา/ลูก</option>
                  <option value="savings">เงินออมฉุกเฉิน</option>
                  <option value="shopping">ช้อปปิ้ง/อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  ลักษณะ
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setIsFixed(true)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-colors ${
                      isFixed
                        ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                    }`}
                  >
                    คงที่
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFixed(false)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-colors ${
                      !isFixed
                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                    }`}
                  >
                    ผันแปร
                  </button>
                </div>
              </div>
            </div>
          )}

          {tabType === 'income' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  หมวดหมู่
                </label>
                <select
                  value={incomeCategory}
                  onChange={(e) => setIncomeCategory(e.target.value as IncomeCategory)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="salary">เงินเดือน</option>
                  <option value="freelance">งานเสริม</option>
                  <option value="business">ธุรกิจ</option>
                  <option value="investment">ปันผล</option>
                  <option value="bonus">โบนัส</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  วันที่เข้า (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={expectedDay}
                  onChange={(e) => setExpectedDay(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
