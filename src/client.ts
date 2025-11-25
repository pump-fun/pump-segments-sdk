
import type {
  SegmentClientConfig,
  SegmentMetadata,
  MembershipResult,
  ExportResult,
} from './types';
import { SegmentError } from './types';

export class SegmentClient {
  private config: SegmentClientConfig;

  constructor(config: SegmentClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Check if a user is in a segment
   */
  async isMember(segmentId: string, userId: string): Promise<boolean> {
    const result = await this.getMembership(segmentId, userId);
    return result.inSegment;
  }

  /**
   * Get detailed membership information
   */
  async getMembership(
    segmentId: string,
    userId: string
  ): Promise<MembershipResult> {
    const url = this.buildUrl(`/users/${userId}/segments/${segmentId}`);
    return this.fetch<MembershipResult>(url);
  }

  /**
   * Get segment metadata
   */
  async getMetadata(segmentId: string): Promise<SegmentMetadata> {
    const url = this.buildUrl(`/segments/${segmentId}/metadata`);
    return this.fetch<SegmentMetadata>(url);
  }

  /**
   * Export users from a segment (paginated)
   */
  async exportUsers(
    segmentId: string,
    options?: {
      cursor?: string;
      limit?: number;
      sample?: number; // 0-1 (e.g., 0.1 = 10%)
    }
  ): Promise<ExportResult> {
    const url = this.buildUrl(`/segments/${segmentId}/users`, {
      cursor: options?.cursor,
      limit: options?.limit,
      p: options?.sample,
    });

    return this.fetch<ExportResult>(url);
  }

  /**
   * Stream all users from a segment
   */
  async *streamUsers(
    segmentId: string,
    batchSize: number = 1000
  ): AsyncIterableIterator<string[]> {
    let cursor: string | undefined;

    do {
      const result = await this.exportUsers(segmentId, {
        cursor,
        limit: batchSize,
      });

      yield result.users;
      cursor = result.nextCursor;
    } while (cursor);
  }

  // Private methods

  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.config.apiEndpoint);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.config.apiKey && {
        Authorization: `Bearer ${this.config.apiKey}`,
      }),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new SegmentError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status,
          await response.text()
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof SegmentError) throw error;

      throw new SegmentError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        String(error)
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}