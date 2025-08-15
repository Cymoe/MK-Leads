import { supabase } from '../lib/supabase'

export class EconomicDataService {
  // Fetch economic indicators for a market
  static async fetchMarketEconomics(marketId, city, state) {
    try {
      // In production, this would call APIs like:
      // - Zillow API for housing data
      // - Census API for demographics
      // - BLS API for employment data
      // - NOAA API for climate data
      
      const economicData = this.generateEconomicData(city, state)
      
      // Store in database
      const { error } = await supabase
        .from('market_economic_data')
        .upsert({
          market_id: marketId,
          ...economicData,
          data_year: new Date().getFullYear(),
          data_source: 'Simulated Data',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'market_id,data_year'
        })
      
      if (error) throw error
      
      return economicData
    } catch (error) {
      console.error('Error fetching economic data:', error)
      return null
    }
  }
  
  // Generate realistic economic data based on location
  static generateEconomicData(city, state) {
    // Base economic profiles by state
    const stateProfiles = {
      CA: {
        medianHomeValue: 750000,
        medianIncome: 85000,
        homeownership: 55,
        unemployment: 4.2,
        populationGrowth: 0.5
      },
      TX: {
        medianHomeValue: 350000,
        medianIncome: 65000,
        homeownership: 62,
        unemployment: 3.8,
        populationGrowth: 1.8
      },
      FL: {
        medianHomeValue: 400000,
        medianIncome: 60000,
        homeownership: 66,
        unemployment: 3.5,
        populationGrowth: 1.5
      },
      NY: {
        medianHomeValue: 650000,
        medianIncome: 75000,
        homeownership: 53,
        unemployment: 4.0,
        populationGrowth: -0.2
      },
      CO: {
        medianHomeValue: 550000,
        medianIncome: 78000,
        homeownership: 65,
        unemployment: 3.6,
        populationGrowth: 1.2
      },
      AZ: {
        medianHomeValue: 425000,
        medianIncome: 62000,
        homeownership: 64,
        unemployment: 3.9,
        populationGrowth: 1.6
      },
      WA: {
        medianHomeValue: 600000,
        medianIncome: 82000,
        homeownership: 63,
        unemployment: 3.7,
        populationGrowth: 1.1
      },
      GA: {
        medianHomeValue: 320000,
        medianIncome: 61000,
        homeownership: 64,
        unemployment: 3.4,
        populationGrowth: 1.3
      },
      default: {
        medianHomeValue: 350000,
        medianIncome: 58000,
        homeownership: 64,
        unemployment: 4.0,
        populationGrowth: 0.5
      }
    }
    
    const profile = stateProfiles[state] || stateProfiles.default
    
    // Add city-specific adjustments
    const cityMultiplier = this.getCityMultiplier(city)
    
    // Climate data by state
    const climateData = this.getClimateData(state)
    
    // Calculate final values with some randomization
    const data = {
      median_home_value: Math.round(profile.medianHomeValue * cityMultiplier * (0.9 + Math.random() * 0.2)),
      home_value_change_yoy: -5 + Math.random() * 15, // -5% to +10% range
      new_construction_permits: Math.floor(100 + Math.random() * 500),
      renovation_permits: Math.floor(200 + Math.random() * 800),
      median_household_income: Math.round(profile.medianIncome * cityMultiplier * (0.9 + Math.random() * 0.2)),
      population_growth_rate: profile.populationGrowth + (Math.random() * 0.5 - 0.25),
      homeownership_rate: profile.homeownership + (Math.random() * 10 - 5),
      unemployment_rate: Math.max(2, profile.unemployment + (Math.random() * 2 - 1)),
      business_growth_rate: 1 + Math.random() * 3,
      ...climateData
    }
    
    return data
  }
  
  // Get city-specific economic multiplier
  static getCityMultiplier(city) {
    const cityMultipliers = {
      'San Francisco': 1.8,
      'Los Angeles': 1.4,
      'San Diego': 1.3,
      'Austin': 1.3,
      'Dallas': 1.2,
      'Houston': 1.1,
      'Miami': 1.3,
      'Seattle': 1.5,
      'Boston': 1.6,
      'Denver': 1.3,
      'Phoenix': 1.1,
      'Atlanta': 1.2,
      'Chicago': 1.3,
      'New York': 1.9,
      'Portland': 1.2,
      default: 1.0
    }
    
    return cityMultipliers[city] || cityMultipliers.default
  }
  
