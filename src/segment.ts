import type { SegmentMetadata, ExportResult } from './types';
import { SegmentClient } from './client';

export class Segment {
  constructor(
    private client: SegmentClient,
    public readonly id: string
  ) {}

  /**
   * Check if a user is in this segment
   * @example
   * const isMember = await powerUsers.contains('user_123');
   */
  async contains(userId: string): Promise<boolean> {
    return this.client.isMember(this.id, userId);
  }

  /**
   * Get all users in this segment
   * @example
   * const result = await powerUsers.getAll();
   * console.log(`${result.users.length} power users`);
   */
  async getAll(options?: {
    cursor?: string;
    limit?: number;
  }): Promise<ExportResult> {
    return this.client.exportUsers(this.id, options);
  }

  /**
   * Get a sample of users from this segment
   * @example
   * // Get 10% sample
   * const result = await powerUsers.getSample(0.1);
   */
  async getSample(
    percentage: number,
    options?: { cursor?: string; limit?: number }
  ): Promise<ExportResult> {
    if (percentage <= 0 || percentage > 1) {
      throw new Error('Sample percentage must be between 0 and 1');
    }

    return this.client.exportUsers(this.id, {
      ...options,
      sample: percentage,
    });
  }

  /**
   * Stream all users in batches
   * @example
   * for await (const batch of powerUsers.stream(500)) {
   *   await processUsers(batch);
   * }
   */
  async *stream(batchSize: number = 1000): AsyncIterableIterator<string[]> {
    yield* this.client.streamUsers(this.id, batchSize);
  }

  /**
   * Get segment metadata (count, version, status)
   * @example
   * const meta = await powerUsers.getMetadata();
   * console.log(`${meta.memberCount} members`);
   */
  async getMetadata(): Promise<SegmentMetadata> {
    return this.client.getMetadata(this.id);
  }

  /**
   * Get member count
   * @example
   * const count = await powerUsers.count();
   */
  async count(): Promise<number> {
    const meta = await this.getMetadata();
    return meta.memberCount;
  }
}