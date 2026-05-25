'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import LoginForm from '@/components/LoginForm';
import type {
  AppState, User, Task, CompletedTask, Goal,
  ManualPointAdjustment, HomeworkEntry, GoalPeriod, TaskStatus,
  PocketMoneySettings, PocketMoneyPayout, InternetTimeReward
} from '@/types';
import { getLevel } from '@/types';

const PRESET_TASKS: Omit<Task, 'id' | 'assignedTo' | 'createdAt'>[] = [
  { title: 'Gjøre lekser', description: 'Fullfør dagens lekser', points: 15, frequency: 'daily', requiresPhoto: false, category: 'skole', icon: '📚', isPreset: true, isActive: true, linkedGoalPeriods: ['week', 'month'] },
  { title: 'Lese 20 minutter', description: 'Les en bok i minst 20 minutter', points: 10, frequency: 'daily', requiresPhoto: false, category: 'læring', icon: '📖', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Rydde rommet', description: 'Rydd og organiser rommet ditt', points: 10, frequency: 'weekly', requiresPhoto: true, category: 'husarbeid', icon: '🛏️', isPreset: true, isActive: true, linkedGoalPeriods: ['week', 'month'] },
  { title: 'Rydde rot', description: 'Rydd opp rot i fellesareal', points: 5, frequency: 'daily', requiresPhoto: false, category: 'husarbeid', icon: '🧹', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Re opp sengen', description: 'Re opp sengen om morgenen', points: 5, frequency: 'daily', requiresPhoto: false, category: 'husarbeid', icon: '🛌', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Tømme oppvaskmaskinen', description: 'Tøm og rydd oppvaskmaskinen', points: 8, frequency: 'daily', requiresPhoto: false, category: 'husarbeid', icon: '🍽️', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Dekke på bordet', description: 'Dekk på bordet til middag', points: 5, frequency: 'daily', requiresPhoto: false, category: 'husarbeid', icon: '🥄', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Gå ut med søppel', description: 'Ta søppelet ut til container', points: 8, frequency: 'weekly', requiresPhoto: false, category: 'husarbeid', icon: '🗑️', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Legge skittentøy i kurven', description: 'Legg skittentøy i klesvaskekurven', points: 5, frequency: 'daily', requiresPhoto: false, category: 'husarbeid', icon: '👕', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Hjelpe til med middag', description: 'Hjelp til med å lage middag', points: 12, frequency: 'daily', requiresPhoto: false, category: 'husarbeid', icon: '👨‍🍳', isPreset: true, isActive: true, linkedGoalPeriods: ['week', 'month'] },
  { title: 'Pakke skolesekk', description: 'Pakk skolesekken kvelden før', points: 5, frequency: 'daily', requiresPhoto: false, category: 'skole', icon: '🎒', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Pusse tenner morgen', description: 'Pusse tennene om morgenen', points: 5, frequency: 'daily', requiresPhoto: false, category: 'helse', icon: '🦷', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Pusse tenner kveld', description: 'Pusse tennene om kvelden', points: 5, frequency: 'daily', requiresPhoto: false, category: 'helse', icon: '🌙', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Legge seg til avtalt tid', description: 'Gå til sengs til avtalt tid uten diskusjon', points: 10, frequency: 'daily', requiresPhoto: false, category: 'helse', icon: '😴', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Holde orden på badet', description: 'Rydd opp etter deg på badet', points: 5, frequency: 'daily', requiresPhoto: false, category: 'husarbeid', icon: '🚿', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Lufte hund / mate kjæledyr', description: 'Ta vare på kjæledyr', points: 10, frequency: 'daily', requiresPhoto: false, category: 'ansvar', icon: '🐕', isPreset: true, isActive: true, linkedGoalPeriods: ['week', 'month'] },
  { title: 'Være ute i frisk luft', description: 'Vær ute minst 30 minutter', points: 8, frequency: 'daily', requiresPhoto: false, category: 'helse', icon: '🌳', isPreset: true, isActive: true, linkedGoalPeriods: ['week'] },
  { title: 'Skjermfri tid', description: 'Ha minst 1 time uten skjerm', points: 10, frequency: 'daily', requiresPhoto: false, category: 'helse', icon: '📵', isPreset: true, isActive: true, linkedGoalPeriods: ['week', 'month'] },
];

const DEFAULT_GOALS: Omit<Goal, 'id' | 'createdAt' | 'isCompleted' | 'completedAt' | 'celebrationShown'>[] = [
  { title: 'Ukeshelt', description: 'Samle poeng denne uken', targetPoints: 100, period: 'week', userId: '', reward: 'Velge kveldsmat', rewardDescription: 'Du får velge hva familien spiser til kvelds!' },
  { title: 'Månedsmester', description: 'Nå månedsmålet', targetPoints: 400, period: 'month', userId: '', reward: 'Pizzakveld', rewardDescription: 'Pizza og film-kveld du velger selv!' },
];

const INITIAL_USERS: User[] = [
  { id: 'admin-1', name: 'Mamma/Pappa', avatar: '👨‍👩‍👧', role: 'admin', points: 0, level: 0, weeklyPoints: 0, monthlyPoints: 0, quarterlyPoints: 0, yearlyPoints: 0, theme: 'space', animation: 'confetti', color: '#8b5cf6' },
  { id: 'child-1', name: 'Barnet', avatar: '🧒', role: 'child', points: 0, level: 0, weeklyPoints: 0, monthlyPoints: 0, quarterlyPoints: 0, yearlyPoints: 0, theme: 'gaming', animation: 'stars', color: '#f59e0b' },
];

const DEFAULT_STATE: AppState = {
  users: INITIAL_USERS,
  currentUserId: 'child-1',
  tasks: PRESET_TASKS.map(t => ({ ...t, id: uuidv4(), assignedTo: ['child-1'], createdAt: new Date().toISOString() })),
  completedTasks: [],
  goals: DEFAULT_GOALS.map(g => ({ ...g, id: uuidv4(), userId: 'child-1', isCompleted: false, celebrationShown: false, createdAt: new Date().toISOString() })),
  adjustments: [],
  homeworkEntries: [],
  pocketMoneySettings: [],
  pocketMoneyPayouts: [],
  internetTimeRewards: [],
  homeTheme: 'space',
  appLogo: 'shield',
  lastResets: {},
};

// ── Period key helpers ────────────────────────────────────────────────────────
function getWeekKey(d: Date): string {
  const tmp = new Date(d); tmp.setHours(0,0,0,0);
  tmp.setDate(tmp.getDate() + 3 - (tmp.getDay() + 6) % 7);
  const w1 = new Date(tmp.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((tmp.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
  return `${tmp.getFullYear()}-W${String(wn).padStart(2,'0')}`;
}
function getMonthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function getQuarterKey(d: Date) { return `${d.getFullYear()}-Q${Math.ceil((d.getMonth()+1)/3)}`; }
function getYearKey(d: Date) { return `${d.getFullYear()}`; }

function applyPeriodResets(s: AppState): { next: AppState; changed: boolean } {
  const now = new Date();
  const week    = getWeekKey(now);
  const month   = getMonthKey(now);
  const quarter = getQuarterKey(now);
  const year    = getYearKey(now);
  const lr = s.lastResets ?? {};
  let users = s.users;
  const newResets = { ...lr };
  let changed = false;

  if (lr.week !== week)    { users = users.map(u => ({ ...u, weeklyPoints: 0 }));    newResets.week = week;       changed = true; }
  if (lr.month !== month)  { users = users.map(u => ({ ...u, monthlyPoints: 0 }));   newResets.month = month;     changed = true; }
  if (lr.quarter !== quarter) { users = users.map(u => ({ ...u, quarterlyPoints: 0 })); newResets.quarter = quarter; changed = true; }
  if (lr.year !== year)    { users = users.map(u => ({ ...u, yearlyPoints: 0 }));    newResets.year = year;       changed = true; }

  if (!changed) return { next: s, changed: false };
  return { next: { ...s, users, lastResets: newResets }, changed: true };
}

interface AppContextType {
  state: AppState;
  currentUser: User;
  isAdmin: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
  switchUser: (userId: string) => void;
  completeTask: (taskId: string, photoData?: string, note?: string) => void;
  approveTask: (completedTaskId: string) => void;
  rejectTask: (completedTaskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'isCompleted' | 'completedAt' | 'celebrationShown'>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  markGoalCelebrated: (goalId: string) => void;
  adjustPoints: (userId: string, points: number, reason: string) => void;
  addUser: (user: Omit<User, 'id' | 'points' | 'level' | 'weeklyPoints' | 'monthlyPoints' | 'quarterlyPoints' | 'yearlyPoints'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addHomework: (entry: Omit<HomeworkEntry, 'id' | 'createdAt' | 'isTaskCreated'>) => void;
  resetAllPoints: () => void;
  setHomeTheme: (theme: string) => void;
  setAppLogo: (logo: string) => void;
  setUserPin: (userId: string, pin: string) => void;
  getTodayCompletions: (userId: string) => CompletedTask[];
  getWeekCompletions: (userId: string) => CompletedTask[];
  getPendingApprovals: () => CompletedTask[];
  getUserGoalProgress: (userId: string, period: GoalPeriod) => number;
  getGroupGoalProgress: (period: GoalPeriod) => number;
  setPocketMoneySetting: (userId: string, pointsPerKrone: number, currency: string) => void;
  payoutPocketMoney: (userId: string, points: number, note: string) => void;
  addInternetTimeReward: (userId: string, minutesEarned: number, pointCost: number) => void;
  useInternetTime: (rewardId: string) => void;
  getPointsHistory: (userId: string) => { week: string; points: number }[];
}

const AppContext = createContext<AppContextType | null>(null);

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isSaving = useRef(false);
  const isLoadingFromDB = useRef(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session && event === 'SIGNED_OUT') { setState(DEFAULT_STATE); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load + realtime when logged in ────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;
    let cancelled = false;

    const applyFromDB = (dbState: AppState) => {
      if (cancelled || isSaving.current) return;
      const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('fq-current-user') : null;
      const tasks = dbState.tasks?.length > 0 ? dbState.tasks : DEFAULT_STATE.tasks;
      const users = dbState.users?.length > 0 ? dbState.users : DEFAULT_STATE.users;
      const merged: AppState = { ...DEFAULT_STATE, ...dbState, tasks, users, currentUserId: savedUserId ?? dbState.currentUserId };
      const { next, changed } = applyPeriodResets(merged);
      // Only skip save if no period resets happened (pure load). If resets changed data, let it save back.
      if (!changed) isLoadingFromDB.current = true;
      setState(next);
    };

    // Load from Supabase
    supabase.from('family_state').select('state').eq('auth_user_id', userId).maybeSingle().then(({ data, error }) => {
      if (cancelled) return;
      if (data?.state) {
        applyFromDB(data.state as AppState);
      } else if (!error) {
        // Genuinely no row yet (new user) — safe to insert defaults
        supabase.from('family_state').upsert({ auth_user_id: userId, state: DEFAULT_STATE, updated_at: new Date().toISOString() }, { onConflict: 'auth_user_id' });
      } else {
        // Query failed (network issue etc.) — do NOT overwrite with defaults, just log
        console.error('[FQ] Failed to load state from DB:', error.message);
      }
      setLoading(false);
    });

    // Realtime — sync from other devices
    const channel = supabase.channel(`family_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_state' }, (payload) => {
        if (isSaving.current) return;
        const row = payload.new as { auth_user_id?: string; state?: AppState };
        if (!row?.state || row.auth_user_id !== userId) return;
        applyFromDB(row.state);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  // ── Save to Supabase when state changes ───────────────────────────────────
  useEffect(() => {
    if (!session || loading) return;

    // Skip saving if this state change came from the DB
    if (isLoadingFromDB.current) {
      isLoadingFromDB.current = false;
      return;
    }

    // User made a change — save to Supabase
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      isSaving.current = true;
      const { error } = await supabase.from('family_state').upsert({
        auth_user_id: session.user.id,
        state,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'auth_user_id' });
      if (error) console.error('[FQ] Save failed:', error.message);
      setTimeout(() => { isSaving.current = false; }, 1000);
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setState(DEFAULT_STATE);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? state.users[0];
  const isAdmin = currentUser?.role === 'admin';

  // ── Actions ───────────────────────────────────────────────────────────────
  const switchUser = (userId: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('fq-current-user', userId);
    setState(prev => ({ ...prev, currentUserId: userId }));
  };

  const completeTask = (taskId: string, photoData?: string, note?: string) => {
    const completion: CompletedTask = {
      id: uuidv4(), taskId, userId: state.currentUserId,
      completedAt: new Date().toISOString(), photoData, note, status: 'pending',
    };
    setState(prev => ({ ...prev, completedTasks: [...prev.completedTasks, completion] }));
  };

  const approveTask = (completedTaskId: string) => {
    setState(prev => {
      const ct = prev.completedTasks.find(c => c.id === completedTaskId);
      if (!ct) return prev;
      const task = prev.tasks.find(t => t.id === ct.taskId);
      const points = task?.points ?? 0;
      const updatedCompletions = prev.completedTasks.map(c =>
        c.id === completedTaskId
          ? { ...c, status: 'approved' as TaskStatus, approvedAt: new Date().toISOString(), approvedBy: prev.currentUserId, pointsAwarded: points }
          : c
      );
      const updatedUsers = prev.users.map(u => {
        if (u.id !== ct.userId) return u;
        const newTotal = u.points + points;
        return { ...u, points: newTotal, level: getLevel(newTotal), weeklyPoints: u.weeklyPoints + points, monthlyPoints: u.monthlyPoints + points, quarterlyPoints: u.quarterlyPoints + points, yearlyPoints: u.yearlyPoints + points };
      });
      const children = updatedUsers.filter(u => u.role === 'child');
      const updatedGoals = prev.goals.map(g => {
        if (g.isCompleted) return g;
        let progress = 0;
        if (g.isGroupGoal) {
          // Group goal: sum all children's points for the period
          if (g.period === 'week') progress = children.reduce((s, u) => s + u.weeklyPoints, 0);
          else if (g.period === 'month') progress = children.reduce((s, u) => s + u.monthlyPoints, 0);
          else if (g.period === 'quarter') progress = children.reduce((s, u) => s + u.quarterlyPoints, 0);
          else if (g.period === 'year') progress = children.reduce((s, u) => s + u.yearlyPoints, 0);
        } else {
          if (g.userId !== ct.userId) return g;
          const user = updatedUsers.find(u => u.id === ct.userId);
          if (!user) return g;
          if (g.period === 'week') progress = user.weeklyPoints;
          else if (g.period === 'month') progress = user.monthlyPoints;
          else if (g.period === 'quarter') progress = user.quarterlyPoints;
          else if (g.period === 'year') progress = user.yearlyPoints;
        }
        if (progress >= g.targetPoints) return { ...g, isCompleted: true, completedAt: new Date().toISOString() };
        return g;
      });
      return { ...prev, completedTasks: updatedCompletions, users: updatedUsers, goals: updatedGoals };
    });
  };

  const rejectTask = (completedTaskId: string) => {
    setState(prev => ({
      ...prev,
      completedTasks: prev.completedTasks.map(c =>
        c.id === completedTaskId ? { ...c, status: 'rejected' as TaskStatus } : c
      ),
    }));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, { ...task, id: uuidv4(), createdAt: new Date().toISOString() }] }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }));
  };

  const deleteTask = (taskId: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'isCompleted' | 'completedAt' | 'celebrationShown'>) => {
    setState(prev => ({ ...prev, goals: [...prev.goals, { ...goal, id: uuidv4(), isCompleted: false, celebrationShown: false, createdAt: new Date().toISOString() }] }));
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setState(prev => ({ ...prev, goals: prev.goals.map(g => g.id === goalId ? { ...g, ...updates } : g) }));
  };

  const deleteGoal = (goalId: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== goalId) }));
  };

  const markGoalCelebrated = (goalId: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.map(g => g.id === goalId ? { ...g, celebrationShown: true } : g) }));
  };

  const adjustPoints = (userId: string, points: number, reason: string) => {
    setState(prev => {
      const adjustment: ManualPointAdjustment = { id: uuidv4(), userId, points, reason, adminId: prev.currentUserId, createdAt: new Date().toISOString() };
      const updatedUsers = prev.users.map(u => {
        if (u.id !== userId) return u;
        const newTotal = Math.max(0, u.points + points);
        return { ...u, points: newTotal, level: getLevel(newTotal), weeklyPoints: Math.max(0, u.weeklyPoints + points), monthlyPoints: Math.max(0, u.monthlyPoints + points), quarterlyPoints: Math.max(0, u.quarterlyPoints + points), yearlyPoints: Math.max(0, u.yearlyPoints + points) };
      });
      return { ...prev, adjustments: [...prev.adjustments, adjustment], users: updatedUsers };
    });
  };

  const addUser = (user: Omit<User, 'id' | 'points' | 'level' | 'weeklyPoints' | 'monthlyPoints' | 'quarterlyPoints' | 'yearlyPoints'>) => {
    setState(prev => ({ ...prev, users: [...prev.users, { ...user, id: uuidv4(), points: 0, level: 0, weeklyPoints: 0, monthlyPoints: 0, quarterlyPoints: 0, yearlyPoints: 0 }] }));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setState(prev => ({ ...prev, users: prev.users.map(u => u.id === userId ? { ...u, ...updates } : u) }));
  };

  const deleteUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId),
      currentUserId: prev.currentUserId === userId ? (prev.users.find(u => u.id !== userId)?.id ?? prev.currentUserId) : prev.currentUserId,
    }));
  };

  const resetAllPoints = () => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => ({ ...u, points: 0, level: 0, weeklyPoints: 0, monthlyPoints: 0, quarterlyPoints: 0, yearlyPoints: 0 })),
      completedTasks: [],
      adjustments: [],
      goals: prev.goals.map(g => ({ ...g, isCompleted: false, completedAt: undefined, celebrationShown: false })),
    }));
  };

  const setHomeTheme = (theme: string) => {
    setState(prev => ({ ...prev, homeTheme: theme }));
  };

  const setAppLogo = (logo: string) => {
    setState(prev => ({ ...prev, appLogo: logo }));
  };

  const setUserPin = (userId: string, pin: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, pin: pin || undefined } : u),
    }));
  };

  const addHomework = (entry: Omit<HomeworkEntry, 'id' | 'createdAt' | 'isTaskCreated'>) => {
    const hw: HomeworkEntry = { ...entry, id: uuidv4(), isTaskCreated: false, createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, homeworkEntries: [...prev.homeworkEntries, hw] }));
    addTask({ title: `Lekser: ${entry.subject}`, description: `Gjør lekser i ${entry.subject} (ca. ${entry.estimatedMinutes} min)`, points: Math.max(10, Math.round(entry.estimatedMinutes / 3)), frequency: 'once', requiresPhoto: false, category: 'skole', icon: '📚', assignedTo: [entry.userId], isPreset: false, isActive: true, linkedGoalPeriods: ['week'] });
  };

  const getTodayCompletions = (userId: string) => {
    const today = new Date().toDateString();
    return state.completedTasks.filter(c => c.userId === userId && new Date(c.completedAt).toDateString() === today);
  };

  const getWeekCompletions = (userId: string) => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return state.completedTasks.filter(c => c.userId === userId && new Date(c.completedAt) >= weekAgo);
  };

  const getPendingApprovals = () => state.completedTasks.filter(c => c.status === 'pending');

  const getUserGoalProgress = (userId: string, period: GoalPeriod): number => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return 0;
    switch (period) {
      case 'day': {
        const today = new Date().toDateString();
        return state.completedTasks.filter(c => c.userId === userId && c.status === 'approved' && new Date(c.completedAt).toDateString() === today).reduce((s, c) => s + (c.pointsAwarded ?? 0), 0);
      }
      case 'week': return user.weeklyPoints;
      case 'month': return user.monthlyPoints;
      case 'quarter': return user.quarterlyPoints;
      case 'year': return user.yearlyPoints;
    }
  };

  const getGroupGoalProgress = (period: GoalPeriod): number => {
    const children = state.users.filter(u => u.role === 'child');
    switch (period) {
      case 'day': {
        const today = new Date().toDateString();
        return state.completedTasks
          .filter(c => c.status === 'approved' && new Date(c.completedAt).toDateString() === today && children.some(u => u.id === c.userId))
          .reduce((s, c) => s + (c.pointsAwarded ?? 0), 0);
      }
      case 'week': return children.reduce((s, u) => s + u.weeklyPoints, 0);
      case 'month': return children.reduce((s, u) => s + u.monthlyPoints, 0);
      case 'quarter': return children.reduce((s, u) => s + u.quarterlyPoints, 0);
      case 'year': return children.reduce((s, u) => s + u.yearlyPoints, 0);
    }
  };

  const setPocketMoneySetting = (userId: string, pointsPerKrone: number, currency: string) => {
    setState(prev => ({ ...prev, pocketMoneySettings: [...prev.pocketMoneySettings.filter(s => s.userId !== userId), { userId, pointsPerKrone, currency }] }));
  };

  const payoutPocketMoney = (userId: string, points: number, note: string) => {
    setState(prev => {
      const setting = prev.pocketMoneySettings.find(s => s.userId === userId);
      if (!setting) return prev;
      const amount = Math.round((points / setting.pointsPerKrone) * 100) / 100;
      const payout: PocketMoneyPayout = { id: uuidv4(), userId, points, amount, currency: setting.currency, paidAt: new Date().toISOString(), note };
      const updatedUsers = prev.users.map(u => { if (u.id !== userId) return u; const newTotal = Math.max(0, u.points - points); return { ...u, points: newTotal, level: getLevel(newTotal) }; });
      return { ...prev, pocketMoneyPayouts: [...prev.pocketMoneyPayouts, payout], users: updatedUsers };
    });
  };

  const addInternetTimeReward = (userId: string, minutesEarned: number, pointCost: number) => {
    setState(prev => {
      const reward: InternetTimeReward = { id: uuidv4(), userId, minutesEarned, pointCost, earnedAt: new Date().toISOString() };
      const updatedUsers = prev.users.map(u => { if (u.id !== userId) return u; const newTotal = Math.max(0, u.points - pointCost); return { ...u, points: newTotal, level: getLevel(newTotal) }; });
      return { ...prev, internetTimeRewards: [...prev.internetTimeRewards, reward], users: updatedUsers };
    });
  };

  const useInternetTime = (rewardId: string) => {
    setState(prev => ({ ...prev, internetTimeRewards: prev.internetTimeRewards.map(r => r.id === rewardId ? { ...r, usedAt: new Date().toISOString() } : r) }));
  };

  const getPointsHistory = (userId: string): { week: string; points: number }[] => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      weeks[`${d.getFullYear()}-W${getISOWeek(d)}`] = 0;
    }
    state.completedTasks.filter(c => c.userId === userId && c.status === 'approved' && c.pointsAwarded).forEach(c => {
      const d = new Date(c.approvedAt ?? c.completedAt);
      const key = `${d.getFullYear()}-W${getISOWeek(d)}`;
      if (key in weeks) weeks[key] = (weeks[key] ?? 0) + (c.pointsAwarded ?? 0);
    });
    return Object.entries(weeks).map(([week, points]) => ({ week, points }));
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="text-white font-bold text-lg">Laster Family Quest...</p>
          <p className="text-gray-500 text-sm mt-1">Kobler til databasen</p>
        </div>
      </div>
    );
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!session) {
    return <LoginForm />;
  }

  // ── App ───────────────────────────────────────────────────────────────────
  return (
    <AppContext.Provider value={{
      state, currentUser, isAdmin, session, signOut,
      switchUser, completeTask, approveTask, rejectTask,
      addTask, updateTask, deleteTask,
      addGoal, updateGoal, deleteGoal, markGoalCelebrated,
      adjustPoints, addUser, updateUser, deleteUser, addHomework, resetAllPoints, setHomeTheme, setAppLogo, setUserPin,
      getTodayCompletions, getWeekCompletions, getPendingApprovals, getUserGoalProgress, getGroupGoalProgress,
      setPocketMoneySetting, payoutPocketMoney, addInternetTimeReward, useInternetTime, getPointsHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
