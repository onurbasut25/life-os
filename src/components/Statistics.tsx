'use client';

import React from 'react';
import { 
  BarChart3, TrendingUp, Dumbbell, Clock, Flame, 
  CheckCircle2, Trophy, Award, Calendar, Zap
} from 'lucide-react';
import { Task, Habit, WorkoutSession, PomodoroSession, PersonalRecord } from '@/types';

interface StatisticsProps {
  tasks: Task[];
  habits: Habit[];
  workouts: WorkoutSession[];
  pomodoroSessions: PomodoroSession[];
  prs: PersonalRecord[];
}

export const Statistics: React.FC<StatisticsProps> = ({
  tasks,
  habits,
  workouts,
  pomodoroSessions,
  prs,
}) => {
  // Odak süresi toplamı
  const totalFocusMinutes = pomodoroSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Spor toplamları
  const totalWorkoutMinutes = workouts.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalSets = workouts.reduce((acc, curr) => {
    return acc + curr.exercises.reduce((exAcc, ex) => exAcc + ex.sets.filter(s => s.completed).length, 0);
  }, 0);
  const totalTonnageKg = workouts.reduce((acc, curr) => {
    return acc + curr.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0);
    }, 0);
  }, 0);

  // Görev tamamlanma oranı
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Alışkanlık ortalama streak
  const avgHabitStreak = habits.length > 0 
    ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length) 
    : 0;

  // Haftalık son 7 gün simülasyonu
  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const weeklyFocusData = [50, 75, 25, 100, 50, 125, totalFocusMinutes > 0 ? 50 : 25];

  return (
    <div className="space-y-6">
      {/* Top Banner Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-900/30 to-zinc-900 border border-indigo-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10">Odak</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{totalFocusHours} <span className="text-sm font-normal text-zinc-400">saat</span></p>
          <p className="text-xs text-zinc-400 mt-1">{pomodoroSessions.length} derin çalışma seansı</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-zinc-900 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10">Hacim</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{Math.round(totalTonnageKg).toLocaleString()} <span className="text-sm font-normal text-zinc-400">kg</span></p>
          <p className="text-xs text-zinc-400 mt-1">{totalSets} tamamlanan set</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/30 to-zinc-900 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10">Görev</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">%{taskCompletionRate}</p>
          <p className="text-xs text-zinc-400 mt-1">{completedTasks} / {tasks.length} tamamlandı</p>
        </div>

        <div className="bg-gradient-to-br from-amber-900/30 to-zinc-900 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10">Disiplin</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{avgHabitStreak} <span className="text-sm font-normal text-zinc-400">gün</span></p>
          <p className="text-xs text-zinc-400 mt-1">Ortalama alışkanlık serisi</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Bar Chart */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" /> Haftalık Pomodoro Dağılımı
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Günlük tamamlanan derin odaklanma süreleri (dakika)</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
              Son 7 Gün
            </span>
          </div>

          <div className="flex items-end justify-between h-44 gap-2 pt-4 px-2 border-b border-zinc-800">
            {daysOfWeek.map((day, idx) => {
              const val = weeklyFocusData[idx];
              const maxVal = 130;
              const heightPercent = Math.min(100, Math.max(15, (val / maxVal) * 100));

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}m
                  </span>
                  <div className="w-full bg-zinc-800/80 rounded-t-xl h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-indigo-500 hover:bg-indigo-400 transition-all rounded-t-xl"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 font-semibold mt-2">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PR & Strength Progression */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Güç Gelişimi & PR Zirveleri
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">En yüksek kaldırılan ağırlıklar ve güç oranları</p>
            </div>
          </div>

          <div className="space-y-3.5 mt-4">
            {prs.map((pr, idx) => {
              const baseTarget = 120; // referans max scale
              const percent = Math.min(100, Math.round((pr.maxWeight / baseTarget) * 100));

              return (
                <div key={idx} className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-zinc-200">{pr.exerciseName}</span>
                    <span className="font-mono text-amber-400 font-bold">{pr.maxWeight} kg ({pr.reps} rep)</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1.5 flex justify-between">
                    <span>Kayıt Tarihi: {pr.date}</span>
                    <span>Hedef Kapasitesi: %{percent}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Habit Consistency Radar / Grid */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Alışkanlık Sadakat Matrisi
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {habits.map((h) => (
            <div key={h.id} className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl">
              <h4 className="text-sm font-bold text-white">{h.title}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-black text-amber-400 font-mono">{h.streak}</span>
                <span className="text-xs text-zinc-400">gün seri</span>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-sm ${
                      i < (h.streak % 7 || (h.streak > 0 ? 7 : 0))
                        ? 'bg-emerald-500'
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
