import React from 'react';
import { MessageSquare, X } from 'lucide-react';

interface SmsToastProps {
  message: string | null;
  onClose: () => void;
}

export const SmsToast: React.FC<SmsToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <MessageSquare className="w-4 h-4" />
            <span>SMS: VM-SURAKSHA</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </div>
  );
};
