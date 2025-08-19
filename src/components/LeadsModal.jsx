import { useState, useEffect } from 'react'
import { X, Users, MapPin, Phone, Mail, Globe, Calendar, Search, Loader, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './LeadsModal.css'

function LeadsModal({ isOpen, onClose, filters }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      (lead.name?.toLowerCase().includes(searchLower) || 
       lead.company_name?.toLowerCase().includes(searchLower)) ||
      lead.contact_name?.toLowerCase().includes(searchLower) ||
      lead.phone?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.address?.toLowerCase().includes(searchLower)
    )
  })

  // Fetch leads when modal opens or filters change
  useEffect(() => {
    if (isOpen && filters) {
      fetchLeads()
    }
  }, [isOpen, filters])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('LeadsModal: Fetching leads with filters:', filters)

      // First, let's see what service types actually exist in the database for this city
      const { data: allLeadsForCity } = await supabase
        .from('leads')
        .select('service_type')
        .eq('city', filters.city)
        .eq('state', filters.state)
      
      const uniqueServiceTypes = [...new Set(allLeadsForCity?.map(lead => lead.service_type) || [])]
      console.log('LeadsModal: Available service types in', filters.city, ':', uniqueServiceTypes)

      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.city) {
        query = query.eq('city', filters.city)
        console.log('LeadsModal: Filtering by city:', filters.city)
      }
      if (filters.state) {
        query = query.eq('state', filters.state)
        console.log('LeadsModal: Filtering by state:', filters.state)
      }
      if (filters.serviceType) {
        // Service mapping - UI names to database service types
        const serviceMapping = {
          'Deck Builders': ['Deck builder', 'Deck contractor', 'Deck construction', 'Deck Builders'],
          'Concrete Contractors': ['Concrete contractor', 'Concrete work', 'Concrete company', 'Contractor', 'Concrete Contractors'],
          'Window & Door': ['Window contractor', 'Door contractor', 'Window installation', 'Door installation', 'Window & Door'],
          'Roofing Contractors': ['Roofing contractor', 'Roofer', 'Roof contractor', 'Roofing company', 'Roofing Contractors'],
          'Tree Services': ['Tree service', 'Tree removal', 'Arborist', 'Tree contractor', 'Tree Services'],
          'Solar Installers': ['Solar installer', 'Solar contractor', 'Solar company', 'Solar panel installer', 'Solar Installers'],
          'Fence Contractors': ['Fence contractor', 'Fencing contractor', 'Fence installation', 'Fence Contractors'],
          'Pool Builders': ['Pool builder', 'Pool contractor', 'Swimming pool contractor', 'Pool installation', 'Pool Builders'],
          'Turf Installers': ['Turf installer', 'Artificial turf installer', 'Synthetic grass installer', 'Turf Installers'],
          'Kitchen Remodeling': ['Kitchen remodeling contractor', 'Kitchen renovation', 'Kitchen contractor', 'Kitchen Remodeling'],
          'Bathroom Remodeling': ['Bathroom remodeling contractor', 'Bathroom renovation', 'Bathroom contractor', 'Bathroom Remodeling'],
          'Whole Home Remodel': ['General contractor', 'Home remodeling contractor', 'Renovation contractor', 'Whole Home Remodel'],
          'Home Addition': ['General contractor', 'Home addition contractor', 'Room addition', 'Construction company'],
          'Exterior Contractors': ['Siding contractor', 'Exterior renovation', 'Exterior remodeling', 'Gutter service'],
          'Hardscape Contractors': ['Landscape designer', 'Hardscaping', 'Patio builder', 'Hardscape contractor', 'Paving contractor'],
          'Landscaping Design': ['Landscaper', 'Landscape designer', 'Landscaping service', 'Landscape architect', 'Landscape lighting designer'],
          'Outdoor Kitchen': ['Outdoor kitchen installation', 'Outdoor kitchen contractor', 'BBQ island builder'],
          'Painting Companies': ['Painter', 'Painting contractor', 'House painter', 'Painting Companies'],
          'Smart Home': ['Smart home installation', 'Home automation', 'Technology installer', 'Smart Home Installation'],
          'Epoxy Flooring': ['Epoxy flooring contractor', 'Floor coating', 'Garage floor epoxy'],
          'Garage Door Services': ['Garage door installer', 'Garage door repair', 'Overhead door contractor'],
          'Cabinet Makers': ['Cabinet maker', 'Cabinet installer', 'Kitchen cabinet contractor'],
          'Tile & Stone': ['Tile contractor', 'Stone contractor', 'Tile installer'],
          'Paving & Asphalt': ['Paving contractor', 'Asphalt contractor', 'Driveway paving'],
          'Custom Home Builders': ['Custom home builder', 'Home builder', 'Residential builder', 'Construction company'],
          'Flooring Contractors': ['Flooring contractor', 'Floor installation', 'Carpet installer'],
          'Artificial Turf Installation': ['Turf supplier', 'Turf installation', 'Synthetic grass installation', 'Artificial grass installer', 'Artificial Turf Installation']
        }
        
        const mappedTypes = serviceMapping[filters.serviceType] || [filters.serviceType]
        console.log('LeadsModal: Filtering by service_type:', filters.serviceType, '-> mapped to:', mappedTypes)
        
        // Try multiple approaches to find leads
        // First try exact matches with mapped types
        query = query.in('service_type', mappedTypes)
        
        const { data: exactMatches } = await query
        console.log('LeadsModal: Exact matches found:', exactMatches?.length || 0)
        
        // If no exact matches, try partial matches with the main service name
        if (!exactMatches || exactMatches.length === 0) {
          console.log('LeadsModal: No exact matches, trying partial match for:', filters.serviceType)
          
          // Reset query for partial matching
          query = supabase
            .from('leads')
            .select('*')
            .eq('city', filters.city)
            .eq('state', filters.state)
            .ilike('service_type', `%${filters.serviceType.split(' ')[0]}%`) // Use first word for partial match
            .order('created_at', { ascending: false })
        }
      }

      const { data, error } = await query

      if (error) throw error

      console.log('LeadsModal: Query returned', data?.length || 0, 'leads')
      console.log('LeadsModal: Sample lead data:', data?.[0])

      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchTerm('')
    setSelectedLead(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="leads-modal-overlay" onClick={handleClose}>
      <div className="leads-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="leads-modal-header">
          <div className="modal-title">
            <h3>
              {filters?.serviceType} Leads in {filters?.city}, {filters?.state}
            </h3>
            <p className="modal-subtitle">
              {filteredLeads.length} of {leads.length} leads
            </p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="leads-modal-search">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Modal Content */}
        <div className="leads-modal-content">
          {loading ? (
            <div className="loading-state">
              <Loader size={32} className="spinner" />
              <p>Loading leads...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error loading leads: {error}</p>
              <button onClick={fetchLeads} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No leads found</h3>
              <p>
                {searchTerm 
                  ? `No leads match "${searchTerm}"`
                  : `No ${filters?.serviceType} leads found in ${filters?.city}, ${filters?.state}`
                }
              </p>
            </div>
          ) : (
            <div className="leads-list">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="lead-card">
                  <div className="lead-header">
                    <h4 className="business-name">{lead.name || lead.company_name || 'Unnamed Business'}</h4>
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedLead(lead)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  
                  <div className="lead-info">
                    {lead.contact_name && (
                      <div className="info-item">
                        <Users size={14} />
                        <span>{lead.contact_name}</span>
                      </div>
                    )}
                    
                    {lead.phone && (
                      <div className="info-item">
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    
                    {lead.email && (
                      <div className="info-item">
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    
                    {lead.website && (
                      <div className="info-item">
                        <Globe size={14} />
                        <span>{lead.website}</span>
                      </div>
                    )}
                    
                    {lead.address && (
                      <div className="info-item">
                        <MapPin size={14} />
                        <span>{lead.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="lead-details-overlay" onClick={() => setSelectedLead(null)}>
            <div className="lead-details-modal" onClick={e => e.stopPropagation()}>
              <div className="lead-details-header">
                <h3>{selectedLead.name || selectedLead.company_name || 'Lead Details'}</h3>
                <button onClick={() => setSelectedLead(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="lead-details-content">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Business:</strong> {selectedLead.name || selectedLead.company_name || 'Unnamed Business'}
                    </div>
                    {selectedLead.contact_name && (
                      <div className="detail-item">
                        <strong>Contact:</strong> {selectedLead.contact_name}
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div className="detail-item">
                        <strong>Phone:</strong> {selectedLead.phone}
                      </div>
                    )}
                    {selectedLead.email && (
                      <div className="detail-item">
                        <strong>Email:</strong> {selectedLead.email}
                      </div>
                    )}
                    {selectedLead.website && (
                      <div className="detail-item">
                        <strong>Website:</strong> 
                        <a href={selectedLead.website} target="_blank" rel="noopener noreferrer">
                          {selectedLead.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Location & Service</h4>
                  <div className="detail-grid">
                    {selectedLead.address && (
                      <div className="detail-item">
                        <strong>Address:</strong> {selectedLead.address}
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>City:</strong> {selectedLead.city}
                    </div>
                    <div className="detail-item">
                      <strong>State:</strong> {selectedLead.state}
                    </div>
                    <div className="detail-item">
                      <strong>Service Type:</strong> {selectedLead.service_type}
                    </div>
                  </div>
                </div>

                {selectedLead.created_at && (
                  <div className="detail-section">
                    <h4>Lead Information</h4>
                    <div className="detail-item">
                      <strong>Added:</strong> {new Date(selectedLead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadsModal
