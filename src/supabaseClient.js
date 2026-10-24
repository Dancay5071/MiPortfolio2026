import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
}

// Inicialización limpia sin credenciales hardcodeadas en texto plano
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key'
);

// Mantener la referencia global para los managers del panel de administración
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
}
