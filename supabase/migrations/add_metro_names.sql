-- Migration to add metro area names to support better UX
-- Date: 2025-01-27

-- Add metro_name column to canonical_cities table
ALTER TABLE public.canonical_cities 
  ADD COLUMN IF NOT EXISTS metro_name VARCHAR(255);

-- Add metro_name column to market_coverage table  
ALTER TABLE public.market_coverage 
  ADD COLUMN IF NOT EXISTS metro_name VARCHAR(255);

-- Create index for metro name queries
CREATE INDEX IF NOT EXISTS idx_canonical_cities_metro_name ON canonical_cities(metro_name);
CREATE INDEX IF NOT EXISTS idx_market_coverage_metro_name ON market_coverage(metro_name);

-- Add comment for documentation
COMMENT ON COLUMN canonical_cities.metro_name IS 'Metropolitan area name (e.g., "New York-Newark-Jersey City, NY-NJ-PA")';
COMMENT ON COLUMN market_coverage.metro_name IS 'Metropolitan area name (e.g., "New York-Newark-Jersey City, NY-NJ-PA")';

-- Update canonical_cities with metro area names based on metro_population
-- This mapping is based on US Census Metropolitan Statistical Areas (MSAs)

-- New York-Newark-Jersey City Metro Area (20,140,470)
UPDATE canonical_cities 
SET metro_name = 'New York-Newark-Jersey City, NY-NJ-PA'
WHERE metro_population = 20140470;

-- Philadelphia-Camden-Wilmington Metro Area (6,245,051)  
UPDATE canonical_cities 
SET metro_name = 'Philadelphia-Camden-Wilmington, PA-NJ-DE-MD'
WHERE metro_population = 6245051;

-- Detroit-Warren-Dearborn Metro Area (4,392,041)
UPDATE canonical_cities 
SET metro_name = 'Detroit-Warren-Dearborn, MI'
WHERE metro_population = 4392041;

-- Washington-Arlington-Alexandria Metro Area (6,385,162)
UPDATE canonical_cities 
SET metro_name = 'Washington-Arlington-Alexandria, DC-VA-MD-WV'
WHERE metro_population = 6385162;

-- Pittsburgh Metro Area (2,422,299)
UPDATE canonical_cities 
SET metro_name = 'Pittsburgh, PA'
WHERE metro_population = 2422299;

-- Portland-Vancouver-Hillsboro Metro Area (2,512,859)
UPDATE canonical_cities 
SET metro_name = 'Portland-Vancouver-Hillsboro, OR-WA'
WHERE metro_population = 2512859;

-- Virginia Beach-Norfolk-Newport News Metro Area (1,799,674)
UPDATE canonical_cities 
SET metro_name = 'Virginia Beach-Norfolk-Newport News, VA-NC'
WHERE metro_population = 1799674;

-- Richmond Metro Area (1,314,434)
UPDATE canonical_cities 
SET metro_name = 'Richmond, VA'
WHERE metro_population = 1314434;

-- Salt Lake City Metro Area (1,257,936)
UPDATE canonical_cities 
SET metro_name = 'Salt Lake City, UT'
WHERE metro_population = 1257936;

-- Grand Rapids-Wyoming Metro Area (1,087,592)
UPDATE canonical_cities 
SET metro_name = 'Grand Rapids-Wyoming, MI'
WHERE metro_population = 1087592;

-- Allentown-Bethlehem-Easton Metro Area (865,310)
UPDATE canonical_cities 
SET metro_name = 'Allentown-Bethlehem-Easton, PA-NJ'
WHERE metro_population = 865310;

-- Ogden-Clearfield Metro Area (694,477)
UPDATE canonical_cities 
SET metro_name = 'Ogden-Clearfield, UT'
WHERE metro_population = 694477;

-- Provo-Orem Metro Area (671,185)
UPDATE canonical_cities 
SET metro_name = 'Provo-Orem, UT'
WHERE metro_population = 671185;

-- Harrisburg-Carlisle Metro Area (577,941)
UPDATE canonical_cities 
SET metro_name = 'Harrisburg-Carlisle, PA'
WHERE metro_population = 577941;

-- Scranton-Wilkes-Barre-Hazleton Metro Area (555,426)
UPDATE canonical_cities 
SET metro_name = 'Scranton--Wilkes-Barre--Hazleton, PA'
WHERE metro_population = 555426;

-- Lancaster Metro Area (545,724)
UPDATE canonical_cities 
SET metro_name = 'Lancaster, PA'
WHERE metro_population = 545724;

-- Lansing-East Lansing Metro Area (541,297)
UPDATE canonical_cities 
SET metro_name = 'Lansing-East Lansing, MI'
WHERE metro_population = 541297;

