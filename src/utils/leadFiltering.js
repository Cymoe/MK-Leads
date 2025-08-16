// Lead filtering utilities to exclude non-service businesses during import

// Universal exclusions that apply to all service types
export const universalExclusions = [
  // Retail/Supply indicators
  'supply store', 'supplies store', 'supply company', 'supply warehouse',
  'supply inc', 'supply corp', 'supply llc', 'winsupply', 'ferguson',
  'building supply', 'lumber', 'home depot', 'lowes', 'menards', 'ace hardware',
  'home center', 'wholesale', 'distributor', 'distribution',
  'showroom', 'retail store', 'retailer', 'depot usa',
  'equipment rental', 'tool rental', 'sanitary supply',
  'bob mills furniture', 'furniture store', 'furniture mart',
  'habitat for humanity', 'habitat restore',
  
  // Manufacturing indicators
  'manufacturer', 'manufacturing', 'factory', 'production facility',
  
  // Sales-only indicators
  'equipment sales', 'equipment dealer', 'dealership',
  
  // Food/Restaurant indicators (for cases like Brookville Biscuit)
  'restaurant', 'cafe', 'coffee', 'bakery', 'biscuit', 'brunch',
  'brewery', 'brewing', 'craft kitchen', 'natural kitchen',
  'catering', 'food', 'dining', 'bistro', 'grill', 'tavern',
  
  // Other non-service indicators
  'supplier', 'vendor', 'appliances llc', 'appliance store',
  'restore', 'thrift store', 'thrift shop', 'secondhand',
  'custom maids', 'maid service', 'cleaning service', 'janitorial',
  'home boutique', 'design boutique', 'interior boutique', 'decor boutique',
  'wood company', 'wood co', 'lumber company', 'timber company',
  'design showroom', 'design gallery', 'decor store', 'decorating store',
  'home decor', 'home accessories', 'home furnishings',
  'gift shop', 'gift store', 'souvenir', 'novelty shop',
  
  // Tool and equipment stores/rentals
  'northern tool', 'harbor freight', 'grainger', 'fastenal',
  'tool store', 'tools store', 'equipment store', 'rental center',
  'rent-a-center', 'rental store', 'equipment sales', 'tool sales',
  'united rentals', 'sunbelt rentals', 'hertz equipment',
  'home depot rental', 'lowes rental', 'tool depot',
  'equipment company', 'tools & equipment', 'industrial supply',
  'industrial tool', 'contractor supply', 'builder supply',
  'northern tool + equipment', 'northern tool+equipment',
  
  // Property management companies (not service providers)
  'property management', 'property manager', 'management company',
  'realty management', 'real estate management', 'apartment management',
  'hoa management', 'condo management',
  
  // Hotels and lodging (not service providers)
  'hotel', 'motel', 'inn', 'lodge', 'resort', 'suites',
  'wyndham', 'marriott', 'hilton', 'holiday inn', 'best western',
  'comfort inn', 'days inn', 'super 8', 'econo lodge', 'la quinta',
  
  // Car dealerships (not service providers)
  'chevrolet', 'ford', 'toyota', 'honda', 'nissan', 'mazda',
  'hyundai', 'kia', 'volkswagen', 'bmw', 'mercedes', 'audi',
  'car dealership', 'auto dealership', 'automotive dealership',
  'car sales', 'auto sales', 'autonation',
  
  // Auto parts stores (retail, not service)
  'o\'reilly auto parts', 'oreilly auto', 'autozone', 'advance auto',
  'napa auto parts', 'auto parts store', 'parts store', 'auto parts',
  'automotive parts', 'car parts', 'truck parts', 'parts plus',
  'parts america', 'parts warehouse', 'parts depot',
  'auto supply', 'automotive supply', 'car accessories', 'auto accessories',
  'performance parts', 'aftermarket parts', 'auto equipment',
  
  // Car washes (not home service providers)
  'car wash', 'carwash', 'auto wash', 'quick quack', 'mister car wash',
  'express wash', 'drive through wash', 'automatic wash', 'touchless wash',
  'wash club', 'wash express', 'wash center', 'detail wash', 'wash tunnel',
  'wash bay', 'wash station', 'mobile wash', 'truck wash',
  
  // Gas stations and convenience stores
  'toot\'n totum', 'toot n totum', 'gas station', 'convenience store',
  '7-eleven', 'circle k', 'quiktrip', 'racetrac', 'wawa', 'sheetz',
  'valero', 'shell station', 'exxon', 'mobil station', 'chevron station',
  'fuel station', 'petrol station', 'filling station', 'service station store',
  'kwik stop', 'quick stop', 'ez mart', 'speedway', 'casey\'s general',
  'stripes', 'allsup\'s', 'ampm', 'arco', 'bp station', 'citgo',
  'conoco', 'phillips 66', 'sinclair', 'sunoco', 'texaco', 'marathon',
  
  // Museums and entertainment venues
  'museum', 'hall of fame', 'gallery', 'theater', 'theatre',
  
  // Shopping centers, malls, and retail complexes
  'shopping center', 'shopping centre', 'shopping mall', 'outlet mall',
  'marketplace shopping', 'shopping district', 'retail center',
  'strip mall', 'strip center', 'outlet stores', 'factory stores',
  'highland park village', 'town center shopping', 'the shops at',
  'the mall at', 'the plaza at', 'the promenade', 'the galleria',
  'the pavilion at', 'the marketplace at', 'the commons at',
  
  // Storage facilities (not service providers)
  'storage unit', 'self storage', 'storage facility', 'mini storage',
  'public storage', 'extra space', 'cubesmart', 'life storage',
  
  // Banks and financial institutions  
  'bank', 'credit union', 'financial services', 'mortgage company',
  'wells fargo', 'bank of america', 'chase bank', 'citibank',
  'receivership', 'receiver', 'bankruptcy', 'trustee', 'liquidation',
  'debt collection', 'collections agency', 'financial receiver',
  'court receiver', 'asset management', 'insolvency',
  'financial advisor', 'investment', 'wealth management', 'financial planning',
  'tax service', 'tax preparation', 'accounting', 'bookkeeping', 'cpa',
  
  // Legal services
  'law firm', 'attorney', 'lawyer', 'legal services', 'law office',
  'legal counsel', 'paralegal', 'litigation', 'law group',
  'dale williams', // Specific exclusion - receivership service
  
  // Insurance and real estate offices
  'insurance agency', 'insurance company', 'state farm', 'allstate',
  'real estate office', 'realty', 'realtors', 'real estate agency',
  'real estate agent', 'realtor', 'remax', 're/max', 'coldwell banker',
  'keller williams', 'century 21', 'berkshire hathaway',
  'pamela r. vaughn', 'pamela vaughn', '806homes', // Specific exclusion - real estate agent
  
  // Medical and healthcare facilities
  'hospital', 'clinic', 'medical center', 'urgent care', 'emergency room',
  'doctor office', 'dentist office', 'veterinary', 'pharmacy',
  
  // Educational institutions
  'school', 'university', 'college', 'academy', 'institute',
  'learning center', 'daycare', 'preschool', 'kindergarten',
  
  // Government buildings
  'city hall', 'courthouse', 'dmv', 'post office', 'usps',
  'police station', 'fire station', 'library', 'municipal',
  
  // Aviation and aerospace (not home/commercial services)
  'aerospace', 'aviation', 'aircraft', 'airplane', 'airport',
  'hangar', 'runway', 'terminal', 'airline', 'airways',
  'jet', 'helicopter', 'flight', 'pilot', 'avionics',
  'propeller', 'fuselage', 'cockpit', 'air force', 'airfield'
];

