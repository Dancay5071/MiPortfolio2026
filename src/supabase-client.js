
// 1. Añade tu URL de Proyecto Supabase
const SUPABASE_URL = 'https://prmrhdxmvgueyduztiii.supabase.co';

// 2. Añade tu clave API "anon" / "public"
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybXJoZHhtdmd1ZXlkdXp0aWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjI3ODksImV4cCI6MjA5NDQzODc4OX0.s60OdhcEGeEL8mpSNI0VYt0QCzTjsTNBMYVZ0GsGA9I';
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
