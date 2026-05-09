'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart3, TrendingUp, Coins, Wifi, Calendar, Star, ChevronRight } from 'lucide-react';
import { InfoModal, InfoButton } from '@/components/InfoModal';
import type { GoalPeriod } from '@/types';

type ViewUser = string; // userId

const PERIOD_COLORS: Record<GoalPeriod, string> = {
  day: '#06b6d4', week: '#6366f1', month: '#10b981', quarter: '#f59e0b', year: '#ef4444',
};

function BarChart({ data, color = '#6366f1', label }: { data: { label: string; value: number }[]; color?: string; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end gap-1.5 h-32">
        {data.map((d, i) => {
          const pct = Math.round((d.value / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold" style={{ color: d.value > 0 ? color : 'transparent' }}>
                {d.value > 0 ? d.value : ''}
              </span>
              <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden" style={{ height: `${Math.max(pct, 2)}%`, background: `${color}40`, minHeight: '4px' }}>
                <div className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700" style={{ height: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}80` }} />
              </div>
              <span className="text-gray-600 text-xs truncate w-full text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RadialProgress({ value, max, color, label, sublabel }: { value: number; max: number; color: string; label: string; sublabel: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-black text-lg leading-none">{value}</span>
          <span className="text-gray-500 text-xs">/ {max}</span>
        </div>
      </div>
      <p className="text-white text-sm font-bold mt-2">{label}</p>
      <p className="text-gray-500 text-xs">{sublabel}</p>
    </div>
  );
}

const STATS_INFO = [
  { icon: '📊', title: 'Poenghistorikk', desc: 'Søylediagram viser poeng per uke (siste 8 uker) og per måned (siste 6 måneder).' },
  { icon: '👥', title: 'Velg barn (admin)', desc: 'Trykk på navnet øverst for å se statistikken til et bestemt barn.' },
  { icon: '💰', title: 'Lommepenger', desc: 'Sett en vekslingskurs (poeng per krone). Bruk «Utbetal»-knappen for å konvertere poeng til lommepenger.' },
  { icon: '🌐', title: 'Internettid', desc: 'Gi internett-tid som belønning. Barnet bruker opptjent tid ved å trykke «Bruk tid».' },
  { icon: '🏅', title: 'Målprogresjon', desc: 'Se fremgangen mot aktive mål for valgt periode.' },
];

export default function StatsPage() {
  const { state, currentUser, isAdmin, getPointsHistory, getUserGoalProgress, setPocketMoneySetting, payoutPocketMoney, addInternetTimeReward, useInternetTime } = useApp();
  const [selectedUserId, setSelectedUserId] = useState(isAdmin ? (state.users.find(u => u.role === 'child')?.id ?? '') : currentUser.id);
  const [showInfo, setShowInfo] = useState(false);
  const [pmRate, setPmRate] = useState('10');
  const [pmCurrency, setPmCurrency] = useState('kr');
  const [pmPoints, setPmPoints] = useState('');
  const [pmNote, setPmNote] = useState('');
  const [inetMinutes, setInetMinutes] = useState('30');
  const [inetPoints, setInetPoints] = useState('50');

  const viewUser = state.users.find(u => u.id === selectedUserId) ?? currentUser;
  const pmSetting = state.pocketMoneySettings.find(s => s.userId === selectedUserId);
  const history = getPointsHistory(selectedUserId);

  // Weekly chart (last 8 weeks)
  const weeklyData = history.map((h, i) => ({
    label: i === history.length - 1 ? 'Nå' : `U${h.week.split('-W')[1]}`,
    value: h.points,
  }));

  // Monthly (calculate from completedTasks)
  const monthlyData = (() => {
    const months: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months[`${d.getFullYear()}-${d.getMonth()}`] = 0;
    }
    state.completedTasks
      .filter(c => c.userId === selectedUserId && c.status === 'approved')
      .forEach(c => {
        const d = new Date(c.approvedAt ?? c.completedAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key in months) months[key] = (months[key] ?? 0) + (c.pointsAwarded ?? 0);
      });
    return Object.entries(months).map(([key, pts]) => ({
      label: monthNames[parseInt(key.split('-')[1])],
      value: pts,
    }));
  })();

  // Internet time
  const unusedTime = state.internetTimeRewards.filter(r => r.userId === selectedUserId && !r.usedAt);
  const totalMinutes = unusedTime.reduce((s, r) => s + r.minutesEarned, 0);

  // Pocket money calc
  const calcAmount = () => {
    const pts = parseInt(pmPoints);
    const rate = pmSetting?.pointsPerKrone ?? parseInt(pmRate);
    if (!pts || !rate) return 0;
    return Math.round((pts / rate) * 100) / 100;
  };

  return (
    <div className="min-h-screen px-4 pt-12 pb-8">
      {showInfo && <InfoModal title="Statistikk — hjelp" items={STATS_INFO} onClose={() => setShowInfo(false)} />}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center">
          <BarChart3 className="text-purple-400" size={24} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">Statistikk</h1>
          <p className="text-gray-500 text-sm">Poeng og oversikt</p>
        </div>
        <InfoButton onClick={() => setShowInfo(true)} />
      </div>

      {/* User picker for admin */}
      {isAdmin && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {state.users.filter(u => u.role === 'child').map(u => (
            <button key={u.id} onClick={() => setSelectedUserId(u.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${selectedUserId === u.id ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400'}`}>
              {u.avatar} {u.name}
            </button>
          ))}
        </div>
      )}

      {/* Totals radial */}
      <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-5 mb-4">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-400" /> {viewUser.name} — Poengsammendrag
        </h2>
        <div className="grid grid-cols-5 gap-1.5">
          <RadialProgress value={getUserGoalProgress(selectedUserId, 'day')} max={Math.max(getUserGoalProgress(selectedUserId, 'day'), 50)} color={PERIOD_COLORS.day} label="I dag" sublabel="Daglig" />
          <RadialProgress value={viewUser.weeklyPoints} max={Math.max(viewUser.weeklyPoints, 100)} color={PERIOD_COLORS.week} label="Uke" sublabel="Ukentlig" />
          <RadialProgress value={viewUser.monthlyPoints} max={Math.max(viewUser.monthlyPoints, 400)} color={PERIOD_COLORS.month} label="Mnd" sublabel="Månedlig" />
          <RadialProgress value={viewUser.quarterlyPoints} max={Math.max(viewUser.quarterlyPoints, 1200)} color={PERIOD_COLORS.quarter} label="Kv." sublabel="Kvartal" />
          <RadialProgress value={viewUser.yearlyPoints} max={Math.max(viewUser.yearlyPoints, 4800)} color={PERIOD_COLORS.year} label="År" sublabel="Årlig" />
        </div>

        {/* Total */}
        <div className="mt-4 bg-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Totale poeng</p>
            <p className="text-white font-black text-3xl">{viewUser.points.toLocaleString()} <span className="text-yellow-400">⭐</span></p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Godkjente oppgaver</p>
            <p className="text-white font-black text-3xl">
              {state.completedTasks.filter(c => c.userId === selectedUserId && c.status === 'approved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-5 mb-4">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" /> Poeng per uke
        </h2>
        <BarChart data={weeklyData} color={PERIOD_COLORS.week} label="Siste 8 uker" />
      </div>

      {/* Monthly chart */}
      <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-5 mb-4">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-emerald-400" /> Poeng per måned
        </h2>
        <BarChart data={monthlyData} color={PERIOD_COLORS.month} label="Siste 6 måneder" />
      </div>

      {/* Internet time */}
      <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-5 mb-4">
        <h2 className="text-white font-bold mb-1 flex items-center gap-2">
          <Wifi size={18} className="text-cyan-400" /> Opptjent internettid
        </h2>
        <p className="text-gray-500 text-xs mb-4">Poeng byttes mot skjermtid — foreldre aktiverer manuelt</p>

        {/* Available time */}
        {totalMinutes > 0 && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mb-3 flex items-center justify-between">
            <div>
              <p className="text-cyan-400 font-black text-3xl">{totalMinutes} min</p>
              <p className="text-gray-400 text-sm">tilgjengelig internettid</p>
            </div>
            <div className="text-4xl">🌐</div>
          </div>
        )}

        {unusedTime.map(r => (
          <div key={r.id} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 mb-2">
            <span className="text-2xl">🌐</span>
            <div className="flex-1">
              <p className="text-white font-semibold">{r.minutesEarned} minutter</p>
              <p className="text-gray-500 text-xs">{new Date(r.earnedAt).toLocaleDateString('no-NO')} · kostet {r.pointCost} ⭐</p>
            </div>
            {isAdmin && (
              <button onClick={() => useInternetTime(r.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all">
                Brukt
              </button>
            )}
          </div>
        ))}

        {isAdmin && (
          <div className="bg-white/5 rounded-2xl p-3 mt-3 space-y-3">
            <p className="text-white text-sm font-semibold">Gi internettid</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Minutter</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" type="number" value={inetMinutes} onChange={e => setInetMinutes(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Pris i poeng</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" type="number" value={inetPoints} onChange={e => setInetPoints(e.target.value)} />
              </div>
            </div>
            <button
              onClick={() => {
                if (!selectedUserId) return;
                addInternetTimeReward(selectedUserId, parseInt(inetMinutes), parseInt(inetPoints));
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl py-2.5 text-sm transition-all active:scale-95"
            >
              Gi {inetMinutes} min mot {inetPoints} ⭐
            </button>
          </div>
        )}
      </div>

      {/* Pocket money */}
      <div className="bg-gray-900/80 rounded-3xl border border-white/5 p-5 mb-4">
        <h2 className="text-white font-bold mb-1 flex items-center gap-2">
          <Coins size={18} className="text-yellow-400" /> Lommepenger
        </h2>
        <p className="text-gray-500 text-xs mb-4">Konverter poeng til lommepenger</p>

        {isAdmin && (
          <>
            <div className="bg-white/5 rounded-2xl p-4 mb-3 space-y-3">
              <p className="text-white text-sm font-semibold">Innstillinger</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Poeng per krone</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                    type="number" min={1} value={pmRate} onChange={e => setPmRate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Valuta</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    value={pmCurrency} onChange={e => setPmCurrency(e.target.value)}>
                    <option value="kr">kr</option>
                    <option value="€">€</option>
                    <option value="$">$</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setPocketMoneySetting(selectedUserId, parseInt(pmRate), pmCurrency)}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl py-2.5 text-sm transition-all active:scale-95">
                Lagre innstilling
              </button>
            </div>

            {pmSetting && (
              <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                <p className="text-white text-sm font-semibold">Utbetal lommepenger</p>
                <p className="text-gray-400 text-xs">Rate: {pmSetting.pointsPerKrone} ⭐ = 1 {pmSetting.currency}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Antall poeng</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                      type="number" placeholder="0" value={pmPoints} onChange={e => setPmPoints(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <div className="bg-yellow-500/20 rounded-xl p-3 w-full text-center">
                      <p className="text-yellow-400 font-black text-lg">{calcAmount()} {pmSetting.currency}</p>
                      <p className="text-gray-500 text-xs">utbetales</p>
                    </div>
                  </div>
                </div>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none placeholder-gray-500"
                  placeholder="Notat (valgfritt)" value={pmNote} onChange={e => setPmNote(e.target.value)} />
                <button
                  onClick={() => {
                    const pts = parseInt(pmPoints);
                    if (!pts || pts > viewUser.points) return;
                    payoutPocketMoney(selectedUserId, pts, pmNote || 'Lommepenger');
                    setPmPoints('');
                    setPmNote('');
                  }}
                  disabled={!pmPoints || parseInt(pmPoints) > viewUser.points}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white font-bold rounded-xl py-2.5 text-sm transition-all active:scale-95"
                >
                  Utbetal {calcAmount()} {pmSetting?.currency ?? 'kr'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Payout history */}
        {state.pocketMoneyPayouts.filter(p => p.userId === selectedUserId).length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Historikk</p>
            <div className="space-y-2">
              {state.pocketMoneyPayouts
                .filter(p => p.userId === selectedUserId)
                .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
                .map(p => (
                  <div key={p.id} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                    <span className="text-xl">💰</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{p.note}</p>
                      <p className="text-gray-500 text-xs">{new Date(p.paidAt).toLocaleDateString('no-NO')} · -{p.points} ⭐</p>
                    </div>
                    <p className="text-yellow-400 font-black">{p.amount} {p.currency}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
