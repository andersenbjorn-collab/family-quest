'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ProgressBar from '@/components/ProgressBar';
import UserSwitcher from '@/components/UserSwitcher';
import CelebrationOverlay from '@/components/animations/CelebrationOverlay';
import { getLevel, getLevelProgress, getNextLevelPoints, LEVEL_NAMES } from '@/types';
import { Star, Zap, CheckCircle, Clock, ChevronRight, Bell, Award, TrendingUp, Shield, Flame } from 'lucide-react';

const THEME_ACCENT: Record<string, string> = {
  space: '#6366f1', gaming: '#a855f7', nature: '#10b981', superhero: '#ef4444', minimal: '#6b7280',
};
const THEME_EMOJI: Record<string, string> = {
  space: '🚀', gaming: '🎮', nature: '🌲', superhero: '🦸', minimal: '⬛',
};

export default function Dashboard() {
  const { state, currentUser, isAdmin, getTodayCompletions, getWeekCompletions, getPendingApprovals, getUserGoalProgress, markGoalCelebrated } = useApp();
  const [celebGoal, setCelebGoal] = useState<{ title: string; animation: typeof currentUser.animation } | null>(null);

  const todayCompletions = getTodayCompletions(currentUser.id);
  const weekCompletions = getWeekCompletions(currentUser.id);
  const pending = getPendingApprovals();

  const assignedTasks = state.tasks.filter(t => t.isActive && t.assignedTo.includes(currentUser.id));
  const todayTaskIds = new Set(todayCompletions.map(c => c.taskId));
  const pendingTodayTasks = assignedTasks.filter(t => t.frequency === 'daily' && !todayTaskIds.has(t.id));

  const level = getLevel(currentUser.points);
  const levelPct = getLevelProgress(currentUser.points);
  const nextLevelPoints = getNextLevelPoints(currentUser.points);
  const accent = THEME_ACCENT[currentUser.theme] ?? '#6366f1';

  const userGoals = state.goals.filter(g => g.userId === currentUser.id && !g.isCompleted);
  const nearestGoal = userGoals[0];

  const todayApproved = todayCompletions.filter(c => c.status === 'approved');
  const todayPoints = todayApproved.reduce((s, c) => s + (c.pointsAwarded ?? 0), 0);
  const streak = todayApproved.length;

  useEffect(() => {
    const completedUncelebrated = state.goals.find(g =>
      g.userId === currentUser.id && g.isCompleted && !g.celebrationShown
    );
    if (completedUncelebrated) {
      setCelebGoal({ title: completedUncelebrated.title, animation: currentUser.animation });
      markGoalCelebrated(completedUncelebrated.id);
    }
  }, [state.goals]);

  if (isAdmin) {
    return (
      <div className="min-h-screen px-4 pt-12 pb-8 relative z-10">
        {celebGoal && <CelebrationOverlay type={celebGoal.animation} goalTitle={celebGoal.title} onDone={() => setCelebGoal(null)} />}

        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm">Administrator</p>
            <h1 className="text-3xl font-black text-white">{currentUser.name} {currentUser.avatar}</h1>
          </div>
          <UserSwitcher />
        </div>

        {/* Pending approvals banner */}
        {pending.length > 0 && (
          <Link href="/tasks">
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-600/30 to-red-600/20 border border-orange-500/40 rounded-3xl p-5 mb-4 flex items-center gap-4 active:scale-95 transition-transform">
              <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl">🔔</div>
              <div className="flex-1">
                <p className="text-white font-black text-lg">{pending.length} oppgave{pending.length !== 1 ? 'r' : ''} venter!</p>
                <p className="text-orange-300 text-sm">Trykk for å godkjenne</p>
              </div>
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-white text-lg">{pending.length}</div>
            </div>
          </Link>
        )}

        {/* Family overview */}
        <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-5 mb-4">
          <p className="text-gray-400 text-sm font-semibold mb-4">Familiemedlemmer</p>
          <div className="space-y-3">
            {state.users.filter(u => u.role === 'child').map(u => {
              const lv = getLevel(u.points);
              const lp = getLevelProgress(u.points);
              return (
                <div key={u.id} className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{u.avatar}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold">{u.name}</p>
                      <p className="text-xs font-semibold" style={{ color: THEME_ACCENT[u.theme] }}>Lv.{lv} {LEVEL_NAMES[lv]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-black text-xl">{u.points}</p>
                      <p className="text-gray-500 text-xs">poeng</p>
                    </div>
                  </div>
                  <ProgressBar value={lp} max={100} color={THEME_ACCENT[u.theme]} height="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Aktive oppgaver', value: state.tasks.filter(t => t.isActive).length, color: '#6366f1', emoji: '📋' },
            { label: 'Venter svar', value: pending.length, color: '#f97316', emoji: '⏳' },
            { label: 'Mål totalt', value: state.goals.length, color: '#10b981', emoji: '🎯' },
          ].map(({ label, value, color, emoji }) => (
            <div key={label} className="bg-gray-900/80 rounded-2xl border border-white/5 p-3 text-center">
              <p className="text-2xl mb-1">{emoji}</p>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-gray-500 text-xs leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <Link href="/admin">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-5 flex items-center justify-between active:scale-95 transition-transform">
            <div className="flex items-center gap-3">
              <Shield size={28} className="text-white" />
              <div>
                <p className="text-white font-black text-lg">Adminpanel</p>
                <p className="text-indigo-200 text-sm">Administrer oppgaver og brukere</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-white/60" />
          </div>
        </Link>
      </div>
    );
  }

  // CHILD VIEW
  return (
    <div className="min-h-screen relative z-10">
      {celebGoal && <CelebrationOverlay type={celebGoal.animation} goalTitle={celebGoal.title} onDone={() => setCelebGoal(null)} />}

      {/* Hero header */}
      <div className="relative overflow-hidden px-4 pt-12 pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: accent }} />
          <div className="absolute top-20 -left-16 w-48 h-48 rounded-full blur-2xl opacity-10" style={{ background: accent }} />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-medium">Hei,</p>
              <h1 className="text-3xl font-black text-white">{currentUser.name} {currentUser.avatar}</h1>
            </div>
            <UserSwitcher />
          </div>

          {/* Big points card */}
          <div className="relative overflow-hidden bg-gray-900/90 rounded-3xl border border-white/10 p-5 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Totale poeng</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white leading-none">{currentUser.points.toLocaleString()}</span>
                    <Star className="text-yellow-400 fill-yellow-400 mb-1" size={32} />
                  </div>
                </div>
                <div className="text-right bg-white/5 rounded-2xl px-4 py-3">
                  <div className={`text-3xl font-black level-${Math.min(level, 9)}`}>Lv.{level}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{LEVEL_NAMES[level] ?? 'Legende'}</div>
                  <div className="text-2xl mt-1">{THEME_EMOJI[currentUser.theme]}</div>
                </div>
              </div>

              <ProgressBar value={levelPct} max={100} color={accent} height="h-3" animated />
              <div className="flex justify-between text-xs mt-2">
                <span className="text-gray-500">{levelPct}% til neste nivå</span>
                <span style={{ color: accent }} className="font-semibold">{(nextLevelPoints - currentUser.points).toLocaleString()} poeng igjen</span>
              </div>
            </div>
          </div>

          {/* Today stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Flame size={20} className="text-orange-400 mx-auto mb-1" />
              <p className="text-white font-black text-xl">{streak}</p>
              <p className="text-gray-500 text-xs">i dag</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Zap size={20} className="text-yellow-400 mx-auto mb-1" />
              <p className="text-yellow-400 font-black text-xl">+{todayPoints}</p>
              <p className="text-gray-500 text-xs">poeng i dag</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <TrendingUp size={20} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-emerald-400 font-black text-xl">{currentUser.weeklyPoints}</p>
              <p className="text-gray-500 text-xs">denne uken</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Pending my submissions */}
        {(() => {
          const myPending = state.completedTasks.filter(c => c.userId === currentUser.id && c.status === 'pending');
          if (myPending.length === 0) return null;
          return (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⏳</div>
              <div>
                <p className="text-white font-bold">{myPending.length} oppgave{myPending.length !== 1 ? 'r' : ''} venter godkjenning</p>
                <p className="text-yellow-300/70 text-sm">Foreldre ser på det snart!</p>
              </div>
            </div>
          );
        })()}

        {/* Today's tasks */}
        <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Zap className="text-yellow-400" size={20} /> Dagens oppgaver
            </h2>
            <Link href="/tasks" className="text-sm font-semibold flex items-center gap-1" style={{ color: accent }}>
              Se alle <ChevronRight size={16} />
            </Link>
          </div>

          {pendingTodayTasks.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-emerald-400 font-bold">Alle oppgaver fullført!</p>
              <p className="text-gray-500 text-sm">Fantastisk jobba i dag!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTodayTasks.slice(0, 4).map(task => (
                <Link href="/tasks" key={task.id}>
                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-2xl p-3 transition-colors active:scale-95">
                    <span className="text-2xl">{task.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/15 rounded-xl px-2.5 py-1 flex-shrink-0">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-black text-sm">{task.points}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {pendingTodayTasks.length > 4 && (
                <Link href="/tasks">
                  <p className="text-center py-2 text-sm font-semibold" style={{ color: accent }}>
                    + {pendingTodayTasks.length - 4} oppgaver til →
                  </p>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Goal progress */}
        {nearestGoal && (
          <Link href="/goals">
            <div className="relative overflow-hidden bg-gray-900/80 rounded-3xl border border-purple-500/20 p-4 active:scale-95 transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-black flex items-center gap-2">
                    <Award className="text-purple-400" size={20} /> Neste belønning
                  </h2>
                  <ChevronRight className="text-purple-400" size={20} />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">🎁</div>
                  <div>
                    <p className="text-white font-bold">{nearestGoal.reward}</p>
                    <p className="text-gray-400 text-sm">{nearestGoal.title}</p>
                  </div>
                </div>
                <ProgressBar
                  value={getUserGoalProgress(currentUser.id, nearestGoal.period)}
                  max={nearestGoal.targetPoints}
                  color="#a855f7"
                  height="h-3"
                  showLabel
                  animated
                />
                <p className="text-purple-300/70 text-xs mt-2">
                  {Math.max(0, nearestGoal.targetPoints - getUserGoalProgress(currentUser.id, nearestGoal.period))} poeng igjen til belønning! 🚀
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Completed today */}
        {todayApproved.length > 0 && (
          <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-4">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={18} /> Gjort i dag
            </h2>
            <div className="space-y-2">
              {todayApproved.slice(0, 3).map(ct => {
                const task = state.tasks.find(t => t.id === ct.taskId);
                return (
                  <div key={ct.id} className="flex items-center gap-3 bg-emerald-500/5 rounded-2xl p-2.5">
                    <span className="text-xl">{task?.icon ?? '✅'}</span>
                    <p className="text-emerald-300 text-sm font-medium flex-1 truncate">{task?.title}</p>
                    <span className="text-emerald-400 font-black text-sm">+{ct.pointsAwarded}⭐</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
