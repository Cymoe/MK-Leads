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
  const [exportFormat, setExportFormat] = useState('single') // 'single', 'by-market', 'by-service'

  // Load leads on component mount
  useEffect(() => {
    loadLeads()
  }, [])

  // Load filter options after leads are loaded
  useEffect(() => {
    if (leads.length > 0) {
      loadFilterOptions()
    }
  }, [leads])

  // Apply filters when filters change
  useEffect(() => {
    applyFilters()
  }, [filters, leads])

  const loadLeads = async () => {
    setLoading(true)
    try {
      // First, get the total count
      const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error getting count:', countError)
        setExportStatus('Error getting lead count: ' + countError.message)
        return
      }

      console.log('Total leads in database:', count)
      setExportStatus(`Loading ${count} leads...`)

      // Load all leads in batches
      const batchSize = 1000
      let allLeads = []
      
      for (let offset = 0; offset < count; offset += batchSize) {
        console.log(`Loading batch ${Math.floor(offset/batchSize) + 1}/${Math.ceil(count/batchSize)}...`)
        
        const { data: batchData, error: batchError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + batchSize - 1)

        if (batchError) {
          console.error('Error loading batch:', batchError)
          setExportStatus(`Error loading leads batch: ${batchError.message}`)
          return
        }

        allLeads = [...allLeads, ...(batchData || [])]
        
        // Update progress
        setExportStatus(`Loaded ${allLeads.length} of ${count} leads...`)
      }

      console.log('Successfully loaded all leads:', allLeads.length)
      setLeads(allLeads)
      setFilteredLeads(allLeads)
      setExportStatus('')

    } catch (err) {
      console.error('Error:', err)
      setExportStatus('Error loading leads: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      // Use RPC or aggregate functions for better performance with large datasets
      // Get unique states - limit to reasonable number for dropdown
      const { data: statesData } = await supabase
        .rpc('get_unique_states')
        .limit(100)

      // Get unique cities - limit to reasonable number for dropdown  
      const { data: citiesData } = await supabase
        .rpc('get_unique_cities')
        .limit(500)

      // Get unique service types
      const { data: serviceTypesData } = await supabase
        .rpc('get_unique_service_types')
        .limit(200)

      // Fallback to direct queries if RPC functions don't exist
      if (!statesData || !citiesData || !serviceTypesData) {
        console.log('RPC functions not available, using direct queries...')
        
        const [statesResult, citiesResult, serviceTypesResult] = await Promise.all([
          supabase.from('leads').select('state').not('state', 'is', null).not('state', 'eq', ''),
          supabase.from('leads').select('city').not('city', 'is', null).not('city', 'eq', ''),
          supabase.from('leads').select('service_type').not('service_type', 'is', null).not('service_type', 'eq', '')
        ])

        setAvailableOptions({
          states: [...new Set(statesResult.data?.map(item => item.state) || [])].sort(),
          cities: [...new Set(citiesResult.data?.map(item => item.city) || [])].sort(),
          serviceTypes: [...new Set(serviceTypesResult.data?.map(item => item.service_type) || [])].sort()
        })
      } else {
        setAvailableOptions({
          states: (statesData || []).sort(),
          cities: (citiesData || []).sort(),
          serviceTypes: (serviceTypesData || []).sort()
        })
      }
    } catch (err) {
      console.error('Error loading filter options:', err)
      // Fallback: extract from already loaded leads if available
      if (leads.length > 0) {
        setAvailableOptions({
          states: [...new Set(leads.map(lead => lead.state).filter(Boolean))].sort(),
          cities: [...new Set(leads.map(lead => lead.city).filter(Boolean))].sort(),
          serviceTypes: [...new Set(leads.map(lead => lead.service_type).filter(Boolean))].sort()
        })
      }
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
        lead.category?.toLowerCase().includes(filters.serviceType.toLowerCase())
      )
    }

    // Apply contact info filters
    if (filters.hasPhone) {
      filtered = filtered.filter(lead => lead.phone && lead.phone.trim() !== '')
    }

    if (filters.hasEmail) {
      filtered = filtered.filter(lead => lead.email && lead.email.trim() !== '')
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
      'Company Name': lead.name || lead.company_name || '',
      'Service Type': lead.service_type || lead.category || '',
      'Phone': lead.phone || '',
      'Email': lead.email || '',
      'Website': lead.website || '',
      'Address': lead.address || '',
      'City': lead.city || '',
      'State': lead.state || '',
      'ZIP': lead.zip || '',
      'Rating': lead.rating || '',
      'Reviews': lead.reviews || '',
      'Instagram': lead.instagram || '',
      'Facebook': lead.facebook || '',
      'LinkedIn': lead.linkedin || '',
      'Google Maps URL': lead.google_maps_url || '',
      'Place ID': lead.place_id || '',
      'Source': lead.source || '',
      'Market ID': lead.market_id || '',
      'Verified': lead.verified ? 'Yes' : 'No',
      'Created Date': lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '',
      'Updated Date': lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : ''
    }
  }

  const createCSVContent = (leads, headers) => {
    return [
      headers.join(','),
      ...leads.map(lead => 
        headers.map(header => {
          const value = lead[header] || ''
          // Escape quotes and wrap in quotes if contains comma or quotes
          return value.toString().includes(',') || value.toString().includes('"') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(',')
      )
    ].join('\n')
  }

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      setExportStatus('No leads to export with current filters')
      return
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const filterSummary = [
        filters.state && `State-${filters.state}`,
        filters.city && `City-${filters.city}`,
        filters.serviceType && `Service-${filters.serviceType}`,
        filters.hasPhone && 'HasPhone',
        filters.hasEmail && 'HasEmail',
        filters.hasWebsite && 'HasWebsite'
      ].filter(Boolean).join('_')

      if (exportFormat === 'single') {
        // Single file export
        const formattedLeads = filteredLeads.map(formatLeadForExport)
        const headers = Object.keys(formattedLeads[0])
        const csvContent = createCSVContent(formattedLeads, headers)
        
        const filename = `Leads_${timestamp}${filterSummary ? '_' + filterSummary : ''}.csv`
        downloadCSV(csvContent, filename)
        
        setExportStatus(`✅ Successfully downloaded ${filteredLeads.length} leads as CSV file!`)
        
      } else if (exportFormat === 'by-market') {
        // Export by market (city + state)
        const marketGroups = {}
        filteredLeads.forEach(lead => {
          const marketKey = `${lead.city || 'Unknown'}_${lead.state || 'Unknown'}`
          if (!marketGroups[marketKey]) {
            marketGroups[marketKey] = []
          }
          marketGroups[marketKey].push(lead)
        })

        let totalFiles = 0
        Object.entries(marketGroups).forEach(([marketKey, leads]) => {
          const formattedLeads = leads.map(formatLeadForExport)
          const headers = Object.keys(formattedLeads[0])
          const csvContent = createCSVContent(formattedLeads, headers)
          
          const filename = `Leads_${marketKey}_${timestamp}_${leads.length}leads.csv`
          downloadCSV(csvContent, filename)
          totalFiles++
        })

        setExportStatus(`✅ Successfully downloaded ${totalFiles} CSV files organized by market!`)
        
      } else if (exportFormat === 'by-service') {
        // Export by service type
        const serviceGroups = {}
        filteredLeads.forEach(lead => {
          const serviceKey = (lead.service_type || lead.category || 'Unknown Service').replace(/[^a-zA-Z0-9]/g, '_')
          if (!serviceGroups[serviceKey]) {
            serviceGroups[serviceKey] = []
          }
          serviceGroups[serviceKey].push(lead)
        })

        let totalFiles = 0
        Object.entries(serviceGroups).forEach(([serviceKey, leads]) => {
          const formattedLeads = leads.map(formatLeadForExport)
          const headers = Object.keys(formattedLeads[0])
          const csvContent = createCSVContent(formattedLeads, headers)
          
          const filename = `Leads_${serviceKey}_${timestamp}_${leads.length}leads.csv`
          downloadCSV(csvContent, filename)
          totalFiles++
        })

        setExportStatus(`✅ Successfully downloaded ${totalFiles} CSV files organized by service type!`)
      }
      
      setTimeout(() => setExportStatus(''), 5000)
      
    } catch (error) {
      console.error('CSV Export error:', error)
      setExportStatus(`❌ CSV Export failed: ${error.message}`)
      setTimeout(() => setExportStatus(''), 10000)
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
      // Check if Google Sheets service is configured
      if (!googleSheetsService.scriptUrl) {
        setExportStatus('📄 Google Sheets not configured. Downloading CSV file instead...')
        setTimeout(() => {
          exportToCSV()
        }, 800)
        return
      }

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
      setExportStatus(`📄 Google Sheets failed. Downloading CSV file instead...`)
      
      // Fallback to CSV export
      setTimeout(() => {
        exportToCSV()
      }, 1500)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="lead-export">
      <div className="export-header">
        <h2>Lead Export Tool</h2>
        <p>Filter and export your leads as CSV files for easy analysis and team collaboration</p>
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

      <div className="export-format-section">
        <h3>Export Format</h3>
        <div className="format-options">
          <label className="format-option">
            <input
              type="radio"
              name="exportFormat"
              value="single"
              checked={exportFormat === 'single'}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            <div className="option-content">
              <strong>Single File</strong>
              <span>All leads in one CSV file</span>
            </div>
          </label>

          <label className="format-option">
            <input
              type="radio"
              name="exportFormat"
              value="by-market"
              checked={exportFormat === 'by-market'}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            <div className="option-content">
              <strong>By Market</strong>
              <span>Separate CSV file for each city/state combination</span>
            </div>
          </label>

          <label className="format-option">
            <input
              type="radio"
              name="exportFormat"
              value="by-service"
              checked={exportFormat === 'by-service'}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            <div className="option-content">
              <strong>By Service Type</strong>
              <span>Separate CSV file for each service category</span>
            </div>
          </label>
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
              Export {filteredLeads.length} Leads 
              {exportFormat === 'single' && ' (Single CSV)'}
              {exportFormat === 'by-market' && ' (By Market)'}
              {exportFormat === 'by-service' && ' (By Service)'}
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
