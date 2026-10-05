import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { MemberAvatarIcon } from './MemberAvatarIcon';
import {
  CalendarDays,
  Sparkles,
  Users,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  ChevronDown,
  Check,
} from 'lucide-react';

interface HeaderProps {
  isDesktopFrame: boolean;
  setIsDesktopFrame: (val: boolean) => void;
  onOpenSyncModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDesktopFrame,
  setIsDesktopFrame,
  onOpenSyncModal,
}) => {
  const {
    members,
    selectedMemberId,
    setSelectedMemberId,
    monthOffset,
    setMonthOffset,
    user,
    isLoggingIn,
    handleGoogleLogin,
    handleGoogleLogout,
    theme,
    toggleTheme,
  } = useFinance();

  const isLight = theme === 'light';
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Active member display info
  const activeMember = members.find((m) => m.id === selectedMemberId);
  const activeMemberLabel =
    selectedMemberId === 'all' ? 'ทั้งบ้าน' : activeMember?.name.split(' ')[0] || 'สมาชิก';
  const activeMemberIcon =
    selectedMemberId === 'all' ? 'users' : activeMember?.avatarIcon || 'user';

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors px-4 py-2 sm:px-6 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-800'
          : 'bg-slate-950/95 border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {/* Top Row: App Brand & Compact Utility Actions */}
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              ฿
            </div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Baiti Fin
              </h1>
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                การเงินบ้าน
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-xl border transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
              }`}
              title={isLight ? 'สลับเป็นธีมมืด' : 'สลับเป็นธีมสว่าง'}
              aria-label="เปลี่ยนธีม"
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Desktop frame preview toggle (Hidden on mobile screen) */}
            <button
              onClick={() => setIsDesktopFrame(!isDesktopFrame)}
              title="สลับมุมมองจอ"
              className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {isDesktopFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{isDesktopFrame ? 'ขยาย' : 'มือถือ'}</span>
            </button>

            {/* Google Authentication */}
            {user ? (
              <div
                className={`flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-xl border text-xs font-medium ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google'}
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[9px] font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[70px] truncate text-[10px]">
                  {user.displayName?.split(' ')[0] || 'Google'}
                </span>
                <button
                  onClick={handleGoogleLogout}
                  title="ออกจากระบบ"
                  className="p-0.5 rounded-md hover:text-rose-500 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium border transition-all ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-[10px]">{isLoggingIn ? '...' : 'ซิงค์ Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Orderly, Balanced 2-Section Filter Strip (ไม่กินขอบ ไม่ดูเยอะ) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
          {/* Section 1: Month Selector Segment (เดือนนี้ / เดือนหน้า) */}
          <div
            className={`inline-flex items-center p-0.5 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              onClick={() => setMonthOffset(0)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                monthOffset === 0
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span className="text-[11px]">เดือนนี้</span>
            </button>
            <button
              onClick={() => setMonthOffset(1)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                monthOffset === 1
                  ? isLight
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span className="text-[11px]">เดือนหน้า</span>
            </button>
          </div>

          {/* Section 2: Neat Member Selector Dropdown (กะทัดรัด ไม่ล้นขอบจอ) */}
          <div className="relative">
            <button
              onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
              title="เลือกแสดงข้อมูลตามสมาชิก"
            >
              <MemberAvatarIcon icon={activeMemberIcon} className="w-3 h-3" />
              <span className="text-[11px] font-medium">{activeMemberLabel}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                  showMemberDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {showMemberDropdown && (
              <>
                {/* Backdrop dismiss */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMemberDropdown(false)}
                />

                <div
                  className={`absolute right-0 top-full mt-1.5 z-50 w-44 rounded-2xl border shadow-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-150 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    แสดงข้อมูลการเงิน
                  </div>

                  {/* All members option */}
                  <button
                    onClick={() => {
                      setSelectedMemberId('all');
                      setShowMemberDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedMemberId === 'all'
                        ? isLight
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'bg-slate-800 text-emerald-400 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-teal-500" />
                      <span>ทั้งบ้าน (ภาพรวม)</span>
                    </div>
                    {selectedMemberId === 'all' && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  {/* Individual members */}
                  <div className="space-y-0.5">
                    {members.map((m) => {
                      const isSelected = selectedMemberId === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setShowMemberDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            isSelected
                              ? isLight
                                ? 'bg-emerald-50 text-emerald-800 font-bold'
                                : 'bg-slate-800 text-emerald-400 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MemberAvatarIcon icon={m.avatarIcon} className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{m.name}</span>
                          </div>
                          {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  {/* Manage family shortcut */}
                  <button
                    onClick={() => {
                      setShowMemberDropdown(false);
                      onOpenSyncModal();
                    }}
                    className="w-full text-left px-2.5 py-1 rounded-xl text-[11px] text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    + จัดการสมาชิกในบ้าน
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
