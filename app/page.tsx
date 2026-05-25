'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Settings, X, Delete } from 'lucide-react';
import ThemeBg from '@/components/ThemeBg';

export default function SelectUserPage() {
  const { state, switchUser } = useApp();
  const router = useRouter();

  const children = state.users.filter(u => u.role === 'child');
  const admins   = state.users.filter(u => u.role === 'admin');
  const today    = new Date().toDateString();
  const todayDOW = new Date().getDay();

  // PIN modal state
  const [pinTarget, setPinTarget] = useState<{ userId: string; goAdmin: boolean; name: string; avatar: string; color: string } | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const getStats = (userId: string) => {
    const assigned = state.tasks.filter(t =>
      t.isActive &&
      t.assignedTo.includes(userId) &&
      t.frequency === 'daily' &&
      (!t.daysOfWeek || t.daysOfWeek.includes(todayDOW))
    );
    const doneToday = new Set(
      state.completedTasks
        .filter(c =>
          c.userId === userId &&
          new Date(c.completedAt).toDateString() === today &&
          (c.status === 'approved' || c.status === 'pending')
        )
        .map(c => c.taskId)
    );
    const todo = assigned.filter(t => !doneToday.has(t.id)).length;
    const done = assigned.filter(t =>  doneToday.has(t.id)).length;
    return { todo, done, total: assigned.length };
  };

  const proceed = (userId: string, goAdmin = false) => {
    switchUser(userId);
    router.push(goAdmin ? '/admin' : '/tasks');
  };

  const handleSelect = (userId: string, goAdmin = false) => {
    const user = state.users.find(u => u.id === userId);
    if (user?.pin) {
      setPinTarget({ userId, goAdmin, name: user.name, avatar: user.avatar, color: user.color });
      setPinInput('');
      setPinError(false);
    } else {
      proceed(userId, goAdmin);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (!pinTarget) return;
    const next = pinInput + digit;
    setPinInput(next);
    setPinError(false);
    if (next.length === 4) {
      const user = state.users.find(u => u.id === pinTarget.userId);
      if (user?.pin === next) {
        setPinTarget(null);
        proceed(pinTarget.userId, pinTarget.goAdmin);
      } else {
        setPinError(true);
        setTimeout(() => setPinInput(''), 600);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinInput(p => p.slice(0, -1));
    setPinError(false);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pt-12 pb-10 relative overflow-hidden">
      {/* Animated theme background */}
      <ThemeBg theme={state.homeTheme} />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 drop-shadow-lg">🎮</div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Family Quest</h1>
          <p className="text-gray-300 mt-2 text-lg drop-shadow">Hvem er du?</p>
        </div>

        {/* Children cards */}
        <div className={`grid gap-4 relative ${children.length === 1 ? 'grid-cols-1 max-w-xs mx-auto w-full' : 'grid-cols-2'}`}>
          {children.map((user) => {
            const { todo, done, total } = getStats(user.id);
            const allDone = total > 0 && todo === 0;
            const color = user.color ?? '#6366f1';
            const isLittle = user.ageGroup === 'little';

            return (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id)}
                className="relative rounded-3xl flex flex-col items-center active:scale-95 transition-all duration-150 overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${color}18 0%, rgba(15,15,30,0.85) 100%)`,
                  border: `2px solid ${allDone ? color + 'cc' : color + '44'}`,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  padding: isLittle ? '28px 16px' : '20px 16px',
                  boxShadow: allDone ? `0 0 20px ${color}44` : undefined,
                }}
              >
                {/* Glow when all done */}
                {allDone && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
                )}

                {/* Lock icon if PIN */}
                {user.pin && (
                  <span className="absolute top-2 left-3 text-base opacity-50">🔒</span>
                )}

                {/* Task count badge */}
                {todo > 0 && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 shadow-lg">
                    {todo}
                  </span>
                )}
                {allDone && (
                  <span className="absolute top-3 right-3 text-xl drop-shadow">✅</span>
                )}

                {/* Avatar */}
                {user.photoData ? (
                  <img src={user.photoData} alt={user.name} className="rounded-full object-cover mb-3"
                    style={{ width: isLittle ? 100 : 80, height: isLittle ? 100 : 80, border: `3px solid ${color}` }} />
                ) : (
                  <div className="rounded-full flex items-center justify-center mb-3"
                    style={{ width: isLittle ? 100 : 80, height: isLittle ? 100 : 80, fontSize: isLittle ? 56 : 44, background: `${color}25`, border: `3px solid ${color}70` }}>
                    {user.avatar}
                  </div>
                )}

                {/* Name */}
                <p className={`text-white font-black text-center leading-tight mb-1 drop-shadow ${isLittle ? 'text-2xl' : 'text-lg'}`}>
                  {user.name}
                </p>

                {/* Today progress */}
                {isLittle ? (
                  // Little children: simple big emoji status
                  <div className="mt-2 text-center">
                    {total === 0 ? <span className="text-4xl">😴</span>
                      : allDone ? <span className="text-4xl">🌟</span>
                      : <span className="text-3xl">{todo > 0 ? '⚡'.repeat(Math.min(todo, 3)) : '✅'}</span>}
                    {todo > 0 && total > 0 && (
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mt-2">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(done / total) * 100}%`, background: color }} />
                      </div>
                    )}
                  </div>
                ) : total === 0 ? (
                  <p className="text-gray-400 text-xs">Ingen oppgaver i dag</p>
                ) : allDone ? (
                  <p className="text-emerald-400 text-xs font-bold">Alt gjort! 🌟</p>
                ) : (
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{done}/{total} gjort</span>
                      <span className="font-bold" style={{ color }}>{todo} igjen</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(done / total) * 100}%`, background: color }} />
                    </div>
                  </div>
                )}

                {!isLittle && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: `${color}CC` }}>
                    {user.points} ⭐
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {children.length === 0 && (
          <div className="text-center py-10">
            <p className="text-5xl mb-3">👨‍👩‍👧</p>
            <p className="text-gray-300 font-bold">Ingen barn lagt til enda</p>
            <p className="text-gray-500 text-sm mt-1">Gå til Foreldrekontroll for å starte</p>
          </div>
        )}

        {/* Foreldrekontroll */}
        <div className="mt-auto pt-8 flex justify-center">
          <button
            onClick={() => {
              const admin = admins[0];
              if (admin) handleSelect(admin.id, true);
              else handleSelect(state.users[0]?.id ?? '', true);
            }}
            className="flex items-center gap-2 border text-gray-400 hover:text-gray-200 text-sm font-semibold px-6 py-3 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
          >
            <Settings size={16} /> Foreldrekontroll
          </button>
        </div>
      </div>

      {/* PIN modal */}
      {pinTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setPinTarget(null)}>
          <div
            className="w-full max-w-sm rounded-t-3xl p-6 pb-8"
            style={{ background: 'linear-gradient(160deg, #12122a 0%, #0a0a1a 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{pinTarget.avatar}</span>
                <div>
                  <p className="text-white font-black text-lg">{pinTarget.name}</p>
                  <p className="text-gray-500 text-sm">Skriv inn PIN-kode</p>
                </div>
              </div>
              <button onClick={() => setPinTarget(null)} className="bg-white/10 p-2 rounded-xl">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full transition-all duration-150"
                  style={{
                    background: pinError
                      ? '#ef4444'
                      : i < pinInput.length
                        ? (pinTarget.color ?? '#6366f1')
                        : 'rgba(255,255,255,0.15)',
                    transform: i < pinInput.length ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: i < pinInput.length && !pinError ? `0 0 10px ${pinTarget.color ?? '#6366f1'}88` : undefined,
                  }} />
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, idx) => {
                if (key === '') return <div key={idx} />;
                return (
                  <button
                    key={key}
                    onClick={() => key === '⌫' ? handlePinBackspace() : handlePinDigit(key)}
                    className="py-4 rounded-2xl text-white font-black text-xl transition-all active:scale-90"
                    style={{
                      background: key === '⌫' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {key === '⌫' ? <span className="flex items-center justify-center"><Delete size={20} /></span> : key}
                  </button>
                );
              })}
            </div>

            {pinError && (
              <p className="text-red-400 text-sm text-center mt-4 font-semibold">Feil PIN-kode, prøv igjen</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
