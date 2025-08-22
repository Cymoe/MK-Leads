-- ReactLeads Blue Ocean Market Analysis
-- This script analyzes lead data to identify underserved markets with high potential

-- 1. Top 50 Cities by Total Lead Count
WITH city_totals AS (
  SELECT 
    city,
    state,
    CONCAT(city, ', ', state) as market,
    COUNT(*) as total_leads
  FROM leads
  WHERE city IS NOT NULL AND state IS NOT NULL
  GROUP BY city, state
  ORDER BY total_leads DESC
  LIMIT 50
)
SELECT * FROM city_totals;

-- 2. Service Distribution in Top Markets
WITH top_markets AS (
  SELECT 
    city,
    state,
    COUNT(*) as total_leads
  FROM leads
  WHERE city IS NOT NULL AND state IS NOT NULL
  GROUP BY city, state
  ORDER BY total_leads DESC
  LIMIT 20
),
service_by_market AS (
  SELECT 
    l.city,
    l.state,
    l.service_type,
    COUNT(*) as service_leads,
    tm.total_leads,
    ROUND((COUNT(*)::numeric / tm.total_leads * 100), 2) as market_share_pct
  FROM leads l
  JOIN top_markets tm ON l.city = tm.city AND l.state = tm.state
  WHERE l.service_type IS NOT NULL
  GROUP BY l.city, l.state, l.service_type, tm.total_leads
)
SELECT 
  city || ', ' || state as market,
  service_type,
  service_leads,
  total_leads,
  market_share_pct
FROM service_by_market
ORDER BY city, state, service_leads DESC;

-- 3. Blue Ocean Finder: Low Competition Services in High-Lead Markets
WITH market_stats AS (
  SELECT 
    city,
    state,
    COUNT(*) as total_leads
  FROM leads
  WHERE city IS NOT NULL AND state IS NOT NULL
  GROUP BY city, state
  HAVING COUNT(*) > 100  -- Only markets with substantial data
),
service_coverage AS (
  SELECT 
    ms.city,
    ms.state,
    s.name as service_type,
    COALESCE(COUNT(l.id), 0) as service_leads,
    ms.total_leads,
    CASE 
      WHEN COUNT(l.id) = 0 THEN 0
      ELSE ROUND((COUNT(l.id)::numeric / ms.total_leads * 100), 2)
    END as coverage_pct
  FROM market_stats ms
  CROSS JOIN service_types_master s
  LEFT JOIN leads l ON 
    l.city = ms.city AND 
    l.state = ms.state AND 
    l.service_type = s.name
  WHERE s.is_active = true
  GROUP BY ms.city, ms.state, s.name, ms.total_leads
)
SELECT 
  city || ', ' || state as market,
  service_type,
  service_leads,
  total_leads as market_total_leads,
  coverage_pct,
  CASE 
    WHEN service_leads = 0 THEN 'NO_PRESENCE'
    WHEN coverage_pct < 1 THEN 'VERY_LOW'
    WHEN coverage_pct < 3 THEN 'LOW'
    WHEN coverage_pct < 5 THEN 'MODERATE'
    ELSE 'HIGH'
  END as competition_level
FROM service_coverage
WHERE service_type IN (
  'EV Charging Installation',
  'Smart Home Installation', 
  'Artificial Turf Installation',
  'Foundation Repair',
  'Basement Waterproofing',
  'Custom Lighting Design',
  'Water Features Installation',
  'Outdoor Kitchen Installation'
)
AND total_leads > 200  -- Focus on substantial markets
ORDER BY total_leads DESC, coverage_pct ASC;

