/**
 * Web Search - Multi-engine search with fallback
 */

import { HttpsProxyAgent } from 'https-proxy-agent'

const ENGINES = {
  ddg: {
    name: 'DuckDuckGo',
    searchUrl: (q, offset = 0) =>
      `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}&s=${offset}`,
    parse: (html) => {
      const results = []
      const regex = /<a class="result__a" href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g
      let m
      while ((m = regex.exec(html)) !== null && results.length < 10) {
        results.push({
          title: m[2].replace(/<[^>]+>/g, ''),
          url: m[1],
          snippet: m[3].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
          rank: results.length + 1
        })
      }
      return results
    }
  },
  bing: {
    name: 'Bing',
    searchUrl: (q, offset = 0) =>
      `https://www.bing.com/search?q=${encodeURIComponent(q)}&first=${offset + 1}`,
    parse: (html) => {
      const results = []
      const regex = /<li class="b_algo"[^>]*>[\s\S]*?<h2[^>]*><a href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<p>([\s\S]*?)<\/p>/g
      let m
      while ((m = regex.exec(html)) !== null && results.length < 10) {
        results.push({
          title: m[2].replace(/<[^>]+>/g, ''),
          url: m[1],
          snippet: m[3].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&hellip;/g, '...').slice(0, 200),
          rank: results.length + 1
        })
      }
      return results
    }
  }
}

async function fetchWithFallback(url, options = {}, proxy = process.env.HTTPS_PROXY) {
  const agent = proxy ? new HttpsProxyAgent(proxy) : undefined
  const fetchOptions = {
    ...options,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      ...options.headers
    },
    ...(agent ? { agent } : {})
  }

  for (const engine of Object.keys(ENGINES)) {
    try {
      const response = await fetch(url.replace(/duckduckgo\.com|bing\.com/, engine === 'ddg' ? 'duckduckgo.com' : 'bing.com'), fetchOptions)
      if (response.ok) {
        return await response.text()
      }
    } catch (e) {
      // Try next engine
    }
  }
  return null
}

export async function search(query, options = {}) {
  const { engine = 'ddg', limit = 10, offset = 0 } = options
  const start = Date.now()
  const eng = ENGINES[engine] || ENGINES.ddg
  const url = eng.searchUrl(query, offset)

  let html
  try {
    html = await fetchWithFallback(url)
  } catch (e) {
    // Fallback: try other engines
    for (const [name, e] of Object.entries(ENGINES)) {
      if (name === engine) continue
      try {
        html = await fetchWithFallback(e.searchUrl(query, offset))
        if (html) break
      } catch {}
    }
  }

  if (!html) {
    return { query, engine: eng.name, results: [], error: 'All engines failed' }
  }

  let results = eng.parse(html)

  // Deduplicate by domain
  const seen = new Set()
  results = results.filter(r => {
    try {
      const domain = new URL(r.url).hostname
      if (seen.has(domain)) return false
      seen.add(domain)
      return true
    } catch { return true }
  }).slice(0, limit)

  return {
    query,
    engine: eng.name,
    results,
    total: results.length,
    time_ms: Date.now() - start
  }
}

// CLI
if (import.meta.url.endsWith(process.argv[1]?.replace(/^file:\/\//, ''))) {
  const args = process.argv.slice(2)
  const engine = args.find(a => a.startsWith('--engine='))?.split('=')[1] || 'ddg'
  const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '10')
  const query = args.filter(a => !a.startsWith('--')).join(' ')

  if (!query) {
    console.error('Usage: node search.mjs [--engine=ddg|bing] [--limit=5] "<query>"')
    process.exit(1)
  }

  const result = await search(query, { engine, limit })
  console.log(JSON.stringify(result, null, 2))
}
