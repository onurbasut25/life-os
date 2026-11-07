'use client';

import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, ExternalLink, X, Check, Save } from 'lucide-react';
import { isSupabaseConfigured } from '@/utils/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SupabaseModal({ isOpen, onClose, onSaved }: SupabaseModalProps) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(localStorage.getItem('LIFE_OS_SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
      setKey(localStorage.getItem('LIFE_OS_SUPABASE_KEY') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !key.trim()) {
      setStatus('Lütfen hem Proje URL hem de Anon Key girin.');
      return;
    }

    try {
      localStorage.setItem('LIFE_OS_SUPABASE_URL', url.trim());
      localStorage.setItem('LIFE_OS_SUPABASE_KEY', key.trim());
      setStatus('Ayarlar kaydedildi! Sayfa yenileniyor...');
      setTimeout(() => {
        onSaved();
        onClose();
        window.location.reload();
      }, 700);
    } catch (e) {
      console.error(e);
      setStatus('Kaydetme hatası.');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('LIFE_OS_SUPABASE_URL');
    localStorage.removeItem('LIFE_OS_SUPABASE_KEY');
    setUrl('');
    setKey('');
    setStatus('Supabase bağlantısı kaldırıldı. Local moddasınız.');
    setTimeout(() => {
      onSaved();
      onClose();
      window.location.reload();
    }, 700);
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0e1013] dark:bg-[#0e1013] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Supabase Gerçek Zamanlı Bulut DB</h2>
              <p className="text-[11px] text-zinc-400">Mac Masaüstü ve Telefon (iOS/Android) senkronizasyonu</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-zinc-200">
                {isConnected ? 'Supabase Bağlantısı Aktif' : 'Yerel (Offline / Local) Mod'}
              </span>
            </div>
            {isConnected && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                WebSocket Live
              </span>
            )}
          </div>

          <p className="text-zinc-400 leading-relaxed text-[11.5px]">
            Supabase hesabınızdaki ücretsiz projenin <strong>Settings &gt; API</strong> sekmesindeki değerleri buraya girerek Mac ve telefonunuz arasında saliseler içinde anlık veri transferi sağlayabilirsiniz.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Project URL (Örn: https://xyz.supabase.co)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Anon / Public Key
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {status && (
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px]">
              {status}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500">
            <span>SQL Tablosu: <code className="text-zinc-300 font-mono">public.life_os_state</code></span>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 underline"
            >
              Supabase Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
            >
              Bağlantıyı Kes
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Kaydet & Bağlan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
