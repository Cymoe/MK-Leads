// Centralized mapping between UI service names and database service types
export const serviceTypeMapping = {
  'Deck Builders': ['Deck builder', 'Deck contractor', 'Deck construction'],
  'Concrete Contractors': ['Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor'],
  'Window & Door': ['Window installation service', 'Door installation', 'Window and door contractor', 'Window installer', 'Window tinting service'],
  'Roofing Contractors': ['Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair'],
  'Tree Services': ['Tree service', 'Tree removal', 'Tree trimming', 'Arborist'],
  'Solar Installers': ['Solar energy contractor', 'Solar panel installation', 'Solar installer'],
  'Fence Contractors': ['Fence contractor', 'Fence installation', 'Fencing company'],
  'Pool Builders': ['Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair'],
  'Turf Installers': ['Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf supplier', 'Turf installation'],
  'Kitchen Remodeling': ['Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor'],
  'Bathroom Remodeling': ['Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor'],
  'Whole Home Remodel': ['General contractor', 'Remodeler', 'Home renovation', 'Construction company', 'General'],
  'Home Addition': ['General contractor', 'Home addition contractor', 'Room addition', 'Construction company'],
  'Exterior Contractors': ['Siding contractor', 'Exterior renovation', 'Exterior remodeling', 'Gutter service'],
  'Hardscape Contractors': ['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor', 'Paving contractor'],
  'Landscaping Design': ['Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect', 'Landscape lighting designer'],
  'Outdoor Kitchen': ['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder'],
  'Painting Companies': ['Painter', 'Painting contractor', 'House painter', 'Painting Companies'],
  'Smart Home': ['Smart home installation', 'Home automation', 'Technology installer'],
  'Epoxy Flooring': ['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy'],
  'Garage Door Services': ['Garage door installer', 'Garage door repair', 'Overhead door contractor'],
  'Cabinet Makers': ['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor'],
  'Tile & Stone': ['Tile contractor', 'Stone contractor', 'Tile installer'],
  'Paving & Asphalt': ['Paving contractor', 'Asphalt contractor', 'Driveway paving'],
  'Custom Home Builders': ['Custom home builder', 'Home builder', 'Residential builder', 'Construction company'],
  'Flooring Contractors': ['Flooring contractor', 'Floor installation', 'Carpet installer']
}

// Get all possible service types for a UI service name
export function getMappedServiceTypes(uiServiceName) {
  return serviceTypeMapping[uiServiceName] || [uiServiceName]
}

// Check if a database service type matches a UI service name
export function serviceTypeMatches(dbServiceType, uiServiceName) {
  const mappedTypes = getMappedServiceTypes(uiServiceName)
  return mappedTypes.some(type => 
    dbServiceType === type || 
    dbServiceType?.toLowerCase() === type.toLowerCase()
  )
}