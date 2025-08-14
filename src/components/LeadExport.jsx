import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { googleSheetsService } from '../lib/apiServices'
import { Download, Filter, Users, MapPin, Phone, Mail, Globe, Calendar, Loader } from 'lucide-react'
import './LeadExport.css'

function LeadExport() {
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    serviceType: '',
    hasPhone: false,
    hasEmail: false,
    hasWebsite: false,
    dateFrom: '',
    dateTo: ''
  })
  const [availableOptions, setAvailableOptions] = useState({
    states: [],
    cities: [],
    serviceTypes: []
  })
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')

  // Load leads and filter options on component mount
  useEffect(() => {
    loadLeads()
    loadFilterOptions()
  }, [])

  // Apply filters when filters change
  useEffect(() => {
    applyFilters()
  }, [filters, leads])

  const loadLeads = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading leads:', error)
        setExportStatus('Error loading leads: ' + error.message)
      } else {
        setLeads(data || [])
        setFilteredLeads(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setExportStatus('Error loading leads: ' + err.message)
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

      setAvailableOptions({
        states: [...new Set(statesData?.map(item => item.state) || [])].sort(),
        cities: [...new Set(citiesData?.map(item => item.city) || [])].sort(),
        serviceTypes: [...new Set(serviceTypesData?.map(item => item.service_type) || [])].sort()
      })
    } catch (err) {
      console.error('Error loading filter options:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...leads]

    // Apply state filter
    if (filters.state) {
      filtered = filtered.filter(lead => lead.state === filters.state)
    }

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter(lead => lead.city === filters.city)
    }

    // Apply service type filter
    if (filters.serviceType) {
      filtered = filtered.filter(lead => 
        lead.service_type?.toLowerCase().includes(filters.serviceType.toLowerCase()) ||
        lead.normalized_service_type?.toLowerCase().includes(filters.serviceType.toLowerCase())
      )
    }

    // Apply contact info filters
    if (filters.hasPhone) {
      filtered = filtered.filter(lead => lead.phone && lead.phone.trim() !== '')
    }

    if (filters.hasEmail) {
      filtered = filtered.filter(lead => 
        (lead.email && lead.email.trim() !== '') ||
        (lead.email2 && lead.email2.trim() !== '') ||
        (lead.email3 && lead.email3.trim() !== '')
      )
    }

    if (filters.hasWebsite) {
      filtered = filtered.filter(lead => lead.website && lead.website.trim() !== '')
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(lead => 
        new Date(lead.created_at) >= new Date(filters.dateFrom)
      )
    }

    if (filters.dateTo) {
      filtered = filtered.filter(lead => 
        new Date(lead.created_at) <= new Date(filters.dateTo + 'T23:59:59')
      )
    }

    setFilteredLeads(filtered)
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
      hasWebsite: false,
      dateFrom: '',
      dateTo: ''
    })
  }

  const formatLeadForExport = (lead) => {
    return {
      'Company Name': lead.company_name || '',
      'Service Type': lead.service_type || lead.normalized_service_type || '',
      'Phone': lead.phone || '',
      'Email': lead.email || lead.email2 || lead.email3 || '',
      'Website': lead.website || '',
      'Address': lead.full_address || lead.address || '',
      'City': lead.city || '',
      'State': lead.state || '',
      'Rating': lead.rating || '',
      'Review Count': lead.review_count || '',
      'Instagram': lead.instagram_url || '',
      'Facebook': lead.facebook_url || '',
      'LinkedIn': lead.linkedin_url || '',
      'Google Maps': lead.google_maps_url || '',
      'Lead Source': lead.lead_source || '',
      'Market ID': lead.market_id || '',
      'Search Query': lead.search_query || '',
      'Running Ads': lead.running_ads ? 'Yes' : 'No',
      'DM Sent': lead.dm_sent ? 'Yes' : 'No',
      'Called': lead.called ? 'Yes' : 'No',
      'Score': lead.score || '',
      'Notes': lead.notes || '',
      'Created Date': lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '',
      'Updated Date': lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : ''
    }
  }

  const exportToGoogleSheets = async () => {
    if (filteredLeads.length === 0) {
      setExportStatus('No leads to export with current filters')
      return
    }

    setExporting(true)
    setExportStatus('Preparing export...')

    try {
      // Format leads for export
      const formattedLeads = filteredLeads.map(formatLeadForExport)
      
      // Create sheet name with timestamp and filters
      const timestamp = new Date().toISOString().split('T')[0]
      const filterSummary = [
        filters.state && `State-${filters.state}`,
        filters.city && `City-${filters.city}`,
        filters.serviceType && `Service-${filters.serviceType}`,
        filters.hasPhone && 'HasPhone',
        filters.hasEmail && 'HasEmail',
        filters.hasWebsite && 'HasWebsite'
      ].filter(Boolean).join('_')
      
      const sheetName = `Leads_${timestamp}${filterSummary ? '_' + filterSummary : ''}`

      setExportStatus(`Exporting ${filteredLeads.length} leads to Google Sheets...`)

      // Export to Google Sheets
      const result = await googleSheetsService.appendData({
        sheet: sheetName,
        data: formattedLeads
      })

      setExportStatus(`✅ Successfully exported ${filteredLeads.length} leads to Google Sheets!`)
      
      // Clear status after 5 seconds
      setTimeout(() => setExportStatus(''), 5000)

    } catch (error) {
      console.error('Export error:', error)
      setExportStatus(`❌ Export failed: ${error.message}`)
      
      // Clear error after 10 seconds
      setTimeout(() => setExportStatus(''), 10000)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="lead-export">
      <div className="export-header">
        <h2>Lead Export Tool</h2>
        <p>Filter and export your leads to Google Sheets for team collaboration</p>
      </div>

      <div className="export-stats">
        <div className="stat-item">
          <Users size={20} />
          <span>{leads.length} Total Leads</span>
        </div>
        <div className="stat-item">
          <Filter size={20} />
          <span>{filteredLeads.length} Filtered Results</span>
        </div>
      </div>

      <div className="export-filters">
        <h3>Filters</h3>
        <div className="filter-grid">
          <div className="filter-group">
            <label>State</label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              {availableOptions.states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>City</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">All Cities</option>
              {availableOptions.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
            >
              <option value="">All Service Types</option>
              {availableOptions.serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
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
            Has Phone Number
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.hasEmail}
              onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
            />
            <Mail size={16} />
            Has Email Address
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
            Clear Filters
          </button>
        </div>
      </div>

      <div className="export-actions">
        <button 
          className="btn btn-primary export-btn"
          onClick={exportToGoogleSheets}
          disabled={exporting || filteredLeads.length === 0}
        >
          {exporting ? (
            <>
              <Loader size={18} className="spinning" />
              Exporting...
            </>
          ) : (
            <>
              <Download size={18} />
              Export {filteredLeads.length} Leads to Google Sheets
            </>
          )}
        </button>
      </div>

      {exportStatus && (
        <div className={`export-status ${exportStatus.includes('✅') ? 'success' : exportStatus.includes('❌') ? 'error' : 'info'}`}>
          {exportStatus}
        </div>
      )}

      {loading && (
        <div className="loading-indicator">
          <Loader size={20} className="spinning" />
          Loading leads...
        </div>
      )}
    </div>
  )
}

export default LeadExport
