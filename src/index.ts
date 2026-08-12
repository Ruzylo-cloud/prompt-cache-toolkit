export interface CacheOptions {
  maxTokens?: number;
  ttl?: number;
}

export interface CachedPromptStats {
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalHits: number;
  totalRequests: number;
}

export class CachedPrompt {
  private content: string;
  private stats: CachedPromptStats;
  private options: Required<CacheOptions>;

  constructor(content: string, options: CacheOptions = {}) {
    this.content = content;
    this.options = {
      maxTokens: options.maxTokens ?? 8000,
      ttl: options.ttl ?? 3600,
    };
    this.stats = {
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      totalHits: 0,
      totalRequests: 0,
    };

    this.validateSize();
  }

  private validateSize(): void {
    // Rough estimation: ~4 chars per token
    const estimatedTokens = Math.ceil(this.content.length / 4);
    if (estimatedTokens > this.options.maxTokens) {
      console.warn(
        `Cache content (~${estimatedTokens} tokens) exceeds recommended size (${this.options.maxTokens})`
      );
    }
  }

  asSystemPrompt(): Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> {
    return [
      {
        type: 'text',
        text: this.content,
        cache_control: { type: 'ephemeral' },
      },
    ];
  }

  recordUsage(stats: {
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  }): void {
    this.stats.totalRequests++;
    if (stats.cache_read_input_tokens) {
      this.stats.cacheReadTokens += stats.cache_read_input_tokens;
      this.stats.totalHits++;
    } else {
      this.stats.cacheCreationTokens += stats.cache_creation_input_tokens ?? 0;
    }
  }

  tokensSaved(): number {
    // Each cache read saves ~4x the tokens vs re-sending
    if (this.stats.totalHits === 0) return 0;
    const avgCacheReadCost = this.stats.cacheReadTokens / this.stats.totalHits;
    const avgCreationCost = this.stats.cacheCreationTokens / (this.stats.totalRequests - this.stats.totalHits) || 0;
    return Math.round(this.stats.totalHits * (avgCreationCost - avgCacheReadCost));
  }

  hitRate(): number {
    return this.stats.totalRequests === 0 ? 0 : this.stats.totalHits / this.stats.totalRequests;
  }

  getStats(): CachedPromptStats {
    return { ...this.stats };
  }
}

export function createCachedPrompt(content: string, options?: CacheOptions): CachedPrompt {
  return new CachedPrompt(content, options);
}

export enum CacheStrategy {
  EPHEMERAL = 'ephemeral',
  PERSISTENT = 'persistent',
}

export interface AdvancedCacheOptions extends CacheOptions {
  strategy?: CacheStrategy;
}

export * from './metrics';
