import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isInfo = toast.type === 'info' || toast.type === 'coming_soon';
  const isError = toast.type === 'error' || toast.type === 'warning';

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 w-[92%] max-w-[440px] z-[999999] animate-in fade-in slide-in-from-top-3 duration-200 select-none">
      <div className="bg-white rounded-[6px] shadow-[0_6px_20px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden">
        {/* Content Row */}
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            {/* Info i / Red ! / Green check circle */}
            {isInfo ? (
              <div className="w-5 h-5 rounded-full bg-[#007bff] flex items-center justify-center text-white shrink-0 shadow-2xs font-extrabold text-[12.5px] italic font-serif leading-none">
                i
              </div>
            ) : isError ? (
              <div className="w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center text-white shrink-0 shadow-2xs font-bold text-xs">
                !
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-white stroke-[3]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
            <span className="text-[13.5px] font-bold text-gray-800 tracking-tight">
              {toast.message}
            </span>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer transition-colors"
            aria-label="Close notification"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* 4-Second Progress Bar */}
        <div className="w-full bg-gray-100 h-[3.5px] overflow-hidden">
          <div
            key={toast.id || Date.now()}
            className={`h-full ${isInfo ? 'bg-[#007bff]' : isError ? 'bg-[#ef4444]' : 'bg-[#22c55e]'} animate-toast-progress`}
          />
        </div>
      </div>
    </div>
  );
}
