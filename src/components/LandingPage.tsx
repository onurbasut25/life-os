'use client';

import React from 'react';
import { 
  Zap, ArrowRight, ShieldCheck, Dumbbell, CheckSquare, 
  Timer, BookOpen, Smartphone, Laptop, Sparkles, ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  currentUser?: string | null;
}

export function LandingPage({ onEnterApp, currentUser }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#090a0b] text-zinc-100 flex flex-col selection:bg-zinc-700 selection:text-white">
      
      {/* Üst Navigasyon */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white shadow-inner">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">LIFE OS</span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wide">ENTERPRISE COCKPIT</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onEnterApp}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-md active:scale-95"
          >
            <span>{currentUser ? `@${currentUser} Kokpitine Git` : 'Uygulamayı Aç'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero (Ana Başlık & Vitrin) */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 mb-8 animate-fade-in font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Masaüstü & Mobil Gerçek Zamanlı Eşzamanlı Sistem v2.0
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.15] mb-6">
          Hayatınızı, Sporunuzu ve Zihninizi <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
            Tek Bir Kokpitten Yönetin.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          Dört ayrı uygulama yerine tek ekosistem. Spor salonundaki hipertrofi setlerinizden derinleşme (pomodoro) seanslarınıza ve BilgeTonyu arşivinize kadar her şey anlık senkron.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-sm transition-all shadow-lg shadow-white/5 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{currentUser ? 'Kokpite Devam Et' : 'Kokpiti Başlat'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Modül Kartları (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 w-full text-left">
          
          {/* 1. Fitness */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white mb-4">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Hipertrofi Antrenman</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              10 egzersizli özel program, set-tekrar-kilo takibi, dinlenme sayacı ve tek tıkla onaylama.
            </p>
          </div>

          {/* 2. Görev & Rutinler */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Görevler & Rutinler</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Özel kategoriler, süresiz veya vadeli işler. Haftalık sıfırlanan alışkanlık zincirleri.
            </p>
          </div>

          {/* 3. Pomodoro Odak */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white mb-4">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Kronometre Pomodoro</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              İleriye sayan hassas sayaç. Tamamlanan süreleri otomatik olarak ilgili göreve yansıtma.
            </p>
          </div>

          {/* 4. BilgeTonyu */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">BilgeTonyu Arşivi</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kitap, film ve araştırma kütüphanesi. Kategori dağılım analizleri ve okuma durumları.
            </p>
          </div>

        </div>

        {/* Platform & Mimari Vurgusu */}
        <div className="mt-16 pt-10 border-t border-zinc-800/60 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Laptop className="w-4 h-4 text-zinc-300" /> Mac & Masaüstü
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Smartphone className="w-4 h-4 text-zinc-300" /> iOS & Android PWA
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-zinc-300" /> Çift Katmanlı Veri Güvenliği
            </span>
          </div>

          <p className="font-mono text-[11px] text-zinc-600">
            Life OS © 2026 • Kişisel Yönetim Mimarisi
          </p>
        </div>

      </section>

    </div>
  );
}
