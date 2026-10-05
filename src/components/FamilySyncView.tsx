import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { MemberAvatarIcon } from './MemberAvatarIcon';
import { MemberIconType } from '../types/finance';
import {
  Users,
  Share2,
  FileSpreadsheet,
  Calendar,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface FamilySyncViewProps {
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const FamilySyncView: React.FC<FamilySyncViewProps> = ({ onShowToast }) => {
  const {
    members,
    addMember,
    removeMember,
    exportPlanToSheets,
    isExportingSheets,
    exportFamilySyncCode,
    importFamilySyncCode,
    resetAllData,
    theme,
  } = useFinance();

  const isLight = theme === 'light';

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('สมาชิก');
  const [newMemberIcon, setNewMemberIcon] = useState<MemberIconType>('user');
  const [showAddMember, setShowAddMember] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [lastSheetUrl, setLastSheetUrl] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addMember(newMemberName.trim(), newMemberRole, newMemberIcon);
    setNewMemberName('');
    setShowAddMember(false);
    onShowToast(`เพิ่ม "${newMemberName}" แล้ว`, 'success');
  };

  const handleCopyCode = () => {
    const code = exportFamilySyncCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    onShowToast('คัดลอกรหัสแล้ว ส่งให้คนในบ้านทาง Line ได้เลย', 'success');
  };

  const handleImportCode = () => {
    if (!inputCode.trim()) return;
    const success = importFamilySyncCode(inputCode.trim());
    if (success) {
      setInputCode('');
      onShowToast('ซิงค์ข้อมูลครอบครัวเรียบร้อย', 'success');
    } else {
      onShowToast('รหัสไม่ถูกต้อง', 'error');
    }
  };

  const handleExportSheets = async () => {
    const res = await exportPlanToSheets();
    if (res.success && res.url) {
      setLastSheetUrl(res.url);
      onShowToast('ส่งออก Google Sheets สำเร็จ', 'success');
    } else {
      onShowToast(res.error || 'ส่งออกไม่สำเร็จ', 'error');
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {/* 1. Members List */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs sm:text-sm font-bold">สมาชิกในบ้าน ({members.length})</h3>
          </div>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>เพิ่มคน</span>
          </button>
        </div>

        {showAddMember && (
          <form
            onSubmit={handleAddMember}
            className={`mb-3 p-3 rounded-2xl border space-y-2 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-750'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="ชื่อสมาชิก"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
                required
              />
              <input
                type="text"
                placeholder="บทบาท (เช่น ภรรยา, บุตร)"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <select
                value={newMemberIcon}
                onChange={(e) => setNewMemberIcon(e.target.value as MemberIconType)}
                className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="user">ไอคอนผู้ใช้ (ตนเอง/พ่อ)</option>
                <option value="heart">ไอคอนหัวใจ (ภรรยา/คู่ชีวิต)</option>
                <option value="home">ไอคอนบ้าน (ส่วนกลาง)</option>
                <option value="smile">ไอคอนรอยยิ้ม (ลูก/บุตร)</option>
                <option value="users">ไอคอนครอบครัว (อื่นๆ)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                บันทึก
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {members.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-800/40 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isLight ? 'bg-white border border-slate-200' : 'bg-slate-800'
                  }`}
                >
                  <MemberAvatarIcon icon={m.avatarIcon} className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span
                    className={`text-xs font-semibold block truncate ${
                      isLight ? 'text-slate-800' : 'text-white'
                    }`}
                  >
                    {m.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.roleLabel}</span>
                </div>
              </div>
              {members.length > 1 && m.id !== 'm1' && m.id !== 'm_family' && (
                <button
                  onClick={() => removeMember(m.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Google Sheets Export */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">แชร์ผ่าน Google Sheets</h4>
              <p className="text-[11px] text-slate-400">ส่งออกข้อมูลให้ทุกคนในบ้านดูผ่านลิงก์ได้</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSheets}
              disabled={isExportingSheets}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm disabled:opacity-50"
            >
              {isExportingSheets ? 'กำลังสร้าง...' : 'สร้าง Sheet'}
            </button>
            {lastSheetUrl && (
              <a
                href={lastSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50"
                title="เปิด Sheet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Family Sync Code */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isLight ? 'bg-sky-50 text-sky-600' : 'bg-sky-500/20 text-sky-400'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <h4 className="text-xs sm:text-sm font-bold truncate">ซิงค์เครื่องคนในบ้าน</h4>
              <p className="text-[11px] text-slate-400 truncate">แชร์ข้อมูลระหว่างเครื่อง</p>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700'
            }`}
            title="คัดลอกรหัสข้อมูล"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copiedCode ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
          </button>
        </div>

        {/* Import Code Input */}
        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder="วางรหัสซิงค์ที่นี่..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className={`flex-1 min-w-0 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900'
                : 'bg-slate-800 border-slate-700 text-white'
            }`}
          />
          <button
            onClick={handleImportCode}
            disabled={!inputCode.trim()}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 disabled:opacity-40"
          >
            นำเข้า
          </button>
        </div>
      </div>

      {/* 4. Reset Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => {
            if (window.confirm('ต้องการรีเซ็ตข้อมูลเริ่มต้นหรือไม่?')) {
              resetAllData();
              onShowToast('รีเซ็ตเรียบร้อย', 'info');
            }
          }}
          className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>รีเซ็ตข้อมูลตัวอย่าง</span>
        </button>
      </div>
    </div>
  );
};
