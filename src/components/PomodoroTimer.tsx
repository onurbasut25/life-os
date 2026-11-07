'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  CheckCircle2, Clock, Check, XCircle, BarChart2
} from 'lucide-react';
import { PomodoroSession, Task } from '@/types';
import { soundAlert } from '@/utils/sound';

interface PomodoroTimerProps {
  tasks: Task[];
  sessions: PomodoroSession[];
  onSessionComplete: (session: PomodoroSession, spentMinutes: number, taskTitle?: string) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks, sessions, onSessionComplete }) => {
  const [seconds, setSeconds] = useState<number>(0); // İleriye doğru sayım
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetMinutes, setTargetMinutes] = useState<number>(25); // Ayarlanabilir hedef süre
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // İleriye doğru sayım döngüsü
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleRun = () => {
    if (!isRunning && soundEnabled) soundAlert('beep');
    setIsRunning(!isRunning);
  };

  // Bitir Butonu: Geçen süreyi kaydeder ve bağlı göreve ekler
  const handleFinish = () => {
    const elapsedMinutes = Math.max(1, Math.round(seconds / 60));
    setIsRunning(false);
    if (soundEnabled) soundAlert('success');

    const newSession: PomodoroSession = {
      id: 'pom-' + Date.now(),
      timestamp: new Date().toISOString(),
      durationMinutes: elapsedMinutes,
      type: 'focus',
      taskTitle: selectedTaskTitle || 'Genel Odaklanma',
    };

    onSessionComplete(newSession, elapsedMinutes, selectedTaskTitle);
    setSeconds(0);
  };

  // İptal Butonu: Süreyi sıfırlar, kaydetmez
  const handleCancel = () => {
    if (seconds > 0) {
      if (confirm('Devam eden odak süresini kaydetmeden iptal etmek istiyor musunuz?')) {
        setIsRunning(false);
        setSeconds(0);
      }
    } else {
      setIsRunning(false);
      setSeconds(0);
    }
  };

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Hangi çalışmaya ne kadar süre harcanmış (Görev bazlı istatistik dökümü)
  const taskTimeMap: Record<string, number> = {};
  sessions.forEach(s => {
    const title = s.taskTitle || 'Genel Odaklanma';
    taskTimeMap[title] = (taskTimeMap[title] || 0) + s.durationMinutes;
  });

  const targetSeconds = targetMinutes * 60;
  const progressPercent = Math.min(100, (seconds / (targetSeconds || 1)) * 100);
  const circleRadius = 100;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Üst Ayarlanabilir Pomodoro & İleri Sayaç Kadranı */}
      <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-3xl p-6 md:p-8 flex flex-col items-center light:shadow-sm transition-colors">
        
        {/* Hedef Süre Ayarlayıcı */}
        <div className="flex items-center gap-2 mb-6 text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
          <span>Hedef Odak Süresi:</span>
          {[15, 25, 45, 60].map(m => (
            <button
              key={m}
              onClick={() => setTargetMinutes(m)}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all ${
                targetMinutes === m
                  ? 'bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-bold'
                  : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700'
              }`}
            >
              {m} dk
            </button>
          ))}
        </div>

        {/* Mat Daire Kadranı (İleriye Doğru Dolan) */}
        <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={circleRadius}
              className="text-zinc-800 dark:text-zinc-800 light:text-zinc-200"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={circleRadius}
              className="text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
              {formatTime(seconds)}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-1">
              İleriye Doğru Sayım
            </span>
            {selectedTaskTitle && (
              <span className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mt-1 max-w-[150px] truncate font-medium">
                🎯 {selectedTaskTitle}
              </span>
            )}
          </div>
        </div>

        {/* Kontrol Butonları: Başlat, Bitir, İptal */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Sesi Aç/Kapat"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleRun}
            className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              isRunning 
                ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 light:text-zinc-800' 
                : 'bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 hover:bg-white dark:hover:bg-white light:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 shadow-sm'
            }`}
          >
            {isRunning ? 'Duraklat' : 'Başlat'}
          </button>

          <button
            onClick={handleFinish}
            disabled={seconds === 0}
            className="px-5 py-2.5 rounded-xl bg-zinc-700 dark:bg-zinc-700 light:bg-zinc-800 hover:bg-zinc-600 text-zinc-100 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Bitir & Kaydet
          </button>

          <button
            onClick={handleCancel}
            disabled={seconds === 0}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 font-semibold text-xs flex items-center gap-1.5 border border-zinc-800 light:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <XCircle className="w-3.5 h-3.5" /> İptal Et
          </button>
        </div>

        {/* Görev Bağlama Alanı */}
        <div className="w-full max-w-sm mt-6 pt-5 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
          <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-400 light:text-zinc-600 uppercase tracking-wider block mb-1.5">
            Süreyi Hangi Göreve Eklemek İstiyorsun?
          </label>
          <select
            value={selectedTaskTitle}
            onChange={(e) => setSelectedTaskTitle(e.target.value)}
            className="w-full bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
          >
            <option value="">(Genel Çalışma)</option>
            {tasks.filter(t => !t.completed).map(t => (
              <option key={t.id} value={t.title}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* İSTATİSTİK TABLOSU: Hangi çalışmaya ne kadar süre harcanmış */}
      <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 space-y-4 light:shadow-sm transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-zinc-400" /> Çalışma Bazlı Süre Dağılımı Tablosu
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Her görev ve konu üzerine ayrılan kümülatif süreler</p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950/60 dark:bg-zinc-950/60 light:bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-800 light:border-zinc-300">
            Toplam: {Object.values(taskTimeMap).reduce((a, b) => a + b, 0)} dk
          </span>
        </div>

        {Object.keys(taskTimeMap).length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">Henüz tamamlanan odak çalışması bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 pb-2">
                  <th className="py-2 px-2 font-semibold">ÇALIŞMA / GÖREV</th>
                  <th className="py-2 px-2 font-semibold">TOPLAM SÜRE</th>
                  <th className="py-2 px-2 font-semibold">DAĞILIM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 dark:divide-zinc-800/40 light:divide-zinc-200">
                {Object.entries(taskTimeMap).map(([title, mins]) => {
                  const total = Object.values(taskTimeMap).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((mins / total) * 100);

                  return (
                    <tr key={title} className="hover:bg-zinc-800/20 light:hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 px-2 font-medium text-zinc-200 dark:text-zinc-200 light:text-zinc-800">
                        {title}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                        {mins} dakika ({ (mins / 60).toFixed(1) } saat)
                      </td>
                      <td className="py-2.5 px-2 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-zinc-300 dark:bg-zinc-300 light:bg-zinc-800 h-full rounded-full" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">%{pct}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
