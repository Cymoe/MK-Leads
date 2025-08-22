import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { MapPin, LayoutDashboard, Download, Database, LogOut, User, Sun, Moon, ChevronDown, Plus, Upload, Menu, X, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CryptoJS from 'crypto-js'
import './Navigation.css'

function Navigation({ session }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => {
    // Respect system preference for first load if nothing stored
    const stored = localStorage.getItem('theme')
    if (stored) return stored
    const prefersLight = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    return prefersLight ? 'light' : 'dark'
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  // Show action buttons on all pages to keep header consistent
  const showActionButtons = true

  // Generate Gravatar URL from email
  const getGravatarUrl = (email, size = 80) => {
    if (!email) return null
    
    // Create proper MD5 hash of email for Gravatar
    const cleanEmail = email.toLowerCase().trim()
    const hash = CryptoJS.MD5(cleanEmail).toString()
    
    // Return Gravatar URL with nice fallback options
    // d=identicon creates a geometric pattern based on email
    // d=robohash creates a robot avatar
    // d=retro creates a pixelated face
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=g`
  }

  // Get user initials for fallback
  const getUserInitials = (email) => {
    if (!email) return 'U'
    const username = email.split('@')[0]
    return username.slice(0, 2).toUpperCase()
  }

  // Apply theme on component mount and when theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light-theme')
    } else {
      root.classList.remove('light-theme')
    }
    // Force repaint on desktop browsers that cache prefers-color-scheme
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark'
  }, [theme])

  // Handle click outside to close dropdown (use 'click', not 'mousedown')
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      // Use capture to ensure we see the click before React stops propagation
      document.addEventListener('click', handleClickOutside, true)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [dropdownOpen])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      // Hard clear Supabase auth in case network blocks sign-out
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-')) localStorage.removeItem(key)
        })
      } catch {}
      // Force reload to login
      window.location.href = '/'
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    // Update the document class for global theme without clobbering other classes
    const root = document.documentElement
    if (newTheme === 'light') {
      root.classList.add('light-theme')
    } else {
      root.classList.remove('light-theme')
    }
    setDropdownOpen(false)
  }

  const handleSignOutClick = async () => {
    setDropdownOpen(false)
    await handleSignOut()
  }

  // Event handlers for action buttons
  const handleAddMarket = () => {
    // If not on Markets page, navigate there with an action param
    if (location.pathname !== '/') {
      navigate('/?action=add-market')
      return
    }
    // Otherwise, dispatch event that MarketCoverage can listen to
    window.dispatchEvent(new CustomEvent('openAddMarketModal'))
  }

  const handleImportLeads = () => {
    // If not on Markets page, navigate there with an action param
    if (location.pathname !== '/') {
      navigate('/?action=import-leads')
      return
    }
    // Otherwise, dispatch event that MarketCoverage can listen to
    window.dispatchEvent(new CustomEvent('openImportLeadsModal'))
  }

  const handleToggleMobileMenu = () => {
    // Dispatch custom event that MarketCoverage can listen to for opening/closing sidebar
    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'))
  }

  // Listen for sidebar state changes to update hamburger icon
  const [sidebarOpen, setSidebarOpenState] = useState(false)
  
  useEffect(() => {
    const handleSidebarStateChange = (event) => {
      setSidebarOpenState(event.detail.isOpen)
    }
    
    window.addEventListener('sidebarStateChanged', handleSidebarStateChange)
    
    return () => {
      window.removeEventListener('sidebarStateChanged', handleSidebarStateChange)
    }
  }, [])

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const userDropdown = session && (
    <div className="nav-user" ref={dropdownRef}>
      <button 
        className="user-dropdown-trigger"
        onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
        type="button"
      >
        <div className="user-avatar">
          <div className="avatar-fallback">
            {getUserInitials(session.user.email)}
          </div>
          <img 
            src={getGravatarUrl(session.user.email, 32)} 
            alt="User Avatar"
            className="avatar-img"
            onLoad={(e) => {
              // Hide fallback when image loads successfully
              e.target.previousSibling.style.display = 'none'
              e.target.style.display = 'block'
            }}
            onError={(e) => {
              // Show fallback if image fails to load
              console.log('Avatar failed to load:', e.target.src)
              e.target.style.display = 'none'
              e.target.previousSibling.style.display = 'flex'
            }}
            style={{ display: 'none' }}
          />
        </div>
        <ChevronDown size={14} className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`} />
      </button>
      
      {dropdownOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <div className="user-avatar-large">
              <div className="avatar-fallback">
                {getUserInitials(session.user.email)}
              </div>
              <img 
                src={getGravatarUrl(session.user.email, 40)} 
                alt="User Avatar"
                className="avatar-img"
                onLoad={(e) => {
                  // Hide fallback when image loads successfully
                  e.target.previousSibling.style.display = 'none'
                  e.target.style.display = 'block'
                }}
                onError={(e) => {
                  // Show fallback if image fails to load
                  console.log('Large avatar failed to load:', e.target.src)
                  e.target.style.display = 'none'
                  e.target.previousSibling.style.display = 'flex'
                }}
                style={{ display: 'none' }}
              />
            </div>
            <div className="user-details">
              <span className="user-name">{session.user.email?.split('@')[0] || 'User'}</span>
              <span className="user-email-small">{session.user.email}</span>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-item"
            onClick={(e) => { e.stopPropagation(); console.log('Theme toggle clicked'); toggleTheme() }}
            type="button"
          >
            <div className="dropdown-item-icon">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </div>
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-item logout-item"
            onClick={(e) => { e.stopPropagation(); console.log('Sign out clicked'); handleSignOutClick() }}
            type="button"
          >
            <div className="dropdown-item-icon">
              <LogOut size={16} />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <nav className="navigation">
        <div className="nav-left-section">
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MapPin size={18} />
              <span>Markets</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/market-intelligence" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <TrendingUp size={18} />
              <span>Intelligence</span>
            </NavLink>
            <NavLink to="/leads" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Database size={18} />
              <span>Leads</span>
            </NavLink>
            <NavLink to="/export" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Download size={18} />
              <span>Export</span>
            </NavLink>
          </div>
        </div>

        {/* Right section: actions and user */}
        <div className="nav-right-section">
          {session && showActionButtons && (
            <div className="nav-actions">
              <button className="btn btn-secondary" onClick={handleAddMarket}>
                <Plus size={12} />
                <span>Add Market</span>
              </button>
              <button className="btn btn-primary" onClick={handleImportLeads}>
                <Upload size={12} />
                <span>Import Leads</span>
              </button>
            </div>
          )}

          {/* User dropdown - always show on desktop */}
          <div className="nav-user-desktop">
            {userDropdown}
          </div>
        </div>
      </nav>

      {/* Mobile top bar with hamburger menu and user dropdown */}
      <div className="mobile-top-bar">
        <button 
          className="mobile-menu-toggle"
          onClick={handleToggleMobileMenu}
          title={sidebarOpen ? "Close Markets Menu" : "Open Markets Menu"}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Mobile action buttons - only show on Markets page */}
        {session && showActionButtons && (
          <div className="mobile-action-buttons">
            <button className="mobile-action-btn" onClick={handleAddMarket} title="Add Market">
              <Plus size={18} />
            </button>
          </div>
        )}
        
        <div className="mobile-user-dropdown">
          {userDropdown}
        </div>
      </div>
    </>
  )
}

export default Navigation