'use client';
import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Star, Camera, CheckCircle, Clock, XCircle, Send, ChevronRight, Zap, RotateCcw, X } from 'lucide-react';
import { InfoModal, InfoButton } from '@/components/InfoModal';
import { urlToBase64 } from '@/lib/imageUtils';
import type { Task, CompletedTask } from '@/types';

const AVATAR_EMOJIS = ['🧒','👦','👧','🧑','👨','👩','🦸','🧙','🧝','🧚','🧜','🦊','🐱','🐶','🦁','🐯','🐸','🐺','🦄','🐻','🐼','🦋','🐲','🦅'];
const AVATAR_STYLES = [
  { style: 'fun-emoji',  label: 'Emoji'   },
  { style: 'big-smile',  label: 'Smil'    },
  { style: 'adventurer', label: 'Eventyr' },
  { style: 'bottts',     label: 'Robot'   },
  { style: 'pixel-art',  label: 'Pixel'   },
  { style: 'lorelei',    label: 'Tegning' },
] as const;

type Tab = 'today' | 'week' | 'all';

interface CompleteModalProps {
  task: Task;
  onSubmit: (photoData?: string, note?: string) => void;
  onClose: () => void;
}

function CompleteModal({ task, onSubmit, onClose }: CompleteModalProps) {
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (task.requiresPhoto && !photoData) {
      alert('Denne oppgaven krever et bilde!');
      return;
    }
    onSubmit(photoData ?? undefined, note || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-gray-900 rounded-t-3xl border-t border-white/10 p-6 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-3xl">
            {task.icon}
          </div>
          <div>
            <h2 className="text-white font-black text-lg">{task.title}</h2>
            <p className="text-yellow-400 font-bold flex items-center gap-1">
              <Star size={14} className="fill-yellow-400" /> {task.points} poeng
            </p>
          </div>
        </div>

        {/* Reference image from admin */}
        {task.referenceImage && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Slik skal det se ut:</p>
            <img src={task.referenceImage} alt="referanse" className="w-full h-48 object-cover rounded-2xl border border-white/10" />
          </div>
        )}

        {task.requiresPhoto && (
          <div>
            <p className="text-orange-400 text-sm font-semibold mb-2 flex items-center gap-1">
              <Camera size={14} /> Bilde kreves som bevis
            </p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
            {photoData ? (
              <div className="relative">
                <img src={photoData} alt="bevis" className="w-full h-44 object-cover rounded-2xl" />
                <button
                  onClick={() => setPhotoData(null)}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
                >
                  <XCircle size={18} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-36 bg-white/5 border-2 border-dashed border-orange-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 active:bg-white/10 transition-colors"
              >
                <Camera size={32} className="text-orange-400" />
                <span className="text-orange-400 font-semibold">Ta bilde</span>
              </button>
            )}
          </div>
        )}

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Legg til kommentar (valgfritt)..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none h-24 text-sm transition-all"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl py-3.5 transition-all active:scale-95">
            Avbryt
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Send size={18} /> Lever oppgave!
          </button>
        </div>
      </div>
    </div>
  );
}

const TASKS_INFO = [
  { icon: '☀️', title: 'Daglige oppgaver', desc: 'Oppgaver du skal gjøre hver dag. Trykk på en oppgave for å levere den.' },
  { icon: '📅', title: 'Ukentlige oppgaver', desc: 'Oppgaver som skal fullføres en gang i uken. Finn dem under «Uken»-fanen.' },
  { icon: '📸', title: 'Bilde som bevis', desc: 'Noen oppgaver krever bilde. Ta et bilde for å dokumentere at du er ferdig.' },
  { icon: '⏳', title: 'Venter på godkjenning', desc: 'Etter levering venter oppgaven til en admin godkjenner den. Da får du poengene.' },
  { icon: '✅', title: 'Godkjenn oppgaver (admin)', desc: 'Gå til «Godkjenning»-fanen for å se innleverte oppgaver og godkjenne eller avvise dem.' },
];

