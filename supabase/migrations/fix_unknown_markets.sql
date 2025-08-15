-- Fix Unknown Markets Script
-- This script creates market records for all cities that have leads but no market record

-- First, let's see what cities need market records
WITH cities_needing_markets AS (
  SELECT DISTINCT 
    l.city,
    l.state,
    COUNT(*) as lead_count
  FROM leads l
  LEFT JOIN market_coverage mc ON LOWER(l.city) = LOWER(mc.city) AND l.state = mc.state
  WHERE mc.id IS NULL
    AND l.city IS NOT NULL
    AND l.state IS NOT NULL
  GROUP BY l.city, l.state
)
SELECT * FROM cities_needing_markets ORDER BY lead_count DESC;

-- Now create market records for these cities
-- We'll assign market types based on lead count as a proxy for city size
INSERT INTO market_coverage (city, state, type, created_at, updated_at)
SELECT DISTINCT
  l.city,
  l.state,
  CASE 
    WHEN COUNT(*) >= 500 THEN 'LARGE'
    WHEN COUNT(*) >= 200 THEN 'MEDIUM'
    WHEN COUNT(*) >= 50 THEN 'SMALL'
    ELSE 'SMALL'
  END as type,
  NOW(),
  NOW()
FROM leads l
LEFT JOIN market_coverage mc ON LOWER(l.city) = LOWER(mc.city) AND l.state = mc.state
WHERE mc.id IS NULL
  AND l.city IS NOT NULL
  AND l.state IS NOT NULL
GROUP BY l.city, l.state
ON CONFLICT (city, state) DO NOTHING;

-- Update the canonical_city_id for the new market records
UPDATE market_coverage mc
SET canonical_city_id = cc.id
FROM canonical_cities cc
WHERE LOWER(mc.city) = LOWER(cc.city) 
  AND mc.state = cc.state_code
  AND mc.canonical_city_id IS NULL;

-- For cities that still don't have canonical_city_id (city name might be slightly different)
-- Try a more flexible match
UPDATE market_coverage mc
SET canonical_city_id = (
  SELECT cc.id 
  FROM canonical_cities cc 
  WHERE cc.state_code = mc.state 
    AND (
      LOWER(cc.city) LIKE LOWER(mc.city) || '%' 
      OR LOWER(mc.city) LIKE LOWER(cc.city) || '%'
    )
  ORDER BY 
    CASE 
      WHEN LOWER(cc.city) = LOWER(mc.city) THEN 0
      ELSE 1
    END,
    cc.population DESC NULLS LAST
  LIMIT 1
)
WHERE mc.canonical_city_id IS NULL;

-- Let's also update market types based on actual city population from canonical_cities
UPDATE market_coverage mc
SET type = CASE
  WHEN cc.population >= 1000000 THEN 'MEGA'
  WHEN cc.population >= 500000 THEN 'LARGE'
  WHEN cc.population >= 100000 THEN 'MEDIUM'
  ELSE 'SMALL'
END
FROM canonical_cities cc
WHERE mc.canonical_city_id = cc.id
  AND mc.type = 'UNKNOWN';

-- Finally, let's verify the results
SELECT 
  mc.city,
  mc.state,
  mc.type,
  cc.population,
  COUNT(DISTINCT l.id) as lead_count
FROM market_coverage mc
LEFT JOIN canonical_cities cc ON mc.canonical_city_id = cc.id
LEFT JOIN leads l ON LOWER(l.city) = LOWER(mc.city) AND l.state = mc.state
GROUP BY mc.city, mc.state, mc.type, cc.population
ORDER BY mc.state, lead_count DESC;