
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  codeSnippet?: string;
  location?: string;
  recommendation?: string;
  createdAt: string;
  resolvedAt?: string;
  // Additional fields that might come from the edge function
  category?: string;
  score?: number;
  lineNumber?: number;
  file?: string;
  line_number?: number;
}

export interface ScanResult {
  id: string;
  repository: string;
  branch: string;
  timestamp: string;
  findings: SecurityFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  status: 'completed' | 'failed' | 'in-progress';
  // Extra fields that might come from the edge function
  repo_name?: string;
  scan_id?: string;
  lastCommitSha?: string;
  statistics?: {
    files_scanned: number;
    issues_by_severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    trends: {
      first_scan: boolean;
      comparison: any;
    };
  };
}

export interface ScanRequest {
  repository: string;
  branch?: string;
  useWebSearch?: boolean;
  sendReport?: boolean;
  recipient?: string;
  createIssues?: boolean;
  includeRecommendations?: boolean;
  scanDepth?: number;
  fileTypes?: string[];
  scanHistory?: boolean;
}