export default function TasksPage() {
  const { state, currentUser, isAdmin, completeTask, approveTask, rejectTask, getTodayCompletions, getWeekCompletions, updateUser } = useApp();
  const [tab, setTab] = useState<Tab>('today');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('');
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const avatarPhotoRef = useRef<HTMLInputElement>(null);

  const todayCompletions = getTodayCompletions(currentUser.id);
  const weekCompletions = getWeekCompletions(currentUser.id);

  const assignedTasks = state.tasks.filter(t =>
    t.isActive && (isAdmin || t.assignedTo.includes(currentUser.id))
  );

  const getTaskCompletion = (taskId: string): CompletedTask | null => {
    const all = [...todayCompletions, ...weekCompletions];
    return all.find(c => c.taskId === taskId) ?? null;
  };

  const handleComplete = (photoData?: string, note?: string) => {
    if (!activeTask) return;
    completeTask(activeTask.id, photoData, note);
    setActiveTask(null);
  };

  const todayDayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const isScheduledToday = (t: Task) => !t.daysOfWeek || t.daysOfWeek.includes(todayDayOfWeek);

  const todayTasks = assignedTasks.filter(t => t.frequency === 'daily' && isScheduledToday(t));
  const weeklyTasks = assignedTasks.filter(t => t.frequency === 'weekly');
  const onceTasks = assignedTasks.filter(t => t.frequency === 'once');

  const todayDone = todayCompletions.filter(c => c.status === 'approved').length;
  const todayPoints = todayCompletions.filter(c => c.status === 'approved').reduce((s, c) => s + (c.pointsAwarded ?? 0), 0);

  // ADMIN VIEW
  if (isAdmin) {
    const pending = state.completedTasks.filter(c => c.status === 'pending');

    return (
      <div className="min-h-screen px-4 pt-12 pb-8">
        {showInfo && <InfoModal title="Oppgaver — hjelp" items={TASKS_INFO} onClose={() => setShowInfo(false)} />}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Oppgavesenter</h1>
          <InfoButton onClick={() => setShowInfo(true)} />
        </div>

        <div className="flex gap-2 mb-5">
          {(['today', 'week', 'all'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400'}`}>
              {t === 'today' ? (
                <span className="flex items-center justify-center gap-1.5">
                  Godkjenning
                  {pending.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pending.length}</span>}
                </span>
              ) : t === 'week' ? 'Alle oppgaver' : 'Historikk'}
            </button>
          ))}
        </div>

        {tab === 'today' && (
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-3">✅</div>
                <p className="text-white font-bold text-lg">Ingen ventende oppgaver</p>
                <p className="text-gray-500 text-sm mt-1">Alt er ryddet opp!</p>
              </div>
            ) : pending.map(ct => {
              const task = state.tasks.find(t => t.id === ct.taskId);
              const user = state.users.find(u => u.id === ct.userId);
              if (!task || !user) return null;
              return (
                <div key={ct.id} className="bg-gray-900/80 rounded-3xl border border-white/5 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{user.avatar}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold">{user.name}</p>
                      <p className="text-gray-400 text-xs">{new Date(ct.completedAt).toLocaleString('no-NO')}</p>
                    </div>
                    <div className="bg-yellow-500/20 rounded-xl px-3 py-1.5 flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-black">{task.points}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 mb-3 flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <p className="text-white font-semibold">{task.title}</p>
                      {ct.note && <p className="text-gray-400 text-sm italic mt-0.5">"{ct.note}"</p>}
                    </div>
                  </div>
                  {ct.photoData && (
                    <img src={ct.photoData} alt="bevis" className="w-full h-48 object-cover rounded-2xl mb-3" />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => rejectTask(ct.id)}
                      className="flex-1 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-1.5 transition-all active:scale-95">
                      <XCircle size={18} /> Avvis
                    </button>
                    <button onClick={() => approveTask(ct.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-1.5 transition-all active:scale-95">
                      <CheckCircle size={18} /> Godkjenn +{task.points}⭐
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'week' && (
          <div className="space-y-2">
            {assignedTasks.map(task => {
              const ct = state.completedTasks.filter(c => c.taskId === task.id).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
              const user = task.assignedTo.map(id => state.users.find(u => u.id === id)).filter(Boolean);
              return (
                <div key={task.id} className="bg-gray-900/80 rounded-2xl border border-white/5 p-3 flex items-center gap-3">
                  <span className="text-2xl">{task.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{task.title}</p>
                    <p className="text-gray-500 text-xs">{user.map(u => u?.name).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm font-bold">⭐{task.points}</span>
                    {ct?.status === 'approved' && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">✓</span>}
                    {ct?.status === 'pending' && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Venter</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'all' && (
          <div className="space-y-2">
            {state.completedTasks
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .slice(0, 50)
              .map(ct => {
                const task = state.tasks.find(t => t.id === ct.taskId);
                const user = state.users.find(u => u.id === ct.userId);
                if (!task || !user) return null;
                return (
                  <div key={ct.id} className="bg-gray-900/80 rounded-2xl border border-white/5 p-3 flex items-center gap-3">
                    <span className="text-xl">{task.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{task.title}</p>
                      <p className="text-gray-500 text-xs">{user.name} · {new Date(ct.completedAt).toLocaleDateString('no-NO')}</p>
                    </div>
                    {ct.status === 'approved' && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">+{ct.pointsAwarded}⭐</span>}
                    {ct.status === 'pending' && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Venter</span>}
                    {ct.status === 'rejected' && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Avvist</span>}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  }

  // CHILD VIEW
  const isLittle = currentUser.ageGroup === 'little';

  // Overdue: daily tasks from yesterday not completed
  // Only show if user has some history (not brand new)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const yesterdayDOW = yesterday.getDay();
  const hasAnyHistory = state.completedTasks.some(c => c.userId === currentUser.id);
  const yesterdayDoneIds = new Set(
    state.completedTasks
      .filter(c => c.userId === currentUser.id && new Date(c.completedAt).toDateString() === yesterdayStr)
      .map(c => c.taskId)
  );
  const missedTasks = !hasAnyHistory ? [] : state.tasks.filter(t =>
    t.isActive &&
    t.assignedTo.includes(currentUser.id) &&
    t.frequency === 'daily' &&
    (!t.daysOfWeek || t.daysOfWeek.includes(yesterdayDOW)) &&
    !yesterdayDoneIds.has(t.id) &&
    new Date(t.createdAt) < yesterday  // task existed before yesterday
  );

  // BIG card for little children (age < 7)
  const renderLittleTask = (task: Task) => {
    const ct = getTaskCompletion(task.id);
    const isDone = ct?.status === 'approved' || ct?.status === 'pending';
    const BG_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#f97316'];
    const color = BG_COLORS[Math.abs(task.id.charCodeAt(0) + task.id.charCodeAt(1)) % BG_COLORS.length];

    return (
      <div
        key={task.id}
        onClick={() => !isDone && setActiveTask(task)}
        className={`rounded-3xl border-2 transition-all duration-200 ${isDone ? 'opacity-50' : 'active:scale-95 cursor-pointer'}`}
        style={{ borderColor: isDone ? 'rgba(255,255,255,0.1)' : `${color}80`, background: isDone ? 'rgba(255,255,255,0.03)' : `${color}15` }}
      >
        <div className="p-5 flex flex-col items-center gap-3 text-center">
          <div className="text-8xl leading-none">{isDone ? (ct?.status === 'approved' ? '✅' : '⏳') : task.icon}</div>
          <p className={`font-black text-xl leading-tight ${isDone ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</p>
          {!isDone && (
            <div className="w-full py-3 rounded-2xl font-black text-white text-lg" style={{ background: color }}>
              Ferdig! ✓
            </div>
          )}
          {ct?.status === 'pending' && <p className="text-yellow-400 text-sm font-bold">⏳ Venter...</p>}
          {ct?.status === 'approved' && <p className="text-emerald-400 text-sm font-bold">🌟 +{ct.pointsAwarded} stjerner!</p>}
        </div>
      </div>
    );
  };

  // Normal card for older children and teens
  const renderTask = (task: Task) => {
    if (isLittle) return renderLittleTask(task);

    const ct = getTaskCompletion(task.id);
    const isDone = ct?.status === 'approved' || ct?.status === 'pending';

    return (
      <div
        key={task.id}
        onClick={() => !isDone && setActiveTask(task)}
        className={`relative overflow-hidden rounded-3xl border transition-all duration-200 ${
          isDone
            ? 'bg-white/5 border-white/5 opacity-60'
            : 'bg-gray-900/80 border-white/10 active:scale-95 cursor-pointer hover:border-indigo-500/40 hover:bg-gray-800/80'
        }`}
      >
        {!isDone && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
        )}
        <div className="p-4 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
            isDone ? 'bg-white/5' : 'bg-gradient-to-br from-indigo-600/30 to-purple-600/20'
          }`}>
            {ct?.status === 'approved' ? '✅' : ct?.status === 'pending' ? '⏳' : task.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-base ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{task.description}</p>
            {ct?.status === 'pending' && (
              <p className="text-yellow-400 text-xs mt-1 font-semibold flex items-center gap-1">
                <Clock size={11} /> Venter på godkjenning
              </p>
            )}
            {ct?.status === 'approved' && (
              <p className="text-emerald-400 text-xs mt-1 font-semibold flex items-center gap-1">
                <CheckCircle size={11} /> Godkjent! +{ct.pointsAwarded}⭐
              </p>
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl ${isDone ? 'bg-white/5' : 'bg-yellow-500/20'}`}>
              <Star size={13} className={isDone ? 'text-gray-600' : 'text-yellow-400 fill-yellow-400'} />
              <span className={`font-black text-sm ${isDone ? 'text-gray-600' : 'text-yellow-400'}`}>{task.points}</span>
            </div>
            {!isDone && <ChevronRight size={16} className="text-indigo-400" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 pt-12 pb-8">
      {showInfo && <InfoModal title="Oppgaver — hjelp" items={TASKS_INFO} onClose={() => setShowInfo(false)} />}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Tappable avatar */}
            <button
              onClick={() => { setShowAvatarPicker(true); setAvatarSeed(''); }}
              className="relative flex-shrink-0 active:scale-90 transition-transform"
              title="Endre avatar"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: currentUser.photoData ? undefined : `${currentUser.color}30`, border: `2px solid ${currentUser.color}` }}>
                {currentUser.photoData
                  ? <img src={currentUser.photoData} alt={currentUser.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl">{currentUser.avatar}</span>
                }
              </div>
              {/* Camera badge */}
              <span className="absolute -bottom-0.5 -right-0.5 bg-indigo-600 rounded-full w-4 h-4 flex items-center justify-center text-[9px]">✏️</span>
            </button>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Zap className="text-yellow-400" size={26} /> Mine oppgaver
            </h1>
          </div>
          <InfoButton onClick={() => setShowInfo(true)} />
        </div>

        {/* Daily progress bar */}
        <div className="bg-gray-900/80 rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Daglig fremgang</p>
            <p className="text-yellow-400 font-black">+{todayPoints} ⭐ i dag</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
              style={{ width: todayTasks.length > 0 ? `${Math.round((todayDone / todayTasks.length) * 100)}%` : '0%' }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-1.5">{todayDone} av {todayTasks.length} daglige oppgaver gjort</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['today', 'week', 'all'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400'}`}>
            {t === 'today' ? '☀️ I dag' : t === 'week' ? '📅 Uken' : '📋 Alle'}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <div className={`${isLittle ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
          {/* Overdue from yesterday */}
          {!isLittle && missedTasks.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3 mb-1">
              <p className="text-orange-400 text-xs font-bold mb-2">⚠️ Ikke gjort i går ({missedTasks.length})</p>
              {missedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 py-1">
                  <span>{t.icon}</span>
                  <span className="text-orange-300 text-sm line-through opacity-70">{t.title}</span>
                </div>
              ))}
            </div>
          )}

          {todayTasks.length === 0 ? (
            <div className={`text-center py-12 ${isLittle ? 'col-span-2' : ''}`}>
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-gray-400">Ingen daglige oppgaver</p>
            </div>
          ) : todayTasks.map(renderTask)}
        </div>
      )}

      {tab === 'week' && (
        <div className="space-y-3">
          {weeklyTasks.length === 0 && onceTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-gray-400">Ingen ukentlige oppgaver</p>
            </div>
          ) : (
            <>
              {weeklyTasks.length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ukentlige</p>
                  {weeklyTasks.map(renderTask)}
                </>
              )}
              {onceTasks.length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Engangsoppgaver</p>
                  {onceTasks.map(renderTask)}
                </>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="space-y-3">
          {assignedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-400">Ingen oppgaver tildelt</p>
            </div>
          ) : assignedTasks.map(renderTask)}
        </div>
      )}

      {/* Complete modal */}
      {activeTask && (
        <CompleteModal
          task={activeTask}
          onSubmit={handleComplete}
          onClose={() => setActiveTask(null)}
        />
      )}

      {/* Avatar picker modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowAvatarPicker(false)}>
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            style={{ background: 'linear-gradient(160deg, #12122a 0%, #0a0a1a 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-black text-lg">Endre avatar</p>
              <button onClick={() => setShowAvatarPicker(false)} className="bg-white/10 p-2 rounded-xl">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Current avatar preview */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: currentUser.photoData ? undefined : `${currentUser.color}30`, border: `3px solid ${currentUser.color}` }}>
                {currentUser.photoData
                  ? <img src={currentUser.photoData} alt={currentUser.name} className="w-full h-full object-cover" />
                  : <span className="text-4xl">{currentUser.avatar}</span>
                }
              </div>
            </div>

            {/* Emoji grid */}
            <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">Velg emoji</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVATAR_EMOJIS.map(av => (
                <button key={av}
                  onClick={() => {
                    updateUser(currentUser.id, { avatar: av, photoData: undefined });
                    setShowAvatarPicker(false);
                  }}
                  className={`text-2xl p-2 rounded-xl transition-all active:scale-90 ${currentUser.avatar === av && !currentUser.photoData ? 'bg-indigo-600 ring-2 ring-indigo-400' : 'bg-white/5 hover:bg-white/10'}`}>
                  {av}
                </button>
              ))}
            </div>

            {/* DiceBear generated avatars */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Genererte avatarer</p>
              <button
                onClick={() => setAvatarSeed(Math.random().toString(36).slice(2, 8))}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={11} /> Nye
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AVATAR_STYLES.map(({ style, label }) => {
                const seed = avatarSeed ? `${currentUser.name}-${avatarSeed}` : currentUser.name;
                const url = `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}&size=128&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                return (
                  <button key={style}
                    disabled={generatingAvatar}
                    onClick={async () => {
                      setGeneratingAvatar(true);
                      try {
                        const base64 = await urlToBase64(url);
                        updateUser(currentUser.id, { photoData: base64 });
                      } catch {
                        updateUser(currentUser.id, { photoData: url });
                      } finally {
                        setGeneratingAvatar(false);
                        setShowAvatarPicker(false);
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all active:scale-90 disabled:opacity-50 ${generatingAvatar ? 'cursor-wait' : ''} bg-white/5 border-white/10 hover:bg-white/10`}>
                    <img src={url} alt={label} className="w-14 h-14 rounded-xl bg-white/10" />
                    <span className="text-xs text-gray-300 font-semibold">
                      {generatingAvatar ? '⏳' : label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Upload own photo */}
            <input
              ref={avatarPhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const data = ev.target?.result as string;
                  if (data) {
                    updateUser(currentUser.id, { photoData: data });
                    setShowAvatarPicker(false);
                  }
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => avatarPhotoRef.current?.click()}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <Camera size={16} /> Last opp eget bilde
            </button>

            {currentUser.photoData && (
              <button
                onClick={() => {
                  updateUser(currentUser.id, { photoData: undefined });
                  setShowAvatarPicker(false);
                }}
                className="w-full mt-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 text-sm font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <X size={14} /> Fjern bilde
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
