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
};

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
  getTodayCompletions: (userId: string) => CompletedTask[];
  getWeekCompletions: (userId: string) => CompletedTask[];
  getPendingApprovals: () => CompletedTask[];
  getUserGoalProgress: (userId: string, period: GoalPeriod) => number;
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
  const skipNextSave = useRef(false);

  // ── Auth + initial data load ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadState(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadState(session.user.id);
      } else {
        setState(DEFAULT_STATE);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadState = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('family_state')
        .select('state')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (data?.state) {
        const dbState = data.state as AppState;
        const tasks = dbState.tasks?.length > 0 ? dbState.tasks : DEFAULT_STATE.tasks;
        const users = dbState.users?.length > 0 ? dbState.users : DEFAULT_STATE.users;
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('fq-current-user') : null;
        skipNextSave.current = true;
        setState({
          ...DEFAULT_STATE, ...dbState, tasks, users,
          currentUserId: savedUserId ?? dbState.currentUserId,
        });
      } else {
        // First login — save default state
        await supabase.from('family_state').insert({
          auth_user_id: userId,
          state: DEFAULT_STATE,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Feil ved lasting av data:', err);
    } finally {
      setLoading(false);
    }

    // Real-time subscription — sync data across devices
    const channel = supabase
      .channel(`family_${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'family_state', filter: `auth_user_id=eq.${userId}` },
        (payload) => {
          if (skipNextSave.current) return;
          const newState = (payload.new as { state: AppState }).state;
          const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('fq-current-user') : null;
          setState(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newState)) return prev;
            return { ...DEFAULT_STATE, ...newState, currentUserId: savedUserId ?? newState.currentUserId };
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  // ── Debounced save to Supabase ────────────────────────────────────────────
  useEffect(() => {
    if (!session || loading) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      skipNextSave.current = true;
      await supabase.from('family_state').upsert({
        auth_user_id: session.user.id,
        state,
        updated_at: new Date().toISOString(),
      });
      setTimeout(() => { skipNextSave.current = false; }, 300);
    }, 800);
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
      const updatedGoals = prev.goals.map(g => {
        if (g.isCompleted || g.userId !== ct.userId) return g;
        const user = updatedUsers.find(u => u.id === ct.userId);
        if (!user) return g;
        let progress = 0;
        if (g.period === 'week') progress = user.weeklyPoints;
        else if (g.period === 'month') progress = user.monthlyPoints;
        else if (g.period === 'quarter') progress = user.quarterlyPoints;
        else if (g.period === 'year') progress = user.yearlyPoints;
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
      adjustPoints, addUser, updateUser, deleteUser, addHomework,
      getTodayCompletions, getWeekCompletions, getPendingApprovals, getUserGoalProgress,
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
