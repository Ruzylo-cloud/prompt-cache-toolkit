# Prompt Cache Toolkit

Small helper for working with Claude's prompt-caching feature. Wraps a piece of text (system instructions, documents, etc.) so it can be reused across requests with the `cache_control` marker Claude's API expects, and gives you simple bookkeeping around cache hits if you feed it usage data.

## Quick Start

```bash
npm install prompt-cache-toolkit
```

```javascript
const { createCachedPrompt } = require('prompt-cache-toolkit');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define cached context (system instructions, documents, etc.)
const cached = createCachedPrompt(`
You are a code reviewer. Review this code for:
- Security issues
- Performance problems
- Best practices
`);

const response = await client.messages.create({
  model: 'claude-sonnet-5',
  max_tokens: 1024,
  system: cached.asSystemPrompt(),
  messages: [{ role: 'user', content: codeSnippet1 }],
});

// Feed the API's usage block back in if you want hit-rate/savings tracking
cached.recordUsage(response.usage);

console.log(`Estimated tokens saved: ${cached.tokensSaved()}`);
```

## What it actually does

- Formats a string into the `cache_control: { type: 'ephemeral' }` shape Claude's Messages API expects for prompt caching.
- Warns (via `console.warn`) if the content looks larger than a configurable token estimate.
- If — and only if — you call `.recordUsage()` with the `usage` object from each API response, it keeps a running count of cache creates vs. cache reads, and can report a hit rate and an estimated token savings. Nothing is tracked automatically; the library has no visibility into your API calls unless you feed it the usage data yourself.

## Use Cases

- **AI Agents**: Cache system prompts & knowledge bases
- **Document Analysis**: Batch process documents with persistent context
- **Content Generation**: Reusable brand guidelines or style sheets
- **Code Review**: Consistent review criteria across a team

## API

### `createCachedPrompt(content, options?)`

Returns a cache-aware prompt wrapper.

**Options:**
- `maxTokens?: number` – Warn if cached content exceeds this (default: 8000)
- `ttl?: number` – Stored on the instance but not currently enforced anywhere in this library; it's advisory only (Claude's server-side cache TTL is controlled by Anthropic, not by this option).

**Methods:**
- `.asSystemPrompt()` – Format for Claude's `system` parameter
- `.recordUsage(usage)` – Feed in a response's `usage` object to update stats. Required before `.hitRate()` or `.tokensSaved()` will report anything meaningful.
- `.tokensSaved()` – An *estimate* based on recorded cache-read vs. cache-creation token averages, not a value returned by the API.
- `.hitRate()` – Cache hits / total recorded requests (0–1). Only reflects calls you've passed to `.recordUsage()`.
- `.getStats()` – Returns the raw counters (`cacheCreationTokens`, `cacheReadTokens`, `totalHits`, `totalRequests`).

## Contributing

Issues and PRs welcome.

## License

MIT

---

Sponsored by [Ferrow](https://ferrow.ai)

---
Part of the [ferrow-toolkit](https://github.com/FerrowAI/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
