'use client';

import React, { useState } from 'react';
import { User, KeyRound, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { soundAlert } from '@/utils/sound';

interface AuthModalProps {
  currentUsername: string | null;
  onLogin: (username: string) => void;
  onClose?: () => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUsername,
  onLogin,
  onClose,
  allowClose = false,
}) => {
  const [usernameInput, setUsernameInput] = useState<string>(currentUsername || '');
  const [pinInput, setPinInput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    soundAlert('success');
    onLogin(usernameInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#121316] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {currentUsername ? 'Hesap / Profil Değiştir' : 'Life OS Hesabınızı Başlatın'}
            </h2>
            <p className="text-xs text-zinc-500">
              Telefon ve bilgisayarınızda aynı kullanıcı adını girerek anında senkronize olun.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Kullanıcı Adı veya E-posta:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="örn: onur, basut, veya onur@mail.com"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Şifresiz ve anında erişim. Bu isim altındaki tüm verileriniz bulutta ve tarayıcınızda otomatik korunur.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>{currentUsername ? 'Profili Güncelle' : 'Giriş Yap & Verilerimi Senkron Tut'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {allowClose && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 text-xs font-semibold rounded-xl"
              >
                Vazgeç
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verileriniz tarayıcı önbelleğinde ve bulut servisinde anında yedeklenir.</span>
        </div>
      </div>
    </div>
  );
};
