---
name: ccb-web-search
description: |
  Multi-engine web search / 多引擎网页搜索
  Uses DuckDuckGo, Bing with fallback. Result ranking, deduplication, smart snippets.
  用途：多搜索引擎搜索，自动降级，支持结果排序、去重、智能摘要。
  触发词 / Triggers: "search for", "google", "find online", "web search", "look up", "搜索", "上网查"
---

# CCB Web Search / 多引擎搜索

Multi-engine search with result ranking and smart extraction.
多引擎智能搜索，支持结果排序和去重。

## 功能 / Features

- **多引擎降级** - DuckDuckGo → Bing，自动切换 / Multi-engine fallback
- **结果去重** - 按域名去重 / Deduplicate by domain
- **智能摘要** - 自动提取相关内容 / Smart snippet extraction
- **结果排序** - 按相关性排序 / Rank by relevance
- **JSON/Markdown** - 结构化或易读输出 / Structured or readable output

## 使用方法 / Usage

```bash
# 基础搜索 / Basic search
node search.mjs "OpenClaw features"

# 指定引擎 / With engine selection
node search.mjs --engine=ddg "AI agents"
node search.mjs --engine=bing "Node.js tips"

# 限制结果数 / With limit
node search.mjs --limit=5 "best VS Code extensions"
```

## 输出格式 / Output Format

```json
{
  "query": "OpenClaw features",
  "engine": "duckduckgo",
  "results": [
    {
      "title": "...",
      "url": "https://...",
      "snippet": "...",
      "rank": 1
    }
  ],
  "total": 10,
  "time_ms": 234
}
```

## 引擎说明 / Engine Details

| 引擎 | 说明 | 备注 |
|------|------|------|
| DuckDuckGo | 默认主引擎 | 隐私友好 / Privacy-friendly |
| Bing | 降级备选 | Bing API / Fallback |

## 应用场景 / Use Cases

- 网络信息查询 / Online information lookup
- 技术文档搜索 / Technical documentation search
- 竞品调研 / Competitor research
- 新闻检索 / News retrieval