-- 4. Emerging Services Geographic Distribution
WITH emerging_services AS (
  SELECT 
    state,
    service_type,
    COUNT(*) as leads_count,
    COUNT(DISTINCT city) as cities_served
  FROM leads
  WHERE service_type IN (
    'EV Charging Installation',
    'Smart Home Installation',
    'Artificial Turf Installation',
    'Custom Lighting Design',
    'Water Features Installation',
    'Outdoor Kitchen Installation',
    'Outdoor Living Structures'
  )
  AND service_type IS NOT NULL
  GROUP BY state, service_type
)
SELECT 
  state,
  service_type,
  leads_count,
  cities_served,
  ROUND(leads_count::numeric / cities_served, 2) as avg_leads_per_city
FROM emerging_services
ORDER BY service_type, leads_count DESC;

-- 5. Foundation/Basement Services in Wet Climate States
WITH wet_states AS (
  SELECT state FROM (VALUES 
    ('OH'), ('MI'), ('IN'), ('IL'), ('WI'), ('MN'), ('IA'), ('MO'),
    ('PA'), ('NY'), ('NJ'), ('MD'), ('VA'), ('WV'), ('KY'), ('TN')
  ) AS t(state)
),
foundation_services AS (
  SELECT 
    l.city,
    l.state,
    COUNT(CASE WHEN l.service_type = 'Foundation Repair' THEN 1 END) as foundation_leads,
    COUNT(CASE WHEN l.service_type = 'Basement Waterproofing' THEN 1 END) as waterproofing_leads,
    COUNT(*) as total_city_leads
  FROM leads l
  JOIN wet_states ws ON l.state = ws.state
  WHERE l.city IS NOT NULL
  GROUP BY l.city, l.state
  HAVING COUNT(*) > 100  -- Substantial markets only
)
SELECT 
  city || ', ' || state as market,
  foundation_leads,
  waterproofing_leads,
  total_city_leads,
  ROUND((foundation_leads + waterproofing_leads)::numeric / total_city_leads * 100, 2) as foundation_services_pct
FROM foundation_services
WHERE foundation_leads < 10 OR waterproofing_leads < 10  -- Low competition
ORDER BY total_city_leads DESC;

-- 6. Smart Home & EV Charging in Tech Hubs
WITH tech_cities AS (
  SELECT city, state FROM (VALUES
    ('Austin', 'TX'), ('Seattle', 'WA'), ('San Francisco', 'CA'),
    ('San Jose', 'CA'), ('Denver', 'CO'), ('Boston', 'MA'),
    ('Portland', 'OR'), ('Raleigh', 'NC'), ('Atlanta', 'GA'),
    ('Phoenix', 'AZ'), ('Dallas', 'TX'), ('Miami', 'FL')
  ) AS t(city, state)
),
tech_services AS (
  SELECT 
    tc.city,
    tc.state,
    COUNT(CASE WHEN l.service_type = 'EV Charging Installation' THEN 1 END) as ev_leads,
    COUNT(CASE WHEN l.service_type = 'Smart Home Installation' THEN 1 END) as smart_home_leads,
    COUNT(CASE WHEN l.service_type = 'Smart Home' THEN 1 END) as smart_home_alt_leads,
    COUNT(*) as total_leads
  FROM tech_cities tc
  LEFT JOIN leads l ON l.city = tc.city AND l.state = tc.state
  GROUP BY tc.city, tc.state
)
SELECT 
  city || ', ' || state as tech_hub,
  ev_leads,
  smart_home_leads + smart_home_alt_leads as smart_home_total,
  total_leads,
  CASE 
    WHEN total_leads = 0 THEN 'NO_DATA'
    WHEN ev_leads < 5 THEN 'EV_OPPORTUNITY'
    WHEN smart_home_leads + smart_home_alt_leads < 5 THEN 'SMART_HOME_OPPORTUNITY'
    ELSE 'SATURATED'
  END as opportunity_type
FROM tech_services
ORDER BY total_leads DESC;

-- 7. Regional Priority vs Actual Saturation Analysis
WITH regional_mapping AS (
  SELECT state, 
    CASE 
      WHEN state IN ('TX', 'FL', 'GA', 'SC', 'NC', 'AL', 'MS', 'LA', 'TN', 'KY', 'AR', 'OK', 'WV') THEN 'south'
      WHEN state IN ('CA', 'AZ', 'NV', 'NM', 'HI') THEN 'west'
      WHEN state IN ('NY', 'NJ', 'CT', 'MA', 'PA', 'VA', 'MD', 'DE', 'VT', 'NH', 'ME', 'RI') THEN 'northeast'
      WHEN state IN ('OH', 'MI', 'IL', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'ND', 'SD') THEN 'midwest'
      WHEN state IN ('WA', 'OR', 'ID', 'MT', 'AK') THEN 'pacificNorthwest'
      WHEN state IN ('CO', 'UT', 'WY') THEN 'mountain'
      ELSE 'other'
    END as region
  FROM (SELECT DISTINCT state FROM leads) s
),
high_priority_services AS (
  -- South high priority services
  SELECT 'south' as region, service FROM (VALUES 
    ('Pool Builders'), ('Outdoor Kitchen'), ('Tree Services'),
    ('Smart Home Installation'), ('Foundation Repair'), ('Pest Control')
  ) AS t(service)
  UNION ALL
  -- West high priority services  
  SELECT 'west' as region, service FROM (VALUES
    ('Solar Installers'), ('Artificial Turf Installation'), 
    ('EV Charging Installation'), ('Smart Home Installation')
  ) AS t(service)
  UNION ALL
  -- Northeast high priority services
  SELECT 'northeast' as region, service FROM (VALUES
    ('Kitchen Remodeling'), ('Bathroom Remodeling'), 
    ('Basement Waterproofing'), ('EV Charging Installation')
  ) AS t(service)
  UNION ALL
  -- Midwest high priority services
  SELECT 'midwest' as region, service FROM (VALUES
    ('Foundation Repair'), ('Basement Waterproofing'),
    ('Concrete Contractors'), ('Garage Door Services')
  ) AS t(service)
),
regional_saturation AS (
  SELECT 
    rm.region,
    hps.service as high_priority_service,
    COUNT(l.id) as total_leads,
    COUNT(DISTINCT l.city || ', ' || l.state) as markets_served
  FROM regional_mapping rm
  JOIN high_priority_services hps ON rm.region = hps.region
  LEFT JOIN leads l ON l.state = rm.state AND l.service_type = hps.service
  GROUP BY rm.region, hps.service
)
SELECT 
  region,
  high_priority_service,
  total_leads,
  markets_served,
  CASE 
    WHEN total_leads < 50 THEN 'SEVERELY_UNDERSERVED'
    WHEN total_leads < 200 THEN 'UNDERSERVED'
    WHEN total_leads < 500 THEN 'MODERATE'
    ELSE 'WELL_SERVED'
  END as saturation_level
FROM regional_saturation
ORDER BY region, total_leads ASC;

-- 8. Summary: Best Blue Ocean Opportunities
WITH opportunity_scores AS (
  SELECT 
    city,
    state,
    service_type,
    service_leads,
    market_total_leads,
    competition_level,
    growth_rate,
    regional_priority,
    (market_total_leads * 0.3) + -- Market size weight
    ((CASE competition_level 
      WHEN 'NO_PRESENCE' THEN 100
      WHEN 'VERY_LOW' THEN 80
      WHEN 'LOW' THEN 60
      WHEN 'MODERATE' THEN 30
      ELSE 0
    END) * 0.4) + -- Competition weight
    (growth_rate * 0.2) + -- Growth weight
    ((CASE regional_priority
      WHEN 'high' THEN 100
      WHEN 'medium' THEN 50
      ELSE 20
    END) * 0.1) as opportunity_score
  FROM (
    -- This would be populated with actual data from previous queries
    SELECT 1 as placeholder
  ) t
)
-- Final recommendations will be compiled from above analyses