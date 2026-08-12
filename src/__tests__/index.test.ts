import { createCachedPrompt, CachedPrompt } from '../index';

describe('CachedPrompt', () => {
  it('should create a cached prompt', () => {
    const prompt = createCachedPrompt('Test content');
    expect(prompt).toBeInstanceOf(CachedPrompt);
  });

  it('should track cache hits', () => {
    const prompt = createCachedPrompt('System instructions');
    prompt.recordUsage({ cache_creation_input_tokens: 1000 });
    prompt.recordUsage({ cache_read_input_tokens: 100 });

    expect(prompt.hitRate()).toBeGreaterThan(0);
  });

  it('should calculate tokens saved', () => {
    const prompt = createCachedPrompt('Content');
    prompt.recordUsage({ cache_creation_input_tokens: 1000 });
    prompt.recordUsage({ cache_read_input_tokens: 50 });
    prompt.recordUsage({ cache_read_input_tokens: 50 });

    expect(prompt.tokensSaved()).toBeGreaterThan(0);
  });

  it('should format as system prompt', () => {
    const prompt = createCachedPrompt('Instructions');
    const formatted = prompt.asSystemPrompt();

    expect(Array.isArray(formatted)).toBe(true);
    expect(formatted[0].type).toBe('text');
    expect(formatted[0].cache_control).toEqual({ type: 'ephemeral' });
  });
});
