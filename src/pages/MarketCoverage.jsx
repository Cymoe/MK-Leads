import { useState, useEffect } from 'react'
import { MapPin, Upload, RefreshCw, ChevronRight, Search, Star, Check, Users, TrendingUp, Target, Loader, Plus, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AddMarketModal from '../components/AddMarketModal'
import ImportModal from '../components/ImportModal'
import './MarketCoverage.css'

function MarketCoverage() {
  const navigate = useNavigate()
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [expandedStates, setExpandedStates] = useState({})
  const [selectedServices, setSelectedServices] = useState([])
  const [activePhase, setActivePhase] = useState('google')
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [serviceTypeCounts, setServiceTypeCounts] = useState({})
  const [showAddMarketModal, setShowAddMarketModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Map states to regions for service prioritization
  const getRegionForState = (state) => {
    const regions = {
      south: ['TX', 'FL', 'GA', 'SC', 'NC', 'AL', 'MS', 'LA', 'TN', 'KY', 'AR'],
      west: ['CA', 'AZ', 'NV', 'NM', 'HI'],
      northeast: ['NY', 'NJ', 'CT', 'MA', 'PA', 'VA', 'MD', 'DE', 'VT', 'NH', 'ME', 'RI'],
      midwest: ['OH', 'MI', 'IL', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'ND', 'SD'],
      pacificNorthwest: ['WA', 'OR', 'ID', 'MT', 'AK'],
      mountain: ['CO', 'UT', 'WY', 'NV', 'ID', 'MT', 'AZ', 'NM'].filter(s => !['ID', 'MT', 'AZ', 'NM'].includes(s)) // Remove overlaps
    }
    
    for (const [region, states] of Object.entries(regions)) {
      if (states.includes(state)) {
        return region
      }
    }
    return 'south' // Default region
  }
  
  // Fetch actual markets from Supabase
  useEffect(() => {
    fetchMarkets()
  }, [])

  // Fetch service type counts when a market is selected
  useEffect(() => {
    if (selectedMarket) {
      fetchServiceTypeCounts(selectedMarket.name, selectedMarket.state)
    }
  }, [selectedMarket])

  const fetchMarkets = async () => {
    try {
      setLoading(true)
      console.log('Fetching markets from Supabase...')
      
      // Fetch markets from the markets view
      const { data: marketsData, error: marketsError } = await supabase
        .from('markets')
        .select('*')
      
      if (marketsError) throw marketsError
      
      // Get lead counts per market using a more efficient approach
      let { data: leadCounts, error: leadError } = await supabase
        .rpc('get_lead_counts_by_city')
      
      if (leadError) {
        // Fallback to manual counting if RPC doesn't exist
        console.log('RPC failed, using fallback method')
        // Supabase has a default limit of 1000, we need to get all leads
        let allLeads = []
        let rangeStart = 0
        const rangeSize = 1000
        let hasMore = true
        
        while (hasMore) {
          const { data: batch, error: batchError } = await supabase
            .from('leads')
            .select('city, state')
            .not('city', 'is', null)
            .not('state', 'is', null)
            .range(rangeStart, rangeStart + rangeSize - 1)
          
          if (batchError) throw batchError
          
          if (batch && batch.length > 0) {
            allLeads = [...allLeads, ...batch]
            rangeStart += rangeSize
            hasMore = batch.length === rangeSize
          } else {
            hasMore = false
          }
        }
        
        console.log(`Fetched ${allLeads.length} total leads`)
        
        // Count leads per city/state
        const cityLeadCounts = {}
        allLeads?.forEach(lead => {
          const key = `${lead.city}-${lead.state}`
          cityLeadCounts[key] = (cityLeadCounts[key] || 0) + 1
        })
        const fallbackLeadCounts = Object.entries(cityLeadCounts).map(([key, count]) => {
          const [city, state] = key.split('-')
          return { city, state, lead_count: count }
        })
        leadCounts = fallbackLeadCounts
      }
      
      // Convert to lookup object
      const cityLeadCounts = {}
      leadCounts?.forEach(item => {
        const key = `${item.city}-${item.state}`
        cityLeadCounts[key] = item.lead_count || 0
      })
      
      // Group markets by state
      const parsedMarkets = {}
      marketsData?.forEach(market => {
        const state = market.state
        const leadCount = cityLeadCounts[`${market.name}-${market.state}`] || 0
        
        if (!parsedMarkets[state]) {
          parsedMarkets[state] = {
            state,
            cities: [],
            total: 0
          }
        }
        
        parsedMarkets[state].cities.push({
          id: market.id,
          name: market.name,
          type: market.type,
          leads: leadCount,
          coverage: market.coverage_percentage || 0,
          population: market.population,
          metroPopulation: market.metro_population,
          services: market.service_types || []
        })
        
        parsedMarkets[state].total += leadCount
      })
      
      // Convert to array and sort
      const marketsArray = Object.values(parsedMarkets)
        .sort((a, b) => b.total - a.total) // Sort states by total leads
        .map(state => ({
          ...state,
          cities: state.cities.sort((a, b) => b.leads - a.leads) // Sort cities by leads
        }))
      
      console.log('Markets loaded:', marketsArray)
      setMarkets(marketsArray)
      
      // Set the first market as selected and expand its state
      if (marketsArray.length > 0 && marketsArray[0].cities.length > 0) {
        const firstCity = marketsArray[0].cities[0]
        const firstState = marketsArray[0].state
        setSelectedMarket({
          ...firstCity,
          state: firstState
        })
        setExpandedStates({ [firstState]: true })
      }
      
    } catch (err) {
      console.error('Error fetching markets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceTypeCounts = async (city, state) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('service_type')
        .eq('city', city)
        .eq('state', state)
        .not('service_type', 'is', null)
      
      if (error) throw error
      
      // Count occurrences of each service type
      const counts = {}
      data?.forEach(lead => {
        const serviceType = lead.service_type
        counts[serviceType] = (counts[serviceType] || 0) + 1
      })
      
      setServiceTypeCounts(counts)
      console.log('Service type counts for', city, state, ':', counts)
    } catch (err) {
      console.error('Error fetching service type counts:', err)
    }
  }

  // Complete service list including emerging services
  const allServices = [
    // Established Services
    { name: 'Deck Builders', category: 'established' },
    { name: 'Concrete Contractors', category: 'established' },
    { name: 'Window & Door', category: 'established' },
    { name: 'Roofing Contractors', category: 'established' },
    { name: 'Tree Services', category: 'established' },
    { name: 'Solar Installers', category: 'established' },
    { name: 'Fence Contractors', category: 'established' },
    { name: 'Pool Builders', category: 'established' },
    { name: 'Turf Installers', category: 'established' },
    { name: 'Kitchen Remodeling', category: 'established' },
    { name: 'Bathroom Remodeling', category: 'established' },
    { name: 'Whole Home Remodel', category: 'established' },
    { name: 'Home Addition', category: 'established' },
    { name: 'Exterior Contractors', category: 'established' },
    { name: 'Hardscape Contractors', category: 'established' },
    { name: 'Landscaping Design', category: 'established' },
    { name: 'Outdoor Kitchen', category: 'established' },
    { name: 'Painting Companies', category: 'established' },
    { name: 'Smart Home', category: 'established' },
    { name: 'Epoxy Flooring', category: 'established' },
    { name: 'Garage Door Services', category: 'established' },
    { name: 'Cabinet Makers', category: 'established' },
    { name: 'Tile & Stone', category: 'established' },
    { name: 'Paving & Asphalt', category: 'established' },
    { name: 'Custom Home Builders', category: 'established' },
    { name: 'Flooring Contractors', category: 'established' },
    // Emerging Services
    { name: 'EV Charging Installation', category: 'emerging', growthRate: '27.11%', marketSize: '$32.12B by 2030' },
    { name: 'Artificial Turf Installation', category: 'emerging', growthRate: '19.7%', marketSize: '$4.88B by 2031' },
    { name: 'Smart Home Installation', category: 'emerging', growthRate: '23.4%', marketSize: '$99.40B by 2032' },
    { name: 'Outdoor Living Structures', category: 'emerging', growthRate: '5.3%', marketSize: '$892.9M' },
    { name: 'Custom Lighting Design', category: 'emerging', growthRate: '5.72%', marketSize: '$252.65B by 2035' },
    { name: 'Water Features Installation', category: 'emerging', growthRate: '8%', marketSize: 'Growing' },
    { name: 'Outdoor Kitchen Installation', category: 'emerging', growthRate: '8.9%', marketSize: '$24.45B' },
    { name: 'Palapa/Tropical Structures', category: 'emerging', growthRate: 'Niche', marketSize: 'Regional' }
  ]
  
  // Regional service priorities based on market data
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
  
  // Special regional services (only show in specific regions)
  const regionalOnlyServices = {
    'Palapa/Tropical Structures': ['FL', 'CA', 'AZ', 'HI']
  }

  const toggleState = (state) => {
    setExpandedStates(prev => ({
      ...prev,
      [state]: !prev[state]
    }))
  }

  const handleMarketSelect = (city, state) => {
    setSelectedMarket({
      ...city,
      state: state
    })
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setSidebarOpen(false)
    }
  }

  const toggleServiceSelection = (serviceName) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        return prev.filter(name => name !== serviceName)
      }
      return [...prev, serviceName]
    })
  }

  const getRecommendedServices = () => {
    if (!selectedMarket) return []
    
    const region = getRegionForState(selectedMarket.state)
    const regionPriorities = regionalServicePriorities[region] || regionalServicePriorities.south
    
    // Map services with their regional priorities
    const servicesWithPriorities = allServices.map(service => {
      // Check if this is a regional-only service
      if (regionalOnlyServices[service.name] && 
          !regionalOnlyServices[service.name].includes(selectedMarket.state)) {
        return null // Don't show this service in this state
      }
      
      // Determine priority based on region
      let priority = 'low'
      if (regionPriorities.high.includes(service.name)) {
        priority = 'high'
      } else if (regionPriorities.medium.includes(service.name)) {
        priority = 'medium'
      }
      
      return {
        ...service,
        priority,
        region
      }
    }).filter(Boolean) // Remove null entries
    
    // Sort by priority (high first) and category (emerging first within same priority)
    return servicesWithPriorities.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // Within same priority, show emerging services first
      if (a.category === 'emerging' && b.category === 'established') return -1
      if (a.category === 'established' && b.category === 'emerging') return 1
      
      return 0
    })
  }

  const getServiceLeadCount = (serviceName) => {
    // First check if the service name itself exists in the database (UI display names)
    let totalCount = serviceTypeCounts[serviceName] || 0
    
    // If we found leads with the exact service name, return that count
    if (totalCount > 0) {
      return totalCount
    }
    
    // Otherwise, map common service names to actual service types in the database
    const serviceMapping = {
      'Deck Builders': ['Deck builder', 'Deck contractor', 'Deck construction'],
      'Concrete Contractors': ['Concrete contractor', 'Concrete work', 'Concrete company'],
      'Window & Door': ['Window installation service', 'Door installation', 'Window and door contractor', 'Window installer'],
      'Roofing Contractors': ['Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair'],
      'Tree Services': ['Tree service', 'Tree removal', 'Tree trimming', 'Arborist'],
      'Solar Installers': ['Solar energy contractor', 'Solar panel installation', 'Solar installer'],
      'Fence Contractors': ['Fence contractor', 'Fence installation', 'Fencing company'],
      'Pool Builders': ['Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair'],
      'Turf Installers': ['Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf installation'],
      'Kitchen Remodeling': ['Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor'],
      'Bathroom Remodeling': ['Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor'],
      'Whole Home Remodel': ['General contractor', 'Remodeler', 'Home renovation', 'Construction company'],
      'Home Addition': ['General contractor', 'Home addition contractor', 'Room addition'],
      'Exterior Contractors': ['Siding contractor', 'Exterior renovation', 'Exterior remodeling'],
      'Hardscape Contractors': ['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor'],
      'Landscaping Design': ['Landscaper', 'Landscape designer', 'Landscaping service'],
      'Outdoor Kitchen': ['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder'],
      'Painting Companies': ['Painter', 'Painting contractor', 'House painter'],
      'Smart Home': ['Smart home installation', 'Home automation', 'Technology installer'],
      'Epoxy Flooring': ['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy'],
      'Garage Door Services': ['Garage door installer', 'Garage door repair', 'Overhead door contractor'],
      'Cabinet Makers': ['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor'],
      'Tile & Stone': ['Tile contractor', 'Stone contractor', 'Tile installer'],
      'Paving & Asphalt': ['Paving contractor', 'Asphalt contractor', 'Driveway paving'],
      'Custom Home Builders': ['Custom home builder', 'Home builder', 'Residential builder'],
      'Flooring Contractors': ['Flooring contractor', 'Floor installation', 'Carpet installer']
    }
    
    // Get the mapped service types
    const mappedTypes = serviceMapping[serviceName] || [serviceName]
    
    // Sum up counts for all mapped service types
    mappedTypes.forEach(type => {
      totalCount += serviceTypeCounts[type] || 0
    })
    
    return totalCount
  }

  const getTotalLeads = () => {
    // Get unique lead count from all cities
    const uniqueLeadCount = markets.reduce((total, state) => {
      return total + state.cities.reduce((stateTotal, city) => stateTotal + city.leads, 0)
    }, 0)
    return uniqueLeadCount
  }

  const getTotalMarkets = () => {
    return markets.reduce((sum, state) => sum + state.cities.length, 0)
  }

  if (loading) {
    return (
      <div className="market-coverage-v2">
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <h2>Loading Markets...</h2>
          <p>Fetching your market data from Supabase</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="market-coverage-v2">
        <div className="error-state">
          <h2>Error Loading Markets</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchMarkets}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="market-coverage-v2">
      
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>Market Coverage</h1>
          <p>{getTotalLeads().toLocaleString()} leads across {getTotalMarkets()} markets in {markets.length} states</p>
        </div>
        <div className="header-right">
          <button className="btn-icon" onClick={fetchMarkets}>
            <RefreshCw size={20} />
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAddMarketModal(true)}>
            <Plus size={16} />
            <span>Add Market</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
            <Upload size={16} />
            <span>Import Leads</span>
          </button>
        </div>
      </header>

      <div className="content">
        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar Overlay for Mobile */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Markets</h3>
            <span className="total-badge">{markets.length} states</span>
          </div>
          
          <div className="states-list">
            {markets.length === 0 ? (
              <div className="empty-sidebar">
                <p>No markets found</p>
                <small>Import leads to see markets</small>
              </div>
            ) : (
              markets.map((stateGroup) => (
                <div key={stateGroup.state} className="state-section">
                  <div 
                    className="state-header"
                    onClick={() => toggleState(stateGroup.state)}
                  >
                    <div className="state-info">
                      <span className="state-code">{stateGroup.state}</span>
                      <span className="state-count">{stateGroup.total.toLocaleString()} leads</span>
                    </div>
                    <ChevronRight size={16} className={expandedStates[stateGroup.state] ? 'expanded' : ''} />
                  </div>
                  
                  {expandedStates[stateGroup.state] && (
                    <div className="cities">
                      {stateGroup.cities.map((city) => (
                        <div
                          key={city.id}
                          className={`city ${selectedMarket?.id === city.id ? 'active' : ''}`}
                          onClick={() => handleMarketSelect(city, stateGroup.state)}
                        >
                          <div className="city-left">
                            <span className="city-name">{city.name}</span>
                            <span className={`city-type ${city.type.toLowerCase()}`}>{city.type}</span>
                          </div>
                          <div className="city-right">
                            <span className="city-leads">{city.leads.toLocaleString()}</span>
                            <div className="coverage-indicator">
                              <div className="coverage-bar">
                                <div className="coverage-fill" style={{ width: `${city.coverage}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        {selectedMarket ? (
          <main className="main-content">
            {/* Market Header */}
            <div className="market-header">
              <div className="market-title">
                <h2>{selectedMarket.name}, {selectedMarket.state}</h2>
                <div className="market-badges">
                  <span className={`type-badge ${selectedMarket.type.toLowerCase()}`}>
                    {selectedMarket.type} MARKET
                  </span>
                  {selectedMarket.population && (
                    <span className="pop-badge">
                      <Users size={14} />
                      {selectedMarket.population.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="market-stats">
                <div className="stat">
                  <span className="stat-value">{selectedMarket.leads.toLocaleString()}</span>
                  <span className="stat-label">Total Leads</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{selectedMarket.coverage}%</span>
                  <span className="stat-label">Coverage</span>
                </div>
                {selectedMarket.metroPopulation && (
                  <div className="stat">
                    <span className="stat-value">{(selectedMarket.metroPopulation / 1000000).toFixed(1)}M</span>
                    <span className="stat-label">Metro Pop</span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-value">{getRecommendedServices().length}</span>
                  <span className="stat-label">Services</span>
                </div>
              </div>
            </div>

            {/* Phase Tabs */}
            <div className="phase-tabs">
              <button 
                className={`phase-tab ${activePhase === 'google' ? 'active' : ''}`}
                onClick={() => setActivePhase('google')}
              >
                <MapPin size={16} />
                Google Maps
                <span className="tab-count">{selectedMarket.leads.toLocaleString()}</span>
              </button>
              <button 
                className={`phase-tab ${activePhase === 'facebook' ? 'active' : ''}`}
                onClick={() => setActivePhase('facebook')}
              >
                <Target size={16} />
                Facebook Ads
                <span className="tab-count">0</span>
              </button>
              <button 
                className={`phase-tab ${activePhase === 'instagram' ? 'active' : ''}`}
                onClick={() => setActivePhase('instagram')}
              >
                <TrendingUp size={16} />
                Instagram
                <span className="tab-count">0</span>
              </button>
            </div>

            {/* Services Grid */}
            <div className="services-section">
              <div className="services-header">
                <h3>All Service Types ({getRecommendedServices().length})</h3>
                <button className="btn-text">
                  Run All Searches ({getRecommendedServices().filter(s => getServiceLeadCount(s.name) === 0).length} needed)
                </button>
              </div>

              <div className="services-grid">
                {getRecommendedServices().map((service) => {
                  const leadCount = getServiceLeadCount(service.name)
                  const isEmerging = service.category === 'emerging'
                  
                  // Parse growth rate for emerging services
                  let growthBadge = null
                  if (isEmerging && service.growthRate) {
                    const rate = parseFloat(service.growthRate)
                    if (rate >= 15) {
                      growthBadge = '🔥' // Hot market
                    } else if (rate >= 5) {
                      growthBadge = '📈' // Growing market
                    }
                  }
                  
                  return (
                    <div 
                      key={service.name}
                      className={`service-card ${selectedServices.includes(service.name) ? 'selected' : ''} ${leadCount > 0 ? 'has-leads' : ''} ${isEmerging ? 'emerging' : 'established'}`}
                      onClick={() => toggleServiceSelection(service.name)}
                    >
                      <div className="service-header">
                        <div className="service-left">
                          {leadCount > 0 && (
                            <div className="service-checkmark">
                              <Check size={14} />
                            </div>
                          )}
                          <span className="service-name">
                            {service.name}
                            {isEmerging && <span className="emerging-badge">🆕</span>}
                          </span>
                        </div>
                        <div className="service-badges">
                          {growthBadge && <span className="growth-badge">{growthBadge}</span>}
                          <div className={`priority-badge ${service.priority}`}>
                            {service.priority === 'high' && <Star size={12} />}
                            {service.priority}
                          </div>
                        </div>
                      </div>
                    
                    <div className="service-body">
                      <div className="service-stat">
                        <span className="stat-number">
                          {getServiceLeadCount(service.name)}
                        </span>
                        <span className="stat-text">leads found</span>
                      </div>
                      {getServiceLeadCount(service.name) > 0 ? (
                        <button className="search-btn view-leads" onClick={(e) => {
                          e.stopPropagation()
                          // Navigate to leads table with filters
                          navigate('/leads', { 
                            state: { 
                              city: selectedMarket.name,
                              state: selectedMarket.state,
                              serviceType: service.name
                            } 
                          })
                        }}>
                          View Leads →
                        </button>
                      ) : (
                        <button className="search-btn" onClick={(e) => {
                          e.stopPropagation()
                          console.log(`Need to search for ${service.name} in ${selectedMarket.name}`)
                        }}>
                          Search →
                        </button>
                      )}
                    </div>

                    {/* Market metadata for emerging services */}
                    {isEmerging && service.marketSize && (
                      <div className="service-metadata">
                        <span className="metadata-item">
                          {service.growthRate && `${service.growthRate} CAGR`}
                        </span>
                        <span className="metadata-item">
                          {service.marketSize}
                        </span>
                      </div>
                    )}

                      {selectedServices.includes(service.name) && (
                        <div className="service-selected">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="selection-actions">
                  <span>{selectedServices.length} services selected</span>
                  <button className="btn btn-primary">
                    Run Selected Searches
                  </button>
                </div>
              )}
            </div>
          </main>
        ) : (
          <main className="main-content">
            <div className="no-selection">
              <MapPin size={48} />
              <h2>Select a Market</h2>
              <p>Choose a market from the sidebar to view details and recommendations</p>
            </div>
          </main>
        )}
      </div>

      {/* Add Market Modal */}
      <AddMarketModal 
        isOpen={showAddMarketModal}
        onClose={() => setShowAddMarketModal(false)}
        onSuccess={fetchMarkets}
        getRegionForState={getRegionForState}
      />

      {/* Import Leads Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        selectedMarket={selectedMarket}
        onImportComplete={fetchMarkets}
      />
    </div>
  )
}

export default MarketCoverage