export type Priority = 'low' | 'medium' | 'high';

export interface TaskCategory {
  id: string;
  name: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD veya 'süresiz' (undefined)
  dueTime?: string; // HH:mm
  spentMinutes?: number; // Pomodoro veya çalışmadan aktarılan toplam dakika
  createdAt: string;
}

export type HabitType = 'routine' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  targetDaysPerWeek: number;
  totalDurationDays?: number;
  completedDates: string[]; // YYYY-MM-DD
  streak: number;
  createdAt: string;
}

export interface ExerciseSet {
  setNumber: number;
  prevWeight?: number;
  prevReps?: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Göğüs' | 'Sırt' | 'Bacak' | 'Omuz' | 'Kol' | 'Karın' | 'Kardiyo';
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: {
    name: string;
    muscleGroup: 'Göğüs' | 'Sırt' | 'Bacak' | 'Omuz' | 'Kol' | 'Karın' | 'Kardiyo';
    defaultSets: number;
  }[];
}

export interface WorkoutSession {
  id: string;
  routineName: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  exercises: Exercise[];
  notes?: string;
}

export interface PomodoroSession {
  id: string;
  timestamp: string;
  durationMinutes: number;
  type: 'focus' | 'short_break' | 'long_break';
  taskTitle?: string;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  date: string;
}

// BilgeTonyu Paneli Tipleri
export interface BookItem {
  id: string;
  title: string;
  author: string;
  mainCategory: 'Bilim' | 'Roman' | 'Felsefe' | 'Tarih' | 'Kişisel Gelişim' | 'Teknoloji' | 'Diğer';
  subCategory?: string;
  pageCount?: number;
  summary: string;
  rating?: number;
  status: 'okunuyor' | 'tamamlandi' | 'okunacak';
  readDate?: string;
}

export interface MovieItem {
  id: string;
  title: string;
  director?: string;
  genre: string;
  year?: number;
  review?: string;
  rating?: number;
  watchedDate: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  domains: string[];
  notes: string;
  sources?: string;
  status: 'devam_ediyor' | 'tamamlandi';
  updatedAt: string;
}
