import { createClient } from '@supabase/supabase-js'

// Replace these placeholders with your actual Supabase URL and Anon Key from your Supabase dashboard
const SUPABASE_URL = 'https://kxwmtsuoniicietmqnqa.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_pgwStcLW772AORaB-mOh5Q_368BRVaw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

