---
name: ccb-web-search
description: |
  Web search with result ranking, deduplication, and smart snippets.
  Uses multiple search engines (DuckDuckGo, Bing) with fallback.
  Use when: user asks to search the web, find information, or research topics.
  Triggers: "search for", "google", "find online", "web search", "look up".
---

# CCB Web Search

Multi-engine search with result ranking and smart extraction.

## Usage

```bash
# Basic search
node search.mjs "OpenClaw features"

# With engine selection
node search.mjs --engine=ddg "AI agents"
node search.mjs --engine=bing "Node.js tips"

# With limit
node search.mjs --limit=5 "best VS Code extensions"
```

## Output Format

```json
{
  "query": "OpenClaw features",
  "engine": "duckduckgo",
  "results": [
    {
      "title": "...",
      "url": "...",
      "snippet": "...",
      "rank": 1
    }
  ],
  "total": 10,
  "time_ms": 234
}
```

## Features

- Multi-engine fallback (DuckDuckGo → Bing)
- Result deduplication by domain
- Smart snippet extraction
- Rank by relevance
- JSON or Markdown output
