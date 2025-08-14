-- Migration to remove unused CRM-related columns
-- These columns are not needed since we're not using this as a CRM
-- Date: 2025-08-14

-- Drop CRM-related columns from leads table
ALTER TABLE public.leads 
  DROP COLUMN IF EXISTS dm_sent,
  DROP COLUMN IF EXISTS dm_response,
  DROP COLUMN IF EXISTS called,
  DROP COLUMN IF EXISTS call_result,
  DROP COLUMN IF EXISTS follow_up_date;