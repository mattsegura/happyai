import { useState } from 'react';
import { getAIService } from '../lib/ai/aiService';
import type { CompletionResponse, AIUsageStats } from '../lib/ai/aiTypes';

/**
 * AI Logger Test Component
 * 
 * Demonstrates the AI logging system by:
 * 1. Making test AI requests
 * 2. Showing logged interactions
 * 3. Displaying usage statistics
 */
export default function AILoggerTest() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CompletionResponse | null>(null);
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aiService = getAIService();

  // Test 1: Simple completion request
  const testSimpleCompletion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.complete({
        prompt: 'Explain the concept of photosynthesis in 2 sentences.',
        featureType: 'course_tutor',
        options: {
          temperature: 0.7,
          maxTokens: 500,
        },
      });

      setResponse(result);
      console.log('✅ AI Response:', result);
      console.log('📊 Tokens Used:', result.tokensUsed);
      console.log('💰 Cost:', `$${(result.costCents / 100).toFixed(4)}`);
      console.log('⚡ Cache Hit:', result.cacheHit);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Cached request (run twice to see cache hit)
  const testCachedRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.complete({
        prompt: 'What is the capital of France?',
        featureType: 'chat',
        options: {
          cacheEnabled: true,
          cacheTTL: 3600, // 1 hour
        },
      });

      setResponse(result);
      console.log('✅ AI Response:', result);
      console.log('⚡ Cache Hit:', result.cacheHit ? 'YES (saved tokens!)' : 'NO (first request)');
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Get usage statistics
  const testGetStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const usageStats = await aiService.getUsageStats(30);
      setStats(usageStats);
      console.log('📊 Usage Stats:', usageStats);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2">🤖 AI Logger Test</h1>
          <p className="text-white/80 mb-8">
            Test the AI interaction logging system and view usage statistics
          </p>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testSimpleCompletion}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
            >
              {loading ? '⏳ Loading...' : '🧪 Test Simple Request'}
            </button>

            <button
              onClick={testCachedRequest}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
            >
              {loading ? '⏳ Loading...' : '💾 Test Cached Request'}
            </button>

            <button
              onClick={testGetStats}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
            >
              {loading ? '⏳ Loading...' : '📊 Get Usage Stats'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-100 font-semibold">❌ Error:</p>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📝 AI Response</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Content:</p>
                  <p className="text-white bg-black/20 p-4 rounded-lg">{response.content}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Provider</p>
                    <p className="text-white font-semibold">{response.provider}</p>
                  </div>
                  
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Model</p>
                    <p className="text-white font-semibold text-sm">{response.model}</p>
                  </div>
                  
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Tokens</p>
                    <p className="text-white font-semibold">{response.tokensUsed.total}</p>
                  </div>
                  
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Cost</p>
                    <p className="text-white font-semibold">${(response.costCents / 100).toFixed(4)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg ${response.cacheHit ? 'bg-green-500/20 border border-green-500/50' : 'bg-blue-500/20 border border-blue-500/50'}`}>
                    <p className="text-white font-semibold">
                      {response.cacheHit ? '⚡ Cache Hit' : '🔄 Fresh Request'}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <p className="text-white">
                      ⏱️ {response.executionTimeMs}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Display */}
          {stats && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Usage Statistics (Last 30 Days)</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">Total Requests</p>
                  <p className="text-white text-2xl font-bold">{stats.totalRequests}</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">Total Tokens</p>
                  <p className="text-white text-2xl font-bold">{stats.totalTokens.toLocaleString()}</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">Total Cost</p>
                  <p className="text-white text-2xl font-bold">${(stats.totalCostCents / 100).toFixed(2)}</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">Cache Hit Rate</p>
                  <p className="text-white text-2xl font-bold">{stats.cacheHitRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-white/60 text-sm mb-2">Avg Tokens/Request</p>
                <p className="text-white text-xl font-semibold">{stats.averageTokensPerRequest.toFixed(0)}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">📖 How to Use</h3>
            <ul className="text-white/80 space-y-2 text-sm">
              <li>• <strong>Test Simple Request:</strong> Makes a fresh AI request and logs it to the database</li>
              <li>• <strong>Test Cached Request:</strong> Run twice to see caching in action (2nd request will be instant)</li>
              <li>• <strong>Get Usage Stats:</strong> View your AI usage statistics from the last 30 days</li>
              <li>• <strong>Check Console:</strong> Open browser DevTools to see detailed logging</li>
            </ul>
          </div>

          {/* What's Being Logged */}
          <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">🔍 What's Being Logged</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="text-white/80">✓ User ID</div>
              <div className="text-white/80">✓ Feature Type</div>
              <div className="text-white/80">✓ Prompt & Response</div>
              <div className="text-white/80">✓ Token Usage</div>
              <div className="text-white/80">✓ Cost (in cents)</div>
              <div className="text-white/80">✓ Provider & Model</div>
              <div className="text-white/80">✓ Cache Hit Status</div>
              <div className="text-white/80">✓ Execution Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
