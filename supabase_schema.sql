-- ==========================================================
-- LIFE OS SUPABASE VERİTABANI KURULUMU (SQL QUERY EDITOR)
-- ==========================================================

-- 1. Kullanıcı durum tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.life_os_state (
    username TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Row Level Security (RLS) ayarı (Anonim okuma ve yazmaya izin verir)
ALTER TABLE public.life_os_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read and write"
ON public.life_os_state
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Gerçek zamanlı (Real-time) dinlemeyi aktif et
ALTER PUBLICATION supabase_realtime ADD TABLE public.life_os_state;
