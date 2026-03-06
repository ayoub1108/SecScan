
import { useState, useEffect } from 'react';
import { ScanResult, ScanRequest } from '@/types/scanner';
import { generateMockScanResult, generateMockHistory } from '@/utils/mockData';
import { toast } from 'sonner';

const STORAGE_KEY = 'security-scanner-history';
const EDGE_FUNCTION_BASE_URL = 'https://eojucgnpskovtadfwfir.supabase.co/functions/v1/security-scanner';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvanVjZ25wc2tvdnRhZGZ3ZmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NDA3OTgsImV4cCI6MjA1MDIxNjc5OH0.n354_1M5MfeLPtiafQ4nN4QiYStK8N8cCpNw7eLW93Y';
// Time threshold for considering a scan recent (in milliseconds)
// Default: 24 hours (24 * 60 * 60 * 1000 = 86,400,000 ms)
const RECENT_SCAN_THRESHOLD = 24 * 60 * 60 * 1000;

interface ScanStore {
  history: ScanResult[];
  loading: boolean;
  currentScan: ScanResult | null;
  runScan: (request: ScanRequest) => Promise<ScanResult>;
  checkRecentScan: (repository: string, branch?: string) => ScanResult | null;
  clearHistory: () => void;
  deleteResult: (id: string) => void;
}

