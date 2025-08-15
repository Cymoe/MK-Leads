// Enhanced service mapping with expanded mappings and Other Services category
// Based on analysis of CSV imports from Greenwich, Newark, and Naples

// Complete list of 34 core UI services
export const coreUIServices = [
  'Deck Builders', 'Concrete Contractors', 'Window & Door', 'Roofing Contractors',
  'Tree Services', 'Solar Installers', 'Fence Contractors', 'Pool Builders',
  'Turf Installers', 'Kitchen Remodeling', 'Bathroom Remodeling', 'Whole Home Remodel',
  'Home Addition', 'Exterior Contractors', 'Hardscape Contractors', 'Landscaping Design',
  'Outdoor Kitchen', 'Painting Companies', 'Smart Home', 'Epoxy Flooring',
  'Garage Door Services', 'Cabinet Makers', 'Tile & Stone', 'Paving & Asphalt',
  'Custom Home Builders', 'Flooring Contractors', 'EV Charging Installation',
  'Artificial Turf Installation', 'Smart Home Installation', 'Outdoor Living Structures',
  'Custom Lighting Design', 'Water Features Installation', 'Outdoor Kitchen Installation',
  'Palapa/Tropical Structures'
]

// Enhanced mapping with additional database variations found in CSV imports
export const enhancedServiceMapping = {
  'Deck Builders': [
    'Deck builder', 'Deck contractor', 'Deck construction', 'Deck installation',
    'Composite decking', 'Wood deck builder', 'Deck repair'
  ],
  'Concrete Contractors': [
    'Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor',
    'Concrete repair', 'Stamped concrete', 'Decorative concrete', 'Concrete pouring'
  ],
  'Window & Door': [
    'Window installation service', 'Door installation', 'Window and door contractor',
    'Window installer', 'Window tinting service', 'Window replacement', 'Door repair',
    'Storm door installation', 'Entry door installation'
  ],
  'Roofing Contractors': [
    'Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair',
    'Roofing', 'Roof replacement', 'Shingle installation', 'Metal roofing',
    'Roof inspection', 'Emergency roof repair'
  ],
  'Tree Services': [
    'Tree service', 'Tree removal', 'Tree trimming', 'Arborist',
    'Tree cutting', 'Stump removal', 'Tree pruning', 'Emergency tree service',
    'Tree care', 'Licensed arborist'
  ],
  'Solar Installers': [
    'Solar energy contractor', 'Solar panel installation', 'Solar installer',
    'Solar energy company', 'Solar power installation', 'Photovoltaic installer',
    'Solar system installer', 'Renewable energy contractor'
  ],
  'Fence Contractors': [
    'Fence contractor', 'Fence installation', 'Fencing company',
    'Fence repair', 'Wood fence installation', 'Vinyl fence installation',
    'Chain link fence', 'Privacy fence installation'
  ],
  'Pool Builders': [
    'Swimming pool contractor', 'Pool cleaning service', 'Pool installation',
    'Pool repair', 'Swimming pool repair service', 'Pool maintenance',
    'Pool builder', 'Pool construction', 'Hot tub installation'
  ],
  'Turf Installers': [
    'Landscaper', 'Lawn care service', 'Artificial turf installation',
    'Turf supplier', 'Turf installation', 'Synthetic grass installation',
    'Artificial grass installer', 'Turf replacement'
  ],
  'Kitchen Remodeling': [
    'Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor',
    'Kitchen design', 'Kitchen cabinet installation', 'Kitchen upgrade',
    'Kitchen makeover', 'Custom kitchen builder'
  ],
  'Bathroom Remodeling': [
    'Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor',
    'Bathroom design', 'Shower installation', 'Bath remodel',
    'Bathroom upgrade', 'Bathroom makeover'
  ],
  'Whole Home Remodel': [
    'General contractor', 'Remodeler', 'Home renovation', 'Construction company',
    'General', 'Home remodeling', 'Full home renovation', 'House remodeling',
    'Residential remodeling', 'Complete home renovation'
  ],
  'Home Addition': [
    'General contractor', 'Home addition contractor', 'Room addition',
    'Construction company', 'Home extension', 'House addition',
    'Second story addition', 'Sunroom addition'
  ],
  'Exterior Contractors': [
    'Siding contractor', 'Exterior renovation', 'Exterior remodeling',
    'Gutter service', 'Gutter cleaning service', 'Vinyl siding',
    'Fiber cement siding', 'Exterior painting', 'Stucco contractor'
  ],
  'Hardscape Contractors': [
    'Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor',
    'Paving contractor', 'Retaining wall builder', 'Walkway installation',
    'Driveway contractor', 'Paver installation'
  ],
  'Landscaping Design': [
    'Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect',
    'Landscape lighting designer', 'Garden design', 'Yard design',
    'Landscape planning', 'Outdoor design'
  ],
  'Outdoor Kitchen': [
    'Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder',
    'Outdoor cooking area', 'Patio kitchen', 'Outdoor kitchen design',
    'Grill installation', 'Outdoor bar builder'
  ],
  'Painting Companies': [
    'Painter', 'Painting contractor', 'House painter', 'Painting Companies',
    'Painting', 'Interior painter', 'Exterior painter', 'Commercial painter',
    'Residential painter', 'Professional painter'
  ],
  'Smart Home': [
    'Smart home installation', 'Home automation', 'Technology installer',
    'Home automation company', 'Smart home integrator', 'Home technology',
    'Connected home installer', 'IoT installation'
  ],
  'Epoxy Flooring': [
    'Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy',
    'Epoxy floor installation', 'Industrial flooring', 'Decorative epoxy',
    'Resinous flooring', 'Epoxy coating'
  ],
  'Garage Door Services': [
    'Garage door installer', 'Garage door repair', 'Overhead door contractor',
    'Garage door service', 'Automatic door installer', 'Garage door opener',
    'Commercial door service', 'Roll up door installation'
  ],
  'Cabinet Makers': [
    'Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor',
    'Custom cabinet maker', 'Cabinet refacing', 'Cabinet builder',
    'Millwork contractor', 'Cabinetry specialist'
  ],
  'Tile & Stone': [
    'Tile contractor', 'Stone contractor', 'Tile installer',
    'Marble installation', 'Granite installer', 'Ceramic tile',
    'Natural stone installer', 'Tile setter'
  ],
  'Paving & Asphalt': [
    'Paving contractor', 'Asphalt contractor', 'Driveway paving',
    'Parking lot paving', 'Sealcoating', 'Asphalt repair',
    'Blacktop contractor', 'Pavement contractor'
  ],
  'Custom Home Builders': [
    'Custom home builder', 'Home builder', 'Residential builder',
    'Construction company', 'New home construction', 'House builder',
    'Luxury home builder', 'General building contractor'
  ],
  'Flooring Contractors': [
    'Flooring contractor', 'Floor installation', 'Carpet installer',
    'Hardwood flooring', 'Laminate flooring', 'Vinyl flooring',
    'Floor refinishing', 'Flooring specialist'
  ],
  'Outdoor Living Structures': [
    'Carport and pergola builder', 'Pergola builder', 'Gazebo builder',
    'Patio cover installation', 'Shade structure', 'Outdoor structure builder',
    'Arbor installation', 'Pavilion builder'
  ]
}

