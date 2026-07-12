import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://prmrhdxmvgueyduztiii.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybXJoZHhtdmd1ZXlkdXp0aWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjI3ODksImV4cCI6MjA5NDQzODc4OX0.s60OdhcEGeEL8mpSNI0VYt0QCzTjsTNBMYVZ0GsGA9I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
}
