-- Update get_lead_counts_by_city to be user-aware
-- Date: 2025-08-15

-- Drop the old function
DROP FUNCTION IF EXISTS get_lead_counts_by_city();

-- Create updated function that filters by current user
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
    AND l.user_id = auth.uid() -- Filter by current user
  GROUP BY l.city, l.state
  ORDER BY lead_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_lead_counts_by_city() TO anon;
GRANT EXECUTE ON FUNCTION get_lead_counts_by_city() TO authenticated;