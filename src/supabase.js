import { createClient } from "@supabase/supabase-js";

// Apnar .env theke nile eita thakbe, ar jodi age direct URL lekha chilo tobe sei direct URL & Key ekhane din
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "APNAR_SUPABASE_PROJECT_URL";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "APNAR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
