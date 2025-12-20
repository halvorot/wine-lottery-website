
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://amwivjkqhskhzbauzwcj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2l2amtxaHNraHpiYXV6d2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDIxMDMsImV4cCI6MjA4MTgxODEwM30.XdZynCX9MkaP_N4ND9Cwno76zDrJagyD5DlAEcPQL54";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "wine-lottery-auth-token",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
