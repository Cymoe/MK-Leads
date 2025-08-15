import { supabase } from '../lib/supabase'

// Google Trends API integration
// Note: Google doesn't have an official Trends API, so we'll use a proxy service
// or implement a scraping solution. For now, we'll simulate the data structure.

export class GoogleTrendsService {
  // Fetch search interest data for a service in a specific location
  static async getSearchInterest(serviceName, city, state) {
    try {
      // In production, this would call an actual API or scraping service
      // For now, we'll generate realistic mock data based on service type and location
      
      const baseInterest = this.calculateBaseInterest(serviceName, state)
      const seasonalFactor = this.getSeasonalFactor(serviceName)
      const growthTrend = this.getGrowthTrend(serviceName)
      
      // Generate last 12 months of data
      const monthlyData = []
      const currentMonth = new Date().getMonth()
      
      for (let i = 11; i >= 0; i--) {
        const month = new Date()
        month.setMonth(currentMonth - i)
        
        // Add some randomness to make it realistic
        const randomVariation = 0.8 + Math.random() * 0.4 // 80% to 120%
        const monthValue = Math.round(
          baseInterest * 
          seasonalFactor[month.getMonth()] * 
          randomVariation *
          (1 + growthTrend * (11 - i) / 12) // Apply growth over time
        )
        
        monthlyData.push({
          date: month.toISOString().slice(0, 7), // YYYY-MM format
          value: Math.min(100, Math.max(0, monthValue)) // Clamp between 0-100
        })
      }
      
      // Calculate current metrics
      const currentValue = monthlyData[monthlyData.length - 1].value
      const previousValue = monthlyData[monthlyData.length - 2].value
      const yearAgoValue = monthlyData[0].value
      
      return {
        service: serviceName,
        location: `${city}, ${state}`,
        currentInterest: currentValue,
        monthlyChange: ((currentValue - previousValue) / previousValue * 100).toFixed(1),
        yearlyChange: ((currentValue - yearAgoValue) / yearAgoValue * 100).toFixed(1),
        monthlyData,
        relatedQueries: this.getRelatedQueries(serviceName, state),
        risingQueries: this.getRisingQueries(serviceName)
      }
    } catch (error) {
      console.error('Error fetching Google Trends data:', error)
      return null
    }
  }
  
  // Calculate base interest level for a service
  static calculateBaseInterest(serviceName, state) {
    const serviceScores = {
      'Solar Installers': { base: 75, states: { CA: 90, TX: 85, AZ: 88, FL: 80 } },
      'EV Charging Installation': { base: 65, states: { CA: 95, WA: 85, OR: 80, CO: 75 } },
      'Pool Builders': { base: 60, states: { FL: 85, TX: 80, CA: 75, AZ: 82 } },
      'Kitchen Remodeling': { base: 70, states: {} },
      'Bathroom Remodeling': { base: 68, states: {} },
      'Smart Home Installation': { base: 55, states: { CA: 70, WA: 65, TX: 60 } },
      'Roofing Contractors': { base: 72, states: { FL: 85, TX: 80, OK: 78 } },
      'Tree Services': { base: 65, states: { GA: 75, SC: 73, NC: 72 } },
      'Landscaping Design': { base: 62, states: {} },
      'Fence Contractors': { base: 58, states: {} },
      'Painting Companies': { base: 66, states: {} },
      'Window & Door': { base: 64, states: {} },
      'Concrete Contractors': { base: 61, states: {} },
      'Deck Builders': { base: 52, states: { WA: 65, OR: 63, MN: 60 } },
      'HVAC Installation': { base: 78, states: { TX: 88, FL: 86, AZ: 90 } }
    }
    
    const serviceData = serviceScores[serviceName] || { base: 50, states: {} }
    return serviceData.states[state] || serviceData.base
  }
  
