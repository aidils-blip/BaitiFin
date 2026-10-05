import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 200);
      }, toast.type === 'success' ? 2000 : 2500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  // 1. Playful Celebratory Popup for Success ("บันทึกเรียบร้อย / เสร็จสิ้น")
  if (toast.type === 'success') {
    return (
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200 cursor-pointer ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative max-w-xs w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center transition-all duration-300 transform ${
            visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'
          }`}
        >
          {/* Sparkle decorative dots */}
          <div className="absolute -top-1 -right-1 text-amber-400 animate-spin duration-1000">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute top-3 left-4 text-emerald-400 opacity-60">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          {/* Animated Green Badge */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-3 animate-bounce">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            บันทึกเรียบร้อย!
          </h3>
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
            เสร็จสิ้น อัลฮัมดุลิลลาฮ์
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-2 leading-relaxed">
            {toast.text}
          </p>

          <button
            onClick={onClose}
            className="mt-4 px-5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            ตกลง
          </button>
        </div>
      </div>
    );
  }

  // 2. Standard Compact Toast for Info & Error
  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xl border border-slate-700/60 bg-slate-900/95 text-slate-100 text-sm max-w-[90vw] transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
      <span className="font-medium text-xs truncate">{toast.text}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors ml-1 shrink-0"
        aria-label="ปิด"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
