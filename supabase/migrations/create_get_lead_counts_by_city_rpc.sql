-- Migration to create get_lead_counts_by_city RPC function
-- Date: 2025-08-14

-- This function returns lead counts grouped by city and state
-- Used by the MarketCoverage component for efficient lead counting
CREATE OR REPLACE FUNCTION get_lead_counts_by_city()
RETURNS TABLE (
  city VARCHAR(255),
  state VARCHAR(2),
  lead_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.city,
    l.state,
    COUNT(*)::BIGINT as lead_count
  FROM leads l
  WHERE l.city IS NOT NULL 
    AND l.state IS NOT NULL
  GROUP BY l.city, l.state
  ORDER BY lead_count DESC;
END;
$$ LANGUAGE plpgsql;