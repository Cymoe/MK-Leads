import { supabase } from '../lib/supabase'

export class CompetitorAnalysisService {
  // Analyze competition for a specific service in a market
  static async analyzeServiceCompetition(marketId, serviceTypeId, city, state) {
    try {
      // Get market population for per-capita calculations
      const { data: market } = await supabase
        .from('market_coverage')
        .select('population')
        .eq('id', marketId)
        .single()
      
      const population = market?.population || 100000
      
      // In production, this would scrape Google Maps, Yelp, etc.
      // For now, we'll generate realistic mock data
      const competitorData = this.generateCompetitorData(serviceTypeId, city, state, population)
      
      // Store in database
      const { error } = await supabase
        .from('competitor_analysis')
        .upsert({
          market_id: marketId,
          service_type_id: serviceTypeId,
          ...competitorData,
          analyzed_at: new Date().toISOString()
        }, {
          onConflict: 'market_id,service_type_id'
        })
      
      if (error) throw error
      
      return competitorData
    } catch (error) {
      console.error('Error analyzing competition:', error)
      return null
    }
  }
  
  // Generate realistic competitor data based on service type and market
  static generateCompetitorData(serviceTypeId, city, state, population) {
    // Base provider counts by service type (per 100k population)
    const providerDensity = {
      'Painting Companies': 25,
      'Landscaping Design': 20,
      'Roofing Contractors': 18,
      'Kitchen Remodeling': 15,
      'Bathroom Remodeling': 14,
      'Plumbing Services': 22,
      'Electrical Services': 20,
      'HVAC Installation': 16,
      'Pool Builders': 8,
      'Solar Installers': 6,
      'EV Charging Installation': 3,
      'Smart Home Installation': 4,
      'Fence Contractors': 12,
      'Concrete Contractors': 14,
      'Tree Services': 10,
      'Window & Door': 11,
      'Deck Builders': 9,
      'Custom Home Builders': 7,
      default: 10
    }
    
    // Adjust for market size and location
    const marketMultiplier = this.getMarketMultiplier(city, state)
    const baseProviders = providerDensity.default * (population / 100000)
    const totalProviders = Math.round(baseProviders * marketMultiplier * (0.8 + Math.random() * 0.4))
    
    // Calculate saturation level
    const providersPerCapita = totalProviders / (population / 100000)
    let saturationLevel = 'low'
    if (providersPerCapita > 25) saturationLevel = 'very_high'
    else if (providersPerCapita > 18) saturationLevel = 'high'
    else if (providersPerCapita > 12) saturationLevel = 'medium'
    
    // Generate top competitors
    const topCompetitors = this.generateTopCompetitors(totalProviders)
    
    // Price ranges by service type
    const priceRanges = this.getPriceRanges(serviceTypeId, state)
    
    return {
      total_providers: totalProviders,
      average_rating: 4.0 + Math.random() * 0.7, // 4.0 to 4.7
      price_range_min: priceRanges.min,
      price_range_max: priceRanges.max,
      providers_per_100k_population: Math.round(providersPerCapita),
      saturation_level: saturationLevel,
      top_competitors: topCompetitors
    }
  }
  
  // Get market multiplier based on city characteristics
  static getMarketMultiplier(city, state) {
    // Major markets have more competition
    const majorMarkets = {
      'Austin, TX': 1.4,
      'Dallas, TX': 1.5,
      'Houston, TX': 1.5,
      'San Antonio, TX': 1.3,
      'Phoenix, AZ': 1.4,
      'Los Angeles, CA': 1.6,
      'San Francisco, CA': 1.5,
      'San Diego, CA': 1.4,
      'Denver, CO': 1.3,
      'Miami, FL': 1.4,
      'Tampa, FL': 1.3,
      'Orlando, FL': 1.3,
      'Atlanta, GA': 1.4,
      'Chicago, IL': 1.5,
      'Boston, MA': 1.4,
      'New York, NY': 1.7,
      'Philadelphia, PA': 1.4,
      'Seattle, WA': 1.4,
      'Portland, OR': 1.3
    }
    
    const cityKey = `${city}, ${state}`
    return majorMarkets[cityKey] || 1.0
  }
  
