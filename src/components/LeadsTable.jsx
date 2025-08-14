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
  const navigationFilters = location.state || {}
  
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [leadsPerPage] = useState(25)
  
  // Filters - Initialize with navigation state if available
  const [filters, setFilters] = useState({
    state: navigationFilters.state || '',
    city: navigationFilters.city || '',
    serviceType: navigationFilters.serviceType || '',
    hasPhone: false,
    hasEmail: false,
    hasWebsite: false
  })
  
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

  // Apply search and filters when they change
  useEffect(() => {
    applyFiltersAndSearch()
  }, [leads, searchTerm, filters])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeads(data || [])
      console.log(`Loaded ${data?.length || 0} leads from Supabase`)
    } catch (err) {
      console.error('Error loading leads:', err)
      setError('Failed to load leads: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      // Get unique states
      const { data: statesData } = await supabase
        .from('leads')
        .select('state')
        .not('state', 'is', null)
        .not('state', 'eq', '')

      // Get unique cities  
      const { data: citiesData } = await supabase
        .from('leads')
        .select('city')
        .not('city', 'is', null)
        .not('city', 'eq', '')

      // Get unique service types
      const { data: serviceTypesData } = await supabase
        .from('leads')
        .select('service_type')
        .not('service_type', 'is', null)
        .not('service_type', 'eq', '')

      setFilterOptions({
        states: [...new Set(statesData?.map(item => item.state) || [])].sort(),
        cities: [...new Set(citiesData?.map(item => item.city) || [])].sort(),
        serviceTypes: [...new Set(serviceTypesData?.map(item => item.service_type) || [])].sort()
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

    // Apply filters
    if (filters.state) {
      filtered = filtered.filter(lead => lead.state === filters.state)
    }

    if (filters.city) {
      filtered = filtered.filter(lead => lead.city === filters.city)
    }

    if (filters.serviceType) {
      filtered = filtered.filter(lead => 
        lead.service_type?.toLowerCase().includes(filters.serviceType.toLowerCase())
      )
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
                      {lead.business_name || 'Unnamed Business'}
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
                        <span>{formatPhone(lead.phone)}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="contact-item">
                        <Mail size={12} />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.website && (
                      <div className="contact-item">
                        <Globe size={12} />
                        <span>Website</span>
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

        {currentLeads.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No leads found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
                  <span>{formatPhone(selectedLead.phone)}</span>
                </div>
                
                <div className="detail-item">
                  <label>EMAIL</label>
                  <span>{selectedLead.email || 'N/A'}</span>
                </div>
                
                <div className="detail-item">
                  <label>WEBSITE</label>
                  <span>{selectedLead.website || 'N/A'}</span>
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
