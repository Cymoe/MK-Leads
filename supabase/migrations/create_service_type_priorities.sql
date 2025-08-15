-- Create service_type_priorities table for custom service ordering
CREATE TABLE IF NOT EXISTS service_type_priorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type VARCHAR(255) NOT NULL UNIQUE,
  priority INTEGER NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_service_type_priorities_priority ON service_type_priorities(priority DESC);

-- Insert default priorities if table is empty
INSERT INTO service_type_priorities (service_type, priority, is_custom)
SELECT 
  unnest(ARRAY[
    'Deck Builders', 'Concrete Contractors', 'Window & Door', 'Roofing Contractors',
    'Tree Services', 'Solar Installers', 'Fence Contractors', 'Pool Builders',
    'Turf Installers', 'Kitchen Remodeling', 'Bathroom Remodeling', 'Whole Home Remodel',
    'Home Addition', 'Exterior Contractors', 'Hardscape Contractors', 'Landscaping Design',
    'Outdoor Kitchen', 'Painting Companies', 'Smart Home', 'Epoxy Flooring',
    'Garage Door Services', 'Cabinet Makers', 'Tile & Stone', 'Paving & Asphalt',
    'Custom Home Builders', 'Flooring Contractors'
  ]) as service_type,
  27 - generate_series(1, 26) as priority,
  false as is_custom
WHERE NOT EXISTS (SELECT 1 FROM service_type_priorities LIMIT 1);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_priorities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_priorities_timestamp
  BEFORE UPDATE ON service_type_priorities
  FOR EACH ROW
  EXECUTE FUNCTION update_service_priorities_updated_at();