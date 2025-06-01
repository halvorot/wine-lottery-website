
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkeafhmdkiebqxnmqqcz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZWFmaG1ka2llYnF4bm1xcWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MTUzOTEsImV4cCI6MjA1NTE5MTM5MX0.gOhQ3J1Nl-1MjEb81VS8qz-uB7PE-0DcrNRI13IVSME";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "wine-lottery-auth-token",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
