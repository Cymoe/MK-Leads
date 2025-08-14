import { useState } from 'react'
import { X, Upload, Database, Calendar, AlertCircle } from 'lucide-react'
import './ImportModal.css'

function ImportModal({ isOpen, onClose, selectedMarket, onImportComplete }) {
  const [activeTab, setActiveTab] = useState('manual')
  const [selectedRuns, setSelectedRuns] = useState([])
  const [apifyToken, setApifyToken] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock Apify runs data
  const mockApifyRuns = [
    {
      id: 'run_1',
      name: 'Fort Collins Painters',
      date: '2024-01-15',
      status: 'SUCCEEDED',
      items: 145,
      dataset: 'dataset_abc123'
    },
    {
      id: 'run_2',
      name: 'Boulder Deck Builders',
      date: '2024-01-14',
      status: 'SUCCEEDED',
      items: 89,
      dataset: 'dataset_def456'
    },
    {
      id: 'run_3',
      name: 'Denver Turf Installers',
      date: '2024-01-13',
      status: 'SUCCEEDED',
      items: 234,
      dataset: 'dataset_ghi789'
    }
  ]

  const handleImport = async () => {
    setLoading(true)
    // Simulate import process
    setTimeout(() => {
      console.log('Importing:', selectedRuns)
      setLoading(false)
      if (onImportComplete) {
        onImportComplete()
      }
      onClose()
    }, 2000)
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
                <h3>Select Previous Apify Runs</h3>
                <p className="section-description">
                  Choose from your previous Apify actor runs to import lead data
                </p>
                
                <div className="runs-list">
                  {mockApifyRuns.map(run => (
                    <div 
                      key={run.id} 
                      className={`run-item ${selectedRuns.includes(run.id) ? 'selected' : ''}`}
                      onClick={() => handleRunToggle(run.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedRuns.includes(run.id)}
                        onChange={() => {}}
                        className="run-checkbox"
                      />
                      <div className="run-info">
                        <div className="run-header">
                          <span className="run-name">{run.name}</span>
                          <span className={`run-status ${run.status.toLowerCase()}`}>
                            {run.status}
                          </span>
                        </div>
                        <div className="run-meta">
                          <span className="run-date">
                            <Calendar size={12} />
                            {run.date}
                          </span>
                          <span className="run-items">{run.items} items</span>
                          <span className="run-dataset">{run.dataset}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRuns.length > 0 && (
                  <div className="import-summary">
                    <AlertCircle size={16} />
                    <span>{selectedRuns.length} run(s) selected for import</span>
                  </div>
                )}
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
            disabled={loading || (activeTab === 'manual' && selectedRuns.length === 0)}
          >
            {loading ? 'Importing...' : 'Import Leads'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportModal
