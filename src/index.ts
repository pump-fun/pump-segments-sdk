export { SegmentClient } from './client';
export { Segment } from './segment';
export { SegmentError } from './types';
export { formatDuration, formatBytes, chunk } from './utils';

export type {
  SegmentClientConfig,
  SegmentMetadata,
  MembershipResult,
  ExportResult,
} from './types';

/**
 * Create a segment instance
 * @example
 * const client = new SegmentClient({ ... });
 * const powerUsers = segment(client, 'power-users');
 */
export function segment(client: SegmentClient, segmentId: string): Segment {
  return new Segment(client, segmentId);
}