'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Settings } from 'lucide-react';

export default function SelectUserPage() {
  const { state, switchUser } = useApp();
  const router = useRouter();

  const children = state.users.filter(u => u.role === 'child');
  const admins = state.users.filter(u => u.role === 'admin');
  const today = new Date().toDateString();
  const todayDOW = new Date().getDay();

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
    const done = assigned.filter(t => doneToday.has(t.id)).length;
    return { todo, done, total: assigned.length };
  };

  const handleSelect = (userId: string, goAdmin = false) => {
    switchUser(userId);
    router.push(goAdmin ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pt-14 pb-10 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="text-center mb-10 relative">
        <div className="text-6xl mb-3">🎮</div>
        <h1 className="text-4xl font-black text-white tracking-tight">Family Quest</h1>
        <p className="text-gray-400 mt-2 text-lg">Hvem er du?</p>
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
              className="relative bg-gray-900/80 border rounded-3xl flex flex-col items-center active:scale-95 transition-all duration-150 overflow-hidden"
              style={{
                borderColor: allDone ? `${color}80` : todo > 0 ? `${color}40` : 'rgba(255,255,255,0.1)',
                padding: isLittle ? '28px 16px' : '20px 16px',
              }}
            >
              {/* Subtle glow when all done */}
              {allDone && (
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }}
                />
              )}

              {/* Task count badge */}
              {todo > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                  {todo}
                </span>
              )}
              {allDone && (
                <span className="absolute top-3 right-3 text-xl">✅</span>
              )}

              {/* Avatar */}
              {user.photoData ? (
                <img
                  src={user.photoData}
                  alt={user.name}
                  className="rounded-full object-cover mb-3"
                  style={{
                    width: isLittle ? 100 : 80,
                    height: isLittle ? 100 : 80,
                    border: `3px solid ${color}`,
                  }}
                />
              ) : (
                <div
                  className="rounded-full flex items-center justify-center mb-3"
                  style={{
                    width: isLittle ? 100 : 80,
                    height: isLittle ? 100 : 80,
                    fontSize: isLittle ? 56 : 44,
                    background: `${color}20`,
                    border: `3px solid ${color}60`,
                  }}
                >
                  {user.avatar}
                </div>
              )}

              {/* Name */}
              <p className={`text-white font-black text-center leading-tight mb-1 ${isLittle ? 'text-2xl' : 'text-lg'}`}>
                {user.name}
              </p>

              {/* Today progress */}
              {total === 0 ? (
                <p className="text-gray-500 text-xs">Ingen oppgaver i dag</p>
              ) : allDone ? (
                <p className="text-emerald-400 text-xs font-bold">Alt gjort! 🌟</p>
              ) : (
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{done}/{total} gjort</span>
                    <span className="font-bold" style={{ color }}>{todo} igjen</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(done / total) * 100}%`, background: color }}
                    />
                  </div>
                </div>
              )}

              {!isLittle && (
                <p className="text-xs mt-2 font-semibold" style={{ color: `${color}BB` }}>
                  {user.points} ⭐
                </p>
              )}
            </button>
          );
        })}
      </div>

      {children.length === 0 && (
        <div className="text-center py-10 relative">
          <p className="text-5xl mb-3">👨‍👩‍👧</p>
          <p className="text-gray-400 font-bold">Ingen barn lagt til enda</p>
          <p className="text-gray-600 text-sm mt-1">Gå til Foreldrekontroll for å starte</p>
        </div>
      )}

      {/* Foreldrekontroll */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => {
            const admin = admins[0];
            if (admin) handleSelect(admin.id, true);
            else handleSelect(state.users[0]?.id ?? '', true);
          }}
          className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-gray-200 text-sm font-semibold px-6 py-3 rounded-2xl transition-all"
        >
          <Settings size={16} /> Foreldrekontroll
        </button>
      </div>
    </div>
  );
}
