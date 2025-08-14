import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dicscsehiegqsmtwewis.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