// Other Home Services - common services from CSV imports that don't fit core categories
export const otherHomeServices = {
  'HVAC Services': [
    'HVAC contractor', 'Heating contractor', 'Air conditioning contractor',
    'HVAC installation', 'Furnace repair', 'AC repair', 'Heating and cooling',
    'HVAC service', 'Climate control specialist'
  ],
  'Plumbing Services': [
    'Plumber', 'Plumbing contractor', 'Plumbing service', 'Pipe repair',
    'Drain cleaning', 'Water heater installation', 'Emergency plumber',
    'Licensed plumber', 'Plumbing repair'
  ],
  'Electrical Services': [
    'Electrician', 'Electrical contractor', 'Electrical service',
    'Electrical repair', 'Wiring contractor', 'Licensed electrician',
    'Electrical installation', 'Emergency electrician'
  ],
  'Handyman Services': [
    'Handyman', 'Handyperson', 'Home repair service', 'General repair',
    'Property maintenance', 'Home maintenance', 'Odd jobs',
    'Minor repairs', 'Handyman service'
  ],
  'Pest Control': [
    'Pest control service', 'Exterminator', 'Termite control',
    'Rodent control', 'Bug extermination', 'Wildlife removal',
    'Pest management', 'Insect control'
  ],
  'Cleaning Services': [
    'House cleaning service', 'Maid service', 'Cleaning company',
    'Residential cleaning', 'Deep cleaning', 'Move-in cleaning',
    'Professional cleaner', 'Home cleaning'
  ],
  'Moving Services': [
    'Moving company', 'Movers', 'Relocation service', 'Local movers',
    'Long distance movers', 'Packing service', 'Moving and storage',
    'Professional movers'
  ],
  'Home Security': [
    'Security system installer', 'Alarm installation', 'Camera installation',
    'Home security service', 'Access control', 'Security company',
    'Surveillance installation', 'Smart security'
  ],
  'Appliance Services': [
    'Appliance repair service', 'Appliance installation', 'Washer repair',
    'Refrigerator repair', 'Appliance technician', 'Appliance service',
    'Kitchen appliance repair', 'Appliance maintenance'
  ],
  'Locksmith Services': [
    'Locksmith', 'Lock installation', 'Key service', 'Emergency locksmith',
    'Lock repair', 'Security locks', 'Residential locksmith',
    'Lock replacement'
  ]
}

// Function to get the UI service category for a database service type
export function getUIServiceCategory(dbServiceType) {
  if (!dbServiceType) return null

  // Check core services first
  for (const [uiService, dbTypes] of Object.entries(enhancedServiceMapping)) {
    if (dbTypes.some(dbType => 
      dbType.toLowerCase() === dbServiceType.toLowerCase()
    )) {
      return { category: uiService, isCore: true }
    }
  }

  // Check if it's the UI service name itself
  if (coreUIServices.includes(dbServiceType)) {
    return { category: dbServiceType, isCore: true }
  }

  // Check other home services
  for (const [category, dbTypes] of Object.entries(otherHomeServices)) {
    if (dbTypes.some(dbType => 
      dbType.toLowerCase() === dbServiceType.toLowerCase()
    )) {
      return { category, isCore: false }
    }
  }

  // If not found in any mapping, categorize as "Other Services"
  return { category: 'Other Services', isCore: false }
}

// Function to calculate coverage with both core and total services
export function calculateEnhancedCoverage(serviceTypes) {
  const coreServicesWithLeads = new Set()
  const otherServicesWithLeads = new Set()
  const unmappedServices = new Set()

  // Categorize all service types
  for (const serviceType of Object.keys(serviceTypes)) {
    const category = getUIServiceCategory(serviceType)
    
    if (category.isCore) {
      coreServicesWithLeads.add(category.category)
    } else if (category.category === 'Other Services') {
      unmappedServices.add(serviceType)
    } else {
      otherServicesWithLeads.add(category.category)
    }
  }

  // Calculate coverage percentages
  const coreCoverage = Math.round((coreServicesWithLeads.size / coreUIServices.length) * 100)
  const totalUniqueServices = coreServicesWithLeads.size + otherServicesWithLeads.size + unmappedServices.size

  return {
    coreCoverage,
    coreServicesCount: coreServicesWithLeads.size,
    totalCoreServices: coreUIServices.length,
    otherServicesCount: otherServicesWithLeads.size,
    unmappedServicesCount: unmappedServices.size,
    totalUniqueServices,
    coreServices: Array.from(coreServicesWithLeads),
    otherServices: Array.from(otherServicesWithLeads),
    unmappedServices: Array.from(unmappedServices)
  }
}