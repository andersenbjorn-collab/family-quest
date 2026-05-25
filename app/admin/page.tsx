'use client';
import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Settings, Users, CheckSquare, Plus, Edit3, Trash2, Star, BookOpen, Sliders, Save, X, Camera, Loader, Key, RotateCcw } from 'lucide-react';
import { InfoModal, InfoButton } from '@/components/InfoModal';
import { HOME_THEMES } from '@/components/ThemeBg';
import type { Task, TaskFrequency, GoalPeriod } from '@/types';

type AdminTab = 'tasks' | 'users' | 'homework' | 'points';

const PRESET_ICONS = ['📚', '📖', '🛏️', '🧹', '🛌', '🍽️', '🥄', '🗑️', '👕', '👨‍🍳', '🎒', '🦷', '🌙', '😴', '🚿', '🐕', '🌳', '📵', '⚽', '🎨', '🎵', '🏃', '🧘', '💪'];
const CATEGORIES = ['skole', 'husarbeid', 'helse', 'læring', 'ansvar', 'sport', 'annet'];

const DEFAULT_TASK: Omit<Task, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  points: 10,
  frequency: 'daily',
  requiresPhoto: false,
  category: 'husarbeid',
  icon: '📋',
  assignedTo: [],
  isPreset: false,
  isActive: true,
  linkedGoalPeriods: ['week'],
};

export default function AdminPage() {
  const { state, currentUser, isAdmin, signOut, addTask, updateTask, deleteTask, adjustPoints, addUser, updateUser, deleteUser, addHomework, resetAllPoints, setHomeTheme, setUserPin } = useApp();
  const [tab, setTab] = useState<AdminTab>('tasks');
  const [editingTask, setEditingTask] = useState<Partial<Task> & { isNew?: boolean } | null>(null);
  const [editingUser, setEditingUser] = useState<typeof state.users[0] | null>(null);
  const [pointsAdj, setPointsAdj] = useState({ userId: '', amount: 0, reason: '' });
  const [newUser, setNewUser] = useState({ name: '', avatar: '🧒', role: 'child' as 'child' | 'admin', ageGroup: 'child' as 'little' | 'child' | 'teen', theme: 'gaming' as const, animation: 'confetti' as const, color: '#f59e0b' });
  const [hwForm, setHwForm] = useState({ userId: state.users.find(u => u.role === 'child')?.id ?? '', subject: '', dueDate: '', estimatedMinutes: 30 });
  const [apiKey, setApiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('fq-apikey') ?? '' : '');
  const [showInfo, setShowInfo] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ subject: string; dueDate: string; estimatedMinutes: number; description: string }[]>([]);
  const [scanError, setScanError] = useState('');
  const scanFileRef = useRef<HTMLInputElement>(null);
  const userPhotoRef = useRef<HTMLInputElement>(null);
  const refImgRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <p className="text-white font-bold text-xl">Kun for administratorer</p>
        <p className="text-gray-500 mt-2">Bytt til admin-brukeren</p>
      </div>
    </div>
  );

  const childUsers = state.users.filter(u => u.role === 'child');
  const TABS = [
    { id: 'tasks', label: 'Oppgaver', icon: CheckSquare },
    { id: 'users', label: 'Brukere', icon: Users },
    { id: 'homework', label: 'Lekser', icon: BookOpen },
    { id: 'points', label: 'Poeng', icon: Star },
  ] as const;

  const saveTask = () => {
    if (!editingTask || !editingTask.title) return;
    if (editingTask.isNew) {
      const { isNew, id, createdAt, ...rest } = editingTask as Task & { isNew: boolean };
      addTask({ ...DEFAULT_TASK, ...rest });
    } else if (editingTask.id) {
      const { isNew, ...rest } = editingTask as Task & { isNew?: boolean };
      updateTask(editingTask.id, rest);
    }
    setEditingTask(null);
  };


  return (
    <div className="min-h-screen px-4 pt-12 pb-8">
      {showInfo && <InfoModal title="Admin — hjelp" items={[
        { icon: '📋', title: 'Oppgaver', desc: 'Lag og rediger oppgaver for barna. Sett poeng, ikon, frekvens og hvem som har oppgaven.' },
        { icon: '👥', title: 'Brukere', desc: 'Legg til nye familiemedlemmer, endre navn, avatar og farge. Slett brukere ved behov.' },
        { icon: '📚', title: 'Lekser', desc: 'Skriv inn lekseinformasjon for å automatisk opprette en lekse-oppgave for barnet.' },
        { icon: '⭐', title: 'Poeng', desc: 'Juster poeng manuelt — gi ekstrapoeng for god innsats, eller trekk fra ved brudd på avtaler.' },
        { icon: '🔑', title: 'API-nøkkel', desc: 'Lim inn en Claude AI-nøkkel for å bruke bildeskannerens automatiske leksegjenkjenning.' },
      ]} onClose={() => setShowInfo(false)} />}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
          <Settings className="text-indigo-400" size={24} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">Adminpanel</h1>
          <p className="text-gray-500 text-sm">Administrer familien</p>
        </div>
        <InfoButton onClick={() => setShowInfo(true)} />
        <button
          onClick={() => { if (confirm('Logg ut?')) signOut(); }}
          className="bg-white/10 hover:bg-white/20 text-gray-400 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
        >
          Logg ut
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as AdminTab)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">{state.tasks.filter(t => t.isActive).length} aktive oppgaver</p>
            <button
              onClick={() => setEditingTask({ ...DEFAULT_TASK, isNew: true })}
              className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
            >
              <Plus size={16} /> Ny oppgave
            </button>
          </div>

          <div className="space-y-2">
            {state.tasks.map(task => (
              <div key={task.id} className={`card p-3 flex items-center gap-3 ${!task.isActive ? 'opacity-50' : ''}`}>
                <span className="text-2xl flex-shrink-0">{task.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{task.title}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-xs text-yellow-400">⭐ {task.points}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">
                      {task.frequency === 'daily' ? 'Daglig' : task.frequency === 'weekly' ? 'Ukentlig' : task.frequency === 'monthly' ? 'Månedlig' : 'Engang'}
                    </span>
                    {task.daysOfWeek && task.daysOfWeek.length < 7 && (
                      <span className="text-xs text-indigo-400">
                        {task.daysOfWeek.length === 5 && JSON.stringify(task.daysOfWeek) === JSON.stringify([1,2,3,4,5])
                          ? '💼 Hverdager'
                          : task.daysOfWeek.length === 2 && JSON.stringify(task.daysOfWeek) === JSON.stringify([0,6])
                          ? '🛋️ Helg'
                          : ['Søn','Man','Tir','Ons','Tor','Fre','Lør'].filter((_,i) => task.daysOfWeek!.includes(i)).join(', ')
                        }
                      </span>
                    )}
                    {task.isPreset && <span className="badge bg-blue-500/20 text-blue-400 text-xs py-0 px-2">Forhåndsinnstilt</span>}
                    {task.requiresPhoto && <span className="text-xs text-orange-400">📷</span>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => updateTask(task.id, { isActive: !task.isActive })}
                    className={`p-2 rounded-xl text-xs ${task.isActive ? 'bg-emerald-600/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}
                  >
                    {task.isActive ? '✓' : '○'}
                  </button>
                  <button onClick={() => setEditingTask({ ...task })} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                    <Edit3 size={15} className="text-gray-400" />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="bg-red-600/20 hover:bg-red-600/40 p-2 rounded-xl transition-colors">
                    <Trash2 size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-3">
          {state.users.map(user => (
            <div key={user.id} className="card p-4">
              <div className="flex items-center gap-3">
                {/* Avatar / photo */}
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: user.photoData ? undefined : `${user.color}30`, border: `2px solid ${user.color}60` }}>
                  {user.photoData
                    ? <img src={user.photoData} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-3xl">{user.avatar}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.role === 'admin' ? 'Administrator' : `${user.points} ⭐ · Lv.${user.level}`}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setEditingUser(user)}
                    className="bg-indigo-600/20 hover:bg-indigo-600/40 p-2.5 rounded-xl transition-colors">
                    <Edit3 size={16} className="text-indigo-400" />
                  </button>
                  {user.id !== currentUser.id && (
                    <button onClick={() => { if (confirm(`Slett ${user.name}?`)) deleteUser(user.id); }}
                      className="bg-red-600/20 hover:bg-red-600/40 p-2.5 rounded-xl transition-colors">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>
              {user.role === 'child' && (
                <div className="grid grid-cols-4 gap-2 text-center mt-3">
                  {[['Uke', user.weeklyPoints], ['Mnd', user.monthlyPoints], ['Kv.', user.quarterlyPoints], ['År', user.yearlyPoints]].map(([l, v]) => (
                    <div key={l} className="bg-white/5 rounded-xl p-2">
                      <p className="text-white font-black">{v}</p>
                      <p className="text-xs text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Home theme picker */}
          <div className="card p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">🎨 Startsidebakgrunn</h3>
            <div className="grid grid-cols-3 gap-2">
              {HOME_THEMES.map(({ value, label, emoji }) => (
                <button key={value}
                  onClick={() => setHomeTheme(value)}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all text-center ${(state.homeTheme ?? 'space') === value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                  <span className="text-xl block mb-0.5">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset all points */}
          <div className="card p-4">
            <h3 className="text-white font-bold mb-1 flex items-center gap-2"><RotateCcw size={18} className="text-red-400" /> Tilbakestill alle poeng</h3>
            <p className="text-gray-500 text-xs mb-3">Nullstiller alle poeng, fullførte oppgaver og justeringer. Oppgaver og mål beholdes.</p>
            <button
              onClick={() => {
                if (confirm('Er du sikker? Dette nullstiller alle poeng og fullførte oppgaver for hele familien. Dette kan ikke angres.')) {
                  resetAllPoints();
                }
              }}
              className="btn-danger w-full flex items-center justify-center gap-2 py-3"
            >
              <RotateCcw size={16} /> Tilbakestill alt til null
            </button>
          </div>

          {/* Add user */}
          <div className="card p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Plus size={18} /> Legg til ny bruker</h3>
            <div className="space-y-3">
              <input className="input" placeholder="Navn" value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} />
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {['🦊', '🐱', '🐶', '🦁', '🐯', '🐸', '🐺', '🦄', '🐻', '🐼', '🦋', '🐲', '🦅', '⭐', '🧒', '👦', '👧', '🦸', '🧙', '🧝'].map(av => (
                    <button key={av} onClick={() => setNewUser(u => ({ ...u, avatar: av }))}
                      className={`text-2xl p-2 rounded-xl ${newUser.avatar === av ? 'bg-indigo-600' : 'bg-white/5'}`}>{av}</button>
                  ))}
                </div>
              </div>
              {newUser.role === 'child' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Aldersgruppe</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'little', label: '🐣 Liten', desc: '< 7 år' },
                      { value: 'child',  label: '🧒 Barn',  desc: '7–12 år' },
                      { value: 'teen',   label: '🎧 Ungdom', desc: '13+ år' },
                    ] as const).map(({ value, label, desc }) => (
                      <button key={value}
                        onClick={() => setNewUser(u => ({ ...u, ageGroup: value }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${(newUser.ageGroup ?? 'child') === value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                        {label}<br /><span className="opacity-60 font-normal">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Rolle</label>
                <div className="flex gap-2">
                  {(['child', 'admin'] as const).map(r => (
                    <button key={r} onClick={() => setNewUser(u => ({ ...u, role: r }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${newUser.role === r ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                      {r === 'child' ? '🧒 Barn' : '👨‍💼 Admin'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { if (!newUser.name) return; addUser({ ...newUser, ageGroup: newUser.ageGroup ?? 'child' }); setNewUser({ name: '', avatar: '🧒', role: 'child', ageGroup: 'child', theme: 'gaming', animation: 'confetti', color: '#f59e0b' }); }}
                className="btn-primary w-full">
                Legg til bruker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Homework tab */}
      {tab === 'homework' && (
        <div>
          <div className="card p-4 mb-4">
            <h3 className="text-white font-bold mb-3">Legg til lekser</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">For hvem</label>
                <select className="input" value={hwForm.userId} onChange={e => setHwForm(f => ({ ...f, userId: e.target.value }))}>
                  {childUsers.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
                </select>
              </div>
              <input className="input" placeholder="Fag (f.eks. Matematikk)" value={hwForm.subject} onChange={e => setHwForm(f => ({ ...f, subject: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Innleveringsdato</label>
                  <input className="input" type="date" value={hwForm.dueDate} onChange={e => setHwForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estimert tid (min)</label>
                  <input className="input" type="number" min={5} step={5} value={hwForm.estimatedMinutes} onChange={e => setHwForm(f => ({ ...f, estimatedMinutes: Number(e.target.value) }))} />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!hwForm.subject || !hwForm.userId) return;
                  addHomework(hwForm);
                  setHwForm(f => ({ ...f, subject: '', dueDate: '' }));
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Legg til manuelt
              </button>
            </div>
          </div>

          {/* Image scanner */}
          <div className="card p-4">
            <h3 className="text-white font-bold mb-1 flex items-center gap-2">
              <Camera size={18} className="text-indigo-400" /> Skann lekseplan fra bilde
            </h3>
            <p className="text-gray-500 text-xs mb-4">Ta bilde av lekseplanen — AI leser den automatisk</p>

            {/* API key */}
            <div className="bg-white/5 rounded-2xl p-3 mb-3">
              <label className="text-xs text-gray-400 mb-1 flex items-center gap-1 block"><Key size={11} /> Anthropic API-nøkkel</label>
              <input
                className="input text-xs"
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={e => {
                  setApiKey(e.target.value);
                  localStorage.setItem('fq-apikey', e.target.value);
                }}
              />
              <p className="text-gray-600 text-xs mt-1">Hent gratis på console.anthropic.com → API Keys</p>
            </div>

            <input
              ref={scanFileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!apiKey) { setScanError('Legg inn API-nøkkel først'); return; }
                setScanError('');
                setScanResult([]);
                setScanning(true);
                try {
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const imageData = ev.target?.result as string;
                    const res = await fetch('/api/scan-homework', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ imageData, apiKey }),
                    });
                    const data = await res.json() as { homeworkItems?: typeof scanResult; error?: string };
                    if (data.error) { setScanError(data.error); }
                    else { setScanResult(data.homeworkItems ?? []); }
                    setScanning(false);
                  };
                  reader.readAsDataURL(file);
                } catch (err) {
                  setScanError('Noe gikk galt. Sjekk API-nøkkelen.');
                  setScanning(false);
                }
              }}
            />

            <button
              onClick={() => scanFileRef.current?.click()}
              disabled={scanning}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {scanning ? (
                <><Loader size={20} className="animate-spin" /> Skanner bilde...</>
              ) : (
                <><Camera size={20} /> Ta bilde av lekseplan</>
              )}
            </button>

            {scanError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-3">
                <p className="text-red-400 text-sm">{scanError}</p>
              </div>
            )}

            {scanResult.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-emerald-400 font-bold text-sm">✓ Fant {scanResult.length} lekse{scanResult.length !== 1 ? 'r' : ''}!</p>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tildel til</label>
                  <select className="input" value={hwForm.userId} onChange={e => setHwForm(f => ({ ...f, userId: e.target.value }))}>
                    {childUsers.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
                  </select>
                </div>
                {scanResult.map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{item.subject}</p>
                      <p className="text-gray-400 text-xs">{item.description}</p>
                      <p className="text-gray-500 text-xs">{item.dueDate ? new Date(item.dueDate).toLocaleDateString('no-NO') : ''} · ~{item.estimatedMinutes} min</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    if (!hwForm.userId) return;
                    scanResult.forEach(item => {
                      addHomework({ userId: hwForm.userId, subject: item.subject, dueDate: item.dueDate, estimatedMinutes: item.estimatedMinutes });
                    });
                    setScanResult([]);
                    setScanError('');
                  }}
                  className="btn-success w-full flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Legg til alle {scanResult.length} lekser
                </button>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-white font-bold mb-3">Lekseplan</h3>
            {state.homeworkEntries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Ingen lekser registrert</p>
            ) : (
              <div className="space-y-2">
                {state.homeworkEntries.map(hw => {
                  const user = state.users.find(u => u.id === hw.userId);
                  return (
                    <div key={hw.id} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                      <span className="text-xl">📚</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{hw.subject}</p>
                        <p className="text-gray-500 text-xs">{user?.name} · {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString('no-NO') : 'Ingen dato'} · ~{hw.estimatedMinutes} min</p>
                      </div>
                      <span className="badge bg-emerald-500/20 text-emerald-400 text-xs">✓ Opprettet</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Points adjustment tab */}
      {tab === 'points' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Sliders size={18} className="text-indigo-400" /> Juster poeng manuelt
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Bruker</label>
                <select className="input" value={pointsAdj.userId} onChange={e => setPointsAdj(p => ({ ...p, userId: e.target.value }))}>
                  <option value="">Velg bruker...</option>
                  {childUsers.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Poeng (negativt = trekke fra)</label>
                <input className="input" type="number" value={pointsAdj.amount} onChange={e => setPointsAdj(p => ({ ...p, amount: Number(e.target.value) }))} />
              </div>
              <input className="input" placeholder="Årsak (vises i historikk)" value={pointsAdj.reason} onChange={e => setPointsAdj(p => ({ ...p, reason: e.target.value }))} />
              <div className="flex gap-3">
                {[-50, -20, -10, 10, 20, 50].map(v => (
                  <button key={v} onClick={() => setPointsAdj(p => ({ ...p, amount: v }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${v > 0 ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20' : 'border-red-700 text-red-400 bg-red-900/20'}`}>
                    {v > 0 ? '+' : ''}{v}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!pointsAdj.userId || !pointsAdj.reason) return;
                  adjustPoints(pointsAdj.userId, pointsAdj.amount, pointsAdj.reason);
                  setPointsAdj({ userId: '', amount: 0, reason: '' });
                }}
                className="btn-primary w-full"
              >
                Lagre justering
              </button>
            </div>
          </div>

          {/* Adjustments history */}
          <div className="card p-4">
            <h3 className="text-white font-bold mb-3">Justeringshistorikk</h3>
            {state.adjustments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Ingen justeringer ennå</p>
            ) : (
              <div className="space-y-2">
                {state.adjustments
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(adj => {
                    const user = state.users.find(u => u.id === adj.userId);
                    return (
                      <div key={adj.id} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                        <span className="text-xl">{user?.avatar ?? '👤'}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{adj.reason}</p>
                          <p className="text-gray-500 text-xs">{user?.name} · {new Date(adj.createdAt).toLocaleDateString('no-NO')}</p>
                        </div>
                        <span className={`font-black ${adj.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {adj.points > 0 ? '+' : ''}{adj.points} ⭐
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task editor modal — inline JSX (never define as inner component) */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setEditingTask(null)}>
          <div className="w-full max-w-lg mx-auto bg-gray-900 rounded-t-3xl p-6 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">{editingTask.isNew ? 'Ny oppgave' : 'Rediger oppgave'}</h2>
              <button onClick={() => setEditingTask(null)} className="bg-white/10 p-2 rounded-xl"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              {/* Icon picker */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Ikon</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map(icon => (
                    <button key={icon} onClick={() => setEditingTask(t => ({ ...t, icon }))}
                      className={`text-2xl p-2 rounded-xl transition-all ${editingTask.icon === icon ? 'bg-indigo-600' : 'bg-white/5 hover:bg-white/10'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <input className="input" placeholder="Oppgavenavn*" value={editingTask.title ?? ''} onChange={e => setEditingTask(t => ({ ...t, title: e.target.value }))} />
              <textarea className="input resize-none h-20" placeholder="Beskrivelse" value={editingTask.description ?? ''} onChange={e => setEditingTask(t => ({ ...t, description: e.target.value }))} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Poeng</label>
                  <input className="input" type="number" min={1} value={editingTask.points ?? 10} onChange={e => setEditingTask(t => ({ ...t, points: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Kategori</label>
                  <select className="input" value={editingTask.category ?? 'husarbeid'} onChange={e => setEditingTask(t => ({ ...t, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Frekvens</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['daily', 'weekly', 'monthly', 'once'] as TaskFrequency[]).map(f => (
                    <button key={f} onClick={() => setEditingTask(t => ({ ...t, frequency: f }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${editingTask.frequency === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                      {f === 'daily' ? 'Daglig' : f === 'weekly' ? 'Ukentlig' : f === 'monthly' ? 'Månedlig' : 'Engang'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day-of-week picker — shown for daily and weekly tasks */}
              {(editingTask.frequency === 'daily' || editingTask.frequency === 'weekly') && (() => {
                const days = editingTask.daysOfWeek ?? [0,1,2,3,4,5,6];
                const DAY_LABELS = ['Søn','Man','Tir','Ons','Tor','Fre','Lør'];
                const toggle = (d: number) => {
                  const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort();
                  setEditingTask(t => ({ ...t, daysOfWeek: next.length === 7 ? undefined : next }));
                };
                const setPreset = (ds: number[]) =>
                  setEditingTask(t => ({ ...t, daysOfWeek: ds.length === 7 ? undefined : ds }));
                return (
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Hvilke dager?</label>
                    {/* Quick presets */}
                    <div className="flex gap-2 mb-2">
                      {[
                        { label: '📅 Alle dager', ds: [0,1,2,3,4,5,6] },
                        { label: '💼 Hverdager', ds: [1,2,3,4,5] },
                        { label: '🛋️ Helg',      ds: [0,6] },
                      ].map(({ label, ds }) => {
                        const active = JSON.stringify([...days].sort()) === JSON.stringify(ds) || (ds.length === 7 && !editingTask.daysOfWeek);
                        return (
                          <button key={label} type="button" onClick={() => setPreset(ds)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${active ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    {/* Individual day toggles */}
                    <div className="grid grid-cols-7 gap-1">
                      {[1,2,3,4,5,6,0].map(d => {
                        const on = days.includes(d);
                        return (
                          <button key={d} type="button" onClick={() => toggle(d)}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all ${on ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`}>
                            {DAY_LABELS[d]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Tildel til</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const allAssigned = childUsers.every(u => editingTask.assignedTo?.includes(u.id));
                      setEditingTask(t => ({ ...t, assignedTo: allAssigned ? [] : childUsers.map(u => u.id) }));
                    }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
                      childUsers.every(u => editingTask.assignedTo?.includes(u.id))
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}>
                    👨‍👩‍👧 Alle
                  </button>
                  {childUsers.map(u => {
                    const assigned = editingTask.assignedTo?.includes(u.id) ?? false;
                    return (
                      <button key={u.id} onClick={() => setEditingTask(t => t ? ({
                        ...t,
                        assignedTo: assigned ? (t.assignedTo ?? []).filter(id => id !== u.id) : [...(t.assignedTo ?? []), u.id]
                      }) : t)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all min-w-[72px] ${assigned ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                        <span className="text-3xl">{u.avatar}</span>
                        <span className="text-xs font-bold">{u.name.split(' ')[0]}</span>
                        {assigned && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Knytt til målperiode</label>
                <div className="flex gap-2 flex-wrap">
                  {(['week', 'month', 'quarter', 'year'] as GoalPeriod[]).map(p => {
                    const linked = editingTask.linkedGoalPeriods?.includes(p) ?? false;
                    return (
                      <button key={p} onClick={() => setEditingTask(t => t ? ({
                        ...t,
                        linkedGoalPeriods: linked ? (t.linkedGoalPeriods ?? []).filter(x => x !== p) : [...(t.linkedGoalPeriods ?? []), p]
                      }) : t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${linked ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                        {p === 'week' ? 'Uke' : p === 'month' ? 'Måned' : p === 'quarter' ? 'Kvartal' : 'År'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 cursor-pointer">
                <input type="checkbox" checked={editingTask.requiresPhoto ?? false} onChange={e => setEditingTask(t => ({ ...t, requiresPhoto: e.target.checked }))} className="w-5 h-5 accent-indigo-500" />
                <div>
                  <p className="text-white text-sm font-semibold">Krev bilde som bevis</p>
                  <p className="text-gray-500 text-xs">Barn må ta bilde for å levere</p>
                </div>
              </label>

              {/* Reference image */}
              <div>
                <label className="text-xs text-gray-400 mb-2 flex items-center gap-1 block">
                  <Camera size={12} /> Referansebilde (valgfritt — vis hva som skal gjøres)
                </label>
                <input
                  ref={refImgRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setEditingTask(t => ({ ...t, referenceImage: ev.target?.result as string }));
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
                {editingTask.referenceImage ? (
                  <div className="relative">
                    <img src={editingTask.referenceImage} alt="referanse" className="w-full h-40 object-cover rounded-2xl" />
                    <button
                      onClick={() => setEditingTask(t => ({ ...t, referenceImage: undefined }))}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => refImgRef.current?.click()}
                    className="w-full h-28 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <Camera size={22} className="text-gray-500" />
                    <span className="text-gray-500 text-sm">Last opp bilde</span>
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingTask(null)} className="btn-secondary flex-1">Avbryt</button>
                <button onClick={saveTask} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={16} /> Lagre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setEditingUser(null)}>
          <div className="w-full max-w-lg mx-auto bg-gray-900 rounded-t-3xl p-6 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">Rediger bruker</h2>
              <button onClick={() => setEditingUser(null)} className="bg-white/10 p-2 rounded-xl"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              {/* Photo / avatar preview */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative cursor-pointer"
                  style={{ background: editingUser.photoData ? undefined : `${editingUser.color}30`, border: `3px solid ${editingUser.color}80` }}
                  onClick={() => userPhotoRef.current?.click()}
                >
                  {editingUser.photoData
                    ? <img src={editingUser.photoData} alt={editingUser.name} className="w-full h-full object-cover" />
                    : <span className="text-5xl">{editingUser.avatar}</span>
                  }
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <input
                  ref={userPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setEditingUser(u => u ? { ...u, photoData: ev.target?.result as string } : u);
                    reader.readAsDataURL(file);
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => userPhotoRef.current?.click()}
                    className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Camera size={14} /> Last opp bilde
                  </button>
                  {editingUser.photoData && (
                    <button
                      onClick={() => setEditingUser(u => u ? { ...u, photoData: undefined } : u)}
                      className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Fjern bilde
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <input
                className="input"
                placeholder="Navn"
                value={editingUser.name}
                onChange={e => setEditingUser(u => u ? { ...u, name: e.target.value } : u)}
              />

              {/* Emoji avatar picker */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Emoji-avatar</label>
                <div className="flex flex-wrap gap-2">
                  {['🧒', '👦', '👧', '🧑', '👨', '👩', '🧔', '👴', '👵', '🦸', '🧙', '🧝', '🧚', '🧜', '🦊', '🐱', '🐶', '🦁', '🐯', '🐸'].map(av => (
                    <button
                      key={av}
                      onClick={() => setEditingUser(u => u ? { ...u, avatar: av } : u)}
                      className={`text-2xl p-2 rounded-xl transition-all ${editingUser.avatar === av ? 'bg-indigo-600 ring-2 ring-indigo-400' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Farge</label>
                <div className="flex flex-wrap gap-2">
                  {['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#f97316', '#84cc16', '#ffffff'].map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingUser(u => u ? { ...u, color } : u)}
                      className={`w-9 h-9 rounded-full transition-all ${editingUser.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Age group */}
              {editingUser.role === 'child' && (
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Aldersgruppe (tilpasser oppgavevisning)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'little', label: '🐣 Liten', desc: 'Under 7 år' },
                      { value: 'child',  label: '🧒 Barn',  desc: '7–12 år' },
                      { value: 'teen',   label: '🎧 Ungdom', desc: '13+ år' },
                    ] as const).map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => setEditingUser(u => u ? { ...u, ageGroup: value } : u)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${(editingUser.ageGroup ?? 'child') === value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                      >
                        {label}<br /><span className="opacity-60 font-normal">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PIN */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">🔒 PIN-kode (valgfritt — 4 siffer)</label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    type="number"
                    placeholder="Ingen PIN (åpen tilgang)"
                    maxLength={4}
                    value={editingUser.pin ?? ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setEditingUser(u => u ? { ...u, pin: val || undefined } : u);
                    }}
                  />
                  {editingUser.pin && (
                    <button onClick={() => setEditingUser(u => u ? { ...u, pin: undefined } : u)}
                      className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 rounded-xl text-sm font-bold transition-colors">
                      Fjern
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-xs mt-1">Lås brukeren med en 4-sifret PIN. Tomt = ingen lås.</p>
              </div>

              {/* Role */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Rolle</label>
                <div className="flex gap-2">
                  {(['child', 'admin'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setEditingUser(u => u ? { ...u, role: r } : u)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${editingUser.role === r ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}
                    >
                      {r === 'child' ? '🧒 Barn' : '👨‍💼 Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Tema</label>
                <div className="grid grid-cols-5 gap-2">
                  {([
                    { value: 'gaming', label: '🎮 Gaming' },
                    { value: 'space', label: '🚀 Space' },
                    { value: 'nature', label: '🌿 Nature' },
                    { value: 'superhero', label: '🦸 Hero' },
                    { value: 'minimal', label: '⬜ Minimal' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setEditingUser(u => u ? { ...u, theme: value } : u)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${editingUser.theme === value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Animasjon ved belønning</label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { value: 'confetti', label: '🎊 Konfetti' },
                    { value: 'fireworks', label: '🎆 Fyrverkeri' },
                    { value: 'stars', label: '⭐ Stjerner' },
                    { value: 'levelup', label: '⬆️ Level up' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setEditingUser(u => u ? { ...u, animation: value } : u)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${editingUser.animation === value ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingUser(null)} className="btn-secondary flex-1">Avbryt</button>
                <button
                  onClick={() => {
                    if (!editingUser.name) return;
                    updateUser(editingUser.id, editingUser);
                    setEditingUser(null);
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Lagre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
