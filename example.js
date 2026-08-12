// Quick example: token savings with cache
const { createCachedPrompt } = require('./dist/index.js');

const systemPrompt = createCachedPrompt(`
You are a code analyzer. Always follow these rules:
1. Check for security issues
2. Identify performance bottlenecks
3. Suggest best practices
`);

// Simulate API calls
const mockResponse1 = {
  cache_creation_input_tokens: 500,
};

const mockResponse2 = {
  cache_read_input_tokens: 50, // Cache hit—much cheaper
};

systemPrompt.recordUsage(mockResponse1);
systemPrompt.recordUsage(mockResponse2);
systemPrompt.recordUsage(mockResponse2);

console.log(`Cache hit rate: ${(systemPrompt.hitRate() * 100).toFixed(1)}%`);
console.log(`Tokens saved: ${systemPrompt.tokensSaved()}`);
