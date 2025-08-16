import { useState } from 'react'
import { X, Upload, Database, Calendar, AlertCircle, Loader } from 'lucide-react'
import ApifyService from '../services/apify'
import { supabase } from '../lib/supabase'
import { filterServiceBusinesses } from '../utils/leadFiltering'
import { globalToast } from '../hooks/useToast'
import './ImportModal.css'

function ImportModal({ isOpen, onClose, selectedMarket, onImportComplete }) {
  const [activeTab, setActiveTab] = useState('manual')
  const [selectedRuns, setSelectedRuns] = useState([])
  const toast = globalToast
  const [apifyToken, setApifyToken] = useState(import.meta.env.VITE_APIFY_API_TOKEN || '')
  const [manualRunId, setManualRunId] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingRuns, setFetchingRuns] = useState(false)
  const [apifyRuns, setApifyRuns] = useState([])
  const [error, setError] = useState('')
  const [serviceType, setServiceType] = useState('')
  
  // Progress tracking for manual imports
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    phase: '', // 'fetching', 'filtering', 'checking', 'importing'
    message: ''
  })

  // Import statistics
  const [importStats, setImportStats] = useState({
    totalFound: 0,
    filtered: 0,
    duplicates: 0,
    imported: 0
  })

  // Fetch runs from Apify
  const fetchApifyRuns = async () => {
    if (!apifyToken) {
      setError('Apify API token not found. Please add VITE_APIFY_API_TOKEN to your .env file')
      return
    }

    setFetchingRuns(true)
    setError('')
    
    try {
      const apifyService = new ApifyService(apifyToken)
      const runsData = await apifyService.getAllRuns({ limit: 20 })
      
      // Transform the runs data to our format
      const transformedRuns = runsData.data.items.map(run => ({
        id: run.id,
        name: run.actInput?.searchStringsArray?.[0] || run.actorName || 'Unnamed Run',
        date: new Date(run.startedAt).toLocaleDateString(),
        status: run.status,
        items: run.stats?.itemCount || 0,
        dataset: run.defaultDatasetId
      }))
      
      setApifyRuns(transformedRuns)
    } catch (err) {
      console.error('Error fetching Apify runs:', err)
      const errorMsg = 'Failed to fetch runs. Please check your API token.'
      setError(errorMsg)
      toast.error(errorMsg, 8000)
    } finally {
      setFetchingRuns(false)
    }
  }

  // Fetch data from a specific run ID
  const fetchRunData = async (runId) => {
    try {
      const apifyService = new ApifyService(apifyToken)
      const runDetails = await apifyService.getRunDetails(runId)
      
      if (!runDetails.data) {
        throw new Error('Run not found')
      }
      
      return {
        id: runDetails.data.id,
        name: runDetails.data.actInput?.searchStringsArray?.[0] || 'Manual Import',
        datasetId: runDetails.data.defaultDatasetId,
        itemCount: runDetails.data.stats?.itemCount || 0
      }
    } catch (err) {
      console.error('Error fetching run details:', err)
      throw err
    }
  }

  const handleImport = async () => {
    if (!selectedMarket) {
      const errorMsg = 'Please select a market from the sidebar first'
      setError(errorMsg)
      toast.error(errorMsg, 5000)
      return
    }
    
    if (!serviceType) {
      const errorMsg = 'Please select a service type'
      setError(errorMsg)
      toast.error(errorMsg, 5000)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }
      
      const apifyService = new ApifyService(apifyToken)
      
      // Determine which datasets to import
      let datasetsToImport = []
      
      if (manualRunId) {
        // Manual run ID entry
        const runData = await fetchRunData(manualRunId)
        datasetsToImport.push({
          datasetId: runData.datasetId,
          runName: runData.name
        })
      } else if (selectedRuns.length > 0) {
        // Selected runs from list
        const runs = apifyRuns.filter(run => selectedRuns.includes(run.id))
        datasetsToImport = runs.map(run => ({
          datasetId: run.dataset,
          runName: run.name
        }))
      } else {
        const errorMsg = 'Please select runs to import or enter a Run ID'
        setError(errorMsg)
        toast.error(errorMsg, 5000)
        setLoading(false)
        return
      }
      
      // Import leads from all selected datasets
      let totalImported = 0
      let totalSkipped = 0
      let totalExcluded = 0
      
      // Reset stats
      setImportStats({
        totalFound: 0,
        filtered: 0,
        duplicates: 0,
        imported: 0
      })
      
      for (const dataset of datasetsToImport) {
        try {
          // Update progress - fetching phase
          setImportProgress({
            current: 0,
            total: 0,
            phase: 'fetching',
            message: `Fetching dataset items from Apify...`
          })
          
          // Fetch dataset items
          const items = await apifyService.getDatasetItems(dataset.datasetId)
          
          // Update progress - transforming phase
          setImportProgress({
            current: 0,
            total: items.length,
            phase: 'transforming',
            message: `Processing ${items.length} items...`
          })
          
          // Transform to our lead format
          const leads = apifyService.transformToLeads(items, dataset.runName)
          
          // Update stats
          setImportStats(prev => ({
            ...prev,
            totalFound: prev.totalFound + leads.length
          }))
          
          // Update progress - filtering phase
          setImportProgress({
            current: 0,
            total: leads.length,
            phase: 'filtering',
            message: `Filtering out non-service businesses...`
          })
          
          // Apply filtering to exclude non-service businesses
          // Use the selected service type for proper filtering, fallback to runName if not selected
          const filterServiceType = serviceType || dataset.runName
          const { filteredLeads: marketLeads, excludedBusinesses } = filterServiceBusinesses(leads, filterServiceType)
          
          console.log('Total leads before filtering:', leads.length)
          console.log('Excluded non-service businesses:', excludedBusinesses.length)
          if (excludedBusinesses.length > 0) {
            console.log('Excluded businesses:', excludedBusinesses)
            // Show info toast about filtered businesses if significant number
            if (excludedBusinesses.length >= 5) {
              toast.info(`Filtered ${excludedBusinesses.length} non-service businesses during import`, 5000)
            }
          }
          console.log('Total leads after filtering:', marketLeads.length, 'for market search in', selectedMarket.name, selectedMarket.state)
          
          // Track excluded count
          totalExcluded += excludedBusinesses.length
          
          // Update stats
          setImportStats(prev => ({
            ...prev,
            filtered: prev.filtered + excludedBusinesses.length
          }))
          
          // Insert leads into database
          if (marketLeads.length > 0) {
            // Update progress - checking duplicates phase
            setImportProgress({
              current: 0,
              total: marketLeads.length,
              phase: 'checking',
              message: `Checking for duplicates among ${marketLeads.length} leads...`
            })
            
            // Check for existing leads to avoid duplicates
            const phones = marketLeads.map(lead => lead.phone).filter(Boolean)
            
            // Get existing leads by phone or company name
            let existingLeads = []
            const companyNames = marketLeads.map(lead => lead.name).filter(Boolean)
            
            if (phones.length > 0) {
              const { data: phoneMatches } = await supabase
                .from('leads')
                .select('phone, company_name')
                .in('phone', phones)
              
              if (phoneMatches) existingLeads = [...existingLeads, ...phoneMatches]
            }
            
            if (companyNames.length > 0) {
              const { data: nameMatches } = await supabase
                .from('leads')
                .select('phone, company_name')
                .in('company_name', companyNames)
              
              if (nameMatches) existingLeads = [...existingLeads, ...nameMatches]
            }
            
            // Create sets for quick lookup
            const existingPhones = new Set(existingLeads.map(l => l.phone).filter(Boolean))
            const existingNames = new Set(existingLeads.map(l => l.company_name).filter(Boolean))
            
            // Filter out duplicates
            const newLeads = marketLeads.filter(lead => {
              // Skip if phone already exists
              if (lead.phone && existingPhones.has(lead.phone)) {
                console.log(`Skipping duplicate: ${lead.name} (phone: ${lead.phone})`)
                return false
              }
              
              // Skip if company name already exists
              if (lead.name && existingNames.has(lead.name)) {
                console.log(`Skipping duplicate: ${lead.name}`)
                return false
              }
              
              return true
            })
            
            const duplicateCount = marketLeads.length - newLeads.length
            
            // Update stats for duplicates
            setImportStats(prev => ({
              ...prev,
              duplicates: prev.duplicates + duplicateCount
            }))
            
            // Insert only new leads
            if (newLeads.length > 0) {
              // Update progress - importing phase
              setImportProgress({
                current: 0,
                total: newLeads.length,
                phase: 'importing',
                message: `Importing ${newLeads.length} new leads to database...`
              })
              
              // Try to get market_id if we have one
              let marketId = null
              if (selectedMarket.id && selectedMarket.id !== `temp-${selectedMarket.name}-${selectedMarket.state}`) {
                marketId = selectedMarket.id
              }
              
              const { data, error } = await supabase
                .from('leads')
                .insert(newLeads.map(lead => ({
                  user_id: user.id,
                  market_id: marketId, // Include market_id if available
                  company_name: lead.name,
                  address: lead.address,
                  full_address: lead.address, // Using same as address
                  city: selectedMarket.name,
                  state: selectedMarket.state,
                  phone: lead.phone,
                  website: lead.website,
                  rating: lead.rating,
                  review_count: lead.reviews,
                  service_type: serviceType || lead.category,
                  facebook_url: lead.facebook,
                  instagram_url: lead.instagram,
                  google_maps_url: lead.googleMapsUrl,
                  lead_source: 'Google Maps',
                  search_query: lead.category,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })))
                .select()
              
              if (error) {
                console.error('Database insert error:', error)
                console.error('Sample lead data:', newLeads[0])
                throw error
              }
              
              totalImported += data.length
              
              // Update stats
              setImportStats(prev => ({
                ...prev,
                imported: prev.imported + data.length
              }))
              
              // Log skipped duplicates
              const skippedCount = marketLeads.length - newLeads.length
              if (skippedCount > 0) {
                console.log(`Skipped ${skippedCount} duplicate leads`)
                totalSkipped += skippedCount
              }
            } else {
              console.log('All leads were duplicates, nothing to import')
              totalSkipped += marketLeads.length
            }
          }
        } catch (err) {
          console.error(`Error importing dataset ${dataset.datasetId}:`, err)
        }
      }
      
      // Success - Show detailed toast notification
      console.log(`Successfully imported ${totalImported} leads, skipped ${totalSkipped} duplicates`)
      
      // Build detailed success message
      let successMsg = `Successfully imported ${totalImported} leads`
      const details = []
      
      if (totalSkipped > 0) {
        details.push(`${totalSkipped} duplicates skipped`)
      }
      if (totalExcluded > 0) {
        details.push(`${totalExcluded} non-services filtered`)
      }
      
      // Show toast with main message and details
      if (totalImported > 0) {
        if (details.length > 0) {
          toast.success(`${successMsg} (${details.join(', ')})`, 15000) // Show for 15 seconds
        } else {
          toast.success(successMsg, 12000) // Show for 12 seconds
        }
      } else if (totalSkipped > 0 || totalExcluded > 0) {
        // No new leads imported but some were processed
        toast.warning(`No new leads imported. ${details.join(', ')}`, 12000) // Show for 12 seconds
      } else {
        // Nothing was imported at all
        toast.info('No leads found to import', 10000) // Show for 10 seconds
      }
      
      if (onImportComplete) {
        onImportComplete()
      }
      
      // Reset form
      setSelectedRuns([])
      setManualRunId('')
      setApifyRuns([])
      
      // Clear import stats
      setImportStats({
        totalFound: 0,
        filtered: 0,
        duplicates: 0,
        imported: 0
      })
      
      onClose()
    } catch (err) {
      console.error('Error during import:', err)
      const errorMessage = err.message || 'Failed to import leads. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage, 10000) // Show error for 10 seconds
    } finally {
      setLoading(false)
    }
  }

  const handleRunToggle = (runId) => {
    setSelectedRuns(prev => {
      if (prev.includes(runId)) {
        return prev.filter(id => id !== runId)
      }
      return [...prev, runId]
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Leads</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Database size={16} />
            Manual Import
          </button>
          <button 
            className={`tab ${activeTab === 'automatic' ? 'active' : ''}`}
            onClick={() => setActiveTab('automatic')}
          >
            <Upload size={16} />
            Automatic Sync
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'manual' ? (
            <div className="import-manual">
              <div className="import-section">
                <h3>Apify Configuration</h3>
                <p className="section-description">
                  Enter a run ID from your Apify console to import leads
                </p>
                
                <div className="alert-info" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                  <strong>Note:</strong> This import expects data from the Google Maps Scraper actor. 
                  Make sure your Apify runs are from compatible scrapers.
                </div>

                <div className="form-group">
                  <label>Run ID</label>
                  <input
                    type="text"
                    placeholder="e.g., 7MqPbQE5Kua5DXzaF"
                    value={manualRunId}
                    onChange={(e) => setManualRunId(e.target.value)}
                    className="form-input"
                  />
                  <small>Find the run ID in your Apify console</small>
                </div>
              </div>

              {error && (
                <div className="error-message" style={{ 
                  marginBottom: '16px', 
                  padding: '12px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  borderRadius: '8px',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={16} style={{ display: 'inline-block', marginRight: '8px' }} />
                  {error}
                </div>
              )}

              <div className="import-section">
                <h3>Target Market</h3>
                <p className="section-description">
                  Select which market to import the leads into
                </p>
                
                <div className="form-group">
                  <select 
                    className="form-input"
                    defaultValue={selectedMarket?.id || ''}
                    disabled={!selectedMarket}
                  >
                    <option value="">-- Select a market from sidebar --</option>
                    {selectedMarket && (
                      <option value={selectedMarket.id}>
                        {selectedMarket.name}, {selectedMarket.state}
                      </option>
                    )}
                  </select>
                  <small>
                    {selectedMarket 
                      ? `Leads will be imported to ${selectedMarket.name}, ${selectedMarket.state}`
                      : 'Please select a market from the sidebar first'
                    }
                  </small>
                </div>
              </div>

              <div className="import-section">
                <h3>Service Type</h3>
                <p className="section-description">
                  Select the service type for proper categorization and filtering
                </p>
                
                <div className="form-group">
                  <select 
                    className="form-input"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="">-- Select Service Type --</option>
                    <optgroup label="High Demand Services">
                      <option value="Painting Companies">Painting Companies</option>
                      <option value="Landscaping Design">Landscaping Design</option>
                      <option value="Solar Installers">Solar Installers</option>
                      <option value="Pool Builders">Pool Builders</option>
                      <option value="Outdoor Kitchen">Outdoor Kitchen</option>
                    </optgroup>
                    <optgroup label="Essential Services">
                      <option value="Concrete Contractors">Concrete Contractors</option>
                      <option value="Fence Contractors">Fence Contractors</option>
                      <option value="Window & Door">Window & Door</option>
                      <option value="Roofing Contractors">Roofing Contractors</option>
                      <option value="Tree Services">Tree Services</option>
                      <option value="Kitchen Remodeling">Kitchen Remodeling</option>
                      <option value="Bathroom Remodeling">Bathroom Remodeling</option>
                      <option value="Whole Home Remodel">Whole Home Remodel</option>
                      <option value="Home Addition">Home Addition</option>
                      <option value="Exterior Contractors">Exterior Contractors</option>
                      <option value="Hardscape Contractors">Hardscape Contractors</option>
                      <option value="Artificial Turf Installation">Artificial Turf Installation</option>
                      <option value="Water Features Installation">Water Features Installation</option>
                      <option value="EV Charging Installation">EV Charging Installation</option>
                    </optgroup>
                    <optgroup label="Specialty Services">
                      <option value="Deck Builders">Deck Builders</option>
                      <option value="Smart Home">Smart Home</option>
                      <option value="Epoxy Flooring">Epoxy Flooring</option>
                      <option value="Garage Door Services">Garage Door Services</option>
                      <option value="Cabinet Makers">Cabinet Makers</option>
                      <option value="Tile & Stone">Tile & Stone</option>
                      <option value="Paving & Asphalt">Paving & Asphalt</option>
                      <option value="Custom Home Builders">Custom Home Builders</option>
                      <option value="Flooring Contractors">Flooring Contractors</option>
                      <option value="Custom Lighting Design">Custom Lighting Design</option>
                      <option value="Outdoor Living Structures">Outdoor Living Structures</option>
                      <option value="Smart Home Installation">Smart Home Installation</option>
                      <option value="Palapa/Tropical Structures">Palapa/Tropical Structures</option>
                      <option value="Outdoor Kitchen Installation">Outdoor Kitchen Installation</option>
                    </optgroup>
                  </select>
                  <small>
                    This helps filter out non-service businesses like stores and galleries
                  </small>
                </div>
              </div>

            </div>
          ) : (
            <div className="import-automatic">
              <div className="import-section">
                <h3>Configure Automatic Sync</h3>
                <p className="section-description">
                  Set up automatic synchronization with your Apify actors
                </p>
                
                <div className="form-group">
                  <label htmlFor="apify-token">Apify API Token</label>
                  <input
                    id="apify-token"
                    type="password"
                    className="input"
                    placeholder="Enter your Apify API token"
                    value={apifyToken}
                    onChange={(e) => setApifyToken(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="actor-id">Actor ID</label>
                  <input
                    id="actor-id"
                    type="text"
                    className="input"
                    placeholder="e.g., apify/google-maps-scraper"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="schedule">Sync Schedule</label>
                  <select id="schedule" className="input">
                    <option>Every hour</option>
                    <option>Every 6 hours</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                </div>

                <div className="sync-info">
                  <AlertCircle size={16} />
                  <span>Automatic sync will run in the background and update your leads database</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-tertiary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleImport}
            disabled={loading || (activeTab === 'manual' && selectedRuns.length === 0 && !manualRunId) || !selectedMarket}
          >
            {loading ? (
              <>
                <Loader size={16} className="spinner" style={{ marginRight: '8px' }} />
                Importing...
              </>
            ) : (
              'Import Leads'
            )}
          </button>
        </div>
        
        {/* Progress Indicator */}
        {loading && importProgress.phase && (
          <div className="import-progress" style={{
            position: 'absolute',
            bottom: '90px',
            left: '24px',
            right: '24px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#3b82f6', fontWeight: '500' }}>
                {importProgress.message}
              </span>
              {importProgress.total > 0 && (
                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                  {importProgress.current} / {importProgress.total}
                </span>
              )}
            </div>
            
            {/* Progress bar */}
            {importProgress.total > 0 && (
              <div style={{
                width: '100%',
                height: '4px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                  height: '100%',
                  background: '#3b82f6',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            )}
            
            {/* Stats summary */}
            <div style={{ 
              marginTop: '12px', 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ color: '#6b7280' }}>Found: </span>
                <span style={{ fontWeight: '500' }}>{importStats.totalFound}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Filtered: </span>
                <span style={{ fontWeight: '500', color: '#ef4444' }}>{importStats.filtered}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Duplicates: </span>
                <span style={{ fontWeight: '500', color: '#f59e0b' }}>{importStats.duplicates}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Imported: </span>
                <span style={{ fontWeight: '500', color: '#10b981' }}>{importStats.imported}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportModal
