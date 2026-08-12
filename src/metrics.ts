import { CachedPromptStats } from './index';

export interface MetricsSnapshot {
  timestamp: number;
  hitRate: number;
  tokensSaved: number;
  stats: CachedPromptStats;
}

export class MetricsCollector {
  private snapshots: MetricsSnapshot[] = [];

  recordSnapshot(hitRate: number, tokensSaved: number, stats: CachedPromptStats): void {
    this.snapshots.push({
      timestamp: Date.now(),
      hitRate,
      tokensSaved,
      stats,
    });
  }

  exportJSON(): string {
    return JSON.stringify(this.snapshots, null, 2);
  }

  averageHitRate(): number {
    if (this.snapshots.length === 0) return 0;
    const sum = this.snapshots.reduce((acc, s) => acc + s.hitRate, 0);
    return sum / this.snapshots.length;
  }
}
