-- Create markets view based on market_coverage table
-- This view is used by the frontend to fetch market data
-- Date: 2025-08-15

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.markets CASCADE;

-- Create the markets view from market_coverage table
CREATE OR REPLACE VIEW public.markets AS
SELECT 
    mc.id,
    -- Extract city name from market_name (format: "City, State")
    split_part(mc.market_name, ', ', 1) as name,
    -- Extract state from market_name or use state column if available
    COALESCE(
        split_part(mc.market_name, ', ', 2),
        (SELECT state FROM canonical_cities WHERE id = mc.canonical_city_id LIMIT 1)
    ) as state,
    -- Map market_type to the expected format
    CASE 
        WHEN mc.population > 1000000 THEN 'MEGA'
        WHEN mc.population > 500000 THEN 'LARGE'
        WHEN mc.population > 100000 THEN 'MEDIUM'
        ELSE 'SMALL'
    END as type,
    mc.coverage_percentage,
    mc.population,
    mc.metro_population,
    mc.actual_service_types as service_types,
    mc.created_at,
    mc.updated_at,
    mc.user_id
FROM market_coverage mc
WHERE mc.user_id = auth.uid(); -- Filter by current user

-- Grant permissions on the view
GRANT SELECT ON public.markets TO anon;
GRANT SELECT ON public.markets TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.markets SET (security_invoker = true);

-- Add comment to document the view
COMMENT ON VIEW public.markets IS 'View that provides a simplified interface to market_coverage table for frontend compatibility, filtered by current user';