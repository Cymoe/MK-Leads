import axios from 'axios'

const APIFY_API_BASE = 'https://api.apify.com/v2'

class ApifyService {
  constructor(token) {
    this.token = token || import.meta.env.VITE_APIFY_API_TOKEN
    this.headers = {
      'Content-Type': 'application/json'
    }
    if (this.token) {
      this.headers['Authorization'] = `Bearer ${this.token}`
    }
  }

  // Get list of actor runs
  async getActorRuns(actorId, options = {}) {
    try {
      const response = await axios.get(
        `${APIFY_API_BASE}/acts/${actorId}/runs`,
        {
          headers: this.headers,
          params: {
            limit: options.limit || 100,
            offset: options.offset || 0,
            status: options.status || 'SUCCEEDED'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching actor runs:', error)
      throw error
    }
  }

  // Get dataset items from a specific run
  async getDatasetItems(datasetId, options = {}) {
    try {
      console.log('Fetching dataset items:', {
        datasetId,
        url: `${APIFY_API_BASE}/datasets/${datasetId}/items`,
        options
      })
      
      const response = await axios.get(
        `${APIFY_API_BASE}/datasets/${datasetId}/items`,
        {
          headers: this.headers,
          params: {
            format: options.format || 'json',
            limit: options.limit || 1000,
            offset: options.offset || 0
          }
        }
      )
      
      console.log('Dataset items response:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: Array.isArray(response.data) ? response.data.length : 'not array',
        sample: response.data && response.data[0] ? Object.keys(response.data[0]) : 'no data'
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching dataset items:', error)
      throw error
    }
  }

  // Get all actor runs (for listing in import modal)
  async getAllRuns(options = {}) {
    try {
      const response = await axios.get(
        `${APIFY_API_BASE}/actor-runs`,
        {
          headers: this.headers,
          params: {
            limit: options.limit || 50,
            offset: options.offset || 0,
            status: options.status || 'SUCCEEDED'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching all runs:', error)
      throw error
    }
  }

  // Get details of a specific run
  async getRunDetails(runId) {
    try {
      const response = await axios.get(
        `${APIFY_API_BASE}/actor-runs/${runId}`,
        {
          headers: this.headers
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching run details:', error)
      throw error
    }
  }

  // Start a new actor run
  async startActor(actorId, input = {}) {
    try {
      const response = await axios.post(
        `${APIFY_API_BASE}/acts/${actorId}/runs`,
        input,
        {
          headers: this.headers
        }
      )
      return response.data
    } catch (error) {
      console.error('Error starting actor:', error)
      throw error
    }
  }

  // Start Google Maps search for a specific service and location
  async startGoogleMapsSearch(serviceName, city, state, options = {}) {
    const defaultOptions = {
      maxResults: 200,
      searchRadius: 50000, // 50km in meters
      language: 'en',
      includeWebResults: false
    }
    
    const config = { ...defaultOptions, ...options }
    
    // Build search queries (multiple per service) based on service and location
    const searchQueries = this.buildSearchQuery(serviceName, city, state)
    
    const actorInput = {
      searchStringsArray: searchQueries, // Now passing array of queries
      maxCrawledPlacesPerSearch: config.maxResults,
      searchRadius: config.searchRadius,
      language: config.language,
      exportPlaceUrls: true,
      saveHtml: false,
      saveScreenshots: false,
      includeWebResults: config.includeWebResults
    }
    
    // Use the official Google Maps Scraper actor
    return this.startActor('nwua9Gu5YrADL7ZDj', actorInput)
  }

  // Build optimized search query for Google Maps
  buildSearchQuery(serviceName, city, state) {
    // Service-specific search queries optimized for Google Maps
    // Multiple queries per service for comprehensive coverage
    const searchQueries = {
      'Deck Builders': [
        'deck contractors',        // Broadest category
        'deck builder',            // Common business name
        'deck construction',       // Service-specific
        'patio deck',             // Combined services
        'deck company'            // Business identifier
      ],
      'Concrete Contractors': [
        'concrete contractors',    // Broadest category
        'concrete',               // Catches all concrete businesses
        'concrete driveway',      // Specific high-volume service
        'concrete patio',         // Another specific service
        'ready mix concrete'      // Commercial suppliers
      ],
      'Window & Door': [
        'window installation',
        'door installation',
        'window replacement',
        'door replacement',
        'window and door contractor'
      ],
      'Roofing Contractors': [
        'roofing contractor',
        'roofer',
        'roof repair',
        'roofing company',
        'roof replacement'
      ],
      'Tree Services': [
        'tree service',
        'tree removal',
        'tree trimming',
        'arborist',
        'tree care'
      ],
      'Solar Installers': [
        'solar panel installation',
        'solar installer',
        'solar energy contractor',
        'solar company',
        'photovoltaic installer'
      ],
      'Fence Contractors': [
        'fence contractor',
        'fence installation',
        'fence company',
        'fence builder',
        'fencing services'
      ],
      'Pool Builders': [
        'pool contractors',       // Broadest category
        'swimming pool',          // Catches all pool businesses
        'pool builder',           // Common business type
        'pool service',           // Includes maintenance companies
        'pool company'            // Generic business identifier
      ],
      'Turf Installers': [
        'artificial turf installation',
        'synthetic grass installer',
        'artificial grass',
        'turf installation',
        'synthetic turf company'
      ],
      'Kitchen Remodeling': [
        'kitchen remodeling',
        'kitchen renovation',
        'kitchen remodeler',
        'kitchen contractor',
        'kitchen design'
      ],
      'Bathroom Remodeling': [
        'bathroom remodeling',
        'bathroom renovation',
        'bathroom remodeler',
        'bathroom contractor',
        'bath remodel'
      ],
      'Whole Home Remodel': [
        'home remodeling',
        'general contractor',
        'home renovation',
        'remodeling contractor',
        'construction company'
      ],
      'Painting Companies': [
        'painting contractors',    // Broadest category
        'painters',               // Most common search
        'painting',               // Catches all painting businesses
        'commercial painting',    // B2B specialists
        'residential painting'    // B2C specialists
      ],
      'Landscaping Design': [
        'landscaping',            // Broadest search
        'landscaper',             // Most common business name
        'landscape contractors',  // Professional category
        'lawn care',              // Related service
        'landscape company'       // Business identifier
      ],
      'Hardscape Contractors': [
        'hardscape contractor',
        'patio builder',
        'hardscaping',
        'paver installation',
        'retaining wall contractor'
      ],
      'Custom Home Builders': [
        'custom home builder',
        'home builder',
        'custom home construction',
        'residential builder',
        'luxury home builder'
      ],
      // Add more mappings as needed
    }
    
    const queries = searchQueries[serviceName] || [serviceName.toLowerCase()]
    // Return array of search queries for this service
    // Use "in" instead of "near" for more precise city-specific results
    return queries.map(q => `${q} in ${city}, ${state}`)
  }

  // Monitor run status with callback for progress updates
  async monitorRunStatus(runId, options = {}) {
    const {
      pollInterval = 5000,
      maxAttempts = 120,
      onProgress = null,
      onComplete = null,
      onError = null
    } = options
    
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const runDetails = await this.getRunDetails(runId)
        const status = runDetails.data.status
        const stats = runDetails.data.stats
        
        // Call progress callback if provided
        if (onProgress) {
          onProgress({
            status: status.toLowerCase(),
            itemCount: stats?.itemCount || 0,
            datasetId: runDetails.data.defaultDatasetId
          })
        }
        
        if (status === 'SUCCEEDED') {
          if (onComplete) {
            onComplete(runDetails.data)
          }
          return runDetails.data
        } else if (status === 'FAILED' || status === 'ABORTED') {
          const error = new Error(`Run ${status.toLowerCase()}`)
          if (onError) {
            onError(error)
          }
          throw error
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        attempts++
        
      } catch (error) {
        if (onError) {
          onError(error)
        }
        throw error
      }
    }
    
    const timeoutError = new Error('Run monitoring timed out')
    if (onError) {
      onError(timeoutError)
    }
    throw timeoutError
  }

  // Transform Apify data to our lead format
  transformToLeads(apifyData, serviceType = 'unknown') {
    console.log('transformToLeads input:', {
      isArray: Array.isArray(apifyData),
      length: Array.isArray(apifyData) ? apifyData.length : 'not array',
      sample: apifyData && apifyData[0] ? Object.keys(apifyData[0]) : 'no data'
    })
    
    if (!Array.isArray(apifyData)) {
      apifyData = [apifyData]
    }

    const transformed = apifyData.map(item => ({
      // Google Maps specific fields
      name: item.title || item.name || '',
      address: item.address || '',
      city: item.city || this.extractCity(item.address),
      state: this.normalizeState(item.state) || this.extractState(item.address),
      zip: item.postalCode || '',
      phone: item.phone || '',
      website: item.website || '',
      rating: item.rating || null,
      reviews: item.reviewsCount || 0,
      
      // Business details
      category: item.category || item.categoryName || serviceType,
      services: item.services || [],
      hours: item.openingHours || {},
      
      // Social/Online presence
      facebook: item.facebookUrl || '',
      instagram: item.instagramUrl || '',
      
      // Metadata
      source: 'apify',
      sourceId: item.placeId || item.id || '',
      collectedAt: new Date().toISOString(),
      
      // Additional Google Maps data
      googleMapsUrl: item.url || '',
      imageUrl: item.imageUrl || '',
      verified: item.verified || false
    }))
    
    console.log('transformToLeads output:', {
      count: transformed.length,
      sample: transformed[0]
    })
    
    return transformed
  }

  // Helper function to extract city from address
  extractCity(address) {
    if (!address) return ''
    // Simple extraction - can be improved with proper parsing
    const parts = address.split(',')
    return parts.length >= 2 ? parts[parts.length - 2].trim() : ''
  }

  // Helper function to extract state from address
  extractState(address) {
    if (!address) return ''
    // Extract state abbreviation (assumes US format)
    const stateMatch = address.match(/\b([A-Z]{2})\b\s*\d{5}/)
    return stateMatch ? stateMatch[1] : ''
  }

  // Helper function to normalize state names to abbreviations
  normalizeState(stateName) {
    if (!stateName) return ''
    
    // If it's already a 2-letter abbreviation, return it
    if (/^[A-Z]{2}$/.test(stateName)) {
      return stateName
    }
    
    // Map of state names to abbreviations
    const stateMap = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY'
    }
    
    // Try to match with proper case
    const properCase = stateName.charAt(0).toUpperCase() + stateName.slice(1).toLowerCase()
    return stateMap[properCase] || stateName
  }

  // Batch import leads from multiple datasets
  async batchImportLeads(datasetIds, serviceType) {
    const allLeads = []
    
    for (const datasetId of datasetIds) {
      try {
        const data = await this.getDatasetItems(datasetId)
        const leads = this.transformToLeads(data, serviceType)
        allLeads.push(...leads)
      } catch (error) {
        console.error(`Error importing dataset ${datasetId}:`, error)
      }
    }
    
    return allLeads
  }
}

export default ApifyService
