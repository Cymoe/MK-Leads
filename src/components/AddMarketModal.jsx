import { useState } from 'react'
import { X, MapPin, Users, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
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
    population: '',
    metroPopulation: '',
    marketType: 'SMALL'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Determine market type based on population
      let marketType = 'SMALL'
      const pop = parseInt(formData.population)
      if (pop > 1000000) {
        marketType = 'MEGA'
      } else if (pop > 500000) {
        marketType = 'LARGE'
      } else if (pop > 100000) {
        marketType = 'MEDIUM'
      }

      // Get region for the state
      const region = getRegionForState(formData.state)

      // Create market
      const { data: market, error: marketError } = await supabase
        .from('markets')
        .insert({
          name: formData.city,
          state: formData.state,
          type: marketType,
          region: region,
          population: formData.population ? parseInt(formData.population) : null,
          metro_population: formData.metroPopulation ? parseInt(formData.metroPopulation) : null,
          coverage_percentage: 0
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

      // Success
      onSuccess()
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
      population: '',
      metroPopulation: '',
      marketType: 'SMALL'
    })
    setError(null)
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
            <label htmlFor="city">
              <MapPin size={16} />
              City Name
            </label>
            <input
              id="city"
              type="text"
              required
              placeholder="e.g., Austin"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">
              State
            </label>
            <select
              id="state"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
            <label htmlFor="population">
              <Users size={16} />
              City Population
            </label>
            <input
              id="population"
              type="number"
              placeholder="e.g., 950000"
              value={formData.population}
              onChange={(e) => setFormData({ ...formData, population: e.target.value })}
            />
            <small>Leave blank if unknown</small>
          </div>

          <div className="form-group">
            <label htmlFor="metroPopulation">
              <Users size={16} />
              Metro Area Population
            </label>
            <input
              id="metroPopulation"
              type="number"
              placeholder="e.g., 2200000"
              value={formData.metroPopulation}
              onChange={(e) => setFormData({ ...formData, metroPopulation: e.target.value })}
            />
            <small>Metropolitan area population (optional)</small>
          </div>

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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating Market...' : 'Create Market'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMarketModal