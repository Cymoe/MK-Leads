-- Fix Supabase Database Permissions for ReactLeads
-- Run this script in your Supabase SQL Editor

-- 1. Check current permissions for 'anon' role
SELECT 
    schemaname,
    tablename,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
AND schemaname = 'public'
AND tablename IN ('markets', 'leads', 'import_history', 'market_phases')
ORDER BY tablename, privilege_type;

-- 2. Grant all necessary permissions to 'anon' role for the tables
GRANT ALL ON public.markets TO anon;
GRANT ALL ON public.leads TO anon;
GRANT ALL ON public.import_history TO anon;
GRANT ALL ON public.market_phases TO anon;

-- 3. Disable Row Level Security (RLS) on these tables for development
ALTER TABLE public.markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_phases DISABLE ROW LEVEL SECURITY;

-- 4. Verify RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('markets', 'leads', 'import_history', 'market_phases');

-- 5. Grant usage on sequences (if they exist) for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 6. Ensure anon role can use the public schema
GRANT USAGE ON SCHEMA public TO anon;

-- Optional: If you want to be more specific with permissions instead of ALL
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.markets TO anon;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_history TO anon;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_phases TO anon;