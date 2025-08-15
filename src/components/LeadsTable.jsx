import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader
} from 'lucide-react'
import './LeadsTable.css'

function LeadsTable() {
  const location = useLocation()
  
  // Get filters from both URL parameters and navigation state
  const urlParams = new URLSearchParams(location.search)
  const urlFilters = {
    state: urlParams.get('state') || '',
    city: urlParams.get('city') || '',
    serviceType: urlParams.get('serviceType') || ''
  }
  const navigationFilters = location.state || {}
  
  // Combine URL params and navigation state (URL params take precedence)
  const initialFilters = {
    state: urlFilters.state || navigationFilters.state || '',
    city: urlFilters.city || navigationFilters.city || '',
    serviceType: urlFilters.serviceType || navigationFilters.serviceType || ''
  }
  
  // Debug filters (can be removed in production)
  useEffect(() => {
    if (initialFilters.state || initialFilters.city || initialFilters.serviceType) {
      console.log('Leads table opened with filters:', initialFilters)
    }
  }, [])
  
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [leadsPerPage, setLeadsPerPage] = useState(25)
  
  // Filters - Initialize with combined filters
  const [filters, setFilters] = useState({
    state: initialFilters.state,
    city: initialFilters.city,
    serviceType: initialFilters.serviceType,
    hasPhone: false,
    hasEmail: false,
    hasWebsite: false
  })
  
  // Auto-open filters if we have any filter values
  useEffect(() => {
    if (initialFilters.state || initialFilters.city || initialFilters.serviceType) {
      setShowFilters(true)
    }
  }, []) // Only on mount
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    cities: [],
    serviceTypes: []
  })

  // Load leads on component mount
  useEffect(() => {
    loadLeads()
    loadFilterOptions()
  }, [])

  // Reload filter options when state changes to update city list
  useEffect(() => {
    loadFilterOptions()
  }, [filters.state])

  // Apply search and filters when they change
  useEffect(() => {
    // Only apply filters if we have leads loaded
    if (leads.length > 0 || !loading) {
      applyFiltersAndSearch()
    }
  }, [leads, searchTerm, filters, loading])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting to load leads from Supabase...')
      console.log('Navigation filters:', navigationFilters)
      
      // Map UI service names to database service types
      const serviceMapping = {
        'Deck Builders': ['Deck builder', 'Deck contractor', 'Deck construction', 'Deck Builders'],
        'Concrete Contractors': ['Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor', 'Concrete Contractors'],
        'Window & Door': ['Window installation service', 'Door installation', 'Window and door contractor', 'Window installer', 'Window tinting service', 'Window & Door'],
        'Roofing Contractors': ['Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair', 'Roofing Contractors'],
        'Tree Services': ['Tree service', 'Tree removal', 'Tree trimming', 'Arborist', 'Tree Services'],
        'Solar Installers': ['Solar energy contractor', 'Solar panel installation', 'Solar installer', 'Solar Installers'],
        'Fence Contractors': ['Fence contractor', 'Fence installation', 'Fencing company', 'Fence Contractors'],
        'Pool Builders': ['Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair', 'Pool Builders'],
        'Turf Installers': ['Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf supplier', 'Turf installation', 'Turf Installers'],
        'Kitchen Remodeling': ['Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor', 'Kitchen Remodeling'],
        'Bathroom Remodeling': ['Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor', 'Bathroom Remodeling'],
        'Whole Home Remodel': ['General contractor', 'Remodeler', 'Home renovation', 'Construction company', 'General', 'Whole Home Remodel'],
        'Home Addition': ['General contractor', 'Home addition contractor', 'Room addition', 'Construction company', 'Home Addition'],
        'Exterior Contractors': ['Siding contractor', 'Exterior renovation', 'Exterior remodeling', 'Gutter service', 'Exterior Contractors'],
        'Hardscape Contractors': ['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor', 'Paving contractor', 'Hardscape Contractors'],
        'Landscaping Design': ['Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect', 'Landscape lighting designer', 'Landscaping Design'],
        'Outdoor Kitchen': ['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder', 'Outdoor Kitchen'],
        'Painting Companies': ['Painter', 'Painting contractor', 'House painter', 'Painting Companies'],
        'Smart Home': ['Smart home installation', 'Home automation', 'Technology installer', 'Smart Home'],
        'Epoxy Flooring': ['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy', 'Epoxy Flooring'],
        'Garage Door Services': ['Garage door installer', 'Garage door repair', 'Overhead door contractor', 'Garage Door Services'],
        'Cabinet Makers': ['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor', 'Cabinet Makers'],
        'Tile & Stone': ['Tile contractor', 'Stone contractor', 'Tile installer', 'Tile & Stone'],
        'Paving & Asphalt': ['Paving contractor', 'Asphalt contractor', 'Driveway paving', 'Paving & Asphalt'],
        'Custom Home Builders': ['Custom home builder', 'Home builder', 'Residential builder', 'Construction company', 'Custom Home Builders'],
        'Flooring Contractors': ['Flooring contractor', 'Floor installation', 'Carpet installer', 'Flooring Contractors'],
        'EV Charging Installation': ['EV charging installer', 'Electric vehicle charger installation', 'EV charging station', 'EV Charging Installation'],
        'Artificial Turf Installation': ['Artificial turf installer', 'Synthetic grass installation', 'Artificial grass', 'Artificial Turf Installation'],
        'Smart Home Installation': ['Smart home installer', 'Home automation installation', 'Connected home', 'Smart Home Installation'],
        'Outdoor Living Structures': ['Carport and pergola builder', 'Pergola builder', 'Gazebo builder', 'Patio cover installation', 'Outdoor Living Structures'],
        'Custom Lighting Design': ['Lighting designer', 'Lighting contractor', 'Landscape lighting', 'Custom Lighting Design'],
        'Water Features Installation': ['Water feature installer', 'Fountain installation', 'Pond builder', 'Water Features Installation'],
        'Outdoor Kitchen Installation': ['Outdoor kitchen builder', 'BBQ island installation', 'Patio kitchen', 'Outdoor Kitchen Installation'],
        'Palapa/Tropical Structures': ['Palapa builder', 'Tiki hut builder', 'Tropical structure', 'Palapa/Tropical Structures']
      }
      
      // Build query with filters
      let query = supabase.from('leads').select('*', { count: 'exact' })
      
      if (navigationFilters.state) {
        query = query.eq('state', navigationFilters.state)
      }
      
      if (navigationFilters.city) {
        query = query.eq('city', navigationFilters.city)
      }
      
      if (navigationFilters.serviceType) {
        const mappedTypes = serviceMapping[navigationFilters.serviceType] || [navigationFilters.serviceType]
        query = query.in('service_type', mappedTypes)
        console.log('Filtering by service types:', mappedTypes)
      }
      
      // Execute the query to get count first
      const { count, error: countError } = await query
      
      if (countError) {
        console.error('Error getting count:', countError)
        throw countError
      }
      
      console.log('Total leads count:', count)
      
      // Now load all data in batches
      let allData = []
      const batchSize = 1000
      
      for (let offset = 0; offset < (count || 0); offset += batchSize) {
        // Rebuild the same query for data fetching
        let dataQuery = supabase.from('leads').select('*')
        
        if (navigationFilters.state) {
          dataQuery = dataQuery.eq('state', navigationFilters.state)
        }
        
        if (navigationFilters.city) {
          dataQuery = dataQuery.eq('city', navigationFilters.city)
        }
        
        if (navigationFilters.serviceType) {
          const mappedTypes = serviceMapping[navigationFilters.serviceType] || [navigationFilters.serviceType]
          dataQuery = dataQuery.in('service_type', mappedTypes)
        }
        
        const { data: batch, error } = await dataQuery
          .order('created_at', { ascending: false })
          .range(offset, Math.min(offset + batchSize - 1, (count || 0) - 1))
        
        if (error) {
          console.error('Error loading batch:', error)
          throw error
        }
        
        if (batch) {
          allData = [...allData, ...batch]
          console.log(`Loaded ${batch.length} leads in batch starting at ${offset}`)
        }
      }
      
      console.log('Total leads loaded:', allData.length)
      setLeads(allData)
      
    } catch (err) {
      console.error('Error loading leads:', err)
      setError('Failed to load leads: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    // Get current URL filters for ensuring they're in the options
    const currentUrlParams = new URLSearchParams(location.search)
    const currentFilters = {
      state: currentUrlParams.get('state') || '',
      city: currentUrlParams.get('city') || '',
      serviceType: currentUrlParams.get('serviceType') || ''
    }
    try {
      // Get all US states for complete coverage
      const { data: statesData } = await supabase
        .from('canonical_cities')
        .select('state')
        .order('state')

      // Get cities that actually have leads (filtered by state if selected)
      let citiesQuery = supabase
        .from('leads')
        .select('city, state')
        .not('city', 'is', null)
        .not('city', 'eq', '')
        .order('city')
      
      // If a state is currently selected, only show cities from that state
      if (filters.state) {
        citiesQuery = citiesQuery.eq('state', filters.state)
      }
      
      const { data: citiesData } = await citiesQuery

      // Get service types from our master service types table (clean UI names)
      const { data: serviceTypesData, error: serviceError } = await supabase
        .from('service_types_master')
        .select('name')
        .eq('is_active', true)
        .order('name')
      
      if (serviceError) {
        console.error('Error loading service types:', serviceError)
      }

      // Use clean service type names from master table
      const uniqueServiceTypes = serviceTypesData 
        ? serviceTypesData.map(item => item.name)
        : []
      
      console.log(`Loaded ${uniqueServiceTypes.length} service types from master table`)
      
      // Debug: Log service types when navigating with a filter
      if (navigationFilters.serviceType) {
        console.log('Navigation service type:', navigationFilters.serviceType)
        console.log('Available service types from master:', uniqueServiceTypes)
        console.log('Does it exist?', uniqueServiceTypes.includes(navigationFilters.serviceType))
      }

      // Ensure URL filter values are included in options even if not in current data
      const states = [...new Set(statesData?.map(item => item.state) || [])].sort()
      
      // Get unique cities that have leads
      const cities = [...new Set(citiesData?.map(item => item.city) || [])].sort()
      
      // Add URL filter values to options if they're not already present
      if (currentFilters.state && !states.includes(currentFilters.state)) {
        states.push(currentFilters.state)
        states.sort()
      }
      if (currentFilters.city && !cities.includes(currentFilters.city)) {
        cities.push(currentFilters.city)
        cities.sort()
      }
      if (currentFilters.serviceType && !uniqueServiceTypes.includes(currentFilters.serviceType)) {
        uniqueServiceTypes.push(currentFilters.serviceType)
        uniqueServiceTypes.sort()
      }

      setFilterOptions({
        states,
        cities,
        serviceTypes: uniqueServiceTypes
      })
      
      console.log('Filter options loaded:', {
        statesCount: states.length,
        citiesCount: cities.length,
        serviceTypesCount: uniqueServiceTypes.length,
        hasInitialState: currentFilters.state && states.includes(currentFilters.state),
        hasInitialCity: currentFilters.city && cities.includes(currentFilters.city),
        hasInitialServiceType: currentFilters.serviceType && uniqueServiceTypes.includes(currentFilters.serviceType)
      })
    } catch (err) {
      console.error('Error loading filter options:', err)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...leads]

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(lead =>
        lead.business_name?.toLowerCase().includes(term) ||
        lead.city?.toLowerCase().includes(term) ||
        lead.state?.toLowerCase().includes(term) ||
        lead.phone?.includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.service_type?.toLowerCase().includes(term)
      )
    }

    // Apply filters only if they differ from navigation filters (for user-applied filters)
    if (filters.state) {
      filtered = filtered.filter(lead => lead.state === filters.state)
    }

    if (filters.city) {
      filtered = filtered.filter(lead => lead.city === filters.city)
    }

    if (filters.serviceType) {
      // Map UI service names to database service types
      const serviceMapping = {
        'Deck Builders': ['Deck builder', 'Deck contractor', 'Deck construction', 'Deck Builders'],
        'Concrete Contractors': ['Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor', 'Concrete Contractors'],
        'Window & Door': ['Window installation service', 'Door installation', 'Window and door contractor', 'Window installer', 'Window tinting service', 'Window & Door'],
        'Roofing Contractors': ['Roofing contractor', 'Roofer', 'Roofing company', 'Roof repair', 'Roofing Contractors'],
        'Tree Services': ['Tree service', 'Tree removal', 'Tree trimming', 'Arborist', 'Tree Services'],
        'Solar Installers': ['Solar energy contractor', 'Solar panel installation', 'Solar installer', 'Solar Installers'],
        'Fence Contractors': ['Fence contractor', 'Fence installation', 'Fencing company', 'Fence Contractors'],
        'Pool Builders': ['Swimming pool contractor', 'Pool cleaning service', 'Pool installation', 'Pool repair', 'Pool Builders'],
        'Turf Installers': ['Landscaper', 'Lawn care service', 'Artificial turf installation', 'Turf supplier', 'Turf installation', 'Turf Installers'],
        'Kitchen Remodeling': ['Kitchen remodeler', 'Kitchen renovation', 'Kitchen contractor', 'Kitchen Remodeling'],
        'Bathroom Remodeling': ['Bathroom remodeler', 'Bathroom renovation', 'Bathroom contractor', 'Bathroom Remodeling'],
        'Whole Home Remodel': ['General contractor', 'Remodeler', 'Home renovation', 'Construction company', 'General', 'Whole Home Remodel'],
        'Home Addition': ['General contractor', 'Home addition contractor', 'Room addition', 'Construction company', 'Home Addition'],
        'Exterior Contractors': ['Siding contractor', 'Exterior renovation', 'Exterior remodeling', 'Gutter service', 'Exterior Contractors'],
        'Hardscape Contractors': ['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor', 'Paving contractor', 'Hardscape Contractors'],
        'Landscaping Design': ['Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect', 'Landscape lighting designer', 'Landscaping Design'],
        'Outdoor Kitchen': ['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder', 'Outdoor Kitchen'],
        'Painting Companies': ['Painter', 'Painting contractor', 'House painter', 'Painting Companies'],
        'Smart Home': ['Smart home installation', 'Home automation', 'Technology installer', 'Smart Home'],
        'Epoxy Flooring': ['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy', 'Epoxy Flooring'],
        'Garage Door Services': ['Garage door installer', 'Garage door repair', 'Overhead door contractor', 'Garage Door Services'],
        'Cabinet Makers': ['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor', 'Cabinet Makers'],
        'Tile & Stone': ['Tile contractor', 'Stone contractor', 'Tile installer', 'Tile & Stone'],
        'Paving & Asphalt': ['Paving contractor', 'Asphalt contractor', 'Driveway paving', 'Paving & Asphalt'],
        'Custom Home Builders': ['Custom home builder', 'Home builder', 'Residential builder', 'Construction company', 'Custom Home Builders'],
        'Flooring Contractors': ['Flooring contractor', 'Floor installation', 'Carpet installer', 'Flooring Contractors'],
        'EV Charging Installation': ['EV charging installer', 'Electric vehicle charger installation', 'EV charging station', 'EV Charging Installation'],
        'Artificial Turf Installation': ['Artificial turf installer', 'Synthetic grass installation', 'Artificial grass', 'Artificial Turf Installation'],
        'Smart Home Installation': ['Smart home installer', 'Home automation installation', 'Connected home', 'Smart Home Installation'],
        'Outdoor Living Structures': ['Carport and pergola builder', 'Pergola builder', 'Gazebo builder', 'Patio cover installation', 'Outdoor Living Structures'],
        'Custom Lighting Design': ['Lighting designer', 'Lighting contractor', 'Landscape lighting', 'Custom Lighting Design'],
        'Water Features Installation': ['Water feature installer', 'Fountain installation', 'Pond builder', 'Water Features Installation'],
        'Outdoor Kitchen Installation': ['Outdoor kitchen builder', 'BBQ island installation', 'Patio kitchen', 'Outdoor Kitchen Installation'],
        'Palapa/Tropical Structures': ['Palapa builder', 'Tiki hut builder', 'Tropical structure', 'Palapa/Tropical Structures']
      }
      
      const mappedTypes = serviceMapping[filters.serviceType] || [filters.serviceType]
      
      filtered = filtered.filter(lead => {
        return mappedTypes.some(type => 
          lead.service_type === type || 
          lead.service_type?.toLowerCase() === type.toLowerCase()
        )
      })
    }

    if (filters.hasPhone) {
      filtered = filtered.filter(lead => lead.phone && lead.phone.trim() !== '')
    }

    if (filters.hasEmail) {
      filtered = filtered.filter(lead => lead.email && lead.email.trim() !== '')
    }

    if (filters.hasWebsite) {
      filtered = filtered.filter(lead => lead.website && lead.website.trim() !== '')
    }

    setFilteredLeads(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      state: '',
      city: '',
      serviceType: '',
      hasPhone: false,
      hasEmail: false,
      hasWebsite: false
    })
    setSearchTerm('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatPhone = (phone) => {
    if (!phone) return 'N/A'
    // Format phone number if it's a valid US number
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  // Pagination calculations
  const indexOfLastLead = currentPage * leadsPerPage
  const indexOfFirstLead = indexOfLastLead - leadsPerPage
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead)
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="leads-table-container">
        <div className="loading-state">
          <Loader size={32} className="spinning" />
          <p>Loading leads from Supabase...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="leads-table-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={loadLeads}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="leads-table-container">
      {/* Header */}
      <div className="leads-header">
        <div className="header-left">
          <h1>Leads Database</h1>
          <p>{filteredLeads.length} of {leads.length} leads</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
          <button className="btn btn-primary" onClick={loadLeads}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-input-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search leads by business name, location, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>STATE</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              >
                <option value="">All States</option>
                {filterOptions.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>CITY</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              >
                <option value="">All Cities</option>
                {filterOptions.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>SERVICE TYPE</label>
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              >
                <option value="">All Services</option>
                {filterOptions.serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasPhone}
                onChange={(e) => handleFilterChange('hasPhone', e.target.checked)}
              />
              <Phone size={16} />
              Has Phone
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasEmail}
                onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
              />
              <Mail size={16} />
              Has Email
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasWebsite}
                onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
              />
              <Globe size={16} />
              Has Website
            </label>
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>BUSINESS</th>
              <th>LOCATION</th>
              <th>SERVICE</th>
              <th>CONTACT</th>
              <th>ADDED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead) => (
              <tr key={lead.id} className="lead-row">
                <td className="business-cell">
                  <div className="business-info">
                    <span className="business-name">
                      {lead.company_name || 'Unnamed Business'}
                    </span>
                    {lead.market_id && (
                      <span className="market-id">{lead.market_id}</span>
                    )}
                  </div>
                </td>
                
                <td className="location-cell">
                  <div className="location-info">
                    <MapPin size={14} />
                    <span>{lead.city}, {lead.state}</span>
                  </div>
                </td>
                
                <td className="service-cell">
                  <span className="service-type">
                    {lead.service_type || 'Not specified'}
                  </span>
                </td>
                
                <td className="contact-cell">
                  <div className="contact-info">
                    {lead.phone && (
                      <div className="contact-item">
                        <Phone size={12} />
                        <a href={`tel:${lead.phone}`} className="contact-link phone-link">
                          {formatPhone(lead.phone)}
                        </a>
                      </div>
                    )}
                    {lead.email && (
                      <div className="contact-item">
                        <Mail size={12} />
                        <a href={`mailto:${lead.email}`} className="contact-link email-link">
                          {lead.email}
                        </a>
                      </div>
                    )}
                    {lead.website && (
                      <div className="contact-item">
                        <Globe size={12} />
                        <a 
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="contact-link website-link"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="date-cell">
                  <div className="date-info">
                    <Calendar size={14} />
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                </td>
                
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      className="btn-icon"
                      onClick={() => setSelectedLead(lead)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentLeads.length === 0 && !loading && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No leads found</h3>
            {(navigationFilters.serviceType || navigationFilters.city || navigationFilters.state) ? (
              <>
                <p>No leads match your current filters:</p>
                <div className="filter-info">
                  {navigationFilters.city && <span>City: <strong>{navigationFilters.city}</strong></span>}
                  {navigationFilters.state && <span>State: <strong>{navigationFilters.state}</strong></span>}
                  {navigationFilters.serviceType && <span>Service: <strong>{navigationFilters.serviceType}</strong></span>}
                </div>
                <p className="filter-note">
                  Note: You may need to run a search for this service type in {navigationFilters.city} to find leads.
                </p>
              </>
            ) : (
              <p>Try adjusting your search or filter criteria</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="page-info">
            <span>Page {currentPage} of {totalPages}</span>
            <span>({indexOfFirstLead + 1}-{Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length})</span>
          </div>
          
          <div className="per-page-selector">
            <label>Show:</label>
            <select 
              value={leadsPerPage} 
              onChange={(e) => {
                setLeadsPerPage(Number(e.target.value))
                setCurrentPage(1) // Reset to first page when changing page size
              }}
              className="per-page-dropdown"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
            <span>per page</span>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLead.business_name || 'Lead Details'}</h2>
              <button 
                className="btn-icon"
                onClick={() => setSelectedLead(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>BUSINESS NAME</label>
                  <span>{selectedLead.business_name || 'N/A'}</span>
                </div>
                
                <div className="detail-item">
                  <label>LOCATION</label>
                  <span>{selectedLead.city}, {selectedLead.state}</span>
                </div>
                
                <div className="detail-item">
                  <label>SERVICE TYPE</label>
                  <span>{selectedLead.service_type || 'N/A'}</span>
                </div>
                
                <div className="detail-item">
                  <label>PHONE</label>
                  {selectedLead.phone ? (
                    <a href={`tel:${selectedLead.phone}`} className="contact-link phone-link">
                      {formatPhone(selectedLead.phone)}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <label>EMAIL</label>
                  {selectedLead.email ? (
                    <a href={`mailto:${selectedLead.email}`} className="contact-link email-link">
                      {selectedLead.email}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <label>WEBSITE</label>
                  {selectedLead.website ? (
                    <a 
                      href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-link website-link"
                    >
                      {selectedLead.website}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <label>MARKET ID</label>
                  <span>{selectedLead.market_id || 'N/A'}</span>
                </div>
                
                <div className="detail-item">
                  <label>CREATED</label>
                  <span>{formatDate(selectedLead.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadsTable
