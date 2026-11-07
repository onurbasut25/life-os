import { 
  Task, TaskCategory, Habit, WorkoutRoutine, WorkoutSession, 
  PomodoroSession, PersonalRecord, BookItem, MovieItem, ResearchItem 
} from '@/types';

// Varsayılan boş veya temel şablon kategorileri
export const INITIAL_TASK_CATEGORIES: TaskCategory[] = [
  { id: 'cat-work', name: 'İş & Proje', color: '#27272a' },
  { id: 'cat-personal', name: 'Kişisel', color: '#27272a' },
  { id: 'cat-health', name: 'Sağlık & Spor', color: '#27272a' },
];

// Son kullanıcıya hazır: Boş görev listesi
export const INITIAL_TASKS: Task[] = [];

// Son kullanıcıya hazır: Boş alışkanlık listesi
export const INITIAL_HABITS: Habit[] = [];

// Hazır özel antrenman şablonu (Kullanıcının talep ettiği 10 egzersiz hazır gelir)
export const WORKOUT_TEMPLATES: WorkoutRoutine[] = [
  {
    id: 'full-hypertrophy',
    name: 'Tam Vücut / Hipertrofi Rutini',
    exercises: [
      { name: 'Barbell Squat', muscleGroup: 'Bacak', defaultSets: 3 },
      { name: 'Romanian Deadlift (RDL) / Leg Curl', muscleGroup: 'Bacak', defaultSets: 3 },
      { name: 'Barbell Bench Press', muscleGroup: 'Göğüs', defaultSets: 3 },
      { name: 'Pulldown', muscleGroup: 'Sırt', defaultSets: 3 },
      { name: 'Machine Overhead Press', muscleGroup: 'Omuz', defaultSets: 3 },
      { name: 'Seated Cable Row', muscleGroup: 'Sırt', defaultSets: 3 },
      { name: 'Pec Fly', muscleGroup: 'Göğüs', defaultSets: 3 },
      { name: 'Lateral Raise', muscleGroup: 'Omuz', defaultSets: 3 },
      { name: 'Barbell Curl', muscleGroup: 'Kol', defaultSets: 3 },
      { name: 'Plank', muscleGroup: 'Karın', defaultSets: 3 },
    ]
  }
];

export const INITIAL_PRS: PersonalRecord[] = [];
export const INITIAL_WORKOUT_HISTORY: WorkoutSession[] = [];
export const INITIAL_POMODORO_SESSIONS: PomodoroSession[] = [];
export const INITIAL_BOOKS: BookItem[] = [];
export const INITIAL_MOVIES: MovieItem[] = [];
export const INITIAL_RESEARCH: ResearchItem[] = [];
