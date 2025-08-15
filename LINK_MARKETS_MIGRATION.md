# Linking Leads to Markets Migration

## Overview
This migration links existing leads to their corresponding markets and sets up automatic linking for future leads.

## Migration Steps

### 1. Run the Migration Script

Execute the following SQL in your Supabase SQL Editor:

```sql
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
```

### 2. Verify the Migration

Check how many leads were linked:

```sql
-- Check leads with market_id
SELECT COUNT(*) as linked_leads
FROM leads
WHERE market_id IS NOT NULL;

-- Check leads without market_id
SELECT COUNT(*) as unlinked_leads
FROM leads
WHERE market_id IS NULL;

-- See which cities have unlinked leads
SELECT DISTINCT city, state, COUNT(*) as lead_count
FROM leads
WHERE market_id IS NULL
  AND city IS NOT NULL
GROUP BY city, state
ORDER BY lead_count DESC;
```

### 3. What This Does

1. **Links Existing Leads**: Updates all existing leads to set their `market_id` based on matching city and state with the `market_coverage` table.

2. **Auto-Links New Leads**: Creates a database trigger that automatically finds and sets the `market_id` for new leads when they're inserted, if the market_id isn't already provided.

3. **Improves Performance**: Adds an index on the market_coverage table for faster lookups.

## Code Changes

The application code has been updated to:

1. **Include market_id on insert**: Both ServiceSearchModal and ImportModal now include the market_id when inserting new leads (if a valid market is selected).

2. **Fallback to trigger**: If market_id isn't provided or the market is temporary, the database trigger will attempt to link the lead based on city/state match.

## Benefits

- **Better Analytics**: Can now easily query leads by market
- **Improved Performance**: Market-based queries will be faster
- **Data Integrity**: Ensures leads are properly associated with markets
- **Automatic Linking**: No manual intervention needed for linking leads to markets