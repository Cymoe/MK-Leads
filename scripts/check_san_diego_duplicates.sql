-- San Diego Home Remodeling Duplicate Analysis Queries

-- 1. Total count
SELECT COUNT(*) as total_count
FROM leads
WHERE city = 'San Diego' 
AND industry = 'Home Remodeling';

-- 2. Check for duplicate phone numbers
WITH phone_duplicates AS (
  SELECT 
    phone,
    COUNT(*) as count,
    STRING_AGG(company_name, ' | ' ORDER BY company_name) as companies,
    STRING_AGG(DISTINCT address, ' | ' ORDER BY address) as addresses
  FROM leads
  WHERE 
    city = 'San Diego' 
    AND industry = 'Home Remodeling'
    AND phone IS NOT NULL 
    AND phone != ''
  GROUP BY phone
  HAVING COUNT(*) > 1
)
SELECT 
  COUNT(*) as duplicate_phone_groups,
  SUM(count) as total_duplicate_records,
  SUM(count) - COUNT(*) as extra_duplicate_records
FROM phone_duplicates;

-- 3. List specific phone duplicates (top 20)
SELECT 
  phone,
  COUNT(*) as count,
  STRING_AGG(company_name, ' | ' ORDER BY company_name) as companies
FROM leads
WHERE 
  city = 'San Diego' 
  AND industry = 'Home Remodeling'
  AND phone IS NOT NULL 
  AND phone != ''
GROUP BY phone
HAVING COUNT(*) > 1
ORDER BY count DESC, phone
LIMIT 20;

-- 4. Check for similar company names
WITH normalized_names AS (
  SELECT 
    id,
    company_name,
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          company_name, 
          '\s+(inc|llc|corp|corporation|company|co)\.?$', 
          '', 
          'gi'
        ),
        '[^a-z0-9]', 
        '', 
        'g'
      )
    ) as normalized_name,
    phone,
    address
  FROM leads
  WHERE 
    city = 'San Diego' 
    AND industry = 'Home Remodeling'
)
SELECT 
  normalized_name,
  COUNT(*) as count,
  STRING_AGG(DISTINCT company_name, ' | ' ORDER BY company_name) as variations
FROM normalized_names
WHERE LENGTH(normalized_name) > 3
GROUP BY normalized_name
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;

-- 5. Check for duplicate addresses
SELECT 
  address,
  COUNT(*) as count,
  STRING_AGG(company_name, ' | ' ORDER BY company_name) as companies
FROM leads
WHERE 
  city = 'San Diego' 
  AND industry = 'Home Remodeling'
  AND address IS NOT NULL 
  AND address != ''
GROUP BY address
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;

-- 6. Check for franchise patterns
SELECT 
  CASE 
    WHEN company_name ILIKE '%re-bath%' THEN 'Re-Bath'
    WHEN company_name ILIKE '%bath fitter%' THEN 'Bath Fitter'
    WHEN company_name ILIKE '%california closets%' THEN 'California Closets'
    WHEN company_name ILIKE '%closets by design%' THEN 'Closets by Design'
    WHEN company_name ILIKE '%kitchen tune-up%' THEN 'Kitchen Tune-Up'
    WHEN company_name ILIKE '%mr. handyman%' THEN 'Mr. Handyman'
    WHEN company_name ILIKE '%handyman connection%' THEN 'Handyman Connection'
    WHEN company_name ILIKE '%five star bath%' THEN 'Five Star Bath Solutions'
    WHEN company_name ILIKE '%west shore home%' THEN 'West Shore Home'
    WHEN company_name ILIKE '%window world%' THEN 'Window World'
    WHEN company_name ILIKE '%renewal by andersen%' THEN 'Renewal by Andersen'
    WHEN company_name ILIKE '%budget blinds%' THEN 'Budget Blinds'
    ELSE 'Other'
  END as franchise_name,
  COUNT(*) as location_count,
  STRING_AGG(company_name || ' - ' || COALESCE(address, 'No address'), '; ' ORDER BY company_name) as locations
