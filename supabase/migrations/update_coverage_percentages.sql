-- Update coverage_percentage column in markets table with accurate calculations
-- Based on actual UI services (34 total) that have leads

-- First, let's update specific markets with their calculated coverage
UPDATE markets SET coverage_percentage = 68 WHERE name = 'Naples' AND state = 'FL';
UPDATE markets SET coverage_percentage = 65 WHERE name = 'Newark' AND state = 'NJ';
UPDATE markets SET coverage_percentage = 65 WHERE name = 'Greenwich' AND state = 'CT';
UPDATE markets SET coverage_percentage = 50 WHERE name = 'San Diego' AND state = 'CA';
UPDATE markets SET coverage_percentage = 35 WHERE name = 'Phoenix' AND state = 'AZ';
UPDATE markets SET coverage_percentage = 18 WHERE name = 'Steamboat Springs' AND state = 'CO';
UPDATE markets SET coverage_percentage = 18 WHERE name = 'Boulder' AND state = 'CO';
UPDATE markets SET coverage_percentage = 15 WHERE name = 'Aspen' AND state = 'CO';
UPDATE markets SET coverage_percentage = 12 WHERE name = 'Fort Collins' AND state = 'CO';
UPDATE markets SET coverage_percentage = 9 WHERE name = 'Park City' AND state = 'UT';
UPDATE markets SET coverage_percentage = 9 WHERE name = 'Traverse City' AND state = 'MI';
UPDATE markets SET coverage_percentage = 9 WHERE name = 'Fort Worth' AND state = 'TX';
UPDATE markets SET coverage_percentage = 9 WHERE name = 'Lake Havasu City' AND state = 'AZ';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Bend' AND state = 'OR';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Pleasanton' AND state = 'CA';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Frisco' AND state = 'TX';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Greenville' AND state = 'SC';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Plano' AND state = 'TX';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Cape Coral' AND state = 'FL';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Coeur D Alene' AND state = 'ID';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Dallas' AND state = 'TX';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Orlando' AND state = 'FL';
UPDATE markets SET coverage_percentage = 6 WHERE name = 'Fredericksburg' AND state = 'TX';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Vail' AND state = 'CO';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Winter Park' AND state = 'FL';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Bozeman' AND state = 'MT';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Breckenridge' AND state = 'CO';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Lenox' AND state = 'MA';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Lancaster' AND state = 'PA';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Houston' AND state = 'TX';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Lubbock' AND state = 'TX';
UPDATE markets SET coverage_percentage = 3 WHERE name = 'Williamsburg' AND state = 'VA';
UPDATE markets SET coverage_percentage = 0 WHERE name = 'Akiachak' AND state = 'AK';

-- Create a function to calculate coverage dynamically
CREATE OR REPLACE FUNCTION calculate_market_coverage(market_city TEXT, market_state TEXT)
RETURNS INTEGER AS $$
DECLARE
  total_ui_services INTEGER := 34;
  covered_services INTEGER := 0;
  service_record RECORD;
BEGIN
  -- Count distinct UI services that have leads
  -- This is a simplified version - in production you'd want the full mapping
  WITH service_counts AS (
    SELECT DISTINCT 
      CASE 
        WHEN service_type IN ('Deck builder', 'Deck contractor', 'Deck construction') THEN 'Deck Builders'
        WHEN service_type IN ('Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor') THEN 'Concrete Contractors'
        WHEN service_type IN ('Window installation service', 'Door installation', 'Window and door contractor', 'Window installer', 'Window tinting service') THEN 'Window & Door'
        WHEN service_type IN ('Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair') THEN 'Roofing Contractors'
        WHEN service_type IN ('Tree service', 'Tree removal', 'Tree trimming', 'Arborist') THEN 'Tree Services'
        WHEN service_type IN ('Solar energy contractor', 'Solar panel installation', 'Solar installer', 'Solar energy company') THEN 'Solar Installers'
        WHEN service_type IN ('Fence contractor', 'Fence installation', 'Fencing company') THEN 'Fence Contractors'
        WHEN service_type IN ('Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair', 'Swimming pool repair service') THEN 'Pool Builders'
        WHEN service_type IN ('Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf supplier', 'Turf installation') THEN 'Turf Installers'
        WHEN service_type IN ('Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor') THEN 'Kitchen Remodeling'
        WHEN service_type IN ('Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor') THEN 'Bathroom Remodeling'
        WHEN service_type IN ('General contractor', 'Remodeler', 'Home renovation', 'Construction company', 'General') THEN 'Whole Home Remodel'
        WHEN service_type IN ('General contractor', 'Home addition contractor', 'Room addition', 'Construction company') THEN 'Home Addition'
        WHEN service_type IN ('Siding contractor', 'Exterior renovation', 'Exterior remodeling', 'Gutter service', 'Gutter cleaning service') THEN 'Exterior Contractors'
        WHEN service_type IN ('Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor', 'Paving contractor') THEN 'Hardscape Contractors'
        WHEN service_type IN ('Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect', 'Landscape lighting designer') THEN 'Landscaping Design'
        WHEN service_type IN ('Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder') THEN 'Outdoor Kitchen'
        WHEN service_type IN ('Painter', 'Painting contractor', 'House painter', 'Painting Companies', 'Painting') THEN 'Painting Companies'
        WHEN service_type IN ('Smart home installation', 'Home automation', 'Technology installer', 'Home automation company') THEN 'Smart Home'
        WHEN service_type IN ('Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy') THEN 'Epoxy Flooring'
        WHEN service_type IN ('Garage door installer', 'Garage door repair', 'Overhead door contractor') THEN 'Garage Door Services'
        WHEN service_type IN ('Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor') THEN 'Cabinet Makers'
        WHEN service_type IN ('Tile contractor', 'Stone contractor', 'Tile installer') THEN 'Tile & Stone'
        WHEN service_type IN ('Paving contractor', 'Asphalt contractor', 'Driveway paving') THEN 'Paving & Asphalt'
        WHEN service_type IN ('Custom home builder', 'Home builder', 'Residential builder', 'Construction company') THEN 'Custom Home Builders'
        WHEN service_type IN ('Flooring contractor', 'Floor installation', 'Carpet installer') THEN 'Flooring Contractors'
        WHEN service_type IN ('Carport and pergola builder', 'Pergola builder', 'Gazebo builder') THEN 'Outdoor Living Structures'
        ELSE service_type -- Keep original if not mapped
      END AS ui_service
    FROM leads
    WHERE city = market_city 
      AND state = market_state 
      AND service_type IS NOT NULL
  )
  SELECT COUNT(DISTINCT ui_service) INTO covered_services
  FROM service_counts
  WHERE ui_service IN (
    'Deck Builders', 'Concrete Contractors', 'Window & Door', 'Roofing Contractors',
    'Tree Services', 'Solar Installers', 'Fence Contractors', 'Pool Builders',
    'Turf Installers', 'Kitchen Remodeling', 'Bathroom Remodeling', 'Whole Home Remodel',
    'Home Addition', 'Exterior Contractors', 'Hardscape Contractors', 'Landscaping Design',
    'Outdoor Kitchen', 'Painting Companies', 'Smart Home', 'Epoxy Flooring',
    'Garage Door Services', 'Cabinet Makers', 'Tile & Stone', 'Paving & Asphalt',
    'Custom Home Builders', 'Flooring Contractors', 'EV Charging Installation',
    'Artificial Turf Installation', 'Smart Home Installation', 'Outdoor Living Structures',
    'Custom Lighting Design', 'Water Features Installation', 'Outdoor Kitchen Installation',
    'Palapa/Tropical Structures'
  );
  
  RETURN ROUND((covered_services::NUMERIC / total_ui_services) * 100);
END;
$$ LANGUAGE plpgsql;