'use client';
import { useApp } from '@/context/AppContext';
import ProgressBar from '@/components/ProgressBar';
import { getLevel, getLevelProgress, getNextLevelPoints, LEVEL_NAMES, LEVEL_THRESHOLDS } from '@/types';
import { Star, Trophy, Zap, Calendar, TrendingUp, Award } from 'lucide-react';
import { InfoModal, InfoButton } from '@/components/InfoModal';
import { useState } from 'react';
import type { Theme, AnimationType } from '@/types';

const THEMES: { id: Theme; label: string; emoji: string; color: string }[] = [
  { id: 'space', label: 'Romfart', emoji: '🚀', color: '#6366f1' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', color: '#a855f7' },
  { id: 'nature', label: 'Friluft', emoji: '🌳', color: '#10b981' },
  { id: 'superhero', label: 'Superhelt', emoji: '🦸', color: '#ef4444' },
  { id: 'minimal', label: 'Minimalist', emoji: '⬛', color: '#6b7280' },
];

const ANIMATIONS: { id: AnimationType; label: string; emoji: string }[] = [
  { id: 'confetti', label: 'Konfetti', emoji: '🎊' },
  { id: 'fireworks', label: 'Fyrverkeri', emoji: '🎆' },
  { id: 'stars', label: 'Stjerner', emoji: '⭐' },
  { id: 'levelup', label: 'Level-up', emoji: '🆙' },
];

const PROFILE_INFO = [
  { icon: '⭐', title: 'Nivå og poeng', desc: 'Totale poeng bestemmer ditt nivå. Hvert nivå har et eget navn — kan du nå toppen?' },
  { icon: '🎨', title: 'Tema', desc: 'Velg fargetema for profilen din. Temaet påvirker farger og animasjoner.' },
  { icon: '🎊', title: 'Feiringsanimasjon', desc: 'Velg hvilken animasjon som vises når du fullfører et mål.' },
  { icon: '📋', title: 'Siste aktivitet', desc: 'Se de siste godkjente oppgavene og poengene du har tjent.' },
  { icon: '👨‍👩‍👧', title: 'Familiepoeng (admin)', desc: 'Som admin ser du en oversikt over alle barns poeng og nivå.' },
];

export default function ProfilePage() {
  const { state, currentUser, isAdmin, updateUser } = useApp();
  const level = getLevel(currentUser.points);
  const [showInfo, setShowInfo] = useState(false);
  const levelPct = getLevelProgress(currentUser.points);
  const nextLevel = getNextLevelPoints(currentUser.points);

  const recentApproved = state.completedTasks
    .filter(c => c.userId === currentUser.id && c.status === 'approved')
    .sort((a, b) => new Date(b.approvedAt ?? b.completedAt).getTime() - new Date(a.approvedAt ?? a.completedAt).getTime())
    .slice(0, 10);

  if (isAdmin) {
    return (
      <div className="min-h-screen px-4 pt-12 pb-8">
        {showInfo && <InfoModal title="Profil — hjelp" items={PROFILE_INFO} onClose={() => setShowInfo(false)} />}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Familiepoeng</h1>
          <InfoButton onClick={() => setShowInfo(true)} />
        </div>
        <div className="space-y-4">
          {state.users.filter(u => u.role === 'child').map(user => {
            const lv = getLevel(user.points);
            const lp = getLevelProgress(user.points);
            const np = getNextLevelPoints(user.points);
            return (
              <div key={user.id} className="card p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{user.avatar}</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-white">{user.name}</h2>
                    <div className={`text-sm font-bold level-${Math.min(lv, 9)}`}>Lv.{lv} · {LEVEL_NAMES[lv]}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-yellow-400">{user.points}</div>
                    <div className="text-xs text-gray-500">total</div>
                  </div>
                </div>
                <ProgressBar value={lp} max={100} color={user.color} height="h-2" />
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[['Uke', user.weeklyPoints], ['Mnd', user.monthlyPoints], ['Kvartal', user.quarterlyPoints], ['År', user.yearlyPoints]].map(([l, v]) => (
                    <div key={l} className="bg-white/5 rounded-2xl p-2 text-center">
                      <p className="text-lg font-black text-white">{v}</p>
                      <p className="text-xs text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-12 pb-8">
      {showInfo && <InfoModal title="Profil — hjelp" items={PROFILE_INFO} onClose={() => setShowInfo(false)} />}
      {/* Hero */}
      <div className="card card-glow p-6 mb-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top right, ${currentUser.color}, transparent)` }} />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{currentUser.avatar}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
              <div className={`text-base font-bold level-${Math.min(level, 9)}`}>Lv.{level} · {LEVEL_NAMES[level] ?? 'Legende'}</div>
            </div>
            <InfoButton onClick={() => setShowInfo(true)} />
            <div className="ml-auto text-right">
              <div className="text-4xl font-black text-yellow-400 flex items-center gap-1">
                {currentUser.points.toLocaleString()} <Star className="fill-yellow-400" size={28} />
              </div>
              <p className="text-xs text-gray-400">totale poeng</p>
            </div>
          </div>

          <ProgressBar value={currentUser.points} max={nextLevel} color={currentUser.color} height="h-3" animated />
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span>{levelPct}% til neste nivå</span>
            <span>{(nextLevel - currentUser.points).toLocaleString()} poeng igjen til Lv.{level + 1}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: Zap, label: 'Denne uken', value: currentUser.weeklyPoints, color: '#6366f1' },
          { icon: Calendar, label: 'Denne måneden', value: currentUser.monthlyPoints, color: '#10b981' },
          { icon: TrendingUp, label: 'Dette kvartalet', value: currentUser.quarterlyPoints, color: '#f59e0b' },
          { icon: Trophy, label: 'Dette året', value: currentUser.yearlyPoints, color: '#ef4444' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4">
            <Icon size={18} className="mb-2" style={{ color }} />
            <p className="text-2xl font-black" style={{ color }}>{value.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Level progress */}
      <div className="card p-4 mb-5">
        <h2 className="text-white font-bold mb-3 flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Nivåer</h2>
        <div className="space-y-2">
          {LEVEL_THRESHOLDS.slice(0, -1).map((threshold, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${level === i ? 'bg-white/10' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${level > i ? 'bg-emerald-600' : level === i ? 'bg-indigo-600' : 'bg-white/5'}`}>
                {level > i ? '✓' : i}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${level >= i ? `level-${Math.min(i, 9)}` : 'text-gray-600'}`}>
                  {LEVEL_NAMES[i]} {level === i && '← Du er her!'}
                </p>
                <p className="text-xs text-gray-600">{threshold.toLocaleString()} poeng</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme settings */}
      <div className="card p-4 mb-5">
        <h2 className="text-white font-bold mb-3">Tema</h2>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => updateUser(currentUser.id, { theme: t.id })}
              className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${currentUser.theme === t.id ? 'border-indigo-500 bg-indigo-600/20' : 'border-white/10 bg-white/5'}`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs text-gray-400 mt-1">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation settings */}
      <div className="card p-4 mb-5">
        <h2 className="text-white font-bold mb-3">Seiersanimation</h2>
        <div className="grid grid-cols-4 gap-2">
          {ANIMATIONS.map(a => (
            <button
              key={a.id}
              onClick={() => updateUser(currentUser.id, { animation: a.id })}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${currentUser.animation === a.id ? 'border-indigo-500 bg-indigo-600/20' : 'border-white/10 bg-white/5'}`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-xs text-gray-400 mt-1">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-4">
        <h2 className="text-white font-bold mb-3 flex items-center gap-2"><Award size={18} className="text-purple-400" /> Siste aktivitet</h2>
        {recentApproved.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Ingen godkjente oppgaver ennå</p>
        ) : (
          <div className="space-y-2">
            {recentApproved.map(ct => {
              const task = state.tasks.find(t => t.id === ct.taskId);
              return (
                <div key={ct.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-xl">{task?.icon ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{task?.title ?? 'Oppgave'}</p>
                    <p className="text-gray-500 text-xs">{new Date(ct.approvedAt ?? ct.completedAt).toLocaleDateString('no-NO')}</p>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">+{ct.pointsAwarded ?? task?.points ?? 0} ⭐</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
