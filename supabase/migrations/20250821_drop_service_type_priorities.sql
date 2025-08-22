-- Drop obsolete service_type_priorities table and trigger if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'service_type_priorities'
  ) THEN
    -- Drop trigger first if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_table = 'service_type_priorities'
        AND trigger_name = 'update_service_priorities_timestamp'
    ) THEN
      DROP TRIGGER update_service_priorities_timestamp ON service_type_priorities;
    END IF;

    -- Function might be shared; drop safely if present
    IF EXISTS (
      SELECT 1 FROM pg_proc WHERE proname = 'update_service_priorities_updated_at'
    ) THEN
      DROP FUNCTION IF EXISTS update_service_priorities_updated_at();
    END IF;

    -- Finally drop the table
    DROP TABLE IF EXISTS service_type_priorities;
  END IF;
END $$;


