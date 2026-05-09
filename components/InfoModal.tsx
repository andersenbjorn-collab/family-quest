'use client';
import { X, HelpCircle } from 'lucide-react';

interface InfoItem {
  icon: string;
  title: string;
  desc: string;
}

interface InfoModalProps {
  title: string;
  items: InfoItem[];
  onClose: () => void;
}

export function InfoModal({ title, items, onClose }: InfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-gray-900 rounded-t-3xl border-t border-white/10 p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-indigo-400" />
            <h2 className="text-white font-black text-lg">{title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X size={18} className="text-gray-300" />
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4 bg-white/5 rounded-2xl p-4">
              <div className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <p className="text-white font-bold text-sm">{item.title}</p>
                <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-2">Skjønt! 👍</button>
      </div>
    </div>
  );
}

interface InfoButtonProps {
  onClick: () => void;
}

export function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
      aria-label="Hjelp"
    >
      <HelpCircle size={18} className="text-gray-400" />
    </button>
  );
}
