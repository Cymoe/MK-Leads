import axios from 'axios'

const APIFY_API_BASE = 'https://api.apify.com/v2'

class ApifyService {
  constructor(token) {
    this.token = token || import.meta.env.VITE_APIFY_TOKEN
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

  // Transform Apify data to our lead format
  transformToLeads(apifyData, serviceType = 'unknown') {
    if (!Array.isArray(apifyData)) {
      apifyData = [apifyData]
    }

    return apifyData.map(item => ({
      // Google Maps specific fields
      name: item.title || item.name || '',
      address: item.address || '',
      city: item.city || this.extractCity(item.address),
      state: item.state || this.extractState(item.address),
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
      verified: item.verified || false,
      
      // Location data
      latitude: item.location?.lat || null,
      longitude: item.location?.lng || null
    }))
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