  // Generate realistic top competitors
  static generateTopCompetitors(totalProviders) {
    const competitors = []
    const topCount = Math.min(5, Math.ceil(totalProviders * 0.1)) // Top 10% or 5, whichever is less
    
    const companyPrefixes = ['Premier', 'Pro', 'Elite', 'Quality', 'Expert', 'Master', 'Superior', 'Reliable', 'Trusted', 'Local']
    const companySuffixes = ['Services', 'Solutions', 'Contractors', 'Professionals', 'Experts', 'Group', 'Company', 'Team']
    
    for (let i = 0; i < topCount; i++) {
      const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]
      const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)]
      
      competitors.push({
        name: `${prefix} ${suffix}`,
        rating: 4.5 + Math.random() * 0.5, // 4.5 to 5.0 for top competitors
        reviews: Math.floor(100 + Math.random() * 400), // 100-500 reviews
        specialties: this.getRandomSpecialties(),
        established_year: 2000 + Math.floor(Math.random() * 20),
        response_time: Math.random() > 0.7 ? 'Within 1 hour' : 'Within 24 hours'
      })
    }
    
    return competitors.sort((a, b) => b.rating - a.rating)
  }
  
  // Get random specialties
  static getRandomSpecialties() {
    const allSpecialties = [
      'Emergency Services',
      'Commercial Projects',
      'Residential',
      'Green Building',
      'Historic Restoration',
      'New Construction',
      'Renovations',
      'Maintenance',
      'Design Services',
      'Warranty Work'
    ]
    
    const count = 2 + Math.floor(Math.random() * 3) // 2-4 specialties
    const specialties = []
    
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * allSpecialties.length)
      if (!specialties.includes(allSpecialties[index])) {
        specialties.push(allSpecialties[index])
      }
    }
    
    return specialties
  }
  
  // Get price ranges by service and location
  static getPriceRanges(serviceTypeId, state) {
    // Base prices (national average)
    const basePrices = {
      'Kitchen Remodeling': { min: 15000, max: 75000 },
      'Bathroom Remodeling': { min: 8000, max: 35000 },
      'Roofing Contractors': { min: 5000, max: 25000 },
      'Solar Installers': { min: 15000, max: 40000 },
      'Pool Builders': { min: 35000, max: 100000 },
      'HVAC Installation': { min: 4000, max: 12000 },
      'Window & Door': { min: 3000, max: 15000 },
      'Painting Companies': { min: 2000, max: 8000 },
      'Fence Contractors': { min: 2500, max: 10000 },
      'Deck Builders': { min: 4000, max: 20000 },
      'Landscaping Design': { min: 3000, max: 15000 },
      'EV Charging Installation': { min: 1500, max: 5000 },
      'Smart Home Installation': { min: 2000, max: 10000 },
      default: { min: 2000, max: 10000 }
    }
    
    // State cost multipliers
    const stateMultipliers = {
      CA: 1.3, NY: 1.25, MA: 1.2, CT: 1.2, NJ: 1.2,
      WA: 1.15, OR: 1.1, CO: 1.1, IL: 1.1, MD: 1.15,
      TX: 0.95, FL: 0.95, GA: 0.9, NC: 0.9, TN: 0.85,
      AZ: 0.95, NV: 1.0, UT: 0.95, NM: 0.9,
      OH: 0.9, MI: 0.9, IN: 0.85, WI: 0.9,
      default: 1.0
    }
    
    const prices = basePrices.default
    const multiplier = stateMultipliers[state] || stateMultipliers.default
    
    return {
      min: Math.round(prices.min * multiplier),
      max: Math.round(prices.max * multiplier)
    }
  }
  
  // Analyze all services for a market
  static async analyzeMarketCompetition(marketId, city, state) {
    try {
      // Get all active service types
      const { data: services } = await supabase
        .from('service_types_master')
        .select('id')
        .eq('is_active', true)
      
      if (!services) return []
      
      // Analyze each service
      const analyses = []
      for (const service of services) {
        const analysis = await this.analyzeServiceCompetition(marketId, service.id, city, state)
        if (analysis) {
          analyses.push(analysis)
        }
      }
      
      return analyses
    } catch (error) {
      console.error('Error analyzing market competition:', error)
      return []
    }
  }
}