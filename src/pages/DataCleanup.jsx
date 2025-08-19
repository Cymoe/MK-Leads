import { useState } from 'react'
import { Trash2, Search, AlertTriangle, CheckCircle, UserX } from 'lucide-react'
import { cleanupSanDiegoRemodelers, identifyDuplicates } from '../utils/cleanupSanDiegoRemodelers'
import { removeSanDiegoDuplicates } from '../utils/removeDuplicates'

function DataCleanup() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [duplicateResults, setDuplicateResults] = useState(null)
  const [removeResults, setRemoveResults] = useState(null)
  const [error, setError] = useState(null)

  const runCleanup = async () => {
    setIsRunning(true)
    setError(null)
    setResults(null)

    try {
      const cleanupResult = await cleanupSanDiegoRemodelers()
      
      if (cleanupResult.error) {
        setError(cleanupResult.error.message)
      } else {
        setResults(cleanupResult)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRunning(false)
    }
  }

  const checkDuplicates = async () => {
    setIsRunning(true)
    setError(null)
    setDuplicateResults(null)

    try {
      const dupResult = await identifyDuplicates()
      
      if (dupResult.error) {
        setError(dupResult.error.message)
      } else {
        setDuplicateResults(dupResult)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRunning(false)
    }
  }

  const removeDuplicates = async () => {
    setIsRunning(true)
    setError(null)
    setRemoveResults(null)

    try {
      const removeResult = await removeSanDiegoDuplicates()
      
      if (removeResult.error) {
        setError(removeResult.error.message)
      } else {
        setRemoveResults(removeResult)
        // Clear duplicate results since we've removed them
        setDuplicateResults(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Cleanup Tools</h1>

      {/* San Diego Cleanup */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          San Diego Remodelers Cleanup
        </h2>
        <p className="text-gray-600 mb-6">
          Remove obvious non-service businesses from San Diego remodeling companies
          (Home Depot, showrooms, supply stores, etc.)
        </p>

        <div className="flex gap-4">
          <button
            onClick={runCleanup}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              isRunning
                ? 'bg-gray-100 text-gray-400'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Trash2 size={18} />
            Run Cleanup
          </button>

          <button
            onClick={checkDuplicates}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              isRunning
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Search size={18} />
            Check Duplicates
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 flex items-center gap-2">
              <AlertTriangle size={18} />
              {error}
            </p>
          </div>
        )}

        {results && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 flex items-center gap-2 mb-2">
              <CheckCircle size={18} />
              Cleanup Complete!
            </h3>
            <p className="text-green-800">
              Removed: {results.removed} non-service businesses
            </p>
            <p className="text-green-800">
              Remaining: {results.remaining} legitimate remodeling contractors
            </p>
            
            {results.removedCompanies && results.removedCompanies.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-green-900 mb-2">Removed Companies:</h4>
                <div className="max-h-48 overflow-y-auto">
                  {results.removedCompanies.map((company, idx) => (
                    <div key={idx} className="text-sm text-green-700">
                      • {company.company_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {duplicateResults && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Duplicate Analysis</h3>
            <p className="text-blue-800">
              Found {duplicateResults.totalDuplicates} potential duplicate entries
            </p>
            <p className="text-blue-800">
              {duplicateResults.duplicateGroups} phone numbers have multiple listings
            </p>
            
            {duplicateResults.examples && duplicateResults.examples.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-blue-900 mb-2">Examples:</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {duplicateResults.examples.slice(0, 5).map((dup, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium text-blue-900">
                        Phone: {dup.phone || '(no phone)'} ({dup.count} entries)
                      </div>
                      {dup.companies.map((c, cidx) => (
                        <div key={cidx} className="text-blue-700 ml-4">
                          • {c.company_name}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Remove Duplicates Button */}
            {duplicateResults.totalDuplicates > 0 && (
              <button
                onClick={removeDuplicates}
                disabled={isRunning}
                className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isRunning
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <UserX size={18} />
                Remove Duplicates (Keep Best Version)
              </button>
            )}
          </div>
        )}

        {removeResults && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-900 flex items-center gap-2 mb-2">
              <CheckCircle size={18} />
              Duplicates Removed!
            </h3>
            <p className="text-orange-800">
              Removed: {removeResults.removed} duplicate entries
            </p>
            <p className="text-orange-800">
              Remaining: {removeResults.remaining} unique remodeling contractors
            </p>
            
            {removeResults.removedCompanies && removeResults.removedCompanies.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-orange-900 mb-2">Removed Duplicates:</h4>
                <div className="max-h-32 overflow-y-auto">
                  {removeResults.removedCompanies.map((company, idx) => (
                    <div key={idx} className="text-sm text-orange-700">
                      • {company.company_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This cleanup is for pre-AI filtering data. 
          New imports with AI filtering enabled won't need this cleanup.
        </p>
      </div>
    </div>
  )
}

export default DataCleanup