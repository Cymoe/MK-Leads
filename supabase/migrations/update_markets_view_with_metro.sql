-- Update markets view to ensure metro_name is included
-- Date: 2025-01-27

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.markets CASCADE;

-- Create the markets view from market_coverage table with metro_name
CREATE OR REPLACE VIEW public.markets AS
SELECT 
    mc.id,
    -- Extract city name from market_name (format: "City, State")
    split_part(mc.market_name, ', ', 1) as name,
    -- Extract state from market_name
    COALESCE(
        split_part(mc.market_name, ', ', 2),
        cc.state
    ) as state,
    -- Map market_type based on population
    CASE 
        WHEN COALESCE(mc.population, cc.population) > 1000000 THEN 'MEGA'
        WHEN COALESCE(mc.population, cc.population) > 500000 THEN 'LARGE'
        WHEN COALESCE(mc.population, cc.population) > 100000 THEN 'MEDIUM'
        ELSE 'SMALL'
    END as type,
    -- Get region from canonical_cities
    cc.region,
    mc.coverage_percentage,
    COALESCE(mc.population, cc.population) as population,
    mc.population_year,
    COALESCE(mc.metro_population, cc.metro_population) as metro_population,
    COALESCE(mc.metro_name, cc.metro_name) as metro_name,
    mc.canonical_city_id,
    mc.actual_service_types as service_types,
    mc.created_at,
    mc.updated_at,
    mc.user_id
FROM market_coverage mc
LEFT JOIN canonical_cities cc ON mc.canonical_city_id = cc.id
WHERE mc.user_id = auth.uid(); -- Filter by current user

-- Grant permissions on the view
GRANT SELECT ON public.markets TO anon;
GRANT SELECT ON public.markets TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.markets SET (security_invoker = true);

-- Add comment to document the view
COMMENT ON VIEW public.markets IS 'View that provides a simplified interface to market_coverage table for frontend compatibility, includes metro_name from both market_coverage and canonical_cities tables';