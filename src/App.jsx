import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MarketCoverage from './pages/MarketCoverage'
import ClaudeChat from './components/ClaudeChat'
import LeadGenDashboard from './components/LeadGenDashboard'
import LeadExport from './components/LeadExport'
import LeadsTable from './components/LeadsTable'
import DatabaseTest from './components/DatabaseTest'
import Navigation from './components/Navigation'
import Setup from './pages/Setup'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<MarketCoverage />} />
          <Route path="/claude" element={<ClaudeChat />} />
          <Route path="/dashboard" element={<LeadGenDashboard />} />
          <Route path="/leads" element={<LeadsTable />} />
          <Route path="/export" element={<LeadExport />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/test" element={<DatabaseTest />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
