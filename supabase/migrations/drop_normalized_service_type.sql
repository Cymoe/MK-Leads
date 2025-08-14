-- Migration to safely remove the normalized_service_type column
-- This column is no longer needed as we handle service type normalization in the application code
-- Date: 2025-08-14

-- First, let's verify the column exists and check if any constraints depend on it
DO $$
BEGIN
    -- Check if the column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'normalized_service_type'
    ) THEN
        -- Drop the column
        ALTER TABLE public.leads 
        DROP COLUMN normalized_service_type;
        
        RAISE NOTICE 'Column normalized_service_type has been successfully dropped from leads table';
    ELSE
        RAISE NOTICE 'Column normalized_service_type does not exist in leads table';
    END IF;
END $$;