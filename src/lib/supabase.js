import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../config/environment'

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
	auth: {
		flowType: 'pkce',
		detectSessionInUrl: true,
		persistSession: true,
		autoRefreshToken: true
	}
})
