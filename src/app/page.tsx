'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, CheckSquare, Dumbbell, Timer, BookOpen,
  Smartphone, RefreshCw, Zap, Moon, Sun, User, LogOut, Trash2, CheckCircle2, ShieldAlert
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
import { AuthModal } from '@/components/AuthModal';
import { LandingPage } from '@/components/LandingPage';
import { getSupabaseClient, isSupabaseConfigured } from '@/utils/supabaseClient';
import { soundAlert } from '@/utils/sound';

type Tab = 'dashboard' | 'tasks' | 'workouts' | 'pomodoro' | 'bilge';

const THEME_KEY = 'LIFE_OS_THEME_CHOICE';
const USERNAME_KEY = 'LIFE_OS_CURRENT_USER';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Kullanıcı Hesabı & Profil
  const [username, setUsername] = useState<string | null>(null);
  const [inApp, setInApp] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);

  // Veri Durumları
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

  // Senkronizasyon referansı
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // İlk yükleme
  useEffect(() => {
    setIsClient(true);
    try {
      // Tema
      const savedTheme = (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
      setTheme(savedTheme);
      applyTheme(savedTheme);

      // Kullanıcı hesabı
      const savedUser = localStorage.getItem(USERNAME_KEY);
      if (savedUser) {
        setUsername(savedUser);
        loadUserData(savedUser);
        // Önceden giriş yapılmışsa doğrudan kokpite al
        setInApp(true);
      } else {
        // Yeni ziyaretçide landing page gösterilir, 'Uygulamayı Aç' denince modal açılır
        setInApp(false);
      }
    } catch (e) {
      console.error('Başlangıç hatası:', e);
    }
  }, []);

  // Supabase Gerçek Zamanlı (WebSocket) Dinleme
  useEffect(() => {
    if (!username) return;
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel(`life-os-sync-${username}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'life_os_state',
          filter: `username=eq.${username}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.data) {
            console.log('⚡ Supabase WebSocket canlı veri alındı:', payload.new.updated_at);
            populateState(payload.new.data);
            if (typeof window !== 'undefined') {
              const localKey = `LIFE_OS_DATA_${username.toLowerCase()}`;
              localStorage.setItem(localKey, JSON.stringify(payload.new.data));
            }
            setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [username]);

  const applyTheme = (t: 'dark' | 'light') => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  // Kullanıcı verisini hem LocalStorage hem Bulut API'den çek
  const loadUserData = async (userKey: string) => {
    const localKey = `LIFE_OS_DATA_${userKey.toLowerCase()}`;
    let loadedFromLocal = false;

    // 1. Önce anında LocalStorage'dan yükle (Hızlı açılış)
    try {
      const localData = localStorage.getItem(localKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        populateState(parsed);
        loadedFromLocal = true;
      }
    } catch (e) {
      console.warn('LocalStorage okunamadı:', e);
    }

    // 2. Supabase varsa önce direkt Supabase'den çek
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from('life_os_state')
          .select('data, updated_at')
          .eq('username', userKey)
          .single();

        if (data && data.data && !error) {
          populateState(data.data);
          localStorage.setItem(localKey, JSON.stringify(data.data));
          setIsSyncing(false);
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          return;
        }
      } catch (e) {
        console.warn('Supabase fetch offline/hata:', e);
      }
    }

    // 3. Ardından yerel API'deki güncel bulut verisini çekip eşle
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/data?username=${encodeURIComponent(userKey)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          populateState(json.data);
          // LocalStorage'ı da güncelle
          localStorage.setItem(localKey, JSON.stringify(json.data));
        } else if (loadedFromLocal) {
          // Eğer sunucuda yoksa ama localde varsa, sunucuya yedekle
          const localData = localStorage.getItem(localKey);
          if (localData) {
            pushToCloud(userKey, JSON.parse(localData));
          }
        }
      }
    } catch (e) {
      console.warn('Bulut senkronizasyonu offline:', e);
    } finally {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const populateState = (data: any) => {
    if (data.tasks) setTasks(data.tasks);
    if (data.categories) setCategories(data.categories);
    if (data.habits) setHabits(data.habits);
    if (data.workouts) setWorkouts(data.workouts);
    if (data.pomodoroSessions) setPomodoroSessions(data.pomodoroSessions);
    if (data.prs) setPrs(data.prs);
    if (data.books) setBooks(data.books);
    if (data.movies) setMovies(data.movies);
    if (data.research) setResearch(data.research);
  };

  // Veri güncelleme & otomatik bulut senkronizasyonu
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

    // 1. Her zaman anında LocalStorage'a yaz
    if (typeof window !== 'undefined' && username) {
      const localKey = `LIFE_OS_DATA_${username.toLowerCase()}`;
      try {
        localStorage.setItem(localKey, JSON.stringify(currentState));
      } catch (e) {
        console.error('LocalStorage yazma hatası:', e);
      }

      // 2. Buluta otomatik arka planda gönder (Debounce 600ms)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      setIsSyncing(true);
      syncTimeoutRef.current = setTimeout(() => {
        pushToCloud(username, currentState);
      }, 600);
    }
  };

  const pushToCloud = async (userKey: string, data: any) => {
    // A) Supabase Bulut DB (Varsa anında WebSocket ile diğer cihazlara yayınlar)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('life_os_state')
          .upsert({
            username: userKey,
            data,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'username' });
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.warn('Supabase upsert hatası:', err);
      }
    }

    // B) Dahili API Yedeklemesi
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userKey, data }),
      });
      if (res.ok) {
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.warn('Buluta yazma gecikmeli:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Kullanıcı Girişi / Profil Belirleme
  const handleLogin = (newUser: string) => {
    const sanitized = newUser.trim().toLowerCase();
    setUsername(sanitized);
    localStorage.setItem(USERNAME_KEY, sanitized);
    setShowAuthModal(false);
    loadUserData(sanitized);
  };

  // Çıkış yap
  const handleLogout = () => {
    if (confirm('Oturumdan çıkmak istediğinize emin misiniz?')) {
      setUsername(null);
      localStorage.removeItem(USERNAME_KEY);
      // Durumları boşalt
      populateState({
        tasks: [],
        categories: INITIAL_TASK_CATEGORIES,
        habits: [],
        workouts: [],
        pomodoroSessions: [],
        prs: [],
        books: [],
        movies: [],
        research: [],
      });
      setShowAuthModal(true);
    }
  };

  // TÜM GEÇMİŞİ VE VERİLERİ SİLME (Kullanıcının özel isteği)
  const handleClearAllHistory = async () => {
    if (!username) return;

    try {
      setIsSyncing(true);
      // 1. LocalStorage'ı temizle
      const localKey = `LIFE_OS_DATA_${username.toLowerCase()}`;
      localStorage.removeItem(localKey);

      // 2. Buluttan sil
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, action: 'clear' }),
      });

      // 3. State'leri tamamen sıfırla
      setTasks([]);
      setHabits([]);
      setWorkouts([]);
      setPomodoroSessions([]);
      setPrs([]);
      setBooks([]);
      setMovies([]);
      setResearch([]);

      setShowClearConfirmModal(false);
      soundAlert('success');
      alert('Tüm verileriniz ve geçmiş kayıtlarınız başarıyla silindi.');
    } catch (e) {
      alert('Silme sırasında bir hata oluştu.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Manuel Eşitleme Butonu
  const triggerManualSync = () => {
    if (username) {
      loadUserData(username);
    } else {
      setShowAuthModal(true);
    }
  };

  // Görev İşlemleri
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    saveState({ tasks: updated });
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
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    saveState({ tasks: updated });
  };

  const handleAddCategory = (name: string) => {
    const newCat: TaskCategory = { id: 'cat-' + Date.now(), name };
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
        return { ...h, completedDates: newDates, streak: newStreak };
      }
      return h;
    });
    setHabits(updated);
    saveState({ habits: updated });
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
  };

  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    saveState({ habits: updated });
  };

  // Workout İşlemleri
  const handleFinishWorkout = (newWorkout: WorkoutSession, newPrs: PersonalRecord[]) => {
    const updatedWorkouts = [newWorkout, ...workouts];
    setWorkouts(updatedWorkouts);
    setPrs(newPrs);
    saveState({ workouts: updatedWorkouts, prs: newPrs });
  };

  // Pomodoro
  const handleSessionComplete = (session: PomodoroSession, spentMinutes: number, taskTitle?: string) => {
    const updatedSessions = [session, ...pomodoroSessions];
    setPomodoroSessions(updatedSessions);

    let updatedTasks = tasks;
    if (taskTitle) {
      updatedTasks = tasks.map(t => {
        if (t.title.toLowerCase() === taskTitle.toLowerCase()) {
          return { ...t, spentMinutes: (t.spentMinutes || 0) + spentMinutes };
        }
        return t;
      });
      setTasks(updatedTasks);
    }

    saveState({ pomodoroSessions: updatedSessions, tasks: updatedTasks });
  };

  // BilgeTonyu
  const handleAddBook = (book: Omit<BookItem, 'id'>) => {
    const newBook: BookItem = { ...book, id: 'b-' + Date.now() };
    const updated = [newBook, ...books];
    setBooks(updated);
    saveState({ books: updated });
  };

  const handleUpdateBook = (id: string, updates: Partial<BookItem>) => {
    const updated = books.map(b => b.id === id ? { ...b, ...updates } : b);
    setBooks(updated);
    saveState({ books: updated });
  };

  const handleDeleteBook = (id: string) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    saveState({ books: updated });
  };

  const handleAddMovie = (movie: Omit<MovieItem, 'id'>) => {
    const newMovie: MovieItem = { ...movie, id: 'm-' + Date.now() };
    const updated = [newMovie, ...movies];
    setMovies(updated);
    saveState({ movies: updated });
  };

  const handleDeleteMovie = (id: string) => {
    const updated = movies.filter(m => m.id !== id);
    setMovies(updated);
    saveState({ movies: updated });
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
  };

  const handleUpdateResearch = (id: string, updates: Partial<ResearchItem>) => {
    const updated = research.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : r);
    setResearch(updated);
    saveState({ research: updated });
  };

  const handleDeleteResearch = (id: string) => {
    const updated = research.filter(r => r.id !== id);
    setResearch(updated);
    saveState({ research: updated });
  };

  if (!isClient) {
    return <div className="min-h-screen bg-[#090a0b] text-zinc-400 flex items-center justify-center text-xs font-mono">Life OS Yükleniyor...</div>;
  }

  // Eğer kullanıcı kokpite henüz girmemişse kurumsal karşılama (Landing Page) sayfasını göster
  if (!inApp) {
    return (
      <>
        {showAuthModal && (
          <AuthModal
            currentUsername={username}
            onLogin={(u) => {
              handleLogin(u);
              setInApp(true);
            }}
            allowClose={true}
            onClose={() => setShowAuthModal(false)}
          />
        )}
        <LandingPage
          currentUser={username}
          onEnterApp={() => {
            if (username) {
              setInApp(true);
            } else {
              setShowAuthModal(true);
            }
          }}
        />
      </>
    );
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
      
      {/* Profil / Hesap Girişi Modalı */}
      {showAuthModal && (
        <AuthModal
          currentUsername={username}
          onLogin={handleLogin}
          allowClose={Boolean(username)}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* TÜM VERİLERİ SİLME ONAY MODALI */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#121316] border border-rose-200 dark:border-rose-950 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-2xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Tüm Geçmişi ve Verileri Sil?</h3>
                <p className="text-xs text-zinc-500">Bu işlem geri alınamaz.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Bu hesaba ait <strong>bütün görevler, alışkanlıklar, antrenman setleri, pomodoro geçmişi ve BilgeTonyu arşivi</strong> kalıcı olarak silinecektir.
            </p>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-200"
              >
                Vazgeç
              </button>
              <button
                onClick={handleClearAllHistory}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-md"
              >
                Evet, Hepsini Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Laptop Kenar Çubuğu (Sidebar) */}
      <aside className="hidden md:flex w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0d0e] flex-col justify-between shrink-0 p-4 sticky top-0 h-screen transition-colors">
        <div className="space-y-4">
          {/* Logo & Marka & Tema */}
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => setInApp(false)}
              className="flex items-center gap-2.5 text-left group"
              title="Karşılama Sayfasına Dön"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700/80 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 block group-hover:text-zinc-500 transition-colors">LIFE OS</span>
                <span className="text-[10px] text-zinc-500 font-mono">Kişisel Kokpit</span>
              </div>
            </button>

            {/* Tema Geçişi */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors"
              title={theme === 'dark' ? 'Açık Temaya Geç' : 'Karanlık Temaya Geç'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Aktif Hesap & Senkronizasyon Durumu */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 text-left group min-w-0"
                title="Hesap Değiştir"
              >
                <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:underline">
                    {username ? `@${username}` : 'Hesap Bağla'}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Otomatik Kayıt
                  </p>
                </div>
              </button>

              <button 
                onClick={triggerManualSync}
                className={`p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all ${isSyncing ? 'animate-spin' : ''}`}
                title="Şimdi Eşitle"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {lastSyncTime && (
              <p className="text-[10px] text-zinc-400 font-mono">Son senkron: {lastSyncTime}</p>
            )}
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

        {/* Alt Bölüm: Tüm Verileri Silme & Oturum */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Tüm Geçmişi & Verileri Sil
          </button>

          {username && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
            >
              <LogOut className="w-3 h-3" /> Çıkış Yap
            </button>
          )}
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Mobil Üst Başlık */}
        <header className="md:hidden flex items-center justify-between p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0c0d0e]/95 backdrop-blur sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white"
            >
              <User className="w-3.5 h-3.5" />
            </button>
            <div>
              <span className="font-bold text-xs tracking-wide text-zinc-900 dark:text-zinc-100 block">
                {username ? `@${username}` : 'LIFE OS'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Tüm Verileri Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={triggerManualSync}
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
