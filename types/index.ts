export type Theme = 'space' | 'nature' | 'gaming' | 'superhero' | 'minimal';
export type AnimationType = 'fireworks' | 'confetti' | 'stars' | 'levelup';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'once';
export type GoalPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type TaskStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'admin' | 'child';

export interface User {
  id: string;
  name: string;
  avatar: string;
  photoData?: string;
  role: UserRole;
  points: number;
  level: number;
  weeklyPoints: number;
  monthlyPoints: number;
  quarterlyPoints: number;
  yearlyPoints: number;
  theme: Theme;
  animation: AnimationType;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  frequency: TaskFrequency;
  requiresPhoto: boolean;
  category: string;
  icon: string;
  assignedTo: string[];
  isPreset: boolean;
  isActive: boolean;
  daysOfWeek?: number[];
  linkedGoalPeriods: GoalPeriod[];
  referenceImage?: string;
  createdAt: string;
}

export interface CompletedTask {
  id: string;
  taskId: string;
  userId: string;
  completedAt: string;
  photoData?: string;
  note?: string;
  status: TaskStatus;
  approvedAt?: string;
  approvedBy?: string;
  pointsAwarded?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetPoints: number;
  period: GoalPeriod;
  userId: string;
  reward: string;
  rewardDescription: string;
  rewardImage?: string;
  isCompleted: boolean;
  completedAt?: string;
  celebrationShown: boolean;
  createdAt: string;
}

export interface ManualPointAdjustment {
  id: string;
  userId: string;
  points: number;
  reason: string;
  adminId: string;
  createdAt: string;
}

export interface PocketMoneySettings {
  userId: string;
  pointsPerKrone: number;
  currency: string;
}

export interface PocketMoneyPayout {
  id: string;
  userId: string;
  points: number;
  amount: number;
  currency: string;
  paidAt: string;
  note: string;
}

export interface InternetTimeReward {
  id: string;
  userId: string;
  minutesEarned: number;
  pointCost: number;
  earnedAt: string;
  usedAt?: string;
}

export interface HomeworkEntry {
  id: string;
  userId: string;
  subject: string;
  dueDate: string;
  estimatedMinutes: number;
  isTaskCreated: boolean;
  createdAt: string;
}

export interface AppState {
  users: User[];
  currentUserId: string;
  tasks: Task[];
  completedTasks: CompletedTask[];
  goals: Goal[];
  adjustments: ManualPointAdjustment[];
  homeworkEntries: HomeworkEntry[];
  pocketMoneySettings: PocketMoneySettings[];
  pocketMoneyPayouts: PocketMoneyPayout[];
  internetTimeRewards: InternetTimeReward[];
}

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 6000];
export const LEVEL_NAMES = ['Nybegynner', 'Utforsker', 'Eventyrer', 'Helt', 'Kriger', 'Mester', 'Legende', 'Superhelt', 'Galaktisk', 'Kosmisk'];

export function getLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

export function getNextLevelPoints(points: number): number {
  const level = getLevel(points);
  if (level >= LEVEL_THRESHOLDS.length - 1) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level + 1];
}

export function getLevelProgress(points: number): number {
  const level = getLevel(points);
  const current = LEVEL_THRESHOLDS[level];
  const next = LEVEL_THRESHOLDS[Math.min(level + 1, LEVEL_THRESHOLDS.length - 1)];
  if (next === current) return 100;
  return Math.round(((points - current) / (next - current)) * 100);
}
