-- Migration to create service types tables
-- Date: 2025-08-14

-- Master list of all service types
CREATE TABLE IF NOT EXISTS service_types_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('established', 'emerging')),
  description TEXT,
  google_categories TEXT[], -- Array of Google Maps categories that map to this service
  growth_rate VARCHAR(20), -- e.g., "27.11%"
  market_size VARCHAR(100), -- e.g., "$32.12B by 2030"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Association table for markets and service types
CREATE TABLE IF NOT EXISTS market_service_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  service_type_id UUID NOT NULL REFERENCES service_types_master(id) ON DELETE CASCADE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_available BOOLEAN DEFAULT true,
  leads_count INTEGER DEFAULT 0,
  last_searched_at TIMESTAMP WITH TIME ZONE,
  search_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(market_id, service_type_id)
);

-- Indexes for performance
CREATE INDEX idx_service_types_category ON service_types_master(category);
CREATE INDEX idx_service_types_active ON service_types_master(is_active);
CREATE INDEX idx_market_service_market_id ON market_service_associations(market_id);
CREATE INDEX idx_market_service_service_type_id ON market_service_associations(service_type_id);
CREATE INDEX idx_market_service_priority ON market_service_associations(priority);

-- Triggers for updated_at
CREATE TRIGGER update_service_types_master_updated_at BEFORE UPDATE ON service_types_master
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_service_associations_updated_at BEFORE UPDATE ON market_service_associations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE service_types_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_service_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON service_types_master FOR SELECT USING (true);
CREATE POLICY "Enable all for authenticated users" ON service_types_master FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON market_service_associations FOR SELECT USING (true);
CREATE POLICY "Enable all for authenticated users" ON market_service_associations FOR ALL USING (true);

-- Insert initial service types based on the current service list
INSERT INTO service_types_master (name, category, google_categories, growth_rate, market_size) VALUES
-- Established Services
('Deck Builders', 'established', ARRAY['Deck builder', 'Deck contractor', 'Deck construction'], NULL, NULL),
('Concrete Contractors', 'established', ARRAY['Concrete contractor', 'Concrete work', 'Concrete company'], NULL, NULL),
('Window & Door', 'established', ARRAY['Window installation service', 'Door installation', 'Window and door contractor', 'Window installer'], NULL, NULL),
('Roofing Contractors', 'established', ARRAY['Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair'], NULL, NULL),
('Tree Services', 'established', ARRAY['Tree service', 'Tree removal', 'Tree trimming', 'Arborist'], NULL, NULL),
('Solar Installers', 'established', ARRAY['Solar energy contractor', 'Solar panel installation', 'Solar installer'], NULL, NULL),
('Fence Contractors', 'established', ARRAY['Fence contractor', 'Fence installation', 'Fencing company'], NULL, NULL),
('Pool Builders', 'established', ARRAY['Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair'], NULL, NULL),
('Turf Installers', 'established', ARRAY['Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf installation'], NULL, NULL),
('Kitchen Remodeling', 'established', ARRAY['Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor'], NULL, NULL),
('Bathroom Remodeling', 'established', ARRAY['Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor'], NULL, NULL),
('Whole Home Remodel', 'established', ARRAY['General contractor', 'Remodeler', 'Home renovation', 'Construction company'], NULL, NULL),
('Home Addition', 'established', ARRAY['General contractor', 'Home addition contractor', 'Room addition'], NULL, NULL),
('Exterior Contractors', 'established', ARRAY['Siding contractor', 'Exterior renovation', 'Exterior remodeling'], NULL, NULL),
('Hardscape Contractors', 'established', ARRAY['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor'], NULL, NULL),
('Landscaping Design', 'established', ARRAY['Landscaper', 'Landscape designer', 'Landscaping service'], NULL, NULL),
('Outdoor Kitchen', 'established', ARRAY['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder'], NULL, NULL),
('Painting Companies', 'established', ARRAY['Painter', 'Painting contractor', 'House painter'], NULL, NULL),
('Smart Home', 'established', ARRAY['Smart home installation', 'Home automation', 'Technology installer'], NULL, NULL),
('Epoxy Flooring', 'established', ARRAY['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy'], NULL, NULL),
('Garage Door Services', 'established', ARRAY['Garage door installer', 'Garage door repair', 'Overhead door contractor'], NULL, NULL),
('Cabinet Makers', 'established', ARRAY['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor'], NULL, NULL),
('Tile & Stone', 'established', ARRAY['Tile contractor', 'Stone contractor', 'Tile installer'], NULL, NULL),
('Paving & Asphalt', 'established', ARRAY['Paving contractor', 'Asphalt contractor', 'Driveway paving'], NULL, NULL),
('Custom Home Builders', 'established', ARRAY['Custom home builder', 'Home builder', 'Residential builder'], NULL, NULL),
('Flooring Contractors', 'established', ARRAY['Flooring contractor', 'Floor installation', 'Carpet installer'], NULL, NULL),
-- Emerging Services
('EV Charging Installation', 'emerging', ARRAY['EV charging station installer', 'Electric vehicle charging'], '27.11%', '$32.12B by 2030'),
('Artificial Turf Installation', 'emerging', ARRAY['Artificial turf installation', 'Synthetic grass installer'], '19.7%', '$4.88B by 2031'),
('Smart Home Installation', 'emerging', ARRAY['Smart home installation', 'Home automation specialist'], '23.4%', '$99.40B by 2032'),
('Outdoor Living Structures', 'emerging', ARRAY['Pergola builder', 'Gazebo installer', 'Outdoor structure contractor'], '5.3%', '$892.9M'),
('Custom Lighting Design', 'emerging', ARRAY['Lighting designer', 'Landscape lighting', 'Architectural lighting'], '5.72%', '$252.65B by 2035'),
('Water Features Installation', 'emerging', ARRAY['Water feature installer', 'Fountain contractor', 'Pond builder'], '8%', 'Growing'),
('Outdoor Kitchen Installation', 'emerging', ARRAY['Outdoor kitchen contractor', 'BBQ island builder'], '8.9%', '$24.45B'),
('Palapa/Tropical Structures', 'emerging', ARRAY['Palapa builder', 'Tiki hut contractor', 'Tropical structure builder'], 'Niche', 'Regional')
ON CONFLICT (name) DO NOTHING;