  // Get seasonal factors for different services
  static getSeasonalFactor(serviceName) {
    const patterns = {
      'Pool Builders': [0.3, 0.4, 0.8, 1.2, 1.4, 1.3, 1.2, 1.0, 0.8, 0.6, 0.4, 0.3], // Peak in spring/summer
      'Roofing Contractors': [0.7, 0.7, 0.9, 1.1, 1.2, 1.3, 1.3, 1.2, 1.1, 1.0, 0.8, 0.7], // Peak in summer
      'HVAC Installation': [0.9, 0.8, 0.9, 1.0, 1.3, 1.4, 1.5, 1.4, 1.1, 0.9, 0.8, 0.8], // Peak in hot months
      'Deck Builders': [0.4, 0.5, 0.8, 1.2, 1.4, 1.3, 1.2, 1.1, 0.9, 0.7, 0.5, 0.4], // Spring/summer
      'Tree Services': [0.8, 0.8, 1.0, 1.2, 1.1, 1.0, 0.9, 0.9, 1.2, 1.3, 1.1, 0.9], // Fall peak
      'Smart Home Installation': [1.0, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 1.1, 1.3, 1.4], // Holiday peak
      default: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] // No seasonal variation
    }
    
    return patterns[serviceName] || patterns.default
  }
  
  // Get growth trend for services
  static getGrowthTrend(serviceName) {
    const trends = {
      'EV Charging Installation': 0.35, // 35% YoY growth
      'Solar Installers': 0.22, // 22% YoY growth
      'Smart Home Installation': 0.18, // 18% YoY growth
      'Heat Pump Installation': 0.25, // 25% YoY growth
      'ADU Construction': 0.20, // 20% YoY growth
      'Battery Storage': 0.30, // 30% YoY growth
      default: 0.05 // 5% baseline growth
    }
    
    return trends[serviceName] || trends.default
  }
  
  // Get related search queries
  static getRelatedQueries(serviceName, state) {
    const queries = {
      'Solar Installers': [
        'solar panel cost',
        'solar incentives ' + state,
        'best solar companies',
        'solar panel installation near me',
        'solar tax credit 2024'
      ],
      'EV Charging Installation': [
        'home EV charger cost',
        'Tesla wall charger installation',
        'Level 2 charger installation',
        'EV charger electrician near me',
        'federal EV charger rebate'
      ],
      'Pool Builders': [
        'pool installation cost',
        'inground pool builders',
        'pool financing',
        'pool contractors near me',
        'best time to build pool'
      ],
      default: [
        serviceName + ' near me',
        serviceName + ' cost',
        'best ' + serviceName,
        serviceName + ' reviews',
        'affordable ' + serviceName
      ]
    }
    
    return queries[serviceName] || queries.default
  }
  
  // Get rising queries (trending up)
  static getRisingQueries(serviceName) {
    const risingQueries = {
      'Solar Installers': [
        { query: 'solar battery backup', rise: '+180%' },
        { query: 'solar panel financing', rise: '+120%' },
        { query: 'net metering ' + new Date().getFullYear(), rise: '+95%' }
      ],
      'EV Charging Installation': [
        { query: 'bidirectional EV charging', rise: '+250%' },
        { query: 'V2H charging', rise: '+200%' },
        { query: 'EV charger load management', rise: '+150%' }
      ],
      'Smart Home Installation': [
        { query: 'matter smart home', rise: '+300%' },
        { query: 'thread protocol devices', rise: '+180%' },
        { query: 'AI home automation', rise: '+140%' }
      ],
      default: [
        { query: serviceName + ' AI tools', rise: '+85%' },
        { query: serviceName + ' automation', rise: '+65%' },
        { query: serviceName + ' 2024 trends', rise: '+45%' }
      ]
    }
    
    return risingQueries[serviceName] || risingQueries.default
  }
  
  // Store trends data in database
  static async storeTrendsData(marketId, trendsData) {
    try {
      // Store each service's trends data
      const updates = []
      
      for (const data of trendsData) {
        // Get service type ID
        const { data: serviceType } = await supabase
          .from('service_types_master')
          .select('id')
          .eq('name', data.service)
          .single()
        
        if (serviceType) {
          updates.push({
            market_id: marketId,
            service_type_id: serviceType.id,
            google_trends_score: data.currentInterest,
            trends_monthly_change: parseFloat(data.monthlyChange),
            trends_yearly_change: parseFloat(data.yearlyChange),
            search_volume: data.estimatedMonthlySearches || 0,
            trends_data: {
              monthlyData: data.monthlyData,
              relatedQueries: data.relatedQueries,
              risingQueries: data.risingQueries,
              estimatedMonthlySearches: data.estimatedMonthlySearches || 0,
              lastUpdated: new Date().toISOString()
            }
          })
        }
      }
      
      // Update service demand metrics with trends data
      if (updates.length > 0) {
        const { error } = await supabase
          .from('service_demand_metrics')
          .upsert(updates, {
            onConflict: 'market_id,service_type_id,time_period',
            ignoreDuplicates: false
          })
        
        if (error) throw error
      }
      
      return { success: true, updated: updates.length }
    } catch (error) {
      console.error('Error storing trends data:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Estimate monthly search volume based on trends score and location
  static estimateMonthlySearches(serviceName, city, state, trendsScore = 50) {
    // Note: city parameter is included for future city-specific adjustments
    // Base search volumes for major services (US average monthly searches)
    const baseSearchVolumes = {
      'Roofing Contractors': 90500,
      'HVAC Installation': 74000,
      'Kitchen Remodeling': 60500,
      'Plumbing Services': 49500,
      'Electrical Services': 40500,
      'Bathroom Remodeling': 33100,
      'Window & Door': 27100,
      'Painting Companies': 22200,
      'Landscaping Design': 18100,
      'Solar Installers': 14800,
      'Flooring Contractors': 12100,
      'Fence Contractors': 9900,
      'Tree Services': 8100,
      'Concrete Contractors': 6600,
      'Pool Builders': 5400,
      'Deck Builders': 4400,
      'Garage Door Services': 3600,
      'Smart Home Installation': 2900,
      'Cabinet Makers': 2400,
      'EV Charging Installation': 1900,
      'Artificial Turf Installation': 1000,
      'Water Features Installation': 720,
      'Custom Lighting Design': 590
    }
    
    // State population multipliers (relative to US average)
    const stateMultipliers = {
      CA: 1.2, TX: 0.9, FL: 0.7, NY: 0.6, PA: 0.4, IL: 0.4, OH: 0.35,
      GA: 0.3, NC: 0.3, MI: 0.3, NJ: 0.3, VA: 0.25, WA: 0.25, AZ: 0.22,
      MA: 0.2, TN: 0.2, IN: 0.2, MO: 0.2, MD: 0.18, WI: 0.18, CO: 0.17,
      MN: 0.17, SC: 0.15, AL: 0.15, LA: 0.14, KY: 0.13, OR: 0.13, OK: 0.12,
      CT: 0.11, UT: 0.1, NV: 0.09, AR: 0.09, MS: 0.09, KS: 0.09, IA: 0.09,
      NM: 0.06, NE: 0.06, WV: 0.05, ID: 0.05, HI: 0.04, NH: 0.04, ME: 0.04,
      MT: 0.03, RI: 0.03, DE: 0.03, SD: 0.025, ND: 0.023, AK: 0.022,
      VT: 0.019, WY: 0.017
    }
    
    // Get base volume and state multiplier
    const baseVolume = baseSearchVolumes[serviceName] || 1000
    const stateMultiplier = stateMultipliers[state] || 0.1
    
    // Adjust by trends score (0-100 scale, with 50 being average)
    const trendsMultiplier = trendsScore / 50
    
    // Calculate estimated searches
    const estimatedSearches = Math.round(baseVolume * stateMultiplier * trendsMultiplier)
    
    return estimatedSearches
  }

  // Fetch trends for all services in a market
  static async fetchMarketTrends(marketId, city, state) {
    try {
      // Get all active service types
      const { data: services } = await supabase
        .from('service_types_master')
        .select('name')
        .eq('is_active', true)
      
      if (!services) return []
      
      // Fetch trends for each service
      const trendsData = []
      for (const service of services) {
        const trends = await this.getSearchInterest(service.name, city, state)
        if (trends) {
          // Add estimated monthly searches
          trends.estimatedMonthlySearches = this.estimateMonthlySearches(
            service.name,
            city,
            state,
            trends.currentInterest
          )
          trendsData.push(trends)
        }
      }
      
      // Store in database
      await this.storeTrendsData(marketId, trendsData)
      
      return trendsData
    } catch (error) {
      console.error('Error fetching market trends:', error)
      return []
    }
  }
}