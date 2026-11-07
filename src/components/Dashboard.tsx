'use client';

import React from 'react';
import { 
  BarChart3, Dumbbell, Timer, Flame, CheckCircle2, Trophy, 
  ArrowRight, Plus, ChevronRight, Activity, TrendingUp, BookOpen, Film, Search, Clock, Infinity
} from 'lucide-react';
import { Task, Habit, WorkoutSession, PomodoroSession, BookItem, MovieItem, ResearchItem } from '@/types';
import { soundAlert } from '@/utils/sound';

interface DashboardProps {
  tasks: Task[];
  habits: Habit[];
  workouts: WorkoutSession[];
  pomodoroSessions: PomodoroSession[];
  books: BookItem[];
  movies: MovieItem[];
  research: ResearchItem[];
  onNavigateTab: (tab: 'dashboard' | 'tasks' | 'workouts' | 'pomodoro' | 'bilge') => void;
  onToggleTask: (id: string) => void;
  onToggleHabitToday: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  habits,
  workouts,
  pomodoroSessions,
  books,
  movies,
  research,
  onNavigateTab,
  onToggleTask,
  onToggleHabitToday,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);
  const completedTodayTasks = tasks.filter(t => t.completed).length;

  const totalFocusMinutes = pomodoroSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const todayFocusMins = pomodoroSessions
    .filter(s => s.timestamp.startsWith(todayStr))
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTodayTasks / tasks.length) * 100) : 0;
  const avgHabitStreak = habits.length > 0 
    ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length) 
    : 0;

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const weeklyFocusData = [50, 75, 25, 100, 50, 125, todayFocusMins > 0 ? todayFocusMins : 25];

  const bookCategoryCounts: Record<string, number> = {};
  books.forEach(b => {
    bookCategoryCounts[b.mainCategory] = (bookCategoryCounts[b.mainCategory] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* 1. ÜST PANEL: ALIŞKANLIKLAR & GÖREV PANOLARI (En Tepeye Taşındı) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Görev Panosu */}
        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 light:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-400" /> Günlük Öncelikli Görevler
            </h3>
            <button 
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 flex items-center gap-1 font-medium"
            >
              Tümünü Yönet <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Harika! Bekleyen öncelikli görevin kalmadı.</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-50 border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => {
                        onToggleTask(t.id);
                        soundAlert('beep');
                      }}
                      className="w-4 h-4 rounded border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 hover:border-zinc-400 shrink-0"
                    />
                    <div className="truncate flex-1">
                      <span className="text-xs font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800 block truncate">{t.title}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                        {t.dueDate ? (
                          <span className="font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {t.dueDate} {t.dueTime || ''}
                          </span>
                        ) : (
                          <span className="font-mono flex items-center gap-1">
                            <Infinity className="w-2.5 h-2.5" /> Süresiz
                          </span>
                        )}
                        {t.spentMinutes !== undefined && t.spentMinutes > 0 && (
                          <span className="font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                            ⏱️ {t.spentMinutes} dk
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    t.priority === 'high' ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-semibold' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {t.priority === 'high' ? 'Yüksek' : 'Orta'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alışkanlıklar Panosu */}
        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 light:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-zinc-400" /> Günlük Alışkanlık Onayı
            </h3>
            <button 
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 flex items-center gap-1 font-medium"
            >
              Listeyi Düzenle <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {habits.map((h) => {
              const done = h.completedDates.includes(todayStr);
              return (
                <div
                  key={h.id}
                  onClick={() => {
                    onToggleHabitToday(h.id);
                    soundAlert('beep');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    done 
                      ? 'bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-zinc-100 border-zinc-700 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-900' 
                      : 'bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-50 border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 hover:border-zinc-700/80 text-zinc-400'
                  }`}
                >
                  <div className="min-w-0 mr-2">
                    <p className="text-xs font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 truncate">{h.title}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 font-mono mt-0.5">
                      {h.type === 'weekly' ? 'Haftalık' : 'Rutin'} • {h.streak} gün seri
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                    done ? 'bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100' : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-500'
                  }`}>
                    ✓
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. ORTA BÖLÜM: 4 TEMEL METRİK KARTI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 light:shadow-sm">
          <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Toplam Odak Süresi</p>
          <p className="text-2xl font-bold font-mono text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">
            {totalFocusHours} <span className="text-xs font-normal text-zinc-500">saat</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">{pomodoroSessions.length} seans</p>
        </div>

        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 light:shadow-sm">
          <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Görev Tamamlama</p>
          <p className="text-2xl font-bold font-mono text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">
            %{taskCompletionRate}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">{completedTodayTasks} / {tasks.length} bitti</p>
        </div>

        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 light:shadow-sm">
          <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Ortalama Seri</p>
          <p className="text-2xl font-bold font-mono text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">
            {avgHabitStreak} <span className="text-xs font-normal text-zinc-500">gün</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">{habits.length} aktif takip</p>
        </div>

        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 light:shadow-sm">
          <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">BilgeTonyu Arşivi</p>
          <p className="text-2xl font-bold font-mono text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">
            {books.length + movies.length + research.length}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">{books.length} kitap • {movies.length} film</p>
        </div>
      </div>

      {/* 3. ALT BÖLÜM: ANALİZ & GRAFİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Haftalık Pomodoro Dağılımı */}
        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 light:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" /> Haftalık Pomodoro Dağılımı (Dakika)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Son 7 günde tamamlanan derin odaklanma süreleri</p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 px-2 py-0.5 rounded">
              7 Günlük
            </span>
          </div>

          <div className="flex items-end justify-between h-36 gap-2 pt-3 px-1 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
            {daysOfWeek.map((day, idx) => {
              const val = weeklyFocusData[idx];
              const maxVal = 130;
              const heightPercent = Math.min(100, Math.max(12, (val / maxVal) * 100));

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}m
                  </span>
                  <div className="w-full bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-zinc-200 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-zinc-400 dark:bg-zinc-400 light:bg-zinc-800 hover:bg-zinc-300 transition-all rounded-t-lg"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BilgeTonyu Kategori Dağılımı */}
        <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 light:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-400" /> BilgeTonyu Kategori Analizi
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Kategorilere göre okunan kitap dağılımı</p>
            </div>
            <button
              onClick={() => onNavigateTab('bilge')}
              className="text-xs text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 font-medium flex items-center gap-1"
            >
              Arşive Git <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 mt-2">
            {Object.keys(bookCategoryCounts).length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Henüz kitap kaydı eklenmedi.</p>
            ) : (
              Object.entries(bookCategoryCounts).map(([cat, count]) => {
                const percent = Math.min(100, Math.round((count / Math.max(books.length, 1)) * 100));
                return (
                  <div key={cat} className="bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-50 border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 p-2.5 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700">{cat}</span>
                      <span className="font-mono text-zinc-100 dark:text-zinc-100 light:text-zinc-900 font-semibold">{count} Kitap (%{percent})</span>
                    </div>
                    <div className="w-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-400 dark:bg-zinc-400 light:bg-zinc-800 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-50 p-2 rounded-lg border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200">
                <span className="text-zinc-500 block text-[10px]">İncelenen Filmler</span>
                <span className="font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800">{movies.length} Eser</span>
              </div>
              <div className="bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-50 p-2 rounded-lg border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200">
                <span className="text-zinc-500 block text-[10px]">Araştırma Konuları</span>
                <span className="font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800">{research.length} Başlık</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
