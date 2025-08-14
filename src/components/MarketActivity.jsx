import { useState } from 'react'
import { MapPin, Facebook, Instagram, ChevronDown, ChevronRight } from 'lucide-react'
import './MarketActivity.css'

function MarketActivity({ market }) {
  const [expandedPhases, setExpandedPhases] = useState({
    phase1: true,
    phase2: false,
    phase3: false
  })

  const togglePhase = (phase) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phase]: !prev[phase]
    }))
  }

  const phases = [
    {
      id: 'phase1',
      number: 1,
      name: 'Google Maps',
      description: 'Foundation coverage from Google Maps',
      icon: <MapPin size={20} />,
      status: 'active',
      leads: 253,
      searches: 11,
      matched: 0,
      unmatched: 253,
      color: 'blue'
    },
    {
      id: 'phase2',
      number: 2,
      name: 'Facebook Ads',
      description: 'Active advertisers from FB Ad Library',
      icon: <Facebook size={20} />,
      status: 'inactive',
      leads: 0,
      searches: 0,
      color: 'gray'
    },
    {
      id: 'phase3',
      number: 3,
      name: 'Instagram',
      description: 'Manual Instagram targeting',
      icon: <Instagram size={20} />,
      status: 'inactive',
      leads: 0,
      handles: 0,
      color: 'gray'
    }
  ]

  return (
    <div className="market-activity">
      <div className="activity-header">
        <div className="activity-title">
          <h2>Market Activity</h2>
          <div className="market-location">
            <span className="market-name">{market.name}, {market.state}</span>
            <span className="market-region">{market.location}</span>
          </div>
        </div>
        <div className="activity-actions">
          <button className="btn-action">Expand All</button>
          <button className="btn-action">Collapse All</button>
        </div>
      </div>

      <div className="activity-summary">
        <div className="summary-stat">
          <span className="stat-value">{market.leads || 253}</span>
          <span className="stat-label">total leads</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">11</span>
          <span className="stat-label">searches performed</span>
        </div>
        <div className="summary-detail">
          (0 matched, {market.leads || 253} unmatched)
        </div>
      </div>

      <div className="phases-container">
        {phases.map((phase) => (
          <div key={phase.id} className={`phase-card ${phase.status}`}>
            <div 
              className="phase-header"
              onClick={() => togglePhase(phase.id)}
            >
              <div className="phase-left">
                <div className={`phase-icon ${phase.color}`}>
                  {phase.icon}
                </div>
                <div className="phase-info">
                  <h3>Phase {phase.number}: {phase.name}</h3>
                  <p>{phase.description}</p>
                </div>
              </div>
              <div className="phase-right">
                <div className="phase-stats">
                  {phase.id === 'phase1' && (
                    <>
                      <span className="phase-stat-value">{phase.leads} leads</span>
                      <span className="phase-stat-label">{phase.searches} searches performed</span>
                    </>
                  )}
                  {phase.id === 'phase2' && (
                    <>
                      <span className="phase-stat-value">{phase.leads} leads</span>
                      <span className="phase-stat-label">{phase.searches} searches</span>
                    </>
                  )}
                  {phase.id === 'phase3' && (
                    <>
                      <span className="phase-stat-value">{phase.leads} leads</span>
                      <span className="phase-stat-label">{phase.handles} handles</span>
                    </>
                  )}
                </div>
                {expandedPhases[phase.id] ? 
                  <ChevronDown size={20} /> : 
                  <ChevronRight size={20} />
                }
              </div>
            </div>

            {expandedPhases[phase.id] && (
              <div className="phase-content">
                {phase.id === 'phase1' && (
                  <div className="phase-details">
                    <div className="detail-row">
                      <span className="detail-label">Service Types:</span>
                      <span className="detail-value">Painting, Deck Building, Turf Installation</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">2 hours ago</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Coverage:</span>
                      <div className="coverage-indicator">
                        <div className="coverage-bar">
                          <div className="coverage-fill" style={{ width: '75%' }} />
                        </div>
                        <span>75%</span>
                      </div>
                    </div>
                  </div>
                )}
                {phase.id === 'phase2' && (
                  <div className="phase-empty">
                    <p>No Facebook Ads data collected yet</p>
                    <button className="btn btn-primary">Start Collection</button>
                  </div>
                )}
                {phase.id === 'phase3' && (
                  <div className="phase-empty">
                    <p>No Instagram data collected yet</p>
                    <button className="btn btn-primary">Start Manual Collection</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MarketActivity
