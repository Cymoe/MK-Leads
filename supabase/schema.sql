-- Markets/Cities table
CREATE TABLE IF NOT EXISTS markets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  type VARCHAR(50) DEFAULT 'SMALL', -- MEGA, LARGE, MEDIUM, SMALL
  region VARCHAR(100),
  service_types TEXT[],
  coverage_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, state)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(2),
  zip VARCHAR(20),
  phone VARCHAR(50),
  website TEXT,
  email VARCHAR(255),
  
  -- Business details
  category VARCHAR(255),
  services TEXT[],
  hours JSONB,
  rating DECIMAL(2,1),
  reviews INTEGER DEFAULT 0,
  
  -- Social presence
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
  
  -- Source tracking
  source VARCHAR(50), -- 'apify', 'manual', 'facebook', 'instagram'
  source_id TEXT,
  source_dataset_id TEXT,
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Google specific
  google_maps_url TEXT,
  place_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  collected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicates
  UNIQUE(name, address)
);

-- Import history table
CREATE TABLE IF NOT EXISTS import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  source VARCHAR(50),
  source_run_id TEXT,
  source_dataset_id TEXT,
  leads_imported INTEGER DEFAULT 0,
  leads_skipped INTEGER DEFAULT 0,
  status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Market activity phases table
CREATE TABLE IF NOT EXISTS market_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL, -- 1, 2, or 3
  phase_name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'inactive', -- 'inactive', 'active', 'completed'
  leads_count INTEGER DEFAULT 0,
  searches_performed INTEGER DEFAULT 0,
  matched_count INTEGER DEFAULT 0,
  unmatched_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(market_id, phase)
);

-- Create indexes for better performance
CREATE INDEX idx_leads_market_id ON leads(market_id);
CREATE INDEX idx_leads_city_state ON leads(city, state);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_category ON leads(category);
CREATE INDEX idx_import_history_market_id ON import_history(market_id);
CREATE INDEX idx_market_phases_market_id ON market_phases(market_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_phases_updated_at BEFORE UPDATE ON market_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC function to get market statistics
CREATE OR REPLACE FUNCTION get_market_stats(market_id UUID)
RETURNS TABLE (
  total_leads BIGINT,
  google_maps_leads BIGINT,
  facebook_leads BIGINT,
  instagram_leads BIGINT,
  categories_count BIGINT,
  avg_rating NUMERIC,
  total_reviews BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_leads,
    COUNT(*) FILTER (WHERE source = 'apify')::BIGINT as google_maps_leads,
    COUNT(*) FILTER (WHERE source = 'facebook')::BIGINT as facebook_leads,
    COUNT(*) FILTER (WHERE source = 'instagram')::BIGINT as instagram_leads,
    COUNT(DISTINCT category)::BIGINT as categories_count,
    AVG(rating)::NUMERIC as avg_rating,
    SUM(reviews)::BIGINT as total_reviews
  FROM leads
  WHERE leads.market_id = get_market_stats.market_id;
END;
$$ LANGUAGE plpgsql;

-- RPC function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_markets BIGINT,
  total_leads BIGINT,
  total_imports BIGINT,
  recent_imports BIGINT,
  top_categories JSON,
  coverage_by_state JSON
) AS $$
BEGIN
  RETURN QUERY
  WITH category_counts AS (
    SELECT category, COUNT(*) as count
    FROM leads
    WHERE category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
    LIMIT 5
  ),
  state_coverage AS (
    SELECT 
      m.state,
      COUNT(DISTINCT m.id) as markets,
      COUNT(l.id) as leads,
      AVG(m.coverage_percentage) as avg_coverage
    FROM markets m
    LEFT JOIN leads l ON l.market_id = m.id
    GROUP BY m.state
  )
  SELECT 
    (SELECT COUNT(*) FROM markets)::BIGINT as total_markets,
    (SELECT COUNT(*) FROM leads)::BIGINT as total_leads,
    (SELECT COUNT(*) FROM import_history WHERE status = 'completed')::BIGINT as total_imports,
    (SELECT COUNT(*) FROM import_history WHERE created_at > NOW() - INTERVAL '7 days')::BIGINT as recent_imports,
    (SELECT json_agg(row_to_json(category_counts)) FROM category_counts) as top_categories,
    (SELECT json_agg(row_to_json(state_coverage)) FROM state_coverage) as coverage_by_state;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_phases ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON markets FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON markets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON markets FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON leads FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON leads FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON leads FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON import_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON import_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON market_phases FOR SELECT USING (true);
CREATE POLICY "Enable all for authenticated users" ON market_phases FOR ALL USING (true);
