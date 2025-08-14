# Database Migration Instructions

Run these migrations in order in your Supabase SQL Editor:

## 1. Add Population Fields to Markets Table
```sql
-- File: add_population_to_markets.sql
-- Adds population, population_year, and metro_population fields
```

## 2. Create Lead Count RPC Function  
```sql
-- File: create_get_lead_counts_by_city_rpc.sql
-- Creates efficient function for counting leads by city
```

## 3. Create Service Types Tables
```sql
-- File: create_service_types_tables.sql
-- Creates service_types_master and market_service_associations tables
-- Populates with all 34 service types including emerging services
```

## 4. Drop Unused CRM Columns (if not already done)
```sql
-- File: drop_crm_columns.sql
-- Removes dm_sent, dm_response, called, call_result, follow_up_date
```

## 5. Drop Normalized Service Type Column (if not already done)
```sql
-- File: drop_normalized_service_type.sql
-- Removes the normalized_service_type column
```

## Running the Migrations

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file's content in order
4. Run each migration
5. Verify tables are created/updated correctly

## New Features Added

- **Add Market Button**: Click to manually add new markets with population data
- **Population Display**: Markets now show city and metro population
- **Regional Service Priorities**: Services are prioritized based on regional demand
- **Emerging Services**: 8 new trending services with growth indicators
- **Service Type Management**: Proper database structure for managing services

## Next Steps

1. Import population data for existing markets
2. Set up Apify integration for new market imports
3. Create bulk market import functionality
4. Add analytics for service performance per market