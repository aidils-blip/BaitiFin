import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DebtsView } from './components/DebtsView';
import { CashflowView } from './components/CashflowView';
import { FamilySyncView } from './components/FamilySyncView';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { AddItemModal } from './components/Modals/AddItemModal';
import { Toast, ToastMessage } from './components/Toast';
import {
  LayoutDashboard,
  CreditCard,
  ArrowUpDown,
  Users,
  Plus,
} from 'lucide-react';

function AppContent() {
  const { theme } = useFinance();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDesktopFrame, setIsDesktopFrame] = useState(false); // false = responsive wide, true = mobile simulator

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'debt' | 'income' | 'expense'>('debt');

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  const handleOpenAddModal = (type: 'debt' | 'income' | 'expense' = 'debt') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900'
          : 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white'
      }`}
    >
      {/* Top Header */}
      <Header
        isDesktopFrame={isDesktopFrame}
        setIsDesktopFrame={setIsDesktopFrame}
        onOpenSyncModal={() => setActiveTab('family')}
      />

      {/* Main Container */}
      <div className="flex-1 w-full flex justify-center">
        <div
          className={`w-full transition-all duration-300 ${
            isDesktopFrame
              ? `max-w-md my-4 border rounded-3xl shadow-2xl overflow-hidden ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                }`
              : 'max-w-3xl px-4 sm:px-6 py-3.5'
          }`}
        >
          {/* Desktop Tab Bar (Shown on wide computer screens) */}
          <div className="hidden md:flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div
              className={`flex items-center gap-1 p-1 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-200'
                      : 'bg-emerald-500 text-slate-950'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>ภาพรวม</span>
              </button>

              <button
                onClick={() => setActiveTab('debts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'debts'
                    ? isLight
                      ? 'bg-rose-50 text-rose-800 shadow-2xs border border-rose-200'
                      : 'bg-rose-500 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>หนี้สิน</span>
              </button>

              <button
                onClick={() => setActiveTab('cashflow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'cashflow'
                    ? isLight
                      ? 'bg-amber-50 text-amber-800 shadow-2xs border border-amber-200'
                      : 'bg-amber-500 text-slate-950'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>รับ-จ่าย</span>
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'family'
                    ? isLight
                      ? 'bg-sky-50 text-sky-800 shadow-2xs border border-sky-200'
                      : 'bg-sky-500 text-slate-950'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ครอบครัว</span>
              </button>
            </div>

            <button
              onClick={() => handleOpenAddModal('debt')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>เพิ่มรายการ</span>
            </button>
          </div>

          {/* Active View */}
          <main className="pt-1">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenAddModal={handleOpenAddModal}
                onShowToast={showToast}
              />
            )}
            {activeTab === 'debts' && (
              <DebtsView
                onOpenAddModal={() => handleOpenAddModal('debt')}
                onShowToast={showToast}
              />
            )}
            {activeTab === 'cashflow' && (
              <CashflowView
                onOpenAddModal={handleOpenAddModal}
                onShowToast={showToast}
              />
            )}
            {activeTab === 'family' && <FamilySyncView onShowToast={showToast} />}
          </main>
        </div>
      </div>

      {/* Symmetrical Mobile Bottom Navigation Bar (5-grid with [+] dead-center) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => handleOpenAddModal('debt')}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultType={addModalType}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