-- York-Hanover Metro Area (449,058)
UPDATE canonical_cities 
SET metro_name = 'York-Hanover, PA'
WHERE metro_population = 449058;

-- Salem Metro Area (433,353)
UPDATE canonical_cities 
SET metro_name = 'Salem, OR'
WHERE metro_population = 433353;

-- Reading Metro Area (421,164)
UPDATE canonical_cities 
SET metro_name = 'Reading, PA'
WHERE metro_population = 421164;

-- Flint Metro Area (406,211)
UPDATE canonical_cities 
SET metro_name = 'Flint, MI'
WHERE metro_population = 406211;

-- Eugene Metro Area (382,971)
UPDATE canonical_cities 
SET metro_name = 'Eugene, OR'
WHERE metro_population = 382971;

-- Ann Arbor Metro Area (372,258)
UPDATE canonical_cities 
SET metro_name = 'Ann Arbor, MI'
WHERE metro_population = 372258;

-- Roanoke Metro Area (315,251)
UPDATE canonical_cities 
SET metro_name = 'Roanoke, VA'
WHERE metro_population = 315251;

-- Atlantic City-Hammonton Metro Area (274,534)
UPDATE canonical_cities 
SET metro_name = 'Atlantic City-Hammonton, NJ'
WHERE metro_population = 274534;

-- Erie Metro Area (270,876)
UPDATE canonical_cities 
SET metro_name = 'Erie, PA'
WHERE metro_population = 270876;

-- Kalamazoo-Portage Metro Area (261,670)
UPDATE canonical_cities 
SET metro_name = 'Kalamazoo-Portage, MI'
WHERE metro_population = 261670;

-- Lynchburg Metro Area (261,593)
UPDATE canonical_cities 
SET metro_name = 'Lynchburg, VA'
WHERE metro_population = 261593;

-- Charlottesville Metro Area (235,232)
UPDATE canonical_cities 
SET metro_name = 'Charlottesville, VA'
WHERE metro_population = 235232;

-- Medford Metro Area (223,259)
UPDATE canonical_cities 
SET metro_name = 'Medford, OR'
WHERE metro_population = 223259;

-- Bend-Redmond Metro Area (198,253)
UPDATE canonical_cities 
SET metro_name = 'Bend-Redmond, OR'
WHERE metro_population = 198253;

-- Blacksburg-Christiansburg-Radford Metro Area (181,863)
UPDATE canonical_cities 
SET metro_name = 'Blacksburg-Christiansburg-Radford, VA'
WHERE metro_population = 181863;

-- St. George Metro Area (180,279)
UPDATE canonical_cities 
SET metro_name = 'St. George, UT'
WHERE metro_population = 180279;

-- State College Metro Area (162,805)
UPDATE canonical_cities 
SET metro_name = 'State College, PA'
WHERE metro_population = 162805;

-- Logan Metro Area (147,601)
UPDATE canonical_cities 
SET metro_name = 'Logan, UT-ID'
WHERE metro_population = 147601;

-- Lebanon Metro Area (143,257)
UPDATE canonical_cities 
SET metro_name = 'Lebanon, PA'
WHERE metro_population = 143257;

-- Harrisonburg Metro Area (135,571)
UPDATE canonical_cities 
SET metro_name = 'Harrisonburg, VA'
WHERE metro_population = 135571;

-- Hazleton Metro Area (134,726)
UPDATE canonical_cities 
SET metro_name = 'Hazleton, PA'
WHERE metro_population = 134726;

-- Johnstown Metro Area (133,472)
UPDATE canonical_cities 
SET metro_name = 'Johnstown, PA'
WHERE metro_population = 133472;

-- Altoona Metro Area (122,820)
UPDATE canonical_cities 
SET metro_name = 'Altoona, PA'
WHERE metro_population = 122820;

-- Williamsport Metro Area (114,188)
UPDATE canonical_cities 
SET metro_name = 'Williamsport, PA'
WHERE metro_population = 114188;

-- Danville Metro Area (106,561)
UPDATE canonical_cities 
SET metro_name = 'Danville, VA'
WHERE metro_population = 106561;

-- McMinnville Metro Area (99,958)
UPDATE canonical_cities 
SET metro_name = 'McMinnville, OR'
WHERE metro_population = 99958;

-- Corvallis Metro Area (95,184)
UPDATE canonical_cities 
SET metro_name = 'Corvallis, OR'
WHERE metro_population = 95184;

-- Grants Pass Metro Area (88,090)
UPDATE canonical_cities 
SET metro_name = 'Grants Pass, OR'
WHERE metro_population = 88090;

-- Update market_coverage table to sync metro names from canonical_cities
UPDATE market_coverage mc
SET metro_name = cc.metro_name
FROM canonical_cities cc
WHERE mc.canonical_city_id = cc.id
  AND cc.metro_name IS NOT NULL;