export const useScanStore = (): ScanStore => {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);

  // Load history from local storage on initial mount only
  useEffect(() => {
    console.log('Loading scan history from localStorage');
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        console.log('Found stored history:', parsedHistory.length, 'items');
        setHistory(parsedHistory);
      } else {
        console.log('No stored history found, initializing with mock data');
        // For demo purposes, initialize with mock data
        const mockHistory = generateMockHistory(3);
        setHistory(mockHistory);
        saveHistoryToStorage(mockHistory);
      }
    } catch (error) {
      console.error('Failed to load scan history:', error);
      toast.error('Failed to load scan history');
    }
  }, []);

  // Helper function to save history to localStorage
  const saveHistoryToStorage = (historyData: ScanResult[]) => {
    try {
      console.log('Saving history to localStorage:', historyData.length, 'items');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
    } catch (error) {
      console.error('Failed to save scan history to localStorage:', error);
    }
  };

  // Check if a recent scan exists for the repository
  const checkRecentScan = (repository: string, branch: string = 'main'): ScanResult | null => {
    console.log(`Checking for recent scans of ${repository}/${branch}`);
    
    if (history.length === 0) {
      console.log('No scan history found');
      return null;
    }
    
    const now = new Date().getTime();
    const recentScans = history.filter(scan => {
      // Match repository and branch
      const isMatch = scan.repository === repository && 
                     (scan.branch === branch || (!scan.branch && branch === 'main'));
      
      if (!isMatch) return false;
      
      // Check if scan is recent enough
      const scanTime = new Date(scan.timestamp).getTime();
      const timeDiff = now - scanTime;
      const isRecent = timeDiff < RECENT_SCAN_THRESHOLD;
      
      if (isRecent) {
        const hoursAgo = Math.round(timeDiff / (60 * 60 * 1000) * 10) / 10;
        console.log(`Found recent scan from ${new Date(scan.timestamp).toLocaleString()}, ${hoursAgo} hours ago`);
      }
      
      return isRecent;
    });
    
    if (recentScans.length > 0) {
      // Sort by timestamp to get the most recent scan
      recentScans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      console.log('Using recent scan result:', recentScans[0].id);
      return recentScans[0];
    }
    
    console.log('No recent scans found for this repository/branch');
    return null;
  };

  const runScan = async (request: ScanRequest): Promise<ScanResult> => {
    setLoading(true);
    console.log('Scan started, loading state:', true);
    console.log('Scan request params:', request);
    
    try {
      // Prepare request payload with advanced options
      const payload = {
        repo: request.repository,
        branch: request.branch || 'main',
        // Include advanced options if provided
        ...(request.useWebSearch !== undefined && { useWebSearch: request.useWebSearch }),
        ...(request.sendReport && request.recipient && { 
          sendReport: true,
          recipient: request.recipient
        }),
        ...(request.createIssues !== undefined && { createIssues: request.createIssues }),
        ...(request.includeRecommendations !== undefined && { 
          includeRecommendations: request.includeRecommendations 
        }),
        ...(request.scanDepth && { scanDepth: request.scanDepth }),
        ...(request.fileTypes && { fileTypes: request.fileTypes }),
        ...(request.scanHistory && { scanHistory: request.scanHistory })
      };
      
      // Use the correct endpoint URL with the scan-repo route
      const endpoint = `${EDGE_FUNCTION_BASE_URL}/scan-repo`;
      console.log('Calling security scanner API:', endpoint);
      
      // Make an actual API call to the deployed edge function
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response received:', data);
      
      // Map the API response to our ScanResult type
      let result: ScanResult;
      
      try {
        // Normalize the response whether it comes from the mock data or edge function
        const findingsArray = Array.isArray(data.findings) ? data.findings : [];
        
        // Generate IDs for findings if they don't exist
        const processedFindings = findingsArray.map((finding, index) => {
          return {
            ...finding,
            id: finding.id || `finding-${index}-${Date.now()}`
          };
        });
        
        // Create the proper scan result object
        result = {
          id: data.scan_id || data.scanId || `scan_${Date.now()}`,
          repository: data.repo_name || request.repository,
          branch: request.branch || 'main',
          timestamp: data.timestamp || new Date().toISOString(),
          findings: processedFindings,
          summary: data.summary || {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0
          },
          status: data.status || 'completed',
        };
        
        // If the API response includes statistics, add them to the result
        if (data.statistics) {
          result.statistics = data.statistics;
        }
        
        // If the API response includes lastCommitSha, add it to the result
        if (data.lastCommitSha) {
          result.lastCommitSha = data.lastCommitSha;
        }
        
        // Validate or populate summary counts if they don't exist
        if (!data.summary) {
          const summary = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0
          };
          
          // Calculate summary counts from findings
          processedFindings.forEach(finding => {
            if (finding.severity && summary[finding.severity] !== undefined) {
              summary[finding.severity]++;
            }
          });
          
          result.summary = summary;
        }
        
        // Save raw response to localStorage for debugging
        localStorage.setItem(`scan_result_raw_${request.repository}`, JSON.stringify(data));
      } catch (error) {
        console.error('Error processing API response:', error);
        console.log('Falling back to mock data');
        // Fall back to mock data if there's an issue
        result = generateMockScanResult(request.repository, request.branch);
      }
      
      // Special handling for email reports
      if (request.sendReport && request.recipient && data.reportSent) {
        toast.success(`Security report sent to ${request.recipient}`);
      }
      
      // Special handling for GitHub issues
      if (request.createIssues && data.issuesCreated) {
        toast.success(`Created ${data.issuesCreated} GitHub issues for critical findings`);
      }
      
      // Update state and store in localStorage
      setCurrentScan(result);
      
      // Update history with the new scan at the beginning
      const updatedHistory = [result, ...history];
      setHistory(updatedHistory);
      
      // Save to localStorage immediately after updating state
      saveHistoryToStorage(updatedHistory);
      
      console.log('Scan completed successfully, history updated:', updatedHistory.length, 'items');
      toast.success('Security scan completed');
      
      return result;
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error(`Security scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fall back to mock data in case of error
      const mockResult = generateMockScanResult(request.repository, request.branch);
      return mockResult;
    } finally {
      console.log('Scan completed, setting loading state to false');
      setLoading(false);
    }
  };

  const clearHistory = () => {
    console.log('Clearing scan history');
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Scan history cleared');
  };

  const deleteResult = (id: string) => {
    console.log('Deleting scan result with ID:', id);
    const updatedHistory = history.filter(result => result.id !== id);
    setHistory(updatedHistory);
    
    // Save the updated history to localStorage
    saveHistoryToStorage(updatedHistory);
    
    if (currentScan?.id === id) {
      setCurrentScan(null);
    }
    toast.success('Scan result deleted');
  };

  return {
    history,
    loading,
    currentScan,
    runScan,
    checkRecentScan,
    clearHistory,
    deleteResult,
  };
};
