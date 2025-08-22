import { useState } from 'react'
import { TrendingUp, Trash2, Droplet, Truck, Building, MapPin, DollarSign, Users, Target, Calculator, Phone, FileText, AlertCircle, CheckCircle, Award, BarChart3, Home } from 'lucide-react'
import Navigation from '../components/Navigation'
import './BusinessAcquisitions.css'

function BusinessAcquisitions({ session }) {
  const [activeTab, setActiveTab] = useState('top10')

  // Key statistics - updated with deep research
  const keyStats = {
    boomerBusinesses: '12M',
    boomerOwnership: '41%',
    planningExit: '77%',
    wealthTransfer: '$10T',
    sellerFinancing: '60%',
    underPERadar: '<$3M'
  }

  // Top 10 Business Types from Deep Research
  const top10Businesses = [
    {
      rank: 1,
      name: 'Septic Services & Maintenance',
      whyTop: 'Essential service, recession-proof, regulatory moat, 65%+ Boomer ownership',
      growth: '6.7% CAGR',
      ebitda: '$500K - $2.5M',
      margins: '25-35%',
      recurring: '70%+',
      multiple: '2.5-3.5x',
      boomerOwnership: '65%+'
    },
    {
      rank: 2,
      name: 'Water Treatment Services (Commercial)',
      whyTop: 'B2B sticky customers, 95%+ retention, technical expertise required',
      growth: '5.2% CAGR',
      ebitda: '$750K - $3M',
      margins: '40-50%',
      recurring: '80%+',
      multiple: '3-4x',
      boomerOwnership: '58%'
    },
    {
      rank: 3,
      name: 'Commercial Laundromats',
      whyTop: 'Cash flow machine, minimal labor, demographic tailwind',
      growth: '4.8% CAGR',
      ebitda: '$300K - $1M',
      margins: '25-35%',
      recurring: '60%',
      multiple: '3-4x',
      boomerOwnership: '72%'
    },
    {
      rank: 4,
      name: 'Funeral Homes (Rural)',
      whyTop: 'Ultimate recession-proof, high barriers to entry, pre-need sales',
      growth: '3.5% CAGR',
      ebitda: '$400K - $2M',
      margins: '20-30%',
      recurring: '40-60%',
      multiple: '4-5x',
      boomerOwnership: '70%+'
    },
    {
      rank: 5,
      name: 'Specialized Equipment Rental',
      whyTop: 'Asset-based lending available, tax advantages, geographic moat',
      growth: '7.1% CAGR',
      ebitda: '$500K - $2.5M',
      margins: '30-40%',
      recurring: '45%',
      multiple: '3-4x',
      boomerOwnership: '61%'
    },
    {
      rank: 6,
      name: 'Mobile Home Park Management',
      whyTop: 'Affordable housing crisis, recurring revenue, 40K+ parks nationwide',
      growth: '8.2% CAGR',
      ebitda: '$400K - $1.5M',
      margins: '35-45%',
      recurring: '90%+',
      multiple: '3.5-4.5x',
      boomerOwnership: '68%'
    },
    {
      rank: 7,
      name: 'Environmental Testing & Compliance',
      whyTop: 'Regulatory requirements, B2B sticky relationships, growing regulations',
      growth: '6.5% CAGR',
      ebitda: '$400K - $2M',
      margins: '30-40%',
      recurring: '75%',
      multiple: '3-4x',
      boomerOwnership: '55%'
    },
    {
      rank: 8,
      name: 'Parking Lot Maintenance',
      whyTop: 'Low competition, essential service, 50-60% gross margins',
      growth: '5.8% CAGR',
      ebitda: '$300K - $1.2M',
      margins: '50-60%',
      recurring: '65%',
      multiple: '2.5-3.5x',
      boomerOwnership: '71%'
    },
    {
      rank: 9,
      name: 'Fire & Safety Equipment Services',
      whyTop: 'Regulatory requirements, 90%+ retention, life safety critical',
      growth: '4.9% CAGR',
      ebitda: '$300K - $1.5M',
      margins: '25-35%',
      recurring: '90%+',
      multiple: '3.5-4x',
      boomerOwnership: '63%'
    },
    {
      rank: 10,
      name: 'Janitorial Services (Medical/Industrial)',
      whyTop: 'Pandemic increased importance, expandable niches, evening work',
      growth: '7.5% CAGR',
      ebitda: '$400K - $2M',
      margins: '15-25%',
      recurring: '85%',
      multiple: '2.5-3x',
      boomerOwnership: '59%'
    }
  ]

  // Business categories with detailed info
  const businessCategories = {
    waste: {
      title: 'Waste & Sanitation Goldmines',
      icon: Trash2,
      color: '#10b981',
      businesses: [
        {
          name: 'Septic Tank Pumping',
          revenue: '$200-1K per job',
          frequency: 'Every 3-5 years per customer',
          margins: '60-70%',
          investment: '$50-150K',
          whyItWorks: 'Essential service, recurring revenue, no competition from apps'
        },
        {
          name: 'Grease Trap Cleaning',
          revenue: '$175+ per cleaning',
          frequency: 'Every 45-90 days',
          margins: '65-75%',
          investment: '$30-80K',
          whyItWorks: 'Required by law, commercial contracts, predictable income'
        },
        {
          name: 'Porta Potty Rental',
          revenue: '$75-150 per unit/month',
          frequency: 'Weekly service',
          margins: '50-60%',
          investment: '$40-100K',
          whyItWorks: 'Construction + events = steady demand'
        },
        {
          name: 'Dumpster Rental',
          revenue: '$300-600 per rental',
          frequency: '7-30 day rentals',
          margins: '55-65%',
          investment: '$75-200K',
          whyItWorks: 'Home renovations + construction boom'
        },
        {
          name: 'Medical Waste Disposal',
          revenue: '$100-500 per pickup',
          frequency: 'Weekly/monthly',
          margins: '70-80%',
          investment: '$50-150K',
          whyItWorks: 'Highly regulated, sticky customers'
        }
      ]
    },
    cleaning: {
      title: 'Essential Cleaning Services',
      icon: Droplet,
      color: '#3b82f6',
      businesses: [
        {
          name: 'Power/Pressure Washing',
          revenue: '$200-800 per job',
          frequency: 'Annual/seasonal',
          margins: '70-85%',
          investment: '$5-20K',
          whyItWorks: 'Low startup, high demand, easy to scale'
        },
        {
          name: 'Gutter Cleaning',
          revenue: '$100-400 per home',
          frequency: 'Twice yearly',
          margins: '75-85%',
          investment: '$3-10K',
          whyItWorks: 'Recurring need, bundle with other services'
        },
        {
          name: 'Commercial Window Cleaning',
          revenue: '$150-1000 per building',
          frequency: 'Monthly contracts',
          margins: '65-75%',
          investment: '$5-15K',
          whyItWorks: 'Predictable contracts, route density'
        },
        {
          name: 'Hood/Exhaust Cleaning',
          revenue: '$300-1500 per job',
          frequency: 'Quarterly (required)',
          margins: '70-80%',
          investment: '$15-40K',
          whyItWorks: 'Fire code requirements, certified techs'
        },
        {
          name: 'Crime Scene Cleanup',
          revenue: '$1000-5000 per job',
          frequency: 'On-demand',
          margins: '80-90%',
          investment: '$10-30K',
          whyItWorks: 'No competition, insurance pays well'
        }
      ]
    },
    mobile: {
      title: 'Mobile Service Empires',
      icon: Truck,
      color: '#8b5cf6',
      businesses: [
        {
          name: 'Mobile Notary',
          revenue: '$75-200 per signing',
          frequency: 'Daily opportunities',
          margins: '90-95%',
          investment: '$500-2K',
          whyItWorks: 'Loan signings pay premium, flexible schedule'
        },
        {
          name: 'Mobile Mechanic',
          revenue: '$100-300 per service',
          frequency: 'Daily',
          margins: '60-70%',
          investment: '$10-30K',
          whyItWorks: 'Convenience premium, no shop overhead'
        },
        {
          name: 'Mobile Pet Grooming',
          revenue: '$75-150 per pet',
          frequency: 'Every 6-8 weeks',
          margins: '65-75%',
          investment: '$20-50K',
          whyItWorks: 'Pet spending recession-proof'
        },
        {
          name: 'Mobile Knife Sharpening',
          revenue: '$5-15 per knife',
          frequency: 'Routes/events',
          margins: '85-90%',
          investment: '$3-10K',
          whyItWorks: 'Restaurants need weekly service'
        },
        {
          name: 'Courier Services',
          revenue: '$25-100 per delivery',
          frequency: 'Daily',
          margins: '50-60%',
          investment: '$5-15K',
          whyItWorks: 'Legal/medical/urgent documents'
        }
      ]
    },
    rental: {
      title: 'Boring Rental Businesses',
      icon: Building,
      color: '#f59e0b',
      businesses: [
        {
          name: 'Vending Machine Routes',
          revenue: '$50-500 per machine/month',
          frequency: 'Passive income',
          margins: '40-50%',
          investment: '$20-100K',
          whyItWorks: '24/7 sales, minimal labor'
        },
        {
          name: 'ATM Routes',
          revenue: '$300-1000 per ATM/month',
          frequency: 'Passive income',
          margins: '50-60%',
          investment: '$30-150K',
          whyItWorks: 'Transaction fees add up'
        },
        {
          name: 'Equipment Rental',
          revenue: '$100-1000 per day',
          frequency: 'Weekend warriors',
          margins: '60-70%',
          investment: '$50-200K',
          whyItWorks: 'Construction/DIY demand'
        },
        {
          name: 'Party/Event Rentals',
          revenue: '$500-5000 per event',
          frequency: 'Weekends',
          margins: '70-80%',
          investment: '$30-100K',
          whyItWorks: 'High weekend rates'
        },
        {
          name: 'Storage Units',
          revenue: '$50-200 per unit/month',
          frequency: 'Monthly recurring',
          margins: '70-85%',
          investment: '$200K-1M',
          whyItWorks: 'Americans have too much stuff'
        }
      ]
    },
    b2b: {
      title: 'B2B Hidden Services',
      icon: Target,
      color: '#ef4444',
      businesses: [
        {
          name: 'Document Shredding',
          revenue: '$100-500 per pickup',
          frequency: 'Monthly routes',
          margins: '70-80%',
          investment: '$30-80K',
          whyItWorks: 'HIPAA/compliance requirements'
        },
        {
          name: 'Uniform/Linen Rental',
          revenue: '$20-50 per employee/week',
          frequency: 'Weekly',
          margins: '55-65%',
          investment: '$100-300K',
          whyItWorks: 'Sticky B2B contracts'
        },
        {
          name: 'Safety Equipment Testing',
          revenue: '$50-200 per item',
          frequency: 'Annual certification',
          margins: '75-85%',
          investment: '$20-50K',
          whyItWorks: 'OSHA requirements'
        },
        {
          name: 'Commercial Laundry',
          revenue: '$0.80-1.50 per pound',
          frequency: 'Daily/weekly',
          margins: '45-55%',
          investment: '$150-500K',
          whyItWorks: 'Hotels/restaurants need it'
        },
        {
          name: 'Fire Extinguisher Service',
          revenue: '$25-75 per unit',
          frequency: 'Annual inspection',
          margins: '70-80%',
          investment: '$10-30K',
          whyItWorks: 'Required by fire code'
        }
      ]
    }
  }

  // Geographic hotspots - updated from deep research
  const geographicHotspots = {
    topStates: [
      { state: 'Florida', boomerOwnership: '32.8%', bestMarkets: 'Naples, The Villages', opportunity: 'Very High' },
      { state: 'Maine', boomerOwnership: '31.2%', bestMarkets: 'Bangor, Portland suburbs', opportunity: 'Very High' },
      { state: 'West Virginia', boomerOwnership: '30.9%', bestMarkets: 'Charleston, Morgantown', opportunity: 'Very High' },
      { state: 'Vermont', boomerOwnership: '30.5%', bestMarkets: 'Burlington, Montpelier', opportunity: 'Very High' },
      { state: 'New Hampshire', boomerOwnership: '30.1%', bestMarkets: 'Nashua, Portsmouth', opportunity: 'High' }
    ],
    hiddenGems: [
      { market: 'The Villages, FL', population: '130K', feature: 'Massive retiree population', services: 'All home services' },
      { market: 'Hilton Head, SC', population: '40K', feature: 'Affluent seasonal residents', services: 'Luxury services' },
      { market: 'Branson, MO', population: '12K', feature: 'Tourism + retirees', services: 'Hospitality support' },
      { market: 'Traverse City, MI', population: '15K', feature: 'Wine country wealth', services: 'Seasonal businesses' },
      { market: 'Prescott, AZ', population: '45K', feature: 'Retiree destination', services: 'Healthcare adjacent' }
    ]
  }

  // Valuation guidelines - enhanced from research
  const valuationGuidelines = [
    { size: 'Service Businesses', multiple: '2.5-3.5x EBITDA', sellerFinancing: '30-50%' },
    { size: 'Equipment-Heavy', multiple: '3-4x EBITDA', sellerFinancing: '40-60%' },
    { size: 'Subscription/Recurring', multiple: '3.5-4.5x EBITDA', sellerFinancing: '30-40%' },
    { size: 'Regulatory Moat', multiple: '+0.5-1x premium', sellerFinancing: 'More likely' },
    { size: 'Sweet Spot ($1-2M EBITDA)', multiple: '3-4x EBITDA', sellerFinancing: '50%+' }
  ]

  // Financial sweet spot metrics
  const financialProfile = {
    idealEbitda: '$500K - $3M (sweet spot: $1M - $2M)',
    minMargins: '20% net minimum, prefer 30%+',
    revenueConcentration: 'No customer >20%',
    contractLength: 'Multi-year or strong recurring',
    growth: 'Flat to modest (3-5% annually)',
    financing: 'SBA up to $5M at 90% LTV'
  }

  return (
    <div className="page-container">
      <Navigation session={session} />
      
      <div className="acquisitions-container">
        <div className="acquisitions-header">
          <h1>🎯 Business Acquisitions</h1>
          <p>The $10 Trillion Baby Boomer Business Transfer Opportunity</p>
        </div>

        {/* Key Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{keyStats.boomerBusinesses}</div>
            <div className="stat-label">Boomer-Owned Businesses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{keyStats.boomerOwnership}</div>
            <div className="stat-label">Of All US Businesses</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{keyStats.planningExit}</div>
            <div className="stat-label">Planning Exit (10 yrs)</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{keyStats.wealthTransfer}</div>
            <div className="stat-label">Wealth Transfer</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{keyStats.sellerFinancing}</div>
            <div className="stat-label">Open to Seller Financing</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{keyStats.underPERadar}</div>
            <div className="stat-label">Under PE Radar</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          <button 
            className={`tab-btn ${activeTab === 'top10' ? 'active' : ''}`}
            onClick={() => setActiveTab('top10')}
          >
            <TrendingUp size={18} />
            Top 10 Opportunities
          </button>
          <button 
            className={`tab-btn ${activeTab === 'waste' ? 'active' : ''}`}
            onClick={() => setActiveTab('waste')}
          >
            <Trash2 size={18} />
            Waste & Sanitation
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cleaning' ? 'active' : ''}`}
            onClick={() => setActiveTab('cleaning')}
          >
            <Droplet size={18} />
            Cleaning Services
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveTab('mobile')}
          >
            <Truck size={18} />
            Mobile Services
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rental' ? 'active' : ''}`}
            onClick={() => setActiveTab('rental')}
          >
            <Building size={18} />
            Rental Businesses
          </button>
          <button 
            className={`tab-btn ${activeTab === 'b2b' ? 'active' : ''}`}
            onClick={() => setActiveTab('b2b')}
          >
            <Target size={18} />
            B2B Services
          </button>
          <button 
            className={`tab-btn ${activeTab === 'geographic' ? 'active' : ''}`}
            onClick={() => setActiveTab('geographic')}
          >
            <MapPin size={18} />
            Geographic Strategy
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'top10' ? (
            // Top 10 Businesses View
            <div className="top10-businesses">
              <div className="category-header">
                <h2>🏆 Top 10 Acquisition Opportunities</h2>
                <p>Ranked by opportunity score based on deep market research</p>
              </div>
              
              <div className="top10-grid">
                {top10Businesses.map((business) => (
                  <div key={business.rank} className="top10-card">
                    <div className="rank-badge">#{business.rank}</div>
                    
                    <div className="top10-header">
                      <h3>{business.name}</h3>
                      <p className="why-top">{business.whyTop}</p>
                    </div>
                    
                    <div className="top10-metrics">
                      <div className="metric-row">
                        <span className="metric-label">Industry Growth:</span>
                        <span className="metric-value growth">{business.growth}</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">EBITDA Range:</span>
                        <span className="metric-value">{business.ebitda}</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Margins:</span>
                        <span className="metric-value highlight">{business.margins}</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Recurring Revenue:</span>
                        <span className="metric-value">{business.recurring}</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Exit Multiple:</span>
                        <span className="metric-value multiple">{business.multiple}</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Boomer Ownership:</span>
                        <span className="metric-value boomer">{business.boomerOwnership}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Financial Profile Section */}
              <div className="financial-profile-section">
                <h3>💰 Financial Sweet Spot</h3>
                <div className="profile-grid">
                  <div className="profile-item">
                    <BarChart3 size={20} />
                    <span className="label">Ideal EBITDA:</span>
                    <span className="value">{financialProfile.idealEbitda}</span>
                  </div>
                  <div className="profile-item">
                    <Target size={20} />
                    <span className="label">Minimum Margins:</span>
                    <span className="value">{financialProfile.minMargins}</span>
                  </div>
                  <div className="profile-item">
                    <Users size={20} />
                    <span className="label">Revenue Concentration:</span>
                    <span className="value">{financialProfile.revenueConcentration}</span>
                  </div>
                  <div className="profile-item">
                    <FileText size={20} />
                    <span className="label">Contract Length:</span>
                    <span className="value">{financialProfile.contractLength}</span>
                  </div>
                  <div className="profile-item">
                    <TrendingUp size={20} />
                    <span className="label">Growth Profile:</span>
                    <span className="value">{financialProfile.growth}</span>
                  </div>
                  <div className="profile-item">
                    <DollarSign size={20} />
                    <span className="label">Financing:</span>
                    <span className="value">{financialProfile.financing}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab !== 'geographic' ? (
            <div className="business-category">
              <div className="category-header">
                <h2>{businessCategories[activeTab].title}</h2>
                <p>Essential services that PE ignores but generate reliable cash flow</p>
              </div>
              
              <div className="business-grid">
                {businessCategories[activeTab].businesses.map((business, index) => {
                  const Icon = businessCategories[activeTab].icon
                  return (
                    <div key={index} className="business-card">
                      <div className="business-header">
                        <div 
                          className="business-icon" 
                          style={{ backgroundColor: businessCategories[activeTab].color }}
                        >
                          <Icon size={24} color="white" />
                        </div>
                        <h3>{business.name}</h3>
                      </div>
                      
                      <div className="business-metrics">
                        <div className="metric">
                          <span className="metric-label">Revenue</span>
                          <span className="metric-value">{business.revenue}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Frequency</span>
                          <span className="metric-value">{business.frequency}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Margins</span>
                          <span className="metric-value highlight">{business.margins}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Investment</span>
                          <span className="metric-value">{business.investment}</span>
                        </div>
                      </div>
                      
                      <div className="why-it-works">
                        <CheckCircle size={16} />
                        <span>{business.whyItWorks}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="geographic-strategy">
              {/* Top States Section */}
              <div className="strategy-section">
                <h2>🏆 Top 5 States by Boomer Business Concentration</h2>
                <p>States with highest percentage of Boomer-owned businesses</p>
                
                <div className="hotspots-grid">
                  {geographicHotspots.topStates.map((spot, index) => (
                    <div key={index} className="hotspot-card">
                      <div className="state-rank">#{index + 1}</div>
                      <h4>{spot.state}</h4>
                      <div className="hotspot-stat">{spot.boomerOwnership} Boomer-owned</div>
                      <div className="best-markets">
                        <strong>Best Markets:</strong> {spot.bestMarkets}
                      </div>
                      <div className={`opportunity-badge ${spot.opportunity.toLowerCase().replace(' ', '-')}`}>
                        {spot.opportunity} Opportunity
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Gems Section */}
              <div className="strategy-section">
                <h2>💎 Hidden Gem Markets</h2>
                <p>Secondary markets with exceptional opportunities PE ignores</p>
                
                <div className="gems-grid">
                  {geographicHotspots.hiddenGems.map((gem, index) => (
                    <div key={index} className="gem-card">
                      <div className="gem-header">
                        <Home size={20} />
                        <h4>{gem.market}</h4>
                      </div>
                      <div className="gem-details">
                        <div className="detail-row">
                          <span className="label">Population:</span>
                          <span className="value">{gem.population}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Key Feature:</span>
                          <span className="value">{gem.feature}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Best Services:</span>
                          <span className="value highlight">{gem.services}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="strategy-section">
                <h2>💰 Valuation Guidelines</h2>
                <p>What to expect when buying these businesses</p>
                
                <div className="valuation-table">
                  <div className="table-header">
                    <div>Business Size</div>
                    <div>Typical Multiple</div>
                    <div>Seller Financing</div>
                  </div>
                  {valuationGuidelines.map((guide, index) => (
                    <div key={index} className="table-row">
                      <div>{guide.size}</div>
                      <div className="multiple">{guide.multiple}</div>
                      <div className="financing">{guide.sellerFinancing}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="strategy-section">
                <h2>🎯 Acquisition Strategy</h2>
                <div className="strategy-grid">
                  <div className="strategy-card">
                    <Phone size={20} />
                    <h4>Direct Outreach</h4>
                    <p>Cold call owners 65+ in target industries</p>
                  </div>
                  <div className="strategy-card">
                    <Users size={20} />
                    <h4>Industry Associations</h4>
                    <p>Attend meetings, build relationships</p>
                  </div>
                  <div className="strategy-card">
                    <FileText size={20} />
                    <h4>Business Brokers</h4>
                    <p>Focus on sub-$5M specialists</p>
                  </div>
                  <div className="strategy-card">
                    <Calculator size={20} />
                    <h4>Creative Financing</h4>
                    <p>Seller notes, earnouts, SBA loans</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <AlertCircle size={24} />
            <div>
              <h3>Why These Businesses Work</h3>
              <ul>
                <li>Essential services people always need</li>
                <li>Too small/unsexy for Private Equity</li>
                <li>Recurring revenue potential</li>
                <li>Owner retiring = motivated seller</li>
                <li>Simple operations = easy transition</li>
              </ul>
            </div>
          </div>
          
          <div className="marketplaces">
            <h4>Where to Find Deals:</h4>
            <div className="marketplace-list">
              <span>BizBuySell (45,000+ listings)</span>
              <span>BizQuest</span>
              <span>BusinessesForSale.com</span>
              <span>Local Business Brokers</span>
              <span>Industry Associations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessAcquisitions