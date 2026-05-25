'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import ProgressBar from '@/components/ProgressBar';
import { Target, Plus, CheckCircle, Edit3, Trash2, X, Save, Camera } from 'lucide-react';
import { InfoModal, InfoButton } from '@/components/InfoModal';
import { useRef } from 'react';
import type { Goal, GoalPeriod } from '@/types';

const PERIOD_LABELS: Record<GoalPeriod, string> = { day: 'Dagsmål', week: 'Ukemål', month: 'Månedsmål', quarter: 'Kvartalsmål', year: 'Årsmål' };
const PERIOD_COLORS: Record<GoalPeriod, string> = { day: '#06b6d4', week: '#6366f1', month: '#10b981', quarter: '#f59e0b', year: '#ef4444' };
const PERIOD_EMOJIS: Record<GoalPeriod, string> = { day: '☀️', week: '📅', month: '🗓️', quarter: '📊', year: '🏆' };

const REWARD_PRESETS = [
  'Teltur førstkommende helg', 'Hotelltur', 'Kinotur', 'Ekstra internettid',
  'Spillkveld', 'Velge middag', 'Pizzakveld', 'Badepark', 'Bowling',
  'Nytt spill / liten gave', 'Valgfri familieaktivitet', 'Spare poeng til større belønning',
];

type FormState = {
  title: string;
  description: string;
  targetPoints: number;
  period: GoalPeriod;
  userIds: string[];
  isGroupGoal: boolean;
  reward: string;
  rewardDescription: string;
  rewardImage?: string;
};

const EMPTY_FORM: FormState = {
  title: '', description: '', targetPoints: 100,
  period: 'week', userIds: [], isGroupGoal: false,
  reward: '', rewardDescription: '', rewardImage: undefined,
};

const GOALS_INFO = [
  { icon: '🎯', title: 'Hva er et mål?', desc: 'Et mål er en poenggrense barnet jobber mot. Samler de nok poeng innen perioden, vinner de belønningen dere har avtalt!' },
  { icon: '👨‍👩‍👧', title: 'Familiemål', desc: 'Slå på «Familiemål» for at alle barnas poeng teller sammen mot ett felles mål. Bra for å jobbe som et lag!' },
  { icon: '📅', title: 'Perioder', desc: 'Velg uke, måned, kvartal eller år. Poengene nullstilles automatisk når perioden starter på nytt.' },
  { icon: '🏆', title: 'Belønning', desc: 'Skriv hva barnet vinner — f.eks. «Kinotur» eller «Velge middag». Bruk hurtigvalgene eller skriv fritt.' },
  { icon: '🎉', title: 'Når målet nås', desc: 'Det kommer en feiringsanimasjon! Målet markeres som fullført, og dere kan avtale belønningen.' },
  { icon: '➕', title: 'Lage mål (kun admin)', desc: 'Trykk «Nytt mål». Fyll inn navn, poenggrense, periode og belønning. Husk å trykke Lagre!' },
];

