'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ChevronDown } from 'lucide-react';

export default function UserSwitcher() {
  const { state, currentUser, switchUser } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl px-3 py-2 transition-all"
      >
        <span className="text-2xl">{currentUser.avatar}</span>
        <div className="text-left">
          <p className="text-sm font-bold text-white leading-tight">{currentUser.name}</p>
          <p className="text-xs text-gray-400">{currentUser.role === 'admin' ? 'Administrator' : `${currentUser.points} poeng`}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[180px]">
          {state.users.map(u => (
            <button
              key={u.id}
              onClick={() => { switchUser(u.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${u.id === currentUser.id ? 'bg-indigo-600/30' : ''}`}
            >
              <span className="text-2xl">{u.avatar}</span>
              <div>
                <p className="text-sm font-semibold text-white">{u.name}</p>
                <p className="text-xs text-gray-400">{u.role === 'admin' ? 'Admin' : `${u.points} ⭐`}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