// Service-specific exclusions
export const serviceSpecificExclusions = {
  'Painting Companies': [
    'art gallery', 'art studio', 'art center', 'art experience',
    'art museum', 'art shop', 'art store', 'art bar',
    'paint store', 'paint shop', 'sherwin williams', 'benjamin moore',
    'kelly-moore paints', 'kelly moore', 'behr paint', 'ppg paints', 'ace paint',
    'h i s paint', 'his paint', 'h.i.s. paint', 'h.i.s paint',
    'paint supply', 'paint supplier', 'paint wholesale', 'paint retail',
    'craft store', 'hobby lobby', 'michaels', 'gallery',
    'paint & decorating', 'home center paint', 'cooperative gallery',
    'wild at art', 'kidzart', 'artspace', 'art workshop', 'diy studio',
    'craft studio', 'pottery', 'face painting', 'fine art painting',
    'art camp', 'make-it take-it', 'creating art', 'painters garden',
    'hello yellow', 'own something original', 'ar workshop',
    'wine & design', 'wine and design', 'paint & sip', 'paint and sip',
    'paintn & sipn', 'booze n brush', 'spin art', 'splatter studio',
    'paint parties', 'paint party', 'painting parties', 'painting party',
    'art lessons', 'art class', 'paint your pot', 'glaze studio',
    'klaystation', 'arts center', 'arts commission', 'art circle',
    'artworks', 'arthouse', 'artpost', 'artsource', 'art & framing',
    'wedding painter', 'live painter', 'nail studio', 'paint and body',
    'auto body', 'body shop', 'flick of the wrist', 'the centerpiece',
    'anchorlight', 'casas studios', 'village art'
  ],
  
  'Landscaping Design': [
    'garden center', 'nursery', 'plant store', 'plant shop',
    'home depot garden', 'lowes garden', 'botanical garden',
    'greenhouse retail', 'plant nursery', 'mulch company',
    'mulch supply', 'stone supply', 'home & garden',
    'family home & garden', 'capital mulch'
  ],
  
  'Solar Installers': [
    'solar equipment', 'solar panel dealer', 'solar supply',
    'solar wholesale', 'solar distributor', 'solar store'
  ],
  
  'Pool Builders': [
    // Supply stores
    'pool supply', 'pool store', 'hot tub dealer', 'spa store',
    'pool equipment', 'leslie pool', 'pool wholesale',
    // YMCAs and community centers
    'ymca', 'ywca', 'community center', 'recreation center',
    // Public pools and aquatic centers
    'aquatic center', 'public pool', 'public swimming',
    'city pool', 'county pool', 'municipal pool',
    'aquatic complex', 'kroc center', 'salvation army',
    // Swim clubs and country clubs
    'swim club', 'country club', 'racquet club', 'tennis club',
    'golf club', 'athletic club', 'health club',
    // Fitness centers and gyms
    'fitness', 'gym', 'health club', 'athletic club',
    'fitness center', 'wellness center',
    // Swim schools and lessons
    'swim school', 'swim lesson', 'swimming lesson',
    'aqua-tots', 'british swim', 'goldfish swim',
    // Neighborhood/Community pools
    'neighborhood pool', 'community pool', 'clubhouse',
    'homeowners association', 'hoa pool', 'amenity center',
    // Specific patterns
    'park pool', 'hills pool', 'drive pool', 'place pool',
    'athletic park', 'water transport',
    // Pool management companies (not builders)
    'pool management', 'lifeguard service',
    // Additional patterns found in analysis
    'mill pool', 'creek pool', 'falls pool', 'landing pool',
    'village pool', 'ridge pool', 'lake pool', 'pointe pool',
    'downs pool', 'estates pool', 'sportsplex',
    // Specific problematic names
    'eliza pool park', 'millbrook exchange park',
    'biltmore hills park', 'orange county sportsplex',
    // Resorts and rentals
    'resort & spa', 'vacations resort', 'swimply', 'pool rental',
    'event space', 'bluegreen vacations'
  ],
  
  'Roofing Contractors': [
    'shingle dealer', 'roofing supply', 'roofing wholesale',
    'roofing materials', 'roofing distributor'
  ],
  
  'Concrete Contractors': [
    'ready mix plant', 'concrete supply', 'concrete plant',
    'cement plant', 'concrete wholesale', 'aggregate supplier'
  ],
  
  'Flooring Contractors': [
    'carpet store', 'flooring store', 'flooring gallery',
    'flooring showroom', 'tile store', 'floor decor',
    'carpet one', 'flooring america'
  ],
  
  'Kitchen Remodeling': [
    'cabinet showroom', 'appliance store', 'kitchen showroom',
    'home depot kitchen', 'lowes kitchen', 'cabinet store',
    'appliances llc', 'granite countertops', 'cabinet shop',
    'cabinetry design center'
  ],
  
  'Bathroom Remodeling': [
    'bath showroom', 'plumbing showroom', 'fixture store',
    'bathroom gallery', 'kohler showroom'
  ],
  
  'Window & Door': [
    'window store', 'door showroom', 'window gallery',
    'door store', 'window world showroom'
  ],
  
  'Fence Contractors': [
    'fence supply', 'fence dealer', 'fence wholesale',
    'fence materials', 'fence store'
  ],
  
  'Deck Builders': [
    'lumber yard', 'lumber store', 'deck supply',
    'decking store', 'lumber wholesale'
  ],
  
  'Tree Services': [
    'tree nursery', 'plant nursery', 'tree farm retail',
    'christmas tree farm', 'tree farm', 'county park', 'state park',
    'retail nursery', 'shopping center', 'plaza', 'mall',
    'cloud chamber', 'crabtree', 'tennis park', 'pilot park',
    'garden center', 'dix park', 'moore square', 'harrispark',
    'painted tree', 'spice and tea', 'city farm', 'chainsaw log',
    'boutique', 'retail', 'nature trail', 'botanical garden',
    'arboretum', 'busch gardens', 'colonial williamsburg',
    'theme park', 'amusement park', 'historical site',
    'visitor center', 'hotel', 'doubletree', 'hilton',
    'kitchens', 'restaurant', 'christmas mouse', 'christmas store',
    'market square', 'waller mill park', 'freedom park'
  ],
  
  'Garage Door Services': [
    'garage door showroom', 'door store', 'overhead door dealer'
  ],
  
  'Cabinet Makers': [
    'cabinet showroom', 'cabinet store', 'cabinet gallery',
    'kitchen gallery'
  ],
  
  'Tile & Stone': [
    'tile store', 'stone yard', 'granite showroom',
    'marble showroom', 'tile gallery'
  ],
  
  'Paving & Asphalt': [
    'asphalt plant', 'paving materials', 'aggregate supplier'
  ],
  
  'Custom Home Builders': [
    'model home center', 'home gallery', 'design center retail'
  ],
  
  'Hardscape Contractors': [
    'paver store', 'stone yard', 'landscape supply',
    'hardscape supply', 'paver dealer'
  ],
  
  'Smart Home': [
    'electronics store', 'best buy', 'technology store'
  ],
  
  'Epoxy Flooring': [
    'epoxy supply', 'coating supply', 'epoxy dealer'
  ],
  
  'EV Charging Installation': [
    'ev dealer', 'tesla store', 'car dealership',
    'auto dealer', 'ev showroom'
  ],
  
  'Artificial Turf Installation': [
    'turf supply', 'turf dealer', 'turf wholesale',
    'synthetic grass dealer', 'turf equipment', 'turf sprayer',
    // Hotels and lodging
    'la quinta inn', 'drury inn', 'motel 6', 'doubletree',
    'inn & suites', 'inn suites', 'extend a suites',
    // Restaurants  
    'steakhouse', 'bbq', 'waffle house', 'popeyes', 'taco spot',
    'burger mania', 'quik burrito', 'tacos y mariscos', 'tacos',
    'texas roadhouse', 'sports bar', 'banquet hall', 'surf and turf',
    // Retail/services
    'auto parts', 'walmart', 'sam\'s club', 'sams club', 'sun devil auto',
    'moneygram', 'sporting goods', 'tax service', 't-mobile',
    'quick-tag', 'coinstar', 'vision & glasses', 'optical center',
    'floral', 'gas station',
    // Medical
    'od', 'dds', 'dvm', 'hearing center', 'dr.', 'doctor',
    // Water services
    'primo water', 'water exchange', 'water refill',
    // Auto dealers
    'lincoln', 'sanderson',
    // Other
    'higi', 'passport photos', 'phone repair', 'lash studio',
    'soccer shop', 'rentals', 'coaching', 'training',
    'vasa fitness', 'fitness',
    // Nurseries (not installers)
    'nursery', 'nurseries', 'landscape centers',
    // Non-turf companies
    'stone company', 'fire bowls', 'stabilizer solutions',
    // Parks and sports facilities
    'park', 'public park', 'sports complex field', 'soccer field',
    'sports complex', 'sports centre', 'sports center',
    'golf course', 'country club', 'basin',
    // Schools and educational facilities
    'high school', 'track and field', 'school field',
    // Government facilities
    'phoenix.gov', '.gov/',
    // Horse racing/gambling
    'turf paradise', 'sportsbook', 'betting',
    // Services (not installation)
    'turfwash', 'turf wash', 'turf cleaning'
  ],
  
  'Outdoor Kitchen': [
    'grill store', 'bbq store', 'outdoor furniture store',
    'patio furniture'
  ],
  
  'Water Features Installation': [
    'pond supply', 'fountain store', 'water garden store'
  ],
  
  'Custom Lighting Design': [
    'electrical supply', 'electric supply', 'rexel', 'capital electric',
    'maurice electric', 'landscape supply', 'siteone landscape',
    'garden center', 'gardening store', 'shade shop', 'house of lights'
  ],
  
  'Outdoor Living Structures': [
    'at home store', 'retail store', 'home goods', 'furniture store',
    'park', 'public park', 'recreation center', 'playground',
    'foundation repair', 'foundation solutions', 'foundation contractor',
    'artificial grass', 'artificial turf', 'synthetic grass',
    'demolition', 'excavation', 'dig and haul',
    'pool repair', 'pool service', 'spa cover', 'pool cover',
    'rain gutter', 'gutter service', 'gutter installation',
    'window replacement', 'door replacement', 'window and door',
    'roofing only', 'roof repair', 'siding contractor'
  ]
};

/**
 * Check if a business should be excluded based on its name and service type
 * @param {string} businessName - The name of the business
 * @param {string} serviceType - The service type being searched
 * @returns {object} - { excluded: boolean, reason?: string }
 */
export function isExcludedBusiness(businessName, serviceType) {
  const nameLower = businessName.toLowerCase();
  
  // Special handling for Painting Companies to catch art-related businesses
  if (serviceType === 'Painting Companies') {
    // Pattern-based exclusions for art businesses
    const artPatterns = [
      // Clear art businesses - when "art" is the main focus
      /^art\s+with\s+/i,                    // "Art with Lauren"
      /\s+art\s*,?\s*(llc|inc|corp)?$/i,   // "Matt Tomko Art", "Taylor White Art"
      /^creating\s+.*\s+art/i,              // "Creating My Art, LLC"
      /museum\s+of\s+art/i,                 // "North Carolina Museum of Art"
      /office\s+of\s+.*\s+arts?/i,          // "The Office of Raleigh Arts"
      /\bart\s+(gallery|studio|center|museum|shop|store|bar|experience|workshop|camp|class|lessons|circle|commission)\b/i,
      /\b(gallery|studio|museum)\s+.*\bart\b/i,
      
      // Personal artist names (Name + Art pattern)
      /^[A-Z][a-z]+\s+[A-Z][a-z]+\s+Art$/i,  // "Taylor White Art", "Matt Tomko Art"
      
      // Other art-related patterns already in exclusions will still be caught
    ];
    
    // Whitelist patterns for legitimate painting companies with "art" in name
    const legitimateArtPatterns = [
      /state\s+of\s+the\s+art/i,           // "State of the Art Painting"
      /\bart\s+of\s+(painting|finishing)/i, // "The Art of Painting"
      /\bartisan?\s+/i,                    // "Artisan", "Artistic" painters
      /\bartistic\s+(painting|touch)/i,     // "Artistic Painting Services"
    ];
    
    // Check if it matches a legitimate pattern first
    for (const pattern of legitimateArtPatterns) {
      if (pattern.test(businessName)) {
        return { excluded: false }; // Explicitly allow these
      }
    }
    
    // Then check art exclusion patterns
    for (const pattern of artPatterns) {
      if (pattern.test(businessName)) {
        return {
          excluded: true,
          reason: `Art business pattern detected: "${businessName}"`
        };
      }
    }
  }
  // Special handling for Pool Builders to catch non-builders
  if (serviceType === 'Pool Builders') {
    // Pattern-based exclusions for community/facility pools
    const poolFacilityPatterns = [
      // Names ending with " Pool" (singular) are almost always facilities
      /\sPool$/i,                           // "Churchill Pool", "Lake Johnson Pool"
      /^[A-Z][a-z]+\s+(Creek|Lake|Ridge|Village|Hills?|Park|Falls|Landing|Pointe|Downs|Mill)\s+Pool$/i,
      // SportsPlex and Parks
      /SportsPlex/i,
      /\sPark$/i,                          // "Biltmore Hills Park"
      // Swimming pools (facilities)
      /Swimming\s+Pool$/i,                 // "Hillside Swimming Pool"
      // Community patterns
      /Community\s+(Swimming\s+)?Pool/i,   // "Widewaters Community Swimming Pool"
      // HOA/Residential patterns
      /Estates?\s+Pool$/i,                 // "Kingsborough Estates Pool"
      /Club\s*House\s*(and\s+)?Pool/i,    // "Ashworth Club House and Pool"
      // Additional patterns from latest analysis
      /Aquatics?\s+Center/i,              // "Edison Johnson Aquatics Center"
      /Recreation\s+Club/i,               // "Recreation Club of Lochmere"
      /The\s+.*\s+Club\s+at/i,           // "The Greenway Club at Falls River"
      /Life\s+Time/i,                     // "Life Time" fitness centers
      /Swimming\s+Association/i,          // "Raleigh Swimming Association"
      /^Swim$/i,                          // Just "Swim" - likely a swim school
      /\bFitness\b/i,                     // Fitness centers
      /Country\s+Club/i,                  // Country clubs
      /Aquatic\s+Facility/i,              // "William H. Sonner Aquatic Facility"
    ];
    
    // Whitelist patterns for legitimate pool businesses
    const legitimatePoolPatterns = [
      /pool\s+(service|builder|construction|contractor|professional|repair|renovation)/i,
      /pools\s+(inc|llc|corp|company|by|&)/i,
      /pool\s+&\s+spa/i,
      /^[A-Za-z\s]+\s+Pools$/i,  // Names ending with "Pools" (plural) are usually businesses
      /SwimScapes/i,              // SwimScapes RDU is a legitimate pool builder
    ];
    
    // Check whitelist first
    for (const pattern of legitimatePoolPatterns) {
      if (pattern.test(businessName)) {
        return { excluded: false };
      }
    }
    
    // Then check exclusion patterns
    for (const pattern of poolFacilityPatterns) {
      if (pattern.test(businessName)) {
        return {
          excluded: true,
          reason: `Pool facility pattern detected: "${businessName}"`
        };
      }
    }
  }
  
  // Special handling for Kitchen Remodeling to catch restaurants
  if (serviceType === 'Kitchen Remodeling' || serviceType === 'Custom Home Builders') {
    // Pattern-based exclusions for restaurants with "Kitchen" in name
    const restaurantPatterns = [
      /\bkitchen\s*&\s*(bar|brewery|grill|cafe|pub)\b/i,
      /\b(craft|natural|organic|farm)\s+kitchen\b/i,
      /\bkitchen\s*-\s*catering\b/i,
      /\b(bistro|restaurant|eatery|diner)\b/i
    ];
    
    for (const pattern of restaurantPatterns) {
      if (pattern.test(businessName)) {
        return {
          excluded: true,
          reason: `Restaurant pattern detected: "${businessName}"`
        };
      }
    }
    
    // Additional checks for website URLs that indicate restaurants
    if (businessName.includes('kitchen') && 
        (businessName.includes('craft') || businessName.includes('natural') || 
         businessName.includes('farm') || businessName.includes('beacon'))) {
      return {
        excluded: true,
        reason: `Likely restaurant with 'kitchen' in name: "${businessName}"`
      };
    }
  }
  
  // Check universal exclusions
  for (const term of universalExclusions) {
    if (nameLower.includes(term)) {
      return { 
        excluded: true, 
        reason: `Universal exclusion: "${term}"` 
      };
    }
  }
  
  // Check service-specific exclusions
  const specificExclusions = serviceSpecificExclusions[serviceType] || [];
  for (const term of specificExclusions) {
    if (nameLower.includes(term)) {
      return { 
        excluded: true, 
        reason: `Service-specific exclusion: "${term}"` 
      };
    }
  }
  
  return { excluded: false };
}

/**
 * Filter an array of leads to exclude non-service businesses
 * @param {Array} leads - Array of lead objects
 * @param {string} serviceType - The service type being imported
 * @returns {object} - { filteredLeads: Array, excludedBusinesses: Array }
 */
export function filterServiceBusinesses(leads, serviceType) {
  const filteredLeads = [];
  const excludedBusinesses = [];
  
  for (const lead of leads) {
    const businessName = lead.name || lead.company_name || '';
    const exclusionCheck = isExcludedBusiness(businessName, serviceType);
    
    if (exclusionCheck.excluded) {
      excludedBusinesses.push({
        name: businessName,
        reason: exclusionCheck.reason,
        address: lead.address
      });
    } else {
      filteredLeads.push(lead);
    }
  }
  
  return {
    filteredLeads,
    excludedBusinesses
  };
}

/**
 * Get a summary of exclusion rules for a service type
 * @param {string} serviceType - The service type
 * @returns {object} - Summary of exclusion rules
 */
export function getExclusionSummary(serviceType) {
  return {
    universal: universalExclusions.length,
    serviceSpecific: (serviceSpecificExclusions[serviceType] || []).length,
    total: universalExclusions.length + (serviceSpecificExclusions[serviceType] || []).length
  };
}