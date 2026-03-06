
import { ScanResult, SecurityFinding } from '@/types/scanner';

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Mock security findings
export const mockFindings: SecurityFinding[] = [
  {
    id: generateId(),
    title: 'Hardcoded API Key Detected',
    description: 'A hardcoded API key was found in the source code. This could lead to unauthorized access if the code is exposed.',
    severity: 'critical',
    codeSnippet: 'const apiKey = "sk-1234567890abcdef";',
    location: 'src/services/api.ts:15',
    recommendation: 'Move sensitive values to environment variables or secure secret storage.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Insecure Direct Object Reference',
    description: 'User input is directly used to access system resources without proper validation.',
    severity: 'high',
    codeSnippet: 'const userId = req.params.id;\nconst userData = getUser(userId);',
    location: 'src/controllers/user.ts:42',
    recommendation: 'Implement proper access control and validate user permissions before accessing resources.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Cross-Site Scripting (XSS) Vulnerability',
    description: 'User input is rendered directly in the DOM without proper sanitization.',
    severity: 'high',
    codeSnippet: 'element.textContent = userInput;',
    location: 'src/components/Comment.tsx:27',
    recommendation: 'Use appropriate sanitization libraries or React\'s built-in XSS protection.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Outdated npm Package',
    description: 'The project is using an outdated version of lodash with known vulnerabilities.',
    severity: 'medium',
    location: 'package.json:25',
    recommendation: 'Update lodash to the latest version to address security vulnerabilities.',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Insecure Cookie Configuration',
    description: 'Cookies are configured without the Secure and HttpOnly flags.',
    severity: 'medium',
    codeSnippet: 'document.cookie = "sessionId=123456; Secure; HttpOnly";',
    location: 'src/utils/auth.ts:53',
    recommendation: 'Set appropriate security flags on cookies to prevent theft and manipulation.',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Missing Content Security Policy',
    description: 'No Content Security Policy is configured, which could allow execution of malicious scripts.',
    severity: 'low',
    recommendation: 'Implement a Content Security Policy to restrict sources of executable scripts.',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Debug Mode Enabled in Production',
    description: 'Application is running in debug mode in a production environment.',
    severity: 'low',
    codeSnippet: 'const app = express();\napp.set("debug", false);',
    location: 'src/server.ts:10',
    recommendation: 'Disable debug mode in production environments.',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Informational: Missing SECURITY.md File',
    description: 'The repository does not have a SECURITY.md file to guide security researchers on vulnerability reporting.',
    severity: 'info',
    recommendation: 'Add a SECURITY.md file with instructions for reporting security issues.',
    createdAt: new Date(Date.now() - 691200000).toISOString(),
  },
];

// Generate a mock scan result
export const generateMockScanResult = (repository: string, branch: string = 'main'): ScanResult => {
  // Select a random subset of findings
  const selectedFindings = [...mockFindings]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * mockFindings.length) + 1);
  
  // Count findings by severity
  const summary = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  
  selectedFindings.forEach(finding => {
    summary[finding.severity]++;
  });
  
  return {
    id: generateId(),
    repository,
    branch,
    timestamp: new Date().toISOString(),
    findings: selectedFindings,
    summary,
    status: 'completed',
  };
};

// Generate historical scan results
export const generateMockHistory = (count: number = 5): ScanResult[] => {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const result = generateMockScanResult('user/repo');
    result.timestamp = date.toISOString();
    
    return result;
  });
};
