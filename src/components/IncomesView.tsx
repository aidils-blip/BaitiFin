import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { MemberAvatarIcon } from './MemberAvatarIcon';
import {
  TrendingUp,
  Briefcase,
  Laptop,
  ShoppingBag,
  Coins,
  Gift,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { IncomeCategory, IncomeItem } from '../types/finance';

interface IncomesViewProps {
  onOpenAddModal: (type: 'income') => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const IncomesView: React.FC<IncomesViewProps> = ({ onOpenAddModal, onShowToast }) => {
  const { filteredIncomes, deleteIncome, members, metrics } = useFinance();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const getCategoryIcon = (cat: IncomeCategory) => {
    switch (cat) {
      case 'salary':
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case 'freelance':
        return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'business':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 'investment':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-rose-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-teal-400" />;
    }
  };

  const getCategoryLabel = (cat: IncomeCategory) => {
    switch (cat) {
      case 'salary':
        return 'เงินเดือนประจำ';
      case 'freelance':
        return 'ฟรีแลนซ์/งานนอก';
      case 'business':
        return 'ธุรกิจ/ค้าขาย';
      case 'investment':
        return 'ปันผล/การลงทุน';
      case 'bonus':
        return 'โบนัส/คอมมิชชั่น';
      default:
        return 'รายได้อื่นๆ';
    }
  };

  const handleDelete = (id: string, title: string) => {
    deleteIncome(id);
    setDeleteConfirmId(null);
    onShowToast(`ลบรายการ "${title}" แล้ว`, 'info');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Summary Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>ช่องทางรายได้ของครอบครัว</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                ฿{metrics.totalIncome.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ เดือน</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              รวมทั้งหมด {filteredIncomes.length} ช่องทาง
            </p>
          </div>

          <button
            onClick={() => onOpenAddModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มช่องทางรายได้</span>
          </button>
        </div>
      </div>

      {/* Income List */}
      <div className="space-y-3">
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">ยังไม่มีข้อมูลรายได้</p>
            <p className="text-xs text-slate-500 mt-1">กดปุ่ม "เพิ่มช่องทางรายได้" เพื่อเพิ่มเงินเดือนหรืองานเสริม</p>
          </div>
        ) : (
          filteredIncomes.map((inc) => {
            const member = memberMap.get(inc.memberId);
            const isConfirming = deleteConfirmId === inc.id;

            return (
              <div
                key={inc.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700/60 shrink-0">
                      {getCategoryIcon(inc.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{inc.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50 font-medium">
                          {getCategoryLabel(inc.category)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>คาดการณ์เข้าวันที่ {inc.expectedDay}</span>
                        </span>
                        {member && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <MemberAvatarIcon icon={member.avatarIcon} className="w-3 h-3" />
                              <span>{member.name.split(' ')[0]}</span>
                            </span>
                          </>
                        )}
                      </div>
                      {inc.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 italic">"{inc.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Right side amount & delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base sm:text-lg font-bold text-emerald-400 font-['Plus_Jakarta_Sans',sans-serif]">
                      +฿{inc.amount.toLocaleString()}
                    </span>

                    {isConfirming ? (
                      <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-800 px-2 py-1 rounded-xl text-xs">
                        <button
                          onClick={() => handleDelete(inc.id, inc.title)}
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
                        onClick={() => setDeleteConfirmId(inc.id)}
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
