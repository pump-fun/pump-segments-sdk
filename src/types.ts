export interface SegmentClientConfig {
  apiEndpoint: string;
  apiKey?: string;
  timeout?: number;
}

export interface SegmentMetadata {
  segmentId: string;
  versionId: string;
  memberCount: number;
  updatedAt: number;
  status: 'ready' | 'updating' | 'failed';
  stats?: {
    added: number;
    removed: number;
    durationMs: number;
    bigQueryBytes: number;
  };
}

export interface MembershipResult {
  inSegment: boolean;
  versionId: string;
  sampleBucket?: number;
  joinedAt?: number;
}

export interface ExportResult {
  users: string[];
  nextCursor?: string;
  versionId: string;
}

export class SegmentError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message);
    this.name = 'SegmentError';
  }
}
