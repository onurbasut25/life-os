'use client';

import React, { useState } from 'react';
import { 
  Check, Plus, Trash2, Calendar, 
  Flame, Tag, Filter, CheckCircle2, Clock, 
  Info, ChevronDown, ChevronUp, AlertCircle, RotateCcw, Infinity
} from 'lucide-react';
import { Task, TaskCategory, Habit, HabitType, Priority } from '@/types';
import { soundAlert } from '@/utils/sound';
import { isDateInCurrentWeek } from '@/utils/dateUtils';

interface TasksAndHabitsProps {
  tasks: Task[];
  categories: TaskCategory[];
  habits: Habit[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddCategory: (name: string, color?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleHabitToday: (habitId: string) => void;
  onAddHabit: (data: {
    title: string;
    type: HabitType;
    targetDaysPerWeek: number;
    totalDurationDays?: number;
  }) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const TasksAndHabits: React.FC<TasksAndHabitsProps> = ({
  tasks,
  categories,
  habits,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onAddCategory,
  onDeleteCategory,
  onToggleHabitToday,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'habits'>('tasks');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Görev Oluşturma
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState<string>('');
  const [isIndefinite, setIsIndefinite] = useState<boolean>(false); // Süresiz seçeneği
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTaskDueTime, setNewTaskDueTime] = useState<string>('18:00');
  const [showTaskDetailForm, setShowTaskDetailForm] = useState<boolean>(false);

  // Kategori Ekleme
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

  // Alışkanlık Oluşturma
  const [newHabitTitle, setNewHabitTitle] = useState<string>('');
  const [newHabitType, setNewHabitType] = useState<HabitType>('routine');
  const [newHabitTargetDays, setNewHabitTargetDays] = useState<number>(7);
  const [newHabitTotalDays, setNewHabitTotalDays] = useState<number>(30);
  const [showAddHabitForm, setShowAddHabitForm] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      priority: newTaskPriority,
      completed: false,
      categoryId: newTaskCategoryId || undefined,
      dueDate: isIndefinite ? undefined : (newTaskDueDate || undefined),
      dueTime: isIndefinite ? undefined : (newTaskDueTime || undefined),
      spentMinutes: 0,
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowTaskDetailForm(false);
    soundAlert('beep');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCategoryModal(false);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    onAddHabit({
      title: newHabitTitle.trim(),
      type: newHabitType,
      targetDaysPerWeek: newHabitTargetDays,
      totalDurationDays: newHabitTotalDays > 0 ? newHabitTotalDays : undefined,
    });

    setNewHabitTitle('');
    setShowAddHabitForm(false);
    soundAlert('beep');
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'no-category') return !t.categoryId;
    return t.categoryId === selectedCategoryFilter;
  });

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Sekmeler */}
      <div className="flex bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-200/60 p-1 rounded-xl border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-300 w-full max-w-xs transition-colors">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'tasks'
              ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-white text-zinc-100 dark:text-zinc-100 light:text-zinc-900 shadow-sm border border-zinc-700/60 light:border-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900'
          }`}
        >
          Görevler ({tasks.filter(t => !t.completed).length})
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'habits'
              ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-white text-zinc-100 dark:text-zinc-100 light:text-zinc-900 shadow-sm border border-zinc-700/60 light:border-zinc-300'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-900'
          }`}
        >
          Alışkanlıklar ({habits.length})
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="space-y-5">
          {/* İlerleme ve Kategori Yönetimi */}
          <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white/80 border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800">Görev & Kategori Yönetimi</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-0.5">{tasks.length} görevden {completedTasksCount} tanesi tamamlandı.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs font-medium border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <Tag className="w-3.5 h-3.5" /> Kategori Oluştur
              </button>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-zinc-300 dark:bg-zinc-300 light:bg-zinc-800 h-full rounded-full transition-all duration-300"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700">%{taskProgress}</span>
              </div>
            </div>
          </div>

          {/* Kategori Modalı */}
          {showAddCategoryModal && (
            <form onSubmit={handleCreateCategory} className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 p-4 rounded-2xl flex gap-2.5 items-center">
              <input
                type="text"
                placeholder="Yeni Kategori Adı (örn: Finans, Proje A, Kişisel)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs rounded-xl"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="px-3 py-2 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs rounded-xl"
              >
                İptal
              </button>
            </form>
          )}

          {/* Görev Ekleme Formu */}
          <form onSubmit={handleCreateTask} className="bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-white/80 border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder="Yeni görev başlığı..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-200 dark:text-zinc-200 light:text-zinc-800 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-2 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 focus:outline-none"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>

                <select
                  value={newTaskCategoryId}
                  onChange={(e) => setNewTaskCategoryId(e.target.value)}
                  className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-2 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 focus:outline-none"
                >
                  <option value="">Kategorisiz</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowTaskDetailForm(!showTaskDetailForm)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    showTaskDetailForm 
                      ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 border-zinc-600 light:border-zinc-400 text-zinc-100 dark:text-zinc-100 light:text-zinc-900' 
                      : 'bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-100 border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-400 light:text-zinc-600'
                  }`}
                >
                  Detay / Deadline
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 hover:bg-white dark:hover:bg-white light:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Ekle
                </button>
              </div>
            </div>

            {/* Genişletilebilir Detay (Süresiz Seçeneği ile) */}
            {showTaskDetailForm && (
              <div className="p-3 bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-100/70 rounded-xl border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-300 space-y-3 pt-3">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200">
                  <input
                    type="checkbox"
                    id="indefiniteCheck"
                    checked={isIndefinite}
                    onChange={(e) => setIsIndefinite(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700"
                  />
                  <label htmlFor="indefiniteCheck" className="text-xs font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700 flex items-center gap-1.5 cursor-pointer">
                    <Infinity className="w-3.5 h-3.5" /> Süresiz Görev (Deadline Yok)
                  </label>
                </div>

                {!isIndefinite && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-500 block mb-1">Son Tarih:</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-500 block mb-1">Saat:</label>
                      <input
                        type="time"
                        value={newTaskDueTime}
                        onChange={(e) => setNewTaskDueTime(e.target.value)}
                        className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-500 block mb-1">Görev Detay / Not:</label>
                  <textarea
                    rows={2}
                    placeholder="Bu görevle ilgili özel notlar veya açıklamalar..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-lg px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Kategori Filtre Butonları */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 text-zinc-100 dark:text-zinc-100 light:text-zinc-100 border border-zinc-700/60'
                  : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-zinc-200'
              }`}
            >
              Tümü ({tasks.length})
            </button>
            {categories.map(c => {
              const count = tasks.filter(t => t.categoryId === c.id).length;
              return (
                <div key={c.id} className="flex items-center group">
                  <button
                    onClick={() => setSelectedCategoryFilter(c.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      selectedCategoryFilter === c.id
                        ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 text-zinc-100 dark:text-zinc-100 light:text-zinc-100 border border-zinc-700/60'
                        : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-400 light:bg-zinc-600" />
                    {c.name} ({count})
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${c.name}" kategorisini silmek istiyor musunuz?`)) {
                        onDeleteCategory(c.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 ml-0.5 transition-opacity"
                    title="Kategoriyi Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Görev Listesi */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Bu kriterde görev bulunmuyor.</p>
            ) : (
              filteredTasks.map((t) => {
                const category = categories.find(c => c.id === t.categoryId);
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border transition-all ${
                      t.completed 
                        ? 'bg-zinc-950/30 dark:bg-zinc-950/30 light:bg-zinc-100/50 border-zinc-900/60 light:border-zinc-200 opacity-60' 
                        : 'bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 hover:border-zinc-700/80 light:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => {
                            onToggleTask(t.id);
                            if (!t.completed) soundAlert('beep');
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                            t.completed
                              ? 'bg-zinc-300 dark:bg-zinc-300 light:bg-zinc-900 border-zinc-300 text-zinc-900 dark:text-zinc-900 light:text-zinc-100'
                              : 'border-zinc-700 dark:border-zinc-700 light:border-zinc-300 hover:border-zinc-500 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${t.completed ? 'line-through text-zinc-500' : 'text-zinc-200 dark:text-zinc-200 light:text-zinc-800'}`}>
                            {t.title}
                          </p>
                          {t.description && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-0.5 leading-relaxed">
                              {t.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-zinc-500">
                            {category && (
                              <span className="px-1.5 py-0.2 rounded font-medium text-[10px] bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                                {category.name}
                              </span>
                            )}
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                              t.priority === 'high' ? 'text-zinc-100 bg-zinc-700 dark:bg-zinc-700 light:bg-zinc-300 font-semibold' : 'text-zinc-400 bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100'
                            }`}>
                              {t.priority === 'high' ? 'Yüksek' : t.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </span>
                            {t.dueDate ? (
                              <span className="font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-600 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-500" />
                                {t.dueDate} {t.dueTime ? `• ${t.dueTime}` : ''}
                              </span>
                            ) : (
                              <span className="font-mono text-zinc-500 flex items-center gap-1">
                                <Infinity className="w-3 h-3 text-zinc-500" /> Süresiz
                              </span>
                            )}
                            {t.spentMinutes !== undefined && t.spentMinutes > 0 && (
                              <span className="font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700 font-semibold">
                                ⏱️ {t.spentMinutes} dk harcandı
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`"${t.title}" görevini silmek istediğinize emin misiniz?`)) {
                            onDeleteTask(t.id);
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 rounded-lg transition-colors shrink-0"
                        title="Görevi Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Alışkanlıklar Sekmesi */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800">Alışkanlık & Rutin Yönetimi</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-0.5">
                Rutinler sürekli devam eder; Haftalık alışkanlıklar pazartesi günleri otomatik sıfırlanır.
              </p>
            </div>
            <button
              onClick={() => setShowAddHabitForm(!showAddHabitForm)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-800 text-zinc-200 dark:text-zinc-200 light:text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Alışkanlık
            </button>
          </div>

          {/* Yeni Alışkanlık Formu */}
          {showAddHabitForm && (
            <form onSubmit={handleCreateHabit} className="bg-zinc-900/70 dark:bg-zinc-900/70 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Alışkanlık adı (örn: 3L Su, Haftalık Rapor)..."
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="flex-1 bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />
                <select
                  value={newHabitType}
                  onChange={(e) => setNewHabitType(e.target.value as HabitType)}
                  className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-2 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 focus:outline-none"
                >
                  <option value="routine">Rutin (Sürekli Günlük)</option>
                  <option value="weekly">Haftalık Alışkanlık (Pzt Sıfırlanır)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-500 block mb-1">
                    Haftada Kaç Gün Yapılacak?
                  </label>
                  <select
                    value={newHabitTargetDays}
                    onChange={(e) => setNewHabitTargetDays(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <option key={d} value={d}>Haftada {d} Gün</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-500 block mb-1">
                    Kaç Gün Devam Edecek?
                  </label>
                  <select
                    value={newHabitTotalDays}
                    onChange={(e) => setNewHabitTotalDays(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
                  >
                    <option value={21}>21 Gün</option>
                    <option value={30}>30 Gün</option>
                    <option value={60}>60 Gün</option>
                    <option value={90}>90 Gün</option>
                    <option value={0}>Sınırsız</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHabitForm(false)}
                  className="px-3.5 py-1.5 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 text-xs font-semibold rounded-xl"
                >
                  Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Rutin & Haftalık Listesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {habits.map((habit) => {
              const isWeekly = habit.type === 'weekly';
              const isCompletedToday = habit.completedDates.includes(todayStr);
              const weeklyCompletedCount = habit.completedDates.filter(d => isDateInCurrentWeek(d)).length;

              return (
                <div
                  key={habit.id}
                  className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 flex items-center justify-between transition-all light:shadow-sm"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                        {isWeekly ? 'Haftalık Alışkanlık' : 'Günlük Rutin'}
                      </span>
                      {habit.totalDurationDays && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {habit.totalDurationDays} gün hedefi
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 truncate">{habit.title}</h4>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                        {habit.streak} gün seri
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {isWeekly 
                          ? `(Bu hafta: ${weeklyCompletedCount}/${habit.targetDaysPerWeek} gün)` 
                          : `(Hedef: ${habit.targetDaysPerWeek} gün/hf)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onToggleHabitToday(habit.id);
                        if (!isCompletedToday) soundAlert('beep');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCompletedToday
                          ? 'bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 shadow-sm'
                          : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700'
                      }`}
                    >
                      {isCompletedToday ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Yapıldı
                        </>
                      ) : (
                        'İşaretle'
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`"${habit.title}" alışkanlığını silmek istediğinize emin misiniz?`)) {
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 rounded-lg transition-colors"
                      title="Alışkanlığı Çıkar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
