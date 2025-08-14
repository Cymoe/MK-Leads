import { NavLink } from 'react-router-dom'
import { MapPin, MessageSquare, LayoutDashboard, Settings, Download, Database } from 'lucide-react'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <span className="brand-text">LeadTracker</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MapPin size={18} />
          <span>Markets</span>
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Database size={18} />
          <span>Leads Table</span>
        </NavLink>
        <NavLink to="/export" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Download size={18} />
          <span>Export Leads</span>
        </NavLink>
        <NavLink to="/claude" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquare size={18} />
          <span>Claude AI</span>
        </NavLink>
        <NavLink to="/setup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Setup</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default Navigation