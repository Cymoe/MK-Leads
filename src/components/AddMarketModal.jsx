import { useState, useEffect } from 'react'
import { X, MapPin, Users, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CityAutocomplete from './CityAutocomplete'
import './AddMarketModal.css'

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
]

function AddMarketModal({ isOpen, onClose, onSuccess, getRegionForState }) {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    marketType: 'MEDIUM', // Default classification
    canonicalCityId: null,
    population: null,
    metroPopulation: null
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isCustomCity, setIsCustomCity] = useState(false)

  const handleCitySelect = (city) => {
    if (city.isCustom) {
      // Custom city entry - use default classification
      setIsCustomCity(true)
      setFormData({
        ...formData,
        city: city.city_name,
        canonicalCityId: null,
        population: null,
        metroPopulation: null,
        marketType: 'MEDIUM' // Default for unknown cities
      })
    } else {
      // Selected from canonical cities - use actual population data
      setIsCustomCity(false)
      const population = city.population || 0
      let marketType = 'SMALL'
      if (population > 1000000) {
        marketType = 'MEGA'
      } else if (population > 500000) {
        marketType = 'LARGE'
      } else if (population > 100000) {
        marketType = 'MEDIUM'
      }
      
      setFormData({
        ...formData,
        city: city.city_name,
        canonicalCityId: city.id,
        population: city.population,
        metroPopulation: city.metro_population,
        marketType: marketType
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    // Validate required fields
    if (!formData.city || !formData.state) {
      setError('City and state are required')
      setSaving(false)
      return
    }

    try {
      // Generate market_id first to check for duplicates
      const marketId = `city-${formData.city.toLowerCase().replace(/\s+/g, '-')}-${formData.state}`
      const marketName = `${formData.city}, ${formData.state}`

      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('You must be logged in to create a market')
        setSaving(false)
        return
      }

      // Check if market already exists for this user
      const { data: existingMarket } = await supabase
        .from('market_coverage')
        .select('id')
        .eq('user_id', user.id)
        .eq('market_id', marketId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results

      if (existingMarket) {
        setError('You have already added this market.')
        setSaving(false)
        return
      }

      // If this is a new city (not from canonical), add it
      let canonicalCityId = formData.canonicalCityId
      
      if (!canonicalCityId && formData.city) {
        const { data: newCity, error: cityError } = await supabase
          .from('canonical_cities')
          .insert({
            city_name: formData.city,
            state: formData.state,
            population: formData.population ? parseInt(formData.population) : null,
            metro_population: formData.metroPopulation ? parseInt(formData.metroPopulation) : null
          })
          .select()
          .single()

        if (cityError) {
          // City might already exist, try to find it
          const { data: existingCity } = await supabase
            .from('canonical_cities')
            .select('id')
            .eq('city_name', formData.city)
            .eq('state', formData.state)
            .single()

          if (existingCity) {
            canonicalCityId = existingCity.id
          } else {
            throw cityError
          }
        } else {
          canonicalCityId = newCity.id
        }
      }
      // Determine market type - must be 'city', 'metro', or 'state'
      // For now, we'll default to 'city' since we're adding individual cities
      const marketType = 'city'


      // Get region for the state
      const region = getRegionForState(formData.state)

      // Create market in market_coverage table (markets is a view based on this table)
      // Note: marketId and marketType were already generated above
      const { data: market, error: marketError } = await supabase
        .from('market_coverage')
        .insert({
          user_id: user.id,
          market_id: marketId,
          market_name: marketName,
          market_type: marketType,
          canonical_city_id: canonicalCityId,
          population: formData.population ? parseInt(formData.population) : null,
          metro_population: formData.metroPopulation ? parseInt(formData.metroPopulation) : null,
          coverage_percentage: 0,
          phase_1_lead_count: 0,
          phase_2_lead_count: 0,
          phase_3_lead_count: 0,
          actual_service_types: []
        })
        .select()
        .single()

      if (marketError) throw marketError

      // Get all service types
      const { data: serviceTypes, error: serviceTypesError } = await supabase
        .from('service_types_master')
        .select('*')
        .eq('is_active', true)

      if (serviceTypesError) throw serviceTypesError

      // Create market-service associations based on region
      const regionalPriorities = getRegionalPriorities(region)
      const associations = serviceTypes.map(serviceType => {
        // Determine priority based on regional data
        let priority = 'low'
        if (regionalPriorities.high.includes(serviceType.name)) {
          priority = 'high'
        } else if (regionalPriorities.medium.includes(serviceType.name)) {
          priority = 'medium'
        }

        // Check if this is a regional-only service
        const isAvailable = !isRegionalOnlyService(serviceType.name, formData.state)

        return {
          market_id: market.id,
          service_type_id: serviceType.id,
          priority: priority,
          is_available: isAvailable
        }
      })

      // Insert all associations
      const { error: assocError } = await supabase
        .from('market_service_associations')
        .insert(associations)

      if (assocError) throw assocError

      // Use the market type we already calculated
      const displayType = formData.marketType

      // Success - call onSuccess with the new market data
      onSuccess({
        id: market.id,
        name: formData.city,
        state: formData.state,
        type: displayType,
        population: formData.population,
        metro_population: formData.metroPopulation,
        leads: 0,
        coverage: 0
      })
      handleClose()
    } catch (err) {
      console.error('Error creating market:', err)
      setError(err.message || 'Failed to create market')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setFormData({
      city: '',
      state: '',
      marketType: 'MEDIUM',
      canonicalCityId: null,
      population: null,
      metroPopulation: null
    })
    setError(null)
    setIsCustomCity(false)
    onClose()
  }

  // Get regional priorities (matching the main component)
  const getRegionalPriorities = (region) => {
    const regionalServicePriorities = {
      south: {
        high: ['Tree Services', 'Fence Contractors', 'Landscaping Design', 'Concrete Contractors', 
               'Painting Companies', 'Roofing Contractors', 'Pool Builders', 'Outdoor Kitchen',
               'Outdoor Living Structures', 'Smart Home Installation'],
        medium: ['Window & Door', 'Kitchen Remodeling', 'Bathroom Remodeling', 'Whole Home Remodel',
                 'Hardscape Contractors', 'Solar Installers', 'Artificial Turf Installation', 
                 'Water Features Installation', 'EV Charging Installation'],
        low: ['Deck Builders', 'Smart Home', 'Epoxy Flooring', 'Garage Door Services', 
              'Cabinet Makers', 'Tile & Stone', 'Paving & Asphalt', 'Custom Home Builders', 
              'Flooring Contractors', 'Custom Lighting Design']
      },
      west: {
        high: ['Solar Installers', 'Painting Companies', 'Landscaping Design', 'Smart Home Installation',
               'Pool Builders', 'Artificial Turf Installation', 'EV Charging Installation',
               'Outdoor Living Structures', 'Custom Lighting Design'],
        medium: ['Concrete Contractors', 'Fence Contractors', 'Window & Door', 'Roofing Contractors',
                 'Kitchen Remodeling', 'Bathroom Remodeling', 'Water Features Installation',
                 'Outdoor Kitchen Installation'],
        low: ['Tree Services', 'Deck Builders', 'Whole Home Remodel', 'Home Addition',
              'Exterior Contractors', 'Hardscape Contractors', 'Turf Installers']
      },
      northeast: {
        high: ['Kitchen Remodeling', 'Bathroom Remodeling', 'Window & Door', 'Painting Companies',
               'Smart Home Installation', 'Roofing Contractors', 'EV Charging Installation'],
        medium: ['Whole Home Remodel', 'Flooring Contractors', 'Cabinet Makers', 'Tile & Stone',
                 'Deck Builders', 'Fence Contractors', 'Custom Lighting Design'],
        low: ['Pool Builders', 'Solar Installers', 'Outdoor Kitchen', 'Artificial Turf Installation',
              'Water Features Installation', 'Outdoor Living Structures', 'Palapa/Tropical Structures']
      },
      midwest: {
        high: ['Concrete Contractors', 'Fence Contractors', 'Garage Door Services', 'Window & Door',
               'Roofing Contractors'],
        medium: ['Kitchen Remodeling', 'Painting Companies', 'Smart Home Installation', 
                 'EV Charging Installation', 'Bathroom Remodeling'],
        low: ['Pool Builders', 'Solar Installers', 'Outdoor Kitchen', 'Artificial Turf Installation',
              'Water Features Installation', 'Outdoor Living Structures', 'Palapa/Tropical Structures']
      },
      pacificNorthwest: {
        high: ['Deck Builders', 'Roofing Contractors', 'Window & Door', 'Smart Home Installation',
               'Tree Services', 'EV Charging Installation'],
        medium: ['Kitchen Remodeling', 'Whole Home Remodel', 'Fence Contractors', 'Concrete Contractors',
                 'Custom Lighting Design', 'Painting Companies'],
        low: ['Pool Builders', 'Solar Installers', 'Turf Installers', 'Artificial Turf Installation',
              'Outdoor Kitchen', 'Water Features Installation', 'Palapa/Tropical Structures']
      },
      mountain: {
        high: ['Roofing Contractors', 'Window & Door', 'Concrete Contractors', 'Garage Door Services'],
        medium: ['Kitchen Remodeling', 'Smart Home Installation', 'Fence Contractors', 
                 'EV Charging Installation', 'Painting Companies'],
        low: ['Pool Builders', 'Outdoor Kitchen', 'Artificial Turf Installation', 
              'Water Features Installation', 'Outdoor Living Structures', 'Palapa/Tropical Structures']
      }
    }
    
    return regionalServicePriorities[region] || regionalServicePriorities.south
  }

  const isRegionalOnlyService = (serviceName, state) => {
    const regionalOnlyServices = {
      'Palapa/Tropical Structures': ['FL', 'CA', 'AZ', 'HI']
    }
    
    return regionalOnlyServices[serviceName] && 
           !regionalOnlyServices[serviceName].includes(state)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Market</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="state">
              State <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="state"
              required
              value={formData.state}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  state: e.target.value, 
                  city: '', 
                  canonicalCityId: null,
                  marketType: 'MEDIUM',
                  population: null,
                  metroPopulation: null
                })
                setIsCustomCity(false)
              }}
            >
              <option value="">Select a state</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="city">
              <MapPin size={16} />
              City Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <CityAutocomplete
              value={formData.city}
              state={formData.state}
              onChange={(value) => setFormData({ ...formData, city: value })}
              onSelect={handleCitySelect}
              placeholder={formData.state ? "Search for a city..." : "Select a state first"}
              allowCustom={true}
            />
          </div>

          {/* Market Size Classification Info */}
          {formData.city && (
            <div className="form-group">
              <label>
                <Users size={16} />
                Market Classification
              </label>
              <div className="market-type-display">
                <span className={`market-type-badge ${formData.marketType.toLowerCase()}`}>
                  {formData.marketType} MARKET
                </span>
                {isCustomCity ? (
                  <small style={{ color: '#6b7280' }}>
                    📍 Default classification for new cities
                  </small>
                ) : (
                  <small style={{ color: '#6b7280' }}>
                    ✅ Based on city population data
                  </small>
                )}
              </div>
            </div>
          )}


          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
            >
              {saving ? 'Creating Market...' : 'Create Market'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMarketModal