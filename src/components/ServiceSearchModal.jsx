import { useState, useEffect } from 'react'
import { X, Search, Loader, AlertCircle, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp, Bot } from 'lucide-react'
import ApifyService from '../services/apify'
import { supabase } from '../lib/supabase'
import { filterServiceBusinesses } from '../utils/leadFiltering'
import * as OpenAIFilter from '../services/aiLeadFilterOpenAI'
import * as SupabaseAIFilter from '../services/aiLeadFilterSupabase'
import './ServiceSearchModal.css'

function ServiceSearchModal({ 
  isOpen, 
  onClose, 
  selectedMarket, 
  selectedServices,
  onSearchComplete 
}) {
  const [searchConfig, setSearchConfig] = useState({
    maxResults: 200,
    searchRadius: 50, // km
    includeClosedBusinesses: false,
    minRating: 0,
    onlyVerified: false,
    useAiFiltering: true // Default to AI filtering enabled
  })
  
  const [activeSearches, setActiveSearches] = useState([])
  const [completedSearches, setCompletedSearches] = useState([])
  const [error, setError] = useState('')
  const [apifyToken, setApifyToken] = useState(import.meta.env.VITE_APIFY_API_TOKEN || '')
  const [isSearching, setIsSearching] = useState(false)
  const [showQueryDetails, setShowQueryDetails] = useState(false)
  const [disabledQueries, setDisabledQueries] = useState({})
  
  // Load Apify token from localStorage or env
  useEffect(() => {
    // First check environment variable
    if (import.meta.env.VITE_APIFY_API_TOKEN) {
      setApifyToken(import.meta.env.VITE_APIFY_API_TOKEN)
    } else {
      // Fall back to localStorage
      const savedToken = localStorage.getItem('apifyToken')
      if (savedToken) {
        setApifyToken(savedToken)
      }
    }
  }, [])
  
  // Service name to Google Maps search query mapping (now returns array)
  const getSearchQueries = (serviceName, city, state) => {
    const searchQueries = {
      'Deck Builders': [
        'deck contractors',        // Broadest category
        'deck builder',            // Common business name
        'deck construction',       // Service-specific
        'patio deck',             // Combined services
        'deck company'            // Business identifier
      ],
      'Concrete Contractors': [
        'concrete contractors',    // Broadest category
        'concrete',               // Catches all concrete businesses
        'concrete driveway',      // Specific high-volume service
        'concrete patio',         // Another specific service
        'ready mix concrete'      // Commercial suppliers
      ],
      'Window & Door': [
        'window door contractors', // Broadest combined search
        'windows doors',          // Catches all related businesses
        'window replacement',     // High-volume service
        'window company',         // Business identifier
        'door installation'       // Specific service
      ],
      'Roofing Contractors': [
        'roofing contractors',     // Broadest category
        'roofing',                // Catches all roofing businesses
        'roof repair',            // Common service search
        'commercial roofing',     // B2B specialists
        'residential roofing'     // B2C specialists
      ],
      'Tree Services': [
        'tree services',          // Plural catches more
        'tree',                   // Broadest search
        'tree removal',           // Most common service
        'tree company',           // Business identifier
        'arborist'                // Professional designation
      ],
      'Solar Installers': [
        'solar contractors',      // Broadest category
        'solar',                  // Catches all solar businesses
        'solar panel',            // Common search
        'solar installation',     // Service-specific
        'solar company'           // Business identifier
      ],
      'Fence Contractors': [
        'fence contractors',      // Broadest category
        'fencing',                // Catches all fence businesses
        'fence company',          // Business identifier
        'fence installation',     // Service-specific
        'chain link fence'        // Specific fence type
      ],
      'Pool Builders': [
        'pool contractors',       // Broadest category
        'swimming pool',          // Catches all pool businesses
        'pool builder',           // Common business type
        'pool service',           // Includes maintenance companies
        'pool company'            // Generic business identifier
      ],
      'Turf Installers': [
        'artificial turf',        // Broadest product search
        'synthetic grass',        // Alternative name
        'turf installation',      // Service-specific
        'artificial grass contractors', // Professional category
        'turf company'            // Business identifier
      ],
      'Kitchen Remodeling': [
        'kitchen remodeling',     // Most common search
        'kitchen contractors',    // Professional category
        'kitchen cabinets',       // Related product/service
        'kitchen renovation',     // Alternative term
        'kitchen company'         // Business identifier
      ],
      'Bathroom Remodeling': [
        'bathroom remodeling',    // Most common search
        'bathroom contractors',   // Professional category
        'bath remodel',           // Shortened version
        'bathroom renovation',    // Alternative term
        'shower installation'     // Specific service
      ],
      'Whole Home Remodel': [
        'general contractors',    // Broadest category
        'home remodeling',        // Service-specific
        'remodeling contractors', // Professional category
        'construction company',   // Business type
        'home renovation'         // Alternative term
      ],
      'Home Addition': [
        'home addition',          // Broadest search
        'room addition',          // Specific type
        'addition contractors',   // Professional category
        'home expansion',         // Alternative term
        'construction company'    // General category
      ],
      'Exterior Contractors': [
        'siding contractors',     // Most specific category
        'siding',                 // Broadest product search
        'exterior remodeling',    // Service category
        'vinyl siding',           // Popular material
        'exterior contractors'    // Professional category
      ],
      'Hardscape Contractors': [
        'hardscape contractors',  // Professional category
        'patio builders',         // Common service
        'pavers',                 // Product search
        'retaining wall',         // Specific service
        'hardscaping'             // Service term
      ],
      'Landscaping Design': [
        'landscaping',            // Broadest search
        'landscaper',             // Most common business name
        'landscape contractors',  // Professional category
        'lawn care',              // Related service
        'landscape company'       // Business identifier
      ],
      'Outdoor Kitchen': [
        'outdoor kitchen',        // Broadest search
        'outdoor kitchen contractors', // Professional category
        'BBQ island',             // Specific feature
        'outdoor cooking',        // General category
        'outdoor kitchen builder' // Business type
      ],
      'Painting Companies': [
        'painting contractors',    // Broadest category
        'painters',               // Most common search
        'painting',               // Catches all painting businesses
        'commercial painting',    // B2B specialists
        'residential painting'    // B2C specialists
      ],
      'Smart Home': [
        'home automation company',     // Business identifier
        'smart home installer',        // Service provider
        'home automation systems',     // System-focused search
        'smart lighting installation', // Specific service
        'home theater installer'       // Related high-end service
      ],
      'Epoxy Flooring': [
        'epoxy flooring',         // Main service term
        'garage floor coating',   // Most common application
        'epoxy contractors',      // Professional category
        'floor coating',          // Broader category
        'concrete coating'        // Related service
      ],
      'Garage Door Services': [
        'garage door',            // Broadest search
        'garage door repair',     // Most common service
        'garage door company',    // Business identifier
        'overhead door',          // Alternative term
        'garage door installation' // Specific service
      ],
      'Cabinet Makers': [
        'cabinet makers',         // Professional category
        'custom cabinets',        // Popular service
        'kitchen cabinets',       // Specific type
        'cabinet company',        // Business identifier
        'cabinet installation'    // Service-specific
      ],
      'Tile & Stone': [
        'tile contractors',       // Professional category
        'tile',                   // Broadest product search
        'stone',                  // Alternative material
        'tile installation',      // Service-specific
        'granite countertops'     // Popular related service
      ],
      'Paving & Asphalt': [
        'paving contractors',     // Professional category
        'asphalt',                // Broadest material search
        'driveway paving',        // Most common service
        'paving company',         // Business identifier
        'sealcoating'             // Related service
      ],
      'Custom Home Builders': [
        'home builders',          // Broadest category
        'custom home builder',    // Specific type
        'construction company',   // General category
        'residential contractor', // Professional term
        'new home construction'   // Service-specific
      ],
      'Flooring Contractors': [
        'flooring contractors',    // Broadest category
        'flooring',               // Catches all flooring businesses
        'floor installation',     // Service-specific
        'carpet',                 // Specific flooring type
        'hardwood floors'         // Another specific type
      ],
      // Emerging services
      'EV Charging Installation': [
        'EV charging',            // Broadest search
        'electric vehicle charger', // Full term
        'EV charger installation', // Service-specific
        'Tesla charger',          // Popular brand
        'electrical contractor'   // General category
      ],
      'Artificial Turf Installation': [
        'artificial turf',        // Broadest product search
        'synthetic grass',        // Alternative name
        'turf installation',      // Service-specific
        'artificial grass contractors', // Professional category
        'turf company'            // Business identifier
      ],
      'Smart Home Installation': [
        'home automation installers',  // Most specific to service
        'smart home integrators',      // Professional category
        'Control4 dealer',             // Popular brand installers
        'Savant dealer',               // Another major brand
        'home theater installation'    // Often combined service
      ],
      'Outdoor Living Structures': [
        'pergola',                // Most common structure
        'gazebo',                 // Alternative structure
        'outdoor structures',     // Broad category
        'patio cover',            // Popular related
        'pergola builders'        // Professional category
      ],
      'Custom Lighting Design': [
        'lighting contractors',   // Professional category
        'landscape lighting',     // Popular service
        'outdoor lighting',       // Alternative term
        'lighting installation',  // Service-specific
        'electrical contractor'   // General category
      ],
      'Water Features Installation': [
        'water features',         // Broadest search
        'pond',                   // Popular feature
        'fountain',               // Alternative feature
        'waterfall',              // Another feature
        'landscape contractor'    // General category
      ],
      'Outdoor Kitchen Installation': [
        'outdoor kitchen',        // Broadest search
        'outdoor kitchen contractors', // Professional category
        'BBQ island',             // Specific feature
        'outdoor cooking',        // General category
        'outdoor kitchen builder' // Business type
      ],
      'Palapa/Tropical Structures': [
        'palapa',                 // Main structure type
        'tiki hut',               // Alternative name
        'thatch roof',            // Feature search
        'tropical structures',    // Category
        'shade structure'         // General category
      ]
    }
    
    const queries = searchQueries[serviceName] || [serviceName.toLowerCase()]
    // Return array of full search queries for this service
    // Use "in" instead of "near" for more precise city-specific results
    return queries.map(q => `${q} in ${city}, ${state}`)
  }
  
  const startSearch = async () => {
    if (!apifyToken) {
      setError('Please enter your Apify API token')
      return
    }
    
    if (!selectedMarket) {
      setError('Please select a market first')
      return
    }
    
    // Check authentication before starting
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      setError('Authentication error - please refresh the page and sign in again')
      console.error('Session error:', sessionError)
      return
    }
    
    setIsSearching(true)
    setError('')
    localStorage.setItem('apifyToken', apifyToken)
    
    const apifyService = new ApifyService(apifyToken)
    const searchQueue = [...selectedServices]
    
    // Process searches sequentially
    for (const serviceName of searchQueue) {
      try {
        // Create search configuration with multiple queries
        const allQueries = getSearchQueries(serviceName, selectedMarket.name, selectedMarket.state)
        
        // Filter out disabled queries
        const searchQueries = allQueries.filter((query, index) => {
          const queryKey = `${serviceName}-${index}`
          return !disabledQueries[queryKey]
        })
        
        // Skip if all queries are disabled
        if (searchQueries.length === 0) {
          console.log(`All queries disabled for ${serviceName}, skipping...`)
          continue
        }
        
        const actorInput = {
          searchStringsArray: searchQueries, // Only enabled queries
          maxCrawledPlacesPerSearch: searchConfig.maxResults,
          searchRadius: searchConfig.searchRadius * 1000, // Convert km to meters
          language: 'en',
          exportPlaceUrls: true,
          saveHtml: false,
          saveScreenshots: false,
          includeWebResults: false
        }
        
        // Add to active searches
        const searchId = Date.now().toString()
        setActiveSearches(prev => [...prev, {
          id: searchId,
          service: serviceName,
          status: 'starting',
          progress: 0,
          startTime: new Date()
        }])
        
        // Start the actor run
        const runData = await apifyService.startActor('nwua9Gu5YrADL7ZDj', actorInput)
        const runId = runData.data.id
        
        // Update search with run ID
        setActiveSearches(prev => prev.map(s => 
          s.id === searchId ? { ...s, runId, status: 'running' } : s
        ))
        
        // Monitor the run status
        await monitorRunStatus(apifyService, runId, searchId, serviceName)
        
      } catch (err) {
        console.error(`Error searching for ${serviceName}:`, err)
        setActiveSearches(prev => prev.map(s => 
          s.service === serviceName ? { ...s, status: 'failed', error: err.message } : s
        ))
      }
    }
    
    setIsSearching(false)
  }
  
  const monitorRunStatus = async (apifyService, runId, searchId, serviceName) => {
    const pollInterval = 5000 // 5 seconds
    let attempts = 0
    const maxAttempts = 120 // 10 minutes max
    
    while (attempts < maxAttempts) {
      try {
        const runDetails = await apifyService.getRunDetails(runId)
        const status = runDetails.data.status
        const stats = runDetails.data.stats
        
        // Update progress
        setActiveSearches(prev => prev.map(s => 
          s.id === searchId ? {
            ...s,
            status: status.toLowerCase(),
            progress: stats?.itemCount || 0,
            datasetId: runDetails.data.defaultDatasetId
          } : s
        ))
        
        if (status === 'SUCCEEDED') {
          // Import the results
          await importSearchResults(
            apifyService,
            runDetails.data.defaultDatasetId,
            serviceName,
            searchId
          )
          break
        } else if (status === 'FAILED' || status === 'ABORTED') {
          throw new Error(`Run ${status.toLowerCase()}`)
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        attempts++
        
      } catch (err) {
        console.error('Error monitoring run:', err)
        setActiveSearches(prev => prev.map(s => 
          s.id === searchId ? { ...s, status: 'failed', error: err.message } : s
        ))
        break
      }
    }
  }
  
  const importSearchResults = async (apifyService, datasetId, serviceName, searchId) => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Authentication error:', authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      if (!user) {
        console.error('No user session found')
        throw new Error('No authenticated user - please sign in again')
      }
      console.log('Authenticated user:', user.id)
      
      // Fetch dataset items
      const items = await apifyService.getDatasetItems(datasetId)
      console.log('Fetched items from Apify:', items.length)
      
      // Transform to our lead format
      const leads = apifyService.transformToLeads(items, serviceName)
      console.log('Transformed leads:', leads.length)
      console.log('Sample transformed lead:', leads[0])
      
      // Log first 5 leads to see what cities we're getting
      console.log('First 5 leads from Apify:', leads.slice(0, 5).map(l => ({
        city: l.city,
        state: l.state,
        address: l.address
      })))
      
      // Log all unique cities found
      const uniqueCities = [...new Set(leads.map(l => `${l.city}, ${l.state}`))];
      console.log('All unique cities found in search results:', uniqueCities)
      
      // Apply filtering to exclude non-service businesses
      let marketLeads = leads
      let excludedBusinesses = []
      
      if (searchConfig.useAiFiltering && import.meta.env.VITE_OPENAI_API_KEY) {
        // Use AI filtering
        console.log('Using AI filtering for', leads.length, 'leads')
        
        // Update search status to show AI filtering
        setActiveSearches(prev => prev.map(s => 
          s.id === searchId ? { 
            ...s, 
            status: 'importing',
            details: `AI filtering ${leads.length} businesses...`
          } : s
        ))
        
        const includedLeads = []
        const aiExcludedBusinesses = []
        
        // Process in batches
        const batchSize = 10
        for (let i = 0; i < leads.length; i += batchSize) {
          const batch = leads.slice(i, i + batchSize)
          
          // Update progress
          setActiveSearches(prev => prev.map(s => 
            s.id === searchId ? { 
              ...s, 
              details: `AI filtering: ${Math.min(i + batchSize, leads.length)}/${leads.length} businesses...`
            } : s
          ))
          
          try {
            // Transform leads to AI format
            const businesses = batch.map(lead => ({
              name: lead.name,
              category: lead.category || '',
              address: lead.address || ''
            }))
            
            // Classify batch using Supabase Edge Function (avoids CORS issues)
            const results = await SupabaseAIFilter.classifyBusinessBatch(
              businesses,
              serviceName
            )
            
            // Process results
            results.forEach((result, index) => {
              const originalLead = batch[index]
              if (result.isServiceProvider) {
                includedLeads.push(originalLead)
              } else {
                aiExcludedBusinesses.push({
                  ...originalLead,
                  aiReason: result.reason,
                  confidence: result.confidence
                })
              }
            })
          } catch (aiError) {
            console.error('AI filtering error, falling back to rule-based:', aiError)
            // Fall back to rule-based filtering for this batch
            const { filteredLeads, excludedBusinesses: ruleExcluded } = filterServiceBusinesses(batch, serviceName)
            includedLeads.push(...filteredLeads)
            aiExcludedBusinesses.push(...ruleExcluded)
          }
        }
        
        marketLeads = includedLeads
        excludedBusinesses = aiExcludedBusinesses
        
        console.log('AI filtering complete:', {
          total: leads.length,
          included: marketLeads.length,
          excluded: excludedBusinesses.length
        })
        
        // Log AI filtering metrics
        if (supabase && user?.id) {
          const startTime = Date.now()
          try {
            await supabase
              .from('ai_filtering_logs')
              .insert({
                user_id: user.id,
                service_type: serviceName,
                market_name: `${selectedMarket.name}, ${selectedMarket.state}`,
                total_processed: leads.length,
                total_filtered: excludedBusinesses.length,
                model_used: import.meta.env.VITE_USE_GPT4_FILTERING === 'true' ? 'gpt-4' : 'gpt-3.5-turbo',
                processing_time_ms: Date.now() - startTime
              })
          } catch (logError) {
            console.error('Error logging AI metrics:', logError)
          }
        }
      } else {
        // Use rule-based filtering
        const filterResult = filterServiceBusinesses(leads, serviceName)
        marketLeads = filterResult.filteredLeads
        excludedBusinesses = filterResult.excludedBusinesses
        console.log('Rule-based filtering:', leads.length, '→', marketLeads.length)
      }
      
      console.log('Total leads after filtering:', marketLeads.length, 'for market search in', selectedMarket.name, selectedMarket.state)
      
      // Check for duplicates and insert
      let importedCount = 0
      let skippedCount = 0
      let excludedCount = excludedBusinesses.length
      
      if (marketLeads.length > 0) {
        // Check for existing leads by phone, company name, and Google Maps URL
        const phones = marketLeads.map(lead => lead.phone).filter(Boolean)
        const companyNames = marketLeads.map(lead => lead.name).filter(Boolean)
        const googleMapsUrls = marketLeads.map(lead => lead.googleMapsUrl).filter(Boolean)
        
        let existingLeads = []
        if (phones.length > 0) {
          const { data: phoneMatches } = await supabase
            .from('leads')
            .select('phone, company_name, google_maps_url')
            .in('phone', phones)
          
          if (phoneMatches) existingLeads = [...existingLeads, ...phoneMatches]
        }
        
        if (companyNames.length > 0) {
          const { data: nameMatches } = await supabase
            .from('leads')
            .select('phone, company_name, google_maps_url')
            .in('company_name', companyNames)
          
          if (nameMatches) existingLeads = [...existingLeads, ...nameMatches]
        }
        
        if (googleMapsUrls.length > 0) {
          const { data: urlMatches } = await supabase
            .from('leads')
            .select('phone, company_name, google_maps_url')
            .in('google_maps_url', googleMapsUrls)
          
          if (urlMatches) existingLeads = [...existingLeads, ...urlMatches]
        }
        
        // Create sets for quick lookup
        const existingPhones = new Set(existingLeads.map(l => l.phone).filter(Boolean))
        const existingNames = new Set(existingLeads.map(l => l.company_name).filter(Boolean))
        const existingUrls = new Set(existingLeads.map(l => l.google_maps_url).filter(Boolean))
        
        // Filter out duplicates
        const newLeads = marketLeads.filter(lead => {
          if (lead.phone && existingPhones.has(lead.phone)) {
            skippedCount++
            return false
          }
          if (lead.name && existingNames.has(lead.name)) {
            skippedCount++
            return false
          }
          return true
        })
        
        // Insert new leads
        if (newLeads.length > 0) {
          console.log('Attempting to insert', newLeads.length, 'new leads')
          // Try to get market_id if we have one
          let marketId = null
          if (selectedMarket.id && selectedMarket.id !== `temp-${selectedMarket.name}-${selectedMarket.state}`) {
            marketId = selectedMarket.id
          }
          
          // IMPORTANT: All leads from a market search are assigned to the searched market,
          // regardless of their actual location. This ensures proper coverage tracking.
          
          const { data, error } = await supabase
            .from('leads')
            .insert(newLeads.map(lead => ({
              user_id: user.id,
              market_id: marketId, // Include market_id if available
              company_name: lead.name,
              address: lead.address,
              full_address: lead.address, // Using same as address
              city: selectedMarket.name,  // Always use the searched market's city
              state: selectedMarket.state, // Always use the searched market's state (already abbreviated)
              phone: lead.phone,
              website: lead.website,
              rating: lead.rating,
              review_count: lead.reviews,
              service_type: serviceName,
              facebook_url: lead.facebook,
              instagram_url: lead.instagram,
              google_maps_url: lead.googleMapsUrl,
              lead_source: 'Google Maps',
              search_query: serviceName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })))
            .select()
          
          if (error) {
            console.error('Database insert error:', error)
            console.error('Sample lead data:', newLeads[0])
            throw error
          }
          
          importedCount = data.length
        }
      }
      
      // Mark search as completed
      const completedSearch = {
        id: searchId,
        service: serviceName,
        status: 'completed',
        importedCount,
        skippedCount,
        excludedCount,
        totalFound: leads.length,
        totalAfterFiltering: marketLeads.length,
        completedTime: new Date()
      }
      
      setActiveSearches(prev => prev.filter(s => s.id !== searchId))
      setCompletedSearches(prev => [...prev, completedSearch])
      
    } catch (err) {
      console.error('Error importing results:', err)
      setActiveSearches(prev => prev.map(s => 
        s.id === searchId ? { ...s, status: 'failed', error: 'Import failed' } : s
      ))
    }
  }
  
  const getTotalProgress = () => {
    const total = selectedServices.length
    const completed = completedSearches.length
    const failed = activeSearches.filter(s => s.status === 'failed').length
    const done = completed + failed
    
    return {
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
      completed,
      failed,
      total
    }
  }
  
  const toggleQueryEnabled = (serviceName, queryIndex) => {
    const queryKey = `${serviceName}-${queryIndex}`
    setDisabledQueries(prev => ({
      ...prev,
      [queryKey]: !prev[queryKey]
    }))
  }
  
  const getEnabledQueryCount = (serviceName) => {
    const allQueries = getSearchQueries(serviceName, selectedMarket?.name || '', selectedMarket?.state || '')
    return allQueries.filter((_, index) => {
      const queryKey = `${serviceName}-${index}`
      return !disabledQueries[queryKey]
    }).length
  }
  
  // Reset disabled queries when modal opens with new services
  useEffect(() => {
    if (isOpen) {
      setDisabledQueries({})
    }
  }, [isOpen, selectedServices])
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content service-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Search for Leads</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Search Configuration */}
          <div className="search-config-section">
            <h3>Search Configuration</h3>
            
            <div className="config-grid">
              <div className="config-item">
                <label>Market</label>
                <div className="market-info">
                  <MapPin size={16} />
                  <span>{selectedMarket?.name}, {selectedMarket?.state}</span>
                </div>
              </div>
              
              <div className="config-item">
                <label>Services to Search</label>
                <div className="services-list">
                  {selectedServices.map(service => (
                    <div key={service} className="service-item">
                      <span className="service-tag">{service}</span>
                      <small className="query-count">
                        {getEnabledQueryCount(service)} of {getSearchQueries(service, selectedMarket?.name || '', selectedMarket?.state || '').length} queries
                      </small>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="config-item">
                <label>Max Results per Service</label>
                <input
                  type="number"
                  value={searchConfig.maxResults}
                  onChange={(e) => setSearchConfig({
                    ...searchConfig,
                    maxResults: parseInt(e.target.value)
                  })}
                  min="10"
                  max="500"
                  className="form-input"
                />
              </div>
              
              <div className="config-item">
                <label>Search Radius (km)</label>
                <input
                  type="number"
                  value={searchConfig.searchRadius}
                  onChange={(e) => setSearchConfig({
                    ...searchConfig,
                    searchRadius: parseInt(e.target.value)
                  })}
                  min="1"
                  max="100"
                  className="form-input"
                />
              </div>
              
              {/* AI Filtering Toggle */}
              <div className="config-item">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={searchConfig.useAiFiltering}
                    onChange={(e) => setSearchConfig({
                      ...searchConfig,
                      useAiFiltering: e.target.checked
                    })}
                    style={{ marginRight: '8px' }}
                  />
                  <Bot size={18} style={{ marginRight: '6px', color: '#3b82f6' }} />
                  <span style={{ fontWeight: '500' }}>Use AI Filtering</span>
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '12px', 
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    Recommended
                  </span>
                </label>
                <small style={{ display: 'block', marginTop: '4px', color: '#6b7280' }}>
                  {searchConfig.useAiFiltering ? (
                    <>
                      AI will filter non-service businesses • ~$0.17 per 1,000 leads
                      {!import.meta.env.VITE_OPENAI_API_KEY && (
                        <span style={{ display: 'block', color: '#ef4444', marginTop: '4px' }}>
                          ⚠️ OpenAI API key not found - will use rule-based filtering
                        </span>
                      )}
                    </>
                  ) : (
                    'Using rule-based filtering (may include some non-service businesses)'
                  )}
                </small>
              </div>
            </div>
            
            {/* Query Details Section */}
            <div className="query-details-section">
              <button 
                className="query-details-toggle"
                onClick={() => setShowQueryDetails(!showQueryDetails)}
              >
                <span>View Search Queries ({selectedServices.reduce((total, service) => 
                  total + getEnabledQueryCount(service), 0
                )} of {selectedServices.reduce((total, service) => 
                  total + getSearchQueries(service, selectedMarket?.name || '', selectedMarket?.state || '').length, 0
                )} enabled)</span>
                {showQueryDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {showQueryDetails && (
                <div className="query-details-content">
                  {selectedServices.map(service => (
                    <div key={service} className="service-queries">
                      <h4>{service}</h4>
                      <ul>
                        {getSearchQueries(service, selectedMarket?.name || '', selectedMarket?.state || '').map((query, idx) => {
                          const queryKey = `${service}-${idx}`
                          const isDisabled = disabledQueries[queryKey]
                          return (
                            <li key={idx} className={`query-item ${isDisabled ? 'disabled' : ''}`}>
                              <label>
                                <input 
                                  type="checkbox"
                                  checked={!isDisabled}
                                  onChange={() => toggleQueryEnabled(service, idx)}
                                />
                                <span>{query}</span>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {!import.meta.env.VITE_APIFY_API_TOKEN && (
              <div className="form-group">
                <label>Apify API Token</label>
                <input
                  type="password"
                  placeholder="Enter your Apify API token"
                  value={apifyToken}
                  onChange={(e) => setApifyToken(e.target.value)}
                  className="form-input"
                />
                <small>Your token is saved locally for future searches</small>
              </div>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          {/* Search Progress */}
          {(activeSearches.length > 0 || completedSearches.length > 0) && (
            <div className="search-progress-section">
              <h3>Search Progress</h3>
              
              <div className="overall-progress">
                <div className="progress-stats">
                  <span>{getTotalProgress().completed} completed</span>
                  <span>{getTotalProgress().failed} failed</span>
                  <span>{getTotalProgress().total} total</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getTotalProgress().percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="searches-list">
                {/* Active Searches */}
                {activeSearches.map(search => (
                  <div key={search.id} className={`search-item ${search.status}`}>
                    <div className="search-header">
                      <span className="search-service">{search.service}</span>
                      <span className="search-status">
                        {search.status === 'running' && (
                          <>
                            <Loader size={14} className="spinner" />
                            Running...
                          </>
                        )}
                        {search.status === 'importing' && (
                          <>
                            <Loader size={14} className="spinner" />
                            Importing...
                          </>
                        )}
                        {search.status === 'failed' && (
                          <>
                            <AlertCircle size={14} />
                            Failed
                          </>
                        )}
                      </span>
                    </div>
                    {search.progress > 0 && (
                      <div className="search-progress">
                        <span>{search.progress} businesses found</span>
                      </div>
                    )}
                    {search.details && (
                      <div className="search-details" style={{ 
                        fontSize: '13px', 
                        color: '#3b82f6',
                        marginTop: '4px'
                      }}>
                        <Bot size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {search.details}
                      </div>
                    )}
                    {search.error && (
                      <div className="search-error">{search.error}</div>
                    )}
                  </div>
                ))}
                
                {/* Completed Searches */}
                {completedSearches.map(search => (
                  <div key={search.id} className="search-item completed">
                    <div className="search-header">
                      <span className="search-service">{search.service}</span>
                      <span className="search-status">
                        <CheckCircle size={14} />
                        Completed
                      </span>
                    </div>
                    <div className="search-results">
                      <span>{search.importedCount} imported</span>
                      {search.skippedCount > 0 && (
                        <span>{search.skippedCount} duplicates skipped</span>
                      )}
                      {search.excludedCount > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Bot size={12} style={{ color: '#3b82f6' }} />
                          {search.excludedCount} non-services excluded
                        </span>
                      )}
                      <span>{search.totalFound} total found</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-tertiary" onClick={onClose}>
            {completedSearches.length > 0 ? 'Close' : 'Cancel'}
          </button>
          {completedSearches.length === 0 && (
            <button 
              className="btn btn-primary"
              onClick={startSearch}
              disabled={isSearching || !apifyToken || selectedServices.length === 0}
            >
              {isSearching ? (
                <>
                  <Loader size={16} className="spinner" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Start Search
                </>
              )}
            </button>
          )}
          {completedSearches.length > 0 && onSearchComplete && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                onSearchComplete()
                onClose()
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceSearchModal