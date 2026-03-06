
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ScanRequest {
  repo: string;
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

interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  location?: {
    file: string;
    line?: number;
  };
  code?: string;
  recommendation?: string;
  references?: string[];
  createdAt: string;
}

interface ScanSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

interface ScanResult {
  scanId: string;
  repository: string;
  branch: string;
  timestamp: string;
  findings: SecurityFinding[];
  summary: ScanSummary;
  status: "running" | "completed" | "failed";
  issuesCreated?: number;
  reportSent?: boolean;
}

// Get API keys from environment variables
const getApiKey = () => Deno.env.get("API_KEY") || "";
const getAuthToken = () => Deno.env.get("AUTH_TOKEN") || "";

// Mock data generator for testing
function generateMockFindings(repo: string, count = 10): SecurityFinding[] {
  const severityLevels: Array<"critical" | "high" | "medium" | "low" | "info"> = [
    "critical", "high", "medium", "low", "info"
  ];
  
  const findings: SecurityFinding[] = [];
  
  for (let i = 0; i < count; i++) {
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    findings.push({
      id: `finding-${Date.now()}-${i}`,
      title: getMockTitle(severity),
      description: getMockDescription(severity),
      severity,
      location: {
        file: getMockFilePath(repo),
        line: Math.floor(Math.random() * 500) + 1,
      },
      code: getMockCode(severity),
      recommendation: getMockRecommendation(severity),
      references: [
        "https://owasp.org/Top10/",
        "https://cwe.mitre.org/",
        "https://nvd.nist.gov/vuln-metrics/cvss"
      ],
      createdAt: new Date().toISOString(),
    });
  }
  
  return findings;
}

function getMockTitle(severity: string): string {
  const titles = {
    critical: [
      "Hardcoded AWS Secret Key", 
      "Remote Code Execution Vulnerability",
      "SQL Injection in User Input"
    ],
    high: [
      "Insecure Direct Object Reference",
      "Cross-Site Scripting (XSS)",
      "Authentication Bypass"
    ],
    medium: [
      "Insecure Cookie Configuration",
      "Outdated npm Package",
      "Missing Content Security Policy"
    ],
    low: [
      "Verbose Error Messages",
      "Missing HTTP Security Headers",
      "Weak Password Requirements"
    ],
    info: [
      "Recommended Security Improvement",
      "Documentation Missing",
      "Best Practice Suggestion"
    ]
  };
  
  const options = titles[severity] || titles.info;
  return options[Math.floor(Math.random() * options.length)];
}

function getMockDescription(severity: string): string {
  const descriptions = {
    critical: "This critical vulnerability could allow attackers to gain unauthorized access to sensitive systems or data. Immediate remediation is required.",
    high: "This high severity issue could potentially be exploited to compromise user data or system integrity. Prompt action is recommended.",
    medium: "This moderate security concern could contribute to increased attack surface and should be addressed in your next development cycle.",
    low: "This represents a minor security issue that follows best practices but poses minimal direct risk.",
    info: "This is an informational finding that suggests improvements to your security posture."
  };
  
  return descriptions[severity] || descriptions.info;
}

function getMockFilePath(repo: string): string {
  const files = [
    "src/components/auth/Login.tsx",
    "src/utils/api.js",
    "src/server/database.py",
    "config/security.json",
    "lib/helpers.rb",
    "app/controllers/users_controller.rb",
    "api/endpoints/payments.js",
    "server/middleware/auth.js",
    "src/services/authService.ts",
    "docker-compose.yml"
  ];
  
  return files[Math.floor(Math.random() * files.length)];
}

function getMockCode(severity: string): string {
  const codes = {
    critical: `const aws = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};`,
    high: `function login(username, password) {
  const query = "SELECT * FROM users WHERE username=$1 AND password=$2";
  return db.execute(query, [username, password]);
}`,
    medium: `app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));`,
    low: `try {
  // Operation logic
} catch (error) {
  console.error("An error occurred");
  res.status(500).send("Internal Server Error");
}`,
    info: `// TODO: Implement proper error handling and logging`
  };
  
  return codes[severity] || codes.info;
}

function getMockRecommendation(severity: string): string {
  const recommendations = {
    critical: "Remove hardcoded credentials immediately and use environment variables or a secure secret management solution like AWS Secrets Manager or HashiCorp Vault.",
    high: "Use parameterized queries or an ORM to prevent SQL injection attacks. Never concatenate user input directly into SQL queries.",
    medium: "Update the session configuration to use secure cookies, set appropriate expiration, and use a strong, randomly generated secret.",
    low: "Implement custom error handling that logs detailed errors for developers but returns sanitized error messages to users.",
    info: "Consider implementing a comprehensive error handling strategy with structured logging and monitoring."
  };
  
  return recommendations[severity] || recommendations.info;
}

function generateScanSummary(findings: SecurityFinding[]): ScanSummary {
  const summary: ScanSummary = {
    critical: 0,
    high: 0, 
    medium: 0,
    low: 0,
    info: 0
  };
  
  for (const finding of findings) {
    summary[finding.severity]++;
  }
  
  return summary;
}

function handleCors(req: Request): Response | null {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  // Return null to continue processing the request
  return null;
}

async function handleScanRepo(req: Request): Promise<Response> {
  try {
    const { repo, branch = "main", useWebSearch = false, 
            sendReport = false, recipient = null, 
            createIssues = false, includeRecommendations = true,
            scanDepth = 3, fileTypes = ["js", "ts", "py", "rb", "go", "java", "php"],
            scanHistory = false } = await req.json() as ScanRequest;
    
    if (!repo) {
      return new Response(
        JSON.stringify({ error: "Repository path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Starting scan for ${repo}:${branch}`);
    
    // Generate between 5-15 mock findings
    const findings = generateMockFindings(repo, Math.floor(Math.random() * 10) + 5);
    const summary = generateScanSummary(findings);
    
    // Create result object
    const result: ScanResult = {
      scanId: `scan_${Date.now()}`,
      repository: repo,
      branch: branch,
      timestamp: new Date().toISOString(),
      findings: findings,
      summary: summary,
      status: "completed",
    };
    
    // Simulate GitHub issues creation if requested
    if (createIssues) {
      // In a real implementation, this would call the GitHub API
      const criticalAndHighIssues = findings.filter(f => 
        f.severity === "critical" || f.severity === "high"
      ).length;
      
      result.issuesCreated = criticalAndHighIssues;
    }
    
    // Simulate sending email report if requested
    if (sendReport && recipient) {
      // In a real implementation, this would use an email service
      result.reportSent = true;
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scan-repo:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleInitScan(req: Request): Promise<Response> {
  try {
    const { repo } = await req.json();
    
    if (!repo) {
      return new Response(
        JSON.stringify({ error: "Repository path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, this would initialize a vector store
    return new Response(
      JSON.stringify({ vectorStoreId: `vs_${Date.now()}`, repository: repo }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleScanResults(req: Request): Promise<Response> {
  try {
    const { repo, limit = 10 } = await req.json();
    
    if (!repo) {
      return new Response(
        JSON.stringify({ error: "Repository path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, this would fetch from database
    const results = [];
    for (let i = 0; i < Math.min(limit, 5); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const findings = generateMockFindings(repo, Math.floor(Math.random() * 10) + 3);
      const summary = generateScanSummary(findings);
      
      results.push({
        scanId: `scan_${date.getTime()}`,
        repository: repo,
        branch: "main",
        timestamp: date.toISOString(),
        findings: findings,
        summary: summary,
        status: "completed"
      });
    }
    
    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleCreateIssues(req: Request): Promise<Response> {
  try {
    const { repo, findings } = await req.json();
    
    if (!repo || !findings || !Array.isArray(findings)) {
      return new Response(
        JSON.stringify({ error: "Repository and findings array are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, this would call the GitHub API
    const created = findings.length;
    const issues = findings.map(f => `Issue created for: ${f.title}`);
    
    return new Response(
      JSON.stringify({ created, issues }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleCronTrigger(req: Request): Promise<Response> {
  try {
    const { repo, branch = "main", sendReport = false, recipient = null } = await req.json();
    
    if (!repo) {
      return new Response(
        JSON.stringify({ error: "Repository path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, this would queue a scan to be executed
    return new Response(
      JSON.stringify({ 
        scanId: `scan_${Date.now()}`,
        message: "Scan queued successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleSendReport(req: Request): Promise<Response> {
  try {
    const { repo, recipient, includeRecommendations = true } = await req.json();
    
    if (!repo || !recipient) {
      return new Response(
        JSON.stringify({ error: "Repository and recipient are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // In a real implementation, this would send an email
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Report sent successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean);
  
  // Default response for root endpoint
  if (path.length === 1 && path[0] === 'security-scanner') {
    return new Response(
      JSON.stringify({ 
        message: "Security Scanner API", 
        version: "1.0.0",
        endpoints: [
          "/security-scanner/init-scan",
          "/security-scanner/scan-repo",
          "/security-scanner/scan-results",
          "/security-scanner/create-issues",
          "/security-scanner/cron-trigger",
          "/security-scanner/send-report"
        ]
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
  
  // Handle different endpoints
  if (path.length === 2 && path[0] === 'security-scanner') {
    switch (path[1]) {
      case 'init-scan':
        return handleInitScan(req);
      case 'scan-repo':
        return handleScanRepo(req);
      case 'scan-results':
        return handleScanResults(req);
      case 'create-issues':
        return handleCreateIssues(req);
      case 'cron-trigger':
        return handleCronTrigger(req);
      case 'send-report':
        return handleSendReport(req);
    }
  }

  return new Response(
    JSON.stringify({ error: "Not Found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
