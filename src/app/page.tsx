'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Dumbbell, Timer, BookOpen,
  Smartphone, RefreshCw, Zap, Moon, Sun
} from 'lucide-react';
import { 
  Task, TaskCategory, Habit, WorkoutSession, PomodoroSession, 
  PersonalRecord, BookItem, MovieItem, ResearchItem, WorkoutRoutine 
} from '@/types';
import { 
  INITIAL_TASKS, INITIAL_TASK_CATEGORIES, INITIAL_HABITS, 
  INITIAL_WORKOUT_HISTORY, INITIAL_POMODORO_SESSIONS, INITIAL_PRS,
  INITIAL_BOOKS, INITIAL_MOVIES, INITIAL_RESEARCH, WORKOUT_TEMPLATES
} from '@/utils/mockData';
import { Dashboard } from '@/components/Dashboard';
import { TasksAndHabits } from '@/components/TasksAndHabits';
import { WorkoutTracker } from '@/components/WorkoutTracker';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { BilgeTonyu } from '@/components/BilgeTonyu';

type Tab = 'dashboard' | 'tasks' | 'workouts' | 'pomodoro' | 'bilge';

const LOCAL_STORAGE_KEY = 'LIFE_OS_DATA_STATE_PROD_V1';
const THEME_KEY = 'LIFE_OS_THEME_CHOICE';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Veri Durumları (Son kullanıcıya hazır)
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [categories, setCategories] = useState<TaskCategory[]>(INITIAL_TASK_CATEGORIES);
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(INITIAL_WORKOUT_HISTORY);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>(INITIAL_POMODORO_SESSIONS);
  const [prs, setPrs] = useState<PersonalRecord[]>(INITIAL_PRS);

  // BilgeTonyu
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [movies, setMovies] = useState<MovieItem[]>(INITIAL_MOVIES);
  const [research, setResearch] = useState<ResearchItem[]>(INITIAL_RESEARCH);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedTheme = (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.habits) setHabits(parsed.habits);
        if (parsed.workouts) setWorkouts(parsed.workouts);
        if (parsed.pomodoroSessions) setPomodoroSessions(parsed.pomodoroSessions);
        if (parsed.prs) setPrs(parsed.prs);
        if (parsed.books) setBooks(parsed.books);
        if (parsed.movies) setMovies(parsed.movies);
        if (parsed.research) setResearch(parsed.research);
      }
    } catch (e) {
      console.error('LocalStorage okuma hatası', e);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const saveState = (updated: {
    tasks?: Task[];
    categories?: TaskCategory[];
    habits?: Habit[];
    workouts?: WorkoutSession[];
    pomodoroSessions?: PomodoroSession[];
    prs?: PersonalRecord[];
    books?: BookItem[];
    movies?: MovieItem[];
    research?: ResearchItem[];
  }) => {
    if (typeof window === 'undefined') return;
    try {
      const currentState = {
        tasks: updated.tasks ?? tasks,
        categories: updated.categories ?? categories,
        habits: updated.habits ?? habits,
        workouts: updated.workouts ?? workouts,
        pomodoroSessions: updated.pomodoroSessions ?? pomodoroSessions,
        prs: updated.prs ?? prs,
        books: updated.books ?? books,
        movies: updated.movies ?? movies,
        research: updated.research ?? research,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.error('LocalStorage kaydetme hatası', e);
    }
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Görev & Kategori İşlemleri
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    saveState({ tasks: updated });
    triggerSync();
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveState({ tasks: updated });
    triggerSync();
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    saveState({ tasks: updated });
    triggerSync();
  };

  const handleAddCategory = (name: string) => {
    const newCat: TaskCategory = {
      id: 'cat-' + Date.now(),
      name,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveState({ categories: updated });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = categories.filter(c => c.id !== categoryId);
    const updatedTasks = tasks.map(t => t.categoryId === categoryId ? { ...t, categoryId: undefined } : t);
    setCategories(updated);
    setTasks(updatedTasks);
    saveState({ categories: updated, tasks: updatedTasks });
  };

  // Alışkanlık İşlemleri
  const handleToggleHabitToday = (habitId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const hasToday = h.completedDates.includes(todayStr);
        const newDates = hasToday 
          ? h.completedDates.filter(d => d !== todayStr)
          : [...h.completedDates, todayStr];
        const newStreak = hasToday ? Math.max(0, h.streak - 1) : h.streak + 1;
        return {
          ...h,
          completedDates: newDates,
          streak: newStreak
        };
      }
      return h;
    });
    setHabits(updated);
    saveState({ habits: updated });
    triggerSync();
  };

  const handleAddHabit = (data: {
    title: string;
    type: 'routine' | 'weekly';
    targetDaysPerWeek: number;
    totalDurationDays?: number;
  }) => {
    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      title: data.title,
      type: data.type,
      targetDaysPerWeek: data.targetDaysPerWeek,
      totalDurationDays: data.totalDurationDays,
      streak: 1,
      completedDates: [new Date().toISOString().split('T')[0]],
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveState({ habits: updated });
    triggerSync();
  };

  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    saveState({ habits: updated });
    triggerSync();
  };

  // Workout İşlemleri
  const handleFinishWorkout = (newWorkout: WorkoutSession, newPrs: PersonalRecord[]) => {
    const updatedWorkouts = [newWorkout, ...workouts];
    setWorkouts(updatedWorkouts);
    setPrs(newPrs);
    saveState({ workouts: updatedWorkouts, prs: newPrs });
    triggerSync();
  };

  // Pomodoro
  const handleSessionComplete = (session: PomodoroSession, spentMinutes: number, taskTitle?: string) => {
    const updatedSessions = [session, ...pomodoroSessions];
    setPomodoroSessions(updatedSessions);

    let updatedTasks = tasks;
    if (taskTitle) {
      updatedTasks = tasks.map(t => {
        if (t.title.toLowerCase() === taskTitle.toLowerCase()) {
          return {
            ...t,
            spentMinutes: (t.spentMinutes || 0) + spentMinutes,
          };
        }
        return t;
      });
      setTasks(updatedTasks);
    }

    saveState({ pomodoroSessions: updatedSessions, tasks: updatedTasks });
    triggerSync();
  };

  // BilgeTonyu
  const handleAddBook = (book: Omit<BookItem, 'id'>) => {
    const newBook: BookItem = { ...book, id: 'b-' + Date.now() };
    const updated = [newBook, ...books];
    setBooks(updated);
    saveState({ books: updated });
    triggerSync();
  };

  const handleUpdateBook = (id: string, updates: Partial<BookItem>) => {
    const updated = books.map(b => b.id === id ? { ...b, ...updates } : b);
    setBooks(updated);
    saveState({ books: updated });
    triggerSync();
  };

  const handleDeleteBook = (id: string) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    saveState({ books: updated });
    triggerSync();
  };

  const handleAddMovie = (movie: Omit<MovieItem, 'id'>) => {
    const newMovie: MovieItem = { ...movie, id: 'm-' + Date.now() };
    const updated = [newMovie, ...movies];
    setMovies(updated);
    saveState({ movies: updated });
    triggerSync();
  };

  const handleDeleteMovie = (id: string) => {
    const updated = movies.filter(m => m.id !== id);
    setMovies(updated);
    saveState({ movies: updated });
    triggerSync();
  };

  const handleAddResearch = (item: Omit<ResearchItem, 'id' | 'updatedAt'>) => {
    const newRes: ResearchItem = {
      ...item,
      id: 'r-' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newRes, ...research];
    setResearch(updated);
    saveState({ research: updated });
    triggerSync();
  };

  const handleUpdateResearch = (id: string, updates: Partial<ResearchItem>) => {
    const updated = research.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : r);
    setResearch(updated);
    saveState({ research: updated });
    triggerSync();
  };

  const handleDeleteResearch = (id: string) => {
    const updated = research.filter(r => r.id !== id);
    setResearch(updated);
    saveState({ research: updated });
    triggerSync();
  };

  if (!isClient) {
    return <div className="min-h-screen bg-[#090a0b] text-zinc-400 flex items-center justify-center text-xs font-mono">Life OS Yükleniyor...</div>;
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Ana Panel', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Görev & Alışkanlık', icon: <CheckSquare className="w-4 h-4" />, badge: tasks.filter(t => !t.completed).length },
    { id: 'workouts', label: 'Antrenman', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <Timer className="w-4 h-4" /> },
    { id: 'bilge', label: 'BilgeTonyu', icon: <BookOpen className="w-4 h-4" />, badge: books.length + research.length },
  ];

  return (
    <div className="min-h-screen transition-colors duration-200 flex flex-col md:flex-row antialiased bg-[#fcfcfc] dark:bg-[#090a0b] text-zinc-900 dark:text-zinc-100">
      {/* Laptop Kenar Çubuğu (Sidebar) */}
      <aside className="hidden md:flex w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0d0e] flex-col justify-between shrink-0 p-4 sticky top-0 h-screen transition-colors">
        <div className="space-y-5">
          {/* Logo & Marka */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700/80 flex items-center justify-center text-white">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 block">LIFE OS</span>
                <span className="text-[10px] text-zinc-500 font-mono">Kişisel Kokpit</span>
              </div>
            </div>

            {/* Tema Geçiş Butonu */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
              title={theme === 'dark' ? 'Açık Temaya Geç' : 'Karanlık Temaya Geç'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Senkronizasyon Durumu */}
          <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Yerel Hafıza Aktif
            </span>
            <button 
              onClick={triggerSync}
              className={`text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all ${isSyncing ? 'animate-spin' : ''}`}
              title="Senkronize Et"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Menü */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Alt Bilgi */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-400 mb-1">
            <Smartphone className="w-3.5 h-3.5" /> PWA Mobil & Masaüstü
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Telefonda &quot;Ana Ekrana Ekle&quot; diyerek tam ekran kullanabilirsiniz.
          </p>
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Mobil Üst Başlık */}
        <header className="md:hidden flex items-center justify-between p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0c0d0e]/95 backdrop-blur sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs tracking-wide text-zinc-900 dark:text-zinc-100">LIFE OS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={triggerSync}
              className={`p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 ${isSyncing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Görünümler */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              tasks={tasks}
              habits={habits}
              workouts={workouts}
              pomodoroSessions={pomodoroSessions}
              books={books}
              movies={movies}
              research={research}
              onNavigateTab={setActiveTab}
              onToggleTask={handleToggleTask}
              onToggleHabitToday={handleToggleHabitToday}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksAndHabits
              tasks={tasks}
              categories={categories}
              habits={habits}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onToggleHabitToday={handleToggleHabitToday}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutTracker
              sessions={workouts}
              prs={prs}
              onFinishWorkout={handleFinishWorkout}
            />
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroTimer
              tasks={tasks}
              sessions={pomodoroSessions}
              onSessionComplete={handleSessionComplete}
            />
          )}

          {activeTab === 'bilge' && (
            <BilgeTonyu
              books={books}
              movies={movies}
              research={research}
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
              onAddMovie={handleAddMovie}
              onDeleteMovie={handleDeleteMovie}
              onAddResearch={handleAddResearch}
              onUpdateResearch={handleUpdateResearch}
              onDeleteResearch={handleDeleteResearch}
            />
          )}
        </div>
      </main>

      {/* Mobil Alt Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0c0d0e]/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800/80 px-2 py-1.5 flex justify-around items-center transition-colors">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl relative transition-all ${
                isActive 
                  ? 'text-zinc-900 dark:text-zinc-100 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-zinc-900 dark:bg-zinc-700 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
