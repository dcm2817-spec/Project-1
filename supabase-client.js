// uniVERSE — Supabase client
// Fill in your own project URL and anon key below, both found in:
// Supabase Dashboard → Project Settings → API
//
// The anon key is safe to expose in frontend code — it's designed for
// this. Row Level Security (the policies in supabase_schema.sql) is
// what actually controls what each user can read/write.

const SUPABASE_URL = "https://mwuyjaekewcqccfcltwb.supabase.co";       // e.g. "https://xxxxx.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_L_XeDGF8JKxOnxQ-l_fmug_7WT7qyf7";      // starts with "eyJ..."

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
