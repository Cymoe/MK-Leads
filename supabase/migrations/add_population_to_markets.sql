-- Migration to add population fields to markets table
-- Date: 2025-08-14

-- Add population fields to markets table
ALTER TABLE public.markets 
  ADD COLUMN IF NOT EXISTS population INTEGER,
  ADD COLUMN IF NOT EXISTS population_year INTEGER DEFAULT 2023,
  ADD COLUMN IF NOT EXISTS metro_population INTEGER;

-- Add index for population queries
CREATE INDEX IF NOT EXISTS idx_markets_population ON markets(population);

-- Add comments for documentation
COMMENT ON COLUMN markets.population IS 'City population from latest census data';
COMMENT ON COLUMN markets.population_year IS 'Year of the population data';
COMMENT ON COLUMN markets.metro_population IS 'Metropolitan area population if applicable';