'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, Plus, Trash2, Check, Timer, Trophy, 
  Calendar, Flame, History, Play, CheckCircle, ChevronDown, ChevronUp, AlertCircle, ArrowUpRight, XCircle, CheckCheck
} from 'lucide-react';
import { WorkoutRoutine, WorkoutSession, Exercise, ExerciseSet, PersonalRecord } from '@/types';
import { WORKOUT_TEMPLATES } from '@/utils/mockData';
import { soundAlert } from '@/utils/sound';

interface WorkoutTrackerProps {
  sessions: WorkoutSession[];
  prs: PersonalRecord[];
  onFinishWorkout: (session: WorkoutSession, newPrs: PersonalRecord[]) => void;
  onAddRoutineTemplate?: (routine: WorkoutRoutine) => void;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ 
  sessions, 
  prs, 
  onFinishWorkout,
  onAddRoutineTemplate 
}) => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(WORKOUT_TEMPLATES);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [recentPrNotice, setRecentPrNotice] = useState<string | null>(null);

  // Yeni Şablon / Program Oluşturma State'i
  const [showAddRoutineModal, setShowAddRoutineModal] = useState<boolean>(false);
  const [newRoutineName, setNewRoutineName] = useState<string>('');
  const [newRoutineExercises, setNewRoutineExercises] = useState<{ name: string; muscleGroup: Exercise['muscleGroup']; defaultSets: number }[]>([
    { name: '', muscleGroup: 'Göğüs', defaultSets: 3 }
  ]);

  // Antrenman içi egzersiz ekleme
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<boolean>(false);
  const [newExName, setNewExName] = useState<string>('');
  const [newExGroup, setNewExGroup] = useState<Exercise['muscleGroup']>('Göğüs');

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeSession) {
      durationTimerRef.current = setInterval(() => {
        setWorkoutDuration(d => d + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setWorkoutDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [activeSession]);

  useEffect(() => {
    if (restTimerSeconds !== null && restTimerSeconds > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimerSeconds(prev => {
          if (prev === null || prev <= 1) {
            soundAlert('rest');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [restTimerSeconds]);

  // Yeni Program Şablonu Oluşturma
  const handleSaveNewRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;

    const validExercises = newRoutineExercises.filter(ex => ex.name.trim() !== '');
    if (validExercises.length === 0) {
      alert('Lütfen en az bir egzersiz adı giriniz.');
      return;
    }

    const createdRoutine: WorkoutRoutine = {
      id: 'routine-' + Date.now(),
      name: newRoutineName.trim(),
      exercises: validExercises,
    };

    setRoutines([...routines, createdRoutine]);
    if (onAddRoutineTemplate) onAddRoutineTemplate(createdRoutine);

    setNewRoutineName('');
    setNewRoutineExercises([{ name: '', muscleGroup: 'Göğüs', defaultSets: 3 }]);
    setShowAddRoutineModal(false);
    soundAlert('success');
  };

  const addExerciseFieldToRoutine = () => {
    setNewRoutineExercises([
      ...newRoutineExercises,
      { name: '', muscleGroup: 'Sırt', defaultSets: 3 }
    ]);
  };

  const removeExerciseFieldFromRoutine = (index: number) => {
    const updated = [...newRoutineExercises];
    updated.splice(index, 1);
    setNewRoutineExercises(updated);
  };

  // Antrenmanı Başlat
  const startWorkoutFromTemplate = (templateId: string) => {
    const tmpl = routines.find(t => t.id === templateId) || routines[0];
    
    const exercises: Exercise[] = tmpl.exercises.map((ex, idx) => {
      let prevW = 20;
      let prevR = 10;
      for (const sess of sessions) {
        const found = sess.exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
        if (found && found.sets.length > 0) {
          prevW = found.sets[0].weight;
          prevR = found.sets[0].reps;
          break;
        }
      }

      const sets: ExerciseSet[] = Array.from({ length: ex.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        prevWeight: prevW,
        prevReps: prevR,
        weight: prevW,
        reps: prevR,
        completed: false,
      }));

      return {
        id: 'ex-' + idx + '-' + Date.now(),
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets,
      };
    });

    setActiveSession({
      id: 'ws-' + Date.now(),
      routineName: tmpl.name,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 0,
      exercises,
      notes: '',
    });
    setWorkoutDuration(0);
    soundAlert('beep');
  };

  // DİREKT "TAM OLARAK YAPILDI" İŞARETLEME (Kullanıcının özel isteği)
  const completeWorkoutDirectly = (templateId: string) => {
    const tmpl = routines.find(t => t.id === templateId) || routines[0];
    if (!confirm(`"${tmpl.name}" antrenmanındaki tüm setler tam olarak yapıldı olarak kaydedilsin mi?`)) return;

    const exercises: Exercise[] = tmpl.exercises.map((ex, idx) => {
      let targetW = 20;
      let targetR = 10;
      for (const sess of sessions) {
        const found = sess.exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
        if (found && found.sets.length > 0) {
          targetW = found.sets[0].weight;
          targetR = found.sets[0].reps;
          break;
        }
      }

      const sets: ExerciseSet[] = Array.from({ length: ex.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        prevWeight: targetW,
        prevReps: targetR,
        weight: targetW,
        reps: targetR,
        completed: true, // Direkt onaylı
      }));

      return {
        id: 'ex-' + idx + '-' + Date.now(),
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets,
      };
    });

    const finished: WorkoutSession = {
      id: 'ws-' + Date.now(),
      routineName: tmpl.name,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 50, // Otomatik standart süre
      exercises,
      notes: 'Hızlı onay: Tüm setler eksiksiz tamamlandı.',
    };

    onFinishWorkout(finished, prs);
    soundAlert('success');
  };

  const cancelWorkout = () => {
    if (confirm('Devam eden antrenmanı iptal etmek istediğinize emin misiniz?')) {
      setActiveSession(null);
      setRestTimerSeconds(null);
      setWorkoutDuration(0);
    }
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    const currentSet = updatedExercises[exerciseIndex].sets[setIndex];
    const newStatus = !currentSet.completed;
    currentSet.completed = newStatus;
    setActiveSession({ ...activeSession, exercises: updatedExercises });

    if (newStatus) {
      soundAlert('beep');
      setRestTimerSeconds(90);

      const exName = updatedExercises[exerciseIndex].name;
      const currentPr = prs.find(p => p.exerciseName.toLowerCase() === exName.toLowerCase());
      if (currentPr && currentSet.weight > currentPr.maxWeight) {
        setRecentPrNotice(`Yeni PR: ${exName} - ${currentSet.weight} kg`);
        setTimeout(() => setRecentPrNotice(null), 4000);
      }
    }
  };

  const addSet = (exerciseIndex: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    const existingSets = updatedExercises[exerciseIndex].sets;
    const lastSet = existingSets[existingSets.length - 1];
    existingSets.push({
      setNumber: existingSets.length + 1,
      prevWeight: lastSet ? lastSet.weight : 20,
      prevReps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 10,
      completed: false,
    });
    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    updatedExercises[exerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  const removeExerciseFromSession = (exerciseIndex: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    const removedName = updatedExercises[exerciseIndex].name;
    if (confirm(`"${removedName}" hareketini bu antrenmandan çıkarmak istiyor musunuz?`)) {
      updatedExercises.splice(exerciseIndex, 1);
      setActiveSession({ ...activeSession, exercises: updatedExercises });
    }
  };

  const handleAddNewExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !newExName.trim()) return;

    const newEx: Exercise = {
      id: 'ex-cust-' + Date.now(),
      name: newExName.trim(),
      muscleGroup: newExGroup,
      sets: [
        { setNumber: 1, weight: 20, reps: 10, completed: false },
        { setNumber: 2, weight: 20, reps: 10, completed: false },
        { setNumber: 3, weight: 20, reps: 10, completed: false },
      ],
    };

    setActiveSession({
      ...activeSession,
      exercises: [...activeSession.exercises, newEx],
    });
    setNewExName('');
    setShowAddExerciseModal(false);
  };

  const completeWorkout = () => {
    if (!activeSession) return;
    const durationMins = Math.max(1, Math.round(workoutDuration / 60));
    
    const newPrs: PersonalRecord[] = [...prs];
    activeSession.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed && s.weight > 0) {
          const existing = newPrs.find(p => p.exerciseName.toLowerCase() === ex.name.toLowerCase());
          if (!existing) {
            newPrs.push({
              exerciseName: ex.name,
              maxWeight: s.weight,
              reps: s.reps,
              date: new Date().toISOString().split('T')[0]
            });
          } else if (s.weight > existing.maxWeight) {
            existing.maxWeight = s.weight;
            existing.reps = s.reps;
            existing.date = new Date().toISOString().split('T')[0];
          }
        }
      });
    });

    const finished: WorkoutSession = {
      ...activeSession,
      durationMinutes: durationMins,
    };

    onFinishWorkout(finished, newPrs);
    setActiveSession(null);
    setRestTimerSeconds(null);
    soundAlert('success');
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const totalWorkoutMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalWorkoutSets = sessions.reduce((acc, curr) => {
    return acc + curr.exercises.reduce((exAcc, ex) => exAcc + ex.sets.filter(s => s.completed).length, 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* PR Bildirimi */}
      {recentPrNotice && (
        <div className="p-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold">{recentPrNotice}</span>
          </div>
          <button onClick={() => setRecentPrNotice(null)} className="text-zinc-400 hover:text-white">Kapat</button>
        </div>
      )}

      {/* Dinlenme Sayacı Floating Bar */}
      {restTimerSeconds !== null && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-700 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Dinlenme</p>
            <p className="text-base font-bold text-zinc-100 font-mono">{formatTimer(restTimerSeconds)}</p>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setRestTimerSeconds(s => (s || 0) + 30)}
              className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              +30s
            </button>
            <button
              onClick={() => setRestTimerSeconds(null)}
              className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Aktif Antrenman Ekranı */}
      {activeSession ? (
        <div className="space-y-5">
          <div className="bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 rounded-2xl p-5 light:shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Canlı Antrenman Kaydı
                </span>
                <h2 className="text-xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">{activeSession.routineName}</h2>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                  <span>Süre: {formatTimer(workoutDuration)}</span>
                  <span>Tarih: {activeSession.date}</span>
                  <span>Hareket: {activeSession.exercises.length}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddExerciseModal(true)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-200 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Egzersiz Ekle
                </button>

                <button
                  onClick={() => setRestTimerSeconds(restTimerSeconds ? null : 90)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Timer className="w-3.5 h-3.5 text-zinc-400" /> Dinlenme: 90s
                </button>

                <button
                  onClick={cancelWorkout}
                  className="px-3 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" /> İptal Et
                </button>

                <button
                  onClick={completeWorkout}
                  className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 hover:bg-white text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Antrenmanı Bitir
                </button>
              </div>
            </div>

            <div className="mt-3.5 pt-3.5 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
              <input
                type="text"
                placeholder="Bugünkü antrenman notu..."
                value={activeSession.notes || ''}
                onChange={(e) => setActiveSession({ ...activeSession, notes: e.target.value })}
                className="w-full bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3.5 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          {showAddExerciseModal && (
            <form onSubmit={handleAddNewExercise} className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-700 p-4 rounded-2xl flex flex-col sm:flex-row gap-2.5 items-center">
              <input
                type="text"
                placeholder="Egzersiz adı..."
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="flex-1 bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none w-full"
              />
              <select
                value={newExGroup}
                onChange={(e) => setNewExGroup(e.target.value as Exercise['muscleGroup'])}
                className="bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-2 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700"
              >
                <option value="Göğüs">Göğüs</option>
                <option value="Sırt">Sırt</option>
                <option value="Bacak">Bacak</option>
                <option value="Omuz">Omuz</option>
                <option value="Kol">Kol</option>
                <option value="Karın">Karın</option>
                <option value="Kardiyo">Kardiyo</option>
              </select>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs rounded-xl"
                >
                  Listeye Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddExerciseModal(false)}
                  className="px-3 py-2 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-400 text-xs rounded-xl"
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          {/* Egzersiz Listesi */}
          <div className="space-y-3.5">
            {activeSession.exercises.map((exercise, exIdx) => {
              const currentPr = prs.find(p => p.exerciseName.toLowerCase() === exercise.name.toLowerCase());

              return (
                <div key={exercise.id} className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 light:shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs font-mono font-semibold flex items-center justify-center">
                        {exIdx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                          {exercise.name}
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600 px-1.5 py-0.2 rounded bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100">
                            {exercise.muscleGroup}
                          </span>
                        </h3>
                        {currentPr && (
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            PR: {currentPr.maxWeight} kg ({currentPr.reps} tekrar)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => addSet(exIdx)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-xs font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Set
                      </button>

                      <button
                        onClick={() => removeExerciseFromSession(exIdx)}
                        className="p-1 text-zinc-500 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Bu egzersizi antrenmandan çıkar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 pb-1.5">
                          <th className="py-1.5 px-2 font-semibold w-12 text-center">SET</th>
                          <th className="py-1.5 px-2 font-semibold">ÖNCEKİ</th>
                          <th className="py-1.5 px-2 font-semibold">AĞIRLIK (KG)</th>
                          <th className="py-1.5 px-2 font-semibold">TEKRAR</th>
                          <th className="py-1.5 px-2 font-semibold w-14 text-center">TAMAM</th>
                          <th className="py-1.5 px-2 w-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40 dark:divide-zinc-800/40 light:divide-zinc-200">
                        {exercise.sets.map((set, setIdx) => (
                          <tr 
                            key={setIdx} 
                            className={`transition-colors ${
                              set.completed ? 'bg-zinc-800/30 dark:bg-zinc-800/30 light:bg-zinc-100' : 'hover:bg-zinc-800/20'
                            }`}
                          >
                            <td className="py-2 px-2 text-center font-mono font-medium text-zinc-400">
                              {set.setNumber}
                            </td>
                            <td className="py-2 px-2 text-zinc-500 font-mono">
                              {set.prevWeight ? `${set.prevWeight} kg × ${set.prevReps}` : '-'}
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                step="0.5"
                                value={set.weight}
                                onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                                className="w-16 bg-zinc-950 dark:bg-zinc-950 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-lg px-2 py-1 text-center font-semibold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                className="w-14 bg-zinc-950 dark:bg-zinc-950 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-lg px-2 py-1 text-center font-semibold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => toggleSetComplete(exIdx, setIdx)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                  set.completed
                                    ? 'bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 shadow-sm'
                                    : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </td>
                            <td className="py-2 px-2 text-right">
                              {exercise.sets.length > 1 && (
                                <button
                                  onClick={() => removeSet(exIdx, setIdx)}
                                  className="text-zinc-600 hover:text-zinc-300 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Antrenman Şablonları & Program Ekleme */
        <div className="space-y-6">
          <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 md:p-6 light:shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Antrenman Programları
                </span>
                <h2 className="text-xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">Özel Rutinler & Şablonlar</h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-1">
                  İster antrenmanı başlatıp canlı set girin, isterseniz doğrudan &quot;Tam Yapıldı&quot; ile anında kaydedin.
                </p>
              </div>

              <button
                onClick={() => setShowAddRoutineModal(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 light:text-zinc-100 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Yeni Program Ekle
              </button>
            </div>

            {/* Yeni Program Ekleme Modalı */}
            {showAddRoutineModal && (
              <form onSubmit={handleSaveNewRoutine} className="bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 p-4 rounded-2xl mt-4 space-y-3">
                <h3 className="text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-800 uppercase tracking-wider">
                  Yeni Antrenman Programı Tasarla
                </h3>
                <input
                  type="text"
                  placeholder="Program Adı (örn: Bacak & Omuz Odaklı, 4 Günlük Split A)..."
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-400 block">Egzersizler:</label>
                  {newRoutineExercises.map((ex, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Hareket Adı (örn: Incline Bench, Leg Press)..."
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...newRoutineExercises];
                          updated[idx].name = e.target.value;
                          setNewRoutineExercises(updated);
                        }}
                        className="flex-1 bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                      />
                      <select
                        value={ex.muscleGroup}
                        onChange={(e) => {
                          const updated = [...newRoutineExercises];
                          updated[idx].muscleGroup = e.target.value as Exercise['muscleGroup'];
                          setNewRoutineExercises(updated);
                        }}
                        className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700"
                      >
                        <option value="Göğüs">Göğüs</option>
                        <option value="Sırt">Sırt</option>
                        <option value="Bacak">Bacak</option>
                        <option value="Omuz">Omuz</option>
                        <option value="Kol">Kol</option>
                        <option value="Karın">Karın</option>
                        <option value="Kardiyo">Kardiyo</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        title="Set Sayısı"
                        value={ex.defaultSets}
                        onChange={(e) => {
                          const updated = [...newRoutineExercises];
                          updated[idx].defaultSets = parseInt(e.target.value) || 3;
                          setNewRoutineExercises(updated);
                        }}
                        className="w-12 bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-1.5 py-1.5 text-xs text-center text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
                      />
                      {newRoutineExercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExerciseFieldFromRoutine(idx)}
                          className="p-1 text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addExerciseFieldToRoutine}
                    className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium pt-1"
                  >
                    <Plus className="w-3 h-3" /> Hareket Ekle
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setShowAddRoutineModal(false)}
                    className="px-3.5 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-xl"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs rounded-xl"
                  >
                    Programı Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Şablon Kartları (Başlat ve Tam Olarak Yapıldı Butonlarıyla) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {routines.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 hover:border-zinc-700 flex flex-col justify-between transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-sm">{tmpl.name}</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-1">{tmpl.exercises.length} temel egzersiz</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tmpl.exercises.slice(0, 3).map((e, i) => (
                        <span key={i} className="text-[10px] bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-400 dark:text-zinc-400 light:text-zinc-700 px-1.5 py-0.2 rounded">
                          {e.name}
                        </span>
                      ))}
                      {tmpl.exercises.length > 3 && (
                        <span className="text-[10px] text-zinc-500">+{tmpl.exercises.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
                    <button
                      onClick={() => startWorkoutFromTemplate(tmpl.id)}
                      className="flex-1 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" /> Başlat
                    </button>

                    {/* DİREKT TAM OLARAK YAPILDI BUTONU */}
                    <button
                      onClick={() => completeWorkoutDirectly(tmpl.id)}
                      className="flex-1 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 hover:bg-white text-zinc-900 dark:text-zinc-900 light:text-zinc-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Tüm setleri tam yapıldı olarak kaydet"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Tam Yapıldı
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Antrenman İstatistikleri & PR Paneli */}
          <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 space-y-4 light:shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-zinc-400" /> Antrenman İstatistikleri & PR Zirveleri
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Toplam süre, tamamlanan setler ve kişisel rekorlar</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-zinc-400">⏱️ {totalWorkoutMinutes} dk toplam</span>
                <span className="text-zinc-400">🏋️ {totalWorkoutSets} set</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {prs.map((pr, idx) => (
                <div key={idx} className="bg-zinc-950/60 dark:bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 rounded-xl p-3">
                  <p className="text-[11px] text-zinc-400 truncate">{pr.exerciseName}</p>
                  <p className="text-xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1 font-mono">
                    {pr.maxWeight} <span className="text-xs font-normal text-zinc-500">kg</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">{pr.reps} rep • {pr.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tamamlanan Antrenman Geçmişi */}
          <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 light:shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-zinc-400" /> Tamamlanan Antrenman Geçmişi
            </h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Henüz antrenman kaydı yok.</p>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((sess) => (
                  <div key={sess.id} className="bg-zinc-950/60 dark:bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800/70 dark:border-zinc-800/70 light:border-zinc-200 rounded-xl p-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200">
                      <div>
                        <h4 className="font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-sm">{sess.routineName}</h4>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{sess.date} • {sess.durationMinutes} dakika • {sess.exercises.length} hareket</p>
                      </div>
                      {sess.notes && (
                        <p className="text-xs text-zinc-400 italic">&quot;{sess.notes}&quot;</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {sess.exercises.map((e, i) => (
                        <span key={i} className="text-[11px] bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-200 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-400 dark:text-zinc-400 light:text-zinc-700 px-2 py-0.5 rounded">
                          {e.name}: {e.sets.filter(s => s.completed).length} set
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
