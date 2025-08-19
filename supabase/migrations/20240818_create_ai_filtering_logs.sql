-- Create table for tracking AI filtering metrics
CREATE TABLE IF NOT EXISTS ai_filtering_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  market_name TEXT,
  total_processed INTEGER DEFAULT 0,
  total_filtered INTEGER DEFAULT 0,
  model_used TEXT DEFAULT 'gpt-3.5-turbo',
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_filtering_logs_user_id ON ai_filtering_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_filtering_logs_created_at ON ai_filtering_logs(created_at);

-- Enable RLS
ALTER TABLE ai_filtering_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only see their own logs
CREATE POLICY "Users can view their own AI filtering logs"
  ON ai_filtering_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policy - users can insert their own logs
CREATE POLICY "Users can insert their own AI filtering logs"
  ON ai_filtering_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());