
import { generateMockScanResult, generateMockHistory } from '../mockData';

describe('Mock Data Generators', () => {
  test('generateMockScanResult should create a valid scan result', () => {
    const repository = 'test/repo';
    const branch = 'test-branch';
    
    const result = generateMockScanResult(repository, branch);
    
    expect(result).toHaveProperty('id');
    expect(result.repository).toBe(repository);
    expect(result.branch).toBe(branch);
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('findings');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('status');
    expect(result.status).toBe('completed');
    
    // Verify summary counts match findings
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    
    result.findings.forEach(finding => {
      counts[finding.severity]++;
    });
    
    expect(result.summary.critical).toBe(counts.critical);
    expect(result.summary.high).toBe(counts.high);
    expect(result.summary.medium).toBe(counts.medium);
    expect(result.summary.low).toBe(counts.low);
    expect(result.summary.info).toBe(counts.info);
  });
  
  test('generateMockHistory should create the right number of history items', () => {
    const count = 5;
    const history = generateMockHistory(count);
    
    expect(history.length).toBe(count);
    
    // Each item should be a valid scan result
    history.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('repository');
      expect(item).toHaveProperty('timestamp');
      expect(item).toHaveProperty('findings');
      expect(item).toHaveProperty('summary');
      expect(item).toHaveProperty('status');
    });
    
    // Items should be in descending date order
    for (let i = 1; i < history.length; i++) {
      const prevDate = new Date(history[i-1].timestamp);
      const currDate = new Date(history[i].timestamp);
      expect(prevDate.getTime()).toBeGreaterThan(currDate.getTime());
    }
  });
});
