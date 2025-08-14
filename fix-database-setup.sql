-- Run this script in your Supabase SQL Editor to fix the database setup

-- 1. First, let's check what tables exist in all schemas
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE tablename IN ('markets', 'leads', 'import_history', 'market_phases')
ORDER BY schemaname, tablename;

-- 2. If tables exist but not in public schema, move them
-- (Uncomment and modify if needed)
-- ALTER TABLE other_schema.markets SET SCHEMA public;
-- ALTER TABLE other_schema.leads SET SCHEMA public;
-- ALTER TABLE other_schema.import_history SET SCHEMA public;
-- ALTER TABLE other_schema.market_phases SET SCHEMA public;

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('markets', 'leads', 'import_history', 'market_phases');

-- 4. If tables don't exist at all, create them
-- Check if markets table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'markets') THEN
        RAISE NOTICE 'Creating markets table...';
        -- Run the full schema.sql here
    ELSE
        RAISE NOTICE 'Markets table already exists';
    END IF;
END $$;

-- 5. Grant permissions to anon role (important for API access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 6. Ensure RLS policies allow anon access for reading
-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON markets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON markets;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON markets;

DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON leads;

-- Create new policies that work with anon role
CREATE POLICY "Enable read access for all users" ON markets FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON markets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON markets FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON leads FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON leads FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON leads FOR DELETE USING (true);

-- 7. Test the setup
SELECT 'Testing markets table access...' as test;
SELECT COUNT(*) as market_count FROM public.markets;

SELECT 'Testing leads table access...' as test;
SELECT COUNT(*) as lead_count FROM public.leads;

-- 8. If you want to temporarily disable RLS for testing
-- ALTER TABLE markets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE import_history DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE market_phases DISABLE ROW LEVEL SECURITY;