export default function GoalsPage() {
  const { state, currentUser, isAdmin, addGoal, updateGoal, deleteGoal, getUserGoalProgress, getGroupGoalProgress } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showInfo, setShowInfo] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const childUsers = state.users.filter(u => u.role === 'child');
  const viewUser = isAdmin ? null : currentUser;
  const groupGoals = state.goals.filter(g => g.isGroupGoal);
  const personalGoals = state.goals.filter(g => !g.isGroupGoal);
  const goalsToShow = viewUser
    ? personalGoals.filter(g => g.userId === viewUser.id)
    : personalGoals;

  const periods: GoalPeriod[] = ['day', 'week', 'month', 'quarter', 'year'];

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingGoal(null);
    setShowAdd(true);
  };

  const openEdit = (goal: Goal) => {
    setForm({
      title: goal.title,
      description: goal.description,
      targetPoints: goal.targetPoints,
      period: goal.period,
      userIds: goal.isGroupGoal ? [] : [goal.userId],
      isGroupGoal: goal.isGroupGoal ?? false,
      reward: goal.reward,
      rewardDescription: goal.rewardDescription,
      rewardImage: goal.rewardImage,
    });
    setEditingGoal(goal);
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditingGoal(null);
    setForm(EMPTY_FORM);
  };

  const saveForm = () => {
    if (!form.title || !form.reward || (!form.isGroupGoal && form.userIds.length === 0)) return;
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: form.title,
        description: form.description,
        targetPoints: form.targetPoints,
        period: form.period,
        reward: form.reward,
        rewardDescription: form.rewardDescription,
        rewardImage: form.rewardImage,
        userId: form.userIds[0] ?? editingGoal.userId,
      });
    } else {
      if (form.isGroupGoal) {
        // One shared goal for the whole family
        addGoal({ ...form, userId: 'group', isGroupGoal: true });
      } else {
        // Create one goal per selected user
        form.userIds.forEach(userId => addGoal({ ...form, userId, isGroupGoal: false }));
      }
    }
    closeModal();
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const user = goal.isGroupGoal ? null : state.users.find(u => u.id === goal.userId);
    const progress = goal.isGroupGoal
      ? getGroupGoalProgress(goal.period)
      : getUserGoalProgress(goal.userId, goal.period);
    const color = PERIOD_COLORS[goal.period];

    return (
      <div className={`card p-4 ${goal.isCompleted ? 'border border-yellow-500/30 bg-yellow-500/5' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-white font-bold">{goal.title}</h3>
              {goal.isCompleted && (
                <span className="badge bg-yellow-500/20 text-yellow-400">
                  <CheckCircle size={12} /> Fullført!
                </span>
              )}
            </div>
            {goal.isGroupGoal && (
              <p className="text-indigo-400 text-xs mb-1 flex items-center gap-1">
                👨‍👩‍👧 Familiemål — alle bidrar sammen
              </p>
            )}
            {!goal.isGroupGoal && isAdmin && user && (
              <p className="text-indigo-400 text-xs mb-1">{user.avatar} {user.name}</p>
            )}
            {goal.description && <p className="text-gray-400 text-sm">{goal.description}</p>}
          </div>
          <span className="badge ml-2 flex-shrink-0" style={{ backgroundColor: `${color}20`, color }}>
            {PERIOD_EMOJIS[goal.period]} {PERIOD_LABELS[goal.period]}
          </span>
        </div>

        {/* Reward image */}
        {goal.rewardImage && (
          <div className="mb-3 rounded-2xl overflow-hidden relative">
            <img src={goal.rewardImage} alt="belønning" className="w-full h-40 object-cover" />
            {goal.isCompleted && (
              <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                <span className="text-5xl">🏆</span>
              </div>
            )}
          </div>
        )}

        <div className="bg-white/5 rounded-2xl p-3 mb-3 flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="text-white font-semibold text-sm">{goal.reward}</p>
            {goal.rewardDescription && <p className="text-gray-400 text-xs">{goal.rewardDescription}</p>}
          </div>
        </div>

        <ProgressBar value={progress} max={goal.targetPoints} color={color} height="h-3" showLabel />

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{progress} / {goal.targetPoints} poeng</span>
          {!goal.isCompleted
            ? <span>{Math.max(0, goal.targetPoints - progress)} poeng igjen</span>
            : goal.completedAt && <span>Nådd {new Date(goal.completedAt).toLocaleDateString('no-NO')}</span>
          }
        </div>

        {isAdmin && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
            {!goal.isCompleted && (
              <button
                onClick={() => updateGoal(goal.id, { isCompleted: true, completedAt: new Date().toISOString() })}
                className="btn-success flex-1 py-2 text-xs"
              >
                ✓ Merk fullført
              </button>
            )}
            <button
              onClick={() => openEdit(goal)}
              className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 py-2 px-3 rounded-2xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Edit3 size={13} /> Rediger
            </button>
            {confirmDeleteId === goal.id ? (
              <div className="flex gap-1">
                <button onClick={() => setConfirmDeleteId(null)}
                  className="bg-white/10 text-gray-400 py-2 px-2 rounded-2xl text-xs font-bold">Avbryt</button>
                <button onClick={() => { deleteGoal(goal.id); setConfirmDeleteId(null); }}
                  className="bg-red-600 text-white py-2 px-2 rounded-2xl text-xs font-bold">Slett!</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDeleteId(goal.id)}
                className="btn-danger py-2 px-3 text-xs">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Shared form for both add and edit
  const isEditingGoal = !!editingGoal;

  return (
    <div className="min-h-screen px-4 pt-12 pb-8">
      {showInfo && <InfoModal title="Mål — hjelp" items={GOALS_INFO} onClose={() => setShowInfo(false)} />}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Target className="text-purple-400" size={28} /> Mål
        </h1>
        <div className="flex items-center gap-2">
          <InfoButton onClick={() => setShowInfo(true)} />
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
              <Plus size={18} /> Nytt mål
            </button>
          )}
        </div>
      </div>

      {/* Family/group goals — shown to all */}
      {groupGoals.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-indigo-400">
            👨‍👩‍👧 Familiemål
          </h2>
          <div className="space-y-3">
            {groupGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Stats summary for child */}
      {!isAdmin && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(['week', 'month'] as GoalPeriod[]).map(period => (
            <div key={period} className="card p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{PERIOD_LABELS[period]}</p>
              <p className="text-2xl font-black" style={{ color: PERIOD_COLORS[period] }}>
                {getUserGoalProgress(currentUser.id, period)}
              </p>
              <p className="text-xs text-gray-500">poeng</p>
            </div>
          ))}
        </div>
      )}

      {/* Goals by period */}
      {periods.map(period => {
        const goals = goalsToShow.filter(g => g.period === period);
        if (goals.length === 0) return null;
        return (
          <div key={period} className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: PERIOD_COLORS[period] }}>
              {PERIOD_EMOJIS[period]} {PERIOD_LABELS[period]}
            </h2>
            <div className="space-y-3">
              {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
            </div>
          </div>
        );
      })}

      {goalsToShow.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-white font-bold text-xl mb-2">Ingen mål ennå</p>
          <p className="text-gray-500">{isAdmin ? 'Legg til mål for barna!' : 'Spør foreldre om å sette mål'}</p>
        </div>
      )}

      {/* Goal form modal — inline JSX (never define as inner component) */}
      {showAdd && isAdmin && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={closeModal}>
          <div className="w-full max-w-lg mx-auto bg-gray-900 rounded-t-3xl p-6 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">
                {isEditingGoal ? 'Rediger mål' : 'Legg til nytt mål'}
              </h2>
              <button onClick={closeModal} className="bg-white/10 p-2 rounded-xl">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="input"
                placeholder="Navn på mål*"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="input resize-none h-20"
                placeholder="Beskrivelse (valgfritt)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              {/* Periode */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Periode</label>
                <div className="grid grid-cols-3 gap-2">
                  {periods.map(p => (
                    <button key={p} type="button"
                      onClick={() => setForm(f => ({ ...f, period: p }))}
                      className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${form.period === p ? 'text-white border-transparent' : 'bg-white/5 border-white/10 text-gray-400'}`}
                      style={form.period === p ? { background: PERIOD_COLORS[p], borderColor: PERIOD_COLORS[p] } : {}}>
                      <span>{PERIOD_EMOJIS[p]}</span>
                      <span>{PERIOD_LABELS[p]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Poengmål */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Poengmål</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={form.targetPoints}
                  onFocus={e => e.target.select()}
                  onChange={e => setForm(f => ({ ...f, targetPoints: Number(e.target.value) }))}
                />
              </div>

              {/* Familiemål toggle */}
              {!isEditingGoal && (
                <div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isGroupGoal: !f.isGroupGoal, userIds: [] }))}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${form.isGroupGoal ? 'bg-indigo-600/20 border-indigo-500/60 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    <span className="text-2xl">👨‍👩‍👧</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-sm">Familiemål</p>
                      <p className="text-xs opacity-70">Alle barnas poeng teller sammen</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.isGroupGoal ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                      {form.isGroupGoal && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </button>
                </div>
              )}

              {/* For hvem */}
              {!form.isGroupGoal && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  {isEditingGoal ? 'Tildelt til' : 'For hvem'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {!isEditingGoal && (
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = childUsers.every(u => form.userIds.includes(u.id));
                        setForm(f => ({ ...f, userIds: allSelected ? [] : childUsers.map(u => u.id) }));
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
                        childUsers.every(u => form.userIds.includes(u.id))
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      👨‍👩‍👧 Alle
                    </button>
                  )}
                  {childUsers.map(u => {
                    const selected = form.userIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (isEditingGoal) {
                            setForm(f => ({ ...f, userIds: [u.id] }));
                          } else {
                            setForm(f => ({
                              ...f,
                              userIds: selected
                                ? f.userIds.filter(id => id !== u.id)
                                : [...f.userIds, u.id],
                            }));
                          }
                        }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all min-w-[72px] ${
                          selected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                        }`}
                      >
                        <span className="text-3xl">{u.avatar}</span>
                        <span className="text-xs font-bold">{u.name.split(' ')[0]}</span>
                        {selected && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
                {form.userIds.length === 0 && (
                  <p className="text-orange-400 text-xs mt-1">Velg minst én person</p>
                )}
              </div>
              )}

              {/* Belønning */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Belønning* <span className="font-normal text-gray-500">— skriv selv eller velg hurtigvalg</span></label>
                <input
                  className="input text-sm mb-3"
                  placeholder="F.eks. Kinotur, Pizzakveld, Ekstra skjermtid..."
                  value={form.reward}
                  onFocus={e => e.target.select()}
                  onChange={e => setForm(f => ({ ...f, reward: e.target.value }))}
                />
                {/* Quick-fill presets */}
                <div className="flex flex-wrap gap-1.5">
                  {REWARD_PRESETS.slice(0, 6).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, reward: r }))}
                      className="text-xs px-3 py-1.5 rounded-xl border bg-white/5 border-white/10 text-gray-400 hover:bg-indigo-600/20 hover:border-indigo-500 hover:text-white active:scale-95 transition-all"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <input
                className="input text-sm"
                placeholder="Belønningsbeskrivelse (valgfritt)"
                value={form.rewardDescription}
                onChange={e => setForm(f => ({ ...f, rewardDescription: e.target.value }))}
              />

              {/* Reward / goal image */}
              <div>
                <label className="text-xs text-gray-400 mb-2 flex items-center gap-1 block">
                  <Camera size={12} /> Bilde av mål eller belønning (valgfritt)
                </label>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setForm(f => ({ ...f, rewardImage: ev.target?.result as string }));
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
                {form.rewardImage ? (
                  <div className="relative">
                    <img src={form.rewardImage} alt="belønning" className="w-full h-40 object-cover rounded-2xl" />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, rewardImage: undefined }))}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageRef.current?.click()}
                    className="w-full h-28 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <Camera size={22} className="text-gray-500" />
                    <span className="text-gray-500 text-sm">Last opp bilde</span>
                  </button>
                )}
              </div>

              {/* Validation hint */}
              {(() => {
                const missing: string[] = [];
                if (!form.title) missing.push('navn på målet');
                if (!form.reward) missing.push('belønning');
                if (!form.isGroupGoal && form.userIds.length === 0) missing.push('hvem målet gjelder for');
                return missing.length > 0 ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2.5 text-amber-400 text-sm">
                    ⚠️ Mangler: <span className="font-semibold">{missing.join(' og ')}</span>
                  </div>
                ) : null;
              })()}

              <div className="flex gap-3 pt-1">
                <button onClick={closeModal} className="btn-secondary flex-1">Avbryt</button>
                <button
                  onClick={saveForm}
                  disabled={!form.title || !form.reward || (!form.isGroupGoal && form.userIds.length === 0)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Save size={16} />
                  {isEditingGoal ? 'Lagre endringer'
                    : form.isGroupGoal ? 'Lagre familiemål'
                    : form.userIds.length > 1 ? `Lagre ${form.userIds.length} mål`
                    : 'Lagre mål'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
