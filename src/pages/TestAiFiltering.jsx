import { useState } from 'react'
import { runAiFilteringTest } from '../testAiFiltering'
import { Bot, Play, Loader, CheckCircle, XCircle } from 'lucide-react'

function TestAiFiltering() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  const [provider, setProvider] = useState('supabase')
  
  // Debug environment variables
  const openAiKeyStatus = import.meta.env.VITE_OPENAI_API_KEY ? 'CONFIGURED' : 'MISSING';
  const anthropicKeyStatus = import.meta.env.VITE_ANTHROPIC_API_KEY ? 'CONFIGURED' : 'MISSING';
  console.log('Environment Debug:', {
    openAiKey: openAiKeyStatus,
    anthropicKey: anthropicKeyStatus,
    allViteKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
  });

  // Capture console logs
  const captureLog = (message) => {
    setLogs(prev => [...prev, message])
  }

  const runTest = async () => {
    setIsRunning(true)
    setResults(null)
    setError(null)
    setLogs([])

    // Override console.log temporarily
    const originalLog = console.log
    console.log = (...args) => {
      captureLog(args.join(' '))
      originalLog(...args)
    }

    try {
      const testResults = await runAiFilteringTest(provider)
      setResults(testResults)
    } catch (err) {
      setError(err.message)
      console.error('Test error:', err)
    } finally {
      console.log = originalLog
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          AI Lead Filtering Test
        </h1>
        <p className="text-gray-600">
          Test the AI-powered lead filtering system with real data from Amarillo pool builders
        </p>
      </div>

      {/* Environment Debug Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">🔧 Environment Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">OpenAI API Key:</span>{' '}
            <span className={openAiKeyStatus === 'CONFIGURED' ? 'text-green-600' : 'text-red-600'}>
              {openAiKeyStatus}
            </span>
          </div>
          <div>
            <span className="font-medium">Anthropic API Key:</span>{' '}
            <span className={anthropicKeyStatus === 'CONFIGURED' ? 'text-green-600' : 'text-red-600'}>
              {anthropicKeyStatus}
            </span>
          </div>
        </div>
        {openAiKeyStatus === 'MISSING' && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ OpenAI key is undefined. Please restart your dev server after adding VITE_OPENAI_API_KEY to .env
          </p>
        )}
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Run Test</h2>
            <p className="text-sm text-gray-600 mt-1">
              This will classify 10 test businesses using AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              disabled={isRunning}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="supabase">OpenAI via Supabase (Recommended - No CORS)</option>
              <option value="openai">OpenAI Direct (May have CORS issues)</option>
              <option value="claude">Claude 3 Haiku</option>
            </select>
            <button
              onClick={runTest}
              disabled={isRunning || (!import.meta.env.VITE_OPENAI_API_KEY && (provider === 'openai' || provider === 'supabase')) || (!import.meta.env.VITE_ANTHROPIC_API_KEY && provider === 'claude')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning || (!import.meta.env.VITE_OPENAI_API_KEY && (provider === 'openai' || provider === 'supabase')) || (!import.meta.env.VITE_ANTHROPIC_API_KEY && provider === 'claude')
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Test
                </>
              )}
            </button>
          </div>
        </div>

        {provider === 'openai' && !import.meta.env.VITE_OPENAI_API_KEY && !import.meta.env.OPENAI_API_KEY && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ No OpenAI API key found. Please add VITE_OPENAI_API_KEY or OPENAI_API_KEY to your .env file
            </p>
          </div>
        )}
        {provider === 'claude' && !import.meta.env.VITE_ANTHROPIC_API_KEY && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ No Anthropic API key found. Please add VITE_ANTHROPIC_API_KEY to your .env file
            </p>
          </div>
        )}
      </div>

      {/* Console Output */}
      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Console Output</h3>
          <div className="font-mono text-xs text-gray-100 space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification Results</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.isServiceProvider
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {result.isServiceProvider ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h4 className="font-medium text-gray-900">{result.businessName}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Category: {result.category || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>AI Decision:</strong> {result.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      result.isServiceProvider ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.isServiceProvider ? 'INCLUDE' : 'EXCLUDE'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestAiFiltering