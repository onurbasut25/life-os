import { createClient } from '@supabase/supabase-js';

// Varsayılan veya localStorage'dan alınacak dinamik değerler
const getSupabaseCredentials = () => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('LIFE_OS_SUPABASE_URL');
    const savedKey = localStorage.getItem('LIFE_OS_SUPABASE_KEY');
    if (savedUrl) url = savedUrl;
    if (savedKey) key = savedKey;
  }
  return { url, key };
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && !url.includes('demo-life-os') && url.startsWith('http'));
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseCredentials();
  if (!isSupabaseConfigured()) return null;
  try {
    return createClient(url, key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (e) {
    console.error('Supabase client error:', e);
    return null;
  }
};
