import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qulzmgpxbyztfswddfxv.supabase.co/rest/v1/';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xD8dMinJK21U21bbyQalSw_sjVUpNac';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