FROM leads
WHERE 
  city = 'San Diego' 
  AND industry = 'Home Remodeling'
GROUP BY franchise_name
HAVING franchise_name != 'Other' AND COUNT(*) > 1
ORDER BY location_count DESC;

-- 7. Service type distribution
SELECT 
  COALESCE(service_type, 'Not specified') as service_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM leads
WHERE 
  city = 'San Diego' 
  AND industry = 'Home Remodeling'
GROUP BY service_type
ORDER BY count DESC;

-- 8. Check for suburbs included as San Diego
SELECT 
  COUNT(*) as suburb_count,
  STRING_AGG(DISTINCT 
    CASE 
      WHEN address ILIKE '%la jolla%' THEN 'La Jolla'
      WHEN address ILIKE '%chula vista%' THEN 'Chula Vista'
      WHEN address ILIKE '%coronado%' THEN 'Coronado'
      WHEN address ILIKE '%del mar%' THEN 'Del Mar'
      WHEN address ILIKE '%encinitas%' THEN 'Encinitas'
      WHEN address ILIKE '%escondido%' THEN 'Escondido'
      WHEN address ILIKE '%la mesa%' THEN 'La Mesa'
      WHEN address ILIKE '%national city%' THEN 'National City'
      WHEN address ILIKE '%oceanside%' THEN 'Oceanside'
      WHEN address ILIKE '%poway%' THEN 'Poway'
      WHEN address ILIKE '%santee%' THEN 'Santee'
      WHEN address ILIKE '%vista%' THEN 'Vista'
      WHEN address ILIKE '%carlsbad%' THEN 'Carlsbad'
      WHEN address ILIKE '%el cajon%' THEN 'El Cajon'
    END, ', '
  ) as suburbs_found
FROM leads
WHERE 
  city = 'San Diego' 
  AND industry = 'Home Remodeling'
  AND (
    address ILIKE '%la jolla%' OR
    address ILIKE '%chula vista%' OR
    address ILIKE '%coronado%' OR
    address ILIKE '%del mar%' OR
    address ILIKE '%encinitas%' OR
    address ILIKE '%escondido%' OR
    address ILIKE '%la mesa%' OR
    address ILIKE '%national city%' OR
    address ILIKE '%oceanside%' OR
    address ILIKE '%poway%' OR
    address ILIKE '%santee%' OR
    address ILIKE '%vista%' OR
    address ILIKE '%carlsbad%' OR
    address ILIKE '%el cajon%'
  );

-- 9. Import date analysis
SELECT 
  DATE(created_at) as import_date,
  COUNT(*) as records_imported
FROM leads
WHERE 
  city = 'San Diego' 
  AND industry = 'Home Remodeling'
GROUP BY DATE(created_at)
ORDER BY import_date DESC;

-- 10. Summary statistics
WITH stats AS (
  SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT phone) as unique_phones,
    COUNT(DISTINCT LOWER(TRIM(company_name))) as unique_names,
    COUNT(DISTINCT LOWER(TRIM(address))) as unique_addresses,
    SUM(CASE WHEN phone IS NULL OR phone = '' THEN 1 ELSE 0 END) as no_phone,
    SUM(CASE WHEN address IS NULL OR address = '' THEN 1 ELSE 0 END) as no_address,
    SUM(CASE WHEN service_type IS NULL OR service_type = '' THEN 1 ELSE 0 END) as no_service_type
  FROM leads
  WHERE 
    city = 'San Diego' 
    AND industry = 'Home Remodeling'
)
SELECT 
  total_records,
  unique_phones,
  unique_names,
  unique_addresses,
  ROUND((total_records - unique_phones) * 100.0 / total_records, 1) as phone_duplicate_rate,
  ROUND(no_phone * 100.0 / total_records, 1) as no_phone_percentage,
  ROUND(no_address * 100.0 / total_records, 1) as no_address_percentage,
  ROUND(no_service_type * 100.0 / total_records, 1) as no_service_type_percentage
FROM stats;