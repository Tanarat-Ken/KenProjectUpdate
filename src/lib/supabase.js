import { createClient } from '@supabase/supabase-js'

// Publishable / anon keys are designed to be exposed in the browser. The values
// below act as a safe default so the app runs out of the box; they can be
// overridden per-environment via Vite env vars (see .env.example).
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://glbndfloqirjjoqfjdlw.supabase.co'
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_fN26c99lv5ySsP__HtnQXQ_DbitsDWJ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})
