-- Link existing leads to their corresponding markets based on city and state
UPDATE leads l
SET market_id = m.id
FROM market_coverage m
WHERE LOWER(l.city) = LOWER(m.city) 
  AND l.state = m.state
  AND l.market_id IS NULL;

-- Create a function to automatically link leads to markets on insert
CREATE OR REPLACE FUNCTION link_lead_to_market()
RETURNS TRIGGER AS $$
BEGIN
  -- If market_id is not provided, try to find it based on city and state
  IF NEW.market_id IS NULL AND NEW.city IS NOT NULL AND NEW.state IS NOT NULL THEN
    SELECT id INTO NEW.market_id
    FROM market_coverage
    WHERE LOWER(city) = LOWER(NEW.city) 
      AND state = NEW.state
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically link leads to markets
DROP TRIGGER IF EXISTS auto_link_lead_to_market ON leads;
CREATE TRIGGER auto_link_lead_to_market
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION link_lead_to_market();

-- Add index for better performance on the lookup
CREATE INDEX IF NOT EXISTS idx_market_coverage_city_state ON market_coverage(LOWER(city), state);