-- Quick fix for database access issues
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/dicscsehiegqsmtwewis/sql)

-- 1. Grant permissions to anon role for API access
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 2. Check if tables are visible to anon role
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('markets', 'leads', 'import_history', 'market_phases');

-- 3. If using RLS, ensure policies allow anon access (temporary fix for development)
ALTER TABLE markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE import_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE market_phases DISABLE ROW LEVEL SECURITY;

-- 4. Test access
SELECT COUNT(*) as markets_count FROM markets;
SELECT COUNT(*) as leads_count FROM leads;