  // Get climate data by state
  static getClimateData(state) {
    const climateProfiles = {
      // Hot states
      TX: { summerTemp: 95, winterTemp: 55, rainfall: 35, severeWeatherDays: 45 },
      AZ: { summerTemp: 105, winterTemp: 65, rainfall: 12, severeWeatherDays: 20 },
      FL: { summerTemp: 90, winterTemp: 70, rainfall: 54, severeWeatherDays: 60 },
      NV: { summerTemp: 100, winterTemp: 50, rainfall: 7, severeWeatherDays: 10 },
      
      // Cold states
      MN: { summerTemp: 80, winterTemp: 20, rainfall: 32, severeWeatherDays: 35 },
      WI: { summerTemp: 78, winterTemp: 25, rainfall: 34, severeWeatherDays: 30 },
      MI: { summerTemp: 78, winterTemp: 28, rainfall: 33, severeWeatherDays: 28 },
      ND: { summerTemp: 82, winterTemp: 15, rainfall: 17, severeWeatherDays: 40 },
      
      // Moderate states
      CA: { summerTemp: 75, winterTemp: 55, rainfall: 20, severeWeatherDays: 10 },
      WA: { summerTemp: 75, winterTemp: 45, rainfall: 38, severeWeatherDays: 15 },
      OR: { summerTemp: 78, winterTemp: 45, rainfall: 43, severeWeatherDays: 12 },
      CO: { summerTemp: 85, winterTemp: 35, rainfall: 16, severeWeatherDays: 50 },
      
      // Default moderate
      default: { summerTemp: 82, winterTemp: 45, rainfall: 40, severeWeatherDays: 25 }
    }
    
    const climate = climateProfiles[state] || climateProfiles.default
    
    return {
      avg_summer_temp: climate.summerTemp + (Math.random() * 6 - 3),
      avg_winter_temp: climate.winterTemp + (Math.random() * 6 - 3),
      annual_rainfall: climate.rainfall + (Math.random() * 10 - 5),
      severe_weather_days: climate.severeWeatherDays + Math.floor(Math.random() * 10 - 5)
    }
  }
  
  // Calculate service demand impact based on economic indicators
  static calculateEconomicImpact(economicData, serviceType) {
    let impactScore = 50 // Base score
    
    // Home value impact
    if (economicData.median_home_value > 500000) {
      impactScore += 10 // Higher home values = more investment in services
    }
    
    // Income impact
    if (economicData.median_household_income > 75000) {
      impactScore += 15 // Higher income = more discretionary spending
    }
    
    // Growth impact
    if (economicData.population_growth_rate > 1.0) {
      impactScore += 10 // Growing areas need more services
    }
    
    // Construction activity
    if (economicData.new_construction_permits > 300) {
      impactScore += 5 // New construction drives demand
    }
    
    // Service-specific adjustments
    const serviceAdjustments = {
      'Solar Installers': {
        factors: [
          { condition: economicData.avg_summer_temp > 85, impact: 10 },
          { condition: economicData.median_home_value > 400000, impact: 5 }
        ]
      },
      'Pool Builders': {
        factors: [
          { condition: economicData.avg_summer_temp > 85, impact: 15 },
          { condition: economicData.median_household_income > 80000, impact: 10 }
        ]
      },
      'HVAC Installation': {
        factors: [
          { condition: economicData.avg_summer_temp > 90 || economicData.avg_winter_temp < 30, impact: 20 },
          { condition: economicData.severe_weather_days > 40, impact: 10 }
        ]
      },
      'Roofing Contractors': {
        factors: [
          { condition: economicData.severe_weather_days > 50, impact: 15 },
          { condition: economicData.home_value_change_yoy > 5, impact: 5 }
        ]
      }
    }
    
    // Apply service-specific adjustments
    const adjustments = serviceAdjustments[serviceType]
    if (adjustments) {
      adjustments.factors.forEach(factor => {
        if (factor.condition) {
          impactScore += factor.impact
        }
      })
    }
    
    return Math.min(100, impactScore) // Cap at 100
  }
}