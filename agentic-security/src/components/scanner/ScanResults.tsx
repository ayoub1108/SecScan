
import { useState, useEffect } from 'react';
import { ScanResult, SecurityFinding, SeverityLevel } from '@/types/scanner';
import { AlertCircle, AlertTriangle, Info, Shield, CheckCircle, FileText, Code, Download } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ScanResultsProps {
  result: ScanResult;
}

export const ScanResults = ({ result }: ScanResultsProps) => {
  // Track open accordion items with proper string array
  const [openItems, setOpenItems] = useState<string[]>([]);  
  const [rawJson, setRawJson] = useState<string>('');
  const [normalizedFindings, setNormalizedFindings] = useState<SecurityFinding[]>([]);
  
  console.log("Rendering ScanResults with:", {
    findings: result.findings.length,
    summary: result.summary,
    repository: result.repository,
    timestamp: result.timestamp
  });

  // Normalize findings to ensure they have all required fields
  useEffect(() => {
    const normalized = result.findings.map((finding, index) => {
      // Generate a stable ID if one doesn't exist
      const id = finding.id || `finding-${index}-${Date.now()}`;
      
      // Generate title from category if it doesn't exist
      let title = finding.title;
      if (!title && (finding as any).category) {
        title = `${(finding as any).category.charAt(0).toUpperCase() + (finding as any).category.slice(1)} issue`;
        if ((finding as any).file) {
          title += ` in ${(finding as any).file.split('/').pop()}`;
        }
      }
      
      // Map location from file property if it exists
      const location = finding.location || (finding as any).file;
      
      // Convert edge function format to our app format
      return {
        id,
        title: title || 'Security Issue',
        description: finding.description,
        severity: finding.severity,
        codeSnippet: finding.codeSnippet || '',
        location: location || '',
        recommendation: finding.recommendation || '',
        createdAt: finding.createdAt || result.timestamp,
        resolvedAt: finding.resolvedAt,
        ...(finding as any).score && { score: (finding as any).score },
        ...(finding as any).line_number && { lineNumber: (finding as any).line_number },
        ...(finding as any).category && { category: (finding as any).category }
      };
    });
    
    setNormalizedFindings(normalized);
    console.log("Normalized findings:", normalized);
  }, [result.findings, result.timestamp]);

  // Format and store the raw JSON data
  useEffect(() => {
    try {
      // Create a sanitized copy for display
      const sanitizedResult = JSON.parse(JSON.stringify(result));
      const jsonString = JSON.stringify(sanitizedResult, null, 2);
      setRawJson(jsonString);
      
      // Save to local storage
      localStorage.setItem(`scan_result_${result.repository}`, jsonString);
      console.log("Scan result saved to local storage");
      
      // Save raw JSON to localStorage as well
      localStorage.setItem(`scan_result_raw_${result.repository}`, jsonString);
    } catch (error) {
      console.error("Failed to process or save scan result:", error);
      // Fallback - just stringify the object directly
      setRawJson(JSON.stringify(result, null, 2));
    }
  }, [result]);
  
  // Function to download the raw JSON
  const downloadRawJson = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_result_${result.repository.replace('/', '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Scan results downloaded");
  };

  // Copy raw JSON to clipboard
  const copyRawJson = () => {
    navigator.clipboard.writeText(rawJson);
    toast.success("Copied to clipboard");
  };

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'info':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const criticalFindings = normalizedFindings.filter(f => f.severity === 'critical');
  const highFindings = normalizedFindings.filter(f => f.severity === 'high');
  const mediumFindings = normalizedFindings.filter(f => f.severity === 'medium');
  const lowFindings = normalizedFindings.filter(f => f.severity === 'low');
  const infoFindings = normalizedFindings.filter(f => f.severity === 'info');

  const hasFindings = normalizedFindings.length > 0;

  const renderFindingDetails = (finding: SecurityFinding) => (
    <div className="space-y-4">
      <p className="text-muted-foreground">{finding.description}</p>
      
      {finding.location && (
        <div>
          <p className="text-sm font-medium mb-1">Location</p>
          <code className="text-xs bg-muted px-2 py-1 rounded">{finding.location}</code>
          {(finding as any).lineNumber && (
            <span className="text-xs ml-2 text-muted-foreground">Line {(finding as any).lineNumber}</span>
          )}
        </div>
      )}
      
      {finding.codeSnippet && (
        <div>
          <p className="text-sm font-medium mb-1">Code Snippet</p>
          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{finding.codeSnippet}</pre>
        </div>
      )}
      
      {(finding as any).category && (
        <div>
          <p className="text-sm font-medium mb-1">Category</p>
          <Badge variant="outline" className="text-xs">
            {(finding as any).category}
          </Badge>
        </div>
      )}
      
      {(finding as any).score && (
        <div>
          <p className="text-sm font-medium mb-1">Risk Score</p>
          <Badge variant="outline" className={`${getSeverityColor(finding.severity)}`}>
            {(finding as any).score}/10
          </Badge>
        </div>
      )}
      
      {finding.recommendation && (
        <div className="bg-primary-blue/10 p-3 rounded flex gap-3">
          <CheckCircle className="h-5 w-5 text-primary-blue shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Recommendation</p>
            <p className="text-sm">{finding.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );

  console.log("Finding groups:", {
    all: normalizedFindings.length,
    critical: criticalFindings.length,
    high: highFindings.length,
    medium: mediumFindings.length,
    low: lowFindings.length,
    info: infoFindings.length
  });

  // Render each finding as an AccordionItem with proper title
  const renderFindingItems = (findings: SecurityFinding[]) => {
    return findings.map((finding) => (
      <AccordionItem 
        key={`finding-${finding.id}`} 
        value={finding.id} 
        className="neo-blur mb-4 rounded-lg overflow-hidden border"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-3 text-left">
            {getSeverityIcon(finding.severity)}
            <div>
              <h3 className="font-medium">{finding.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </Badge>
                {finding.location && (
                  <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                    <FileText className="inline h-3 w-3 mr-1" />
                    {finding.location.split('/').pop()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {renderFindingDetails(finding)}
        </AccordionContent>
      </AccordionItem>
    ));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-full p-3 bg-primary-blue/10 text-primary-blue mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Security Scan Results</h1>
        <p className="text-muted-foreground">
          Repository: <span className="font-medium text-foreground">{result.repository}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          Scanned on {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={`${result.summary.critical > 0 ? 'border-red-300 dark:border-red-800' : ''}`}>
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-medium flex justify-between items-center">
              {result.summary.critical}
              <AlertCircle className={`h-5 w-5 ${result.summary.critical > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardTitle>
            <CardDescription>Critical</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className={`${result.summary.high > 0 ? 'border-orange-300 dark:border-orange-800' : ''}`}>
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-medium flex justify-between items-center">
              {result.summary.high}
              <AlertTriangle className={`h-5 w-5 ${result.summary.high > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </CardTitle>
            <CardDescription>High</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className={`${result.summary.medium > 0 ? 'border-yellow-300 dark:border-yellow-800' : ''}`}>
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-medium flex justify-between items-center">
              {result.summary.medium}
              <AlertTriangle className={`h-5 w-5 ${result.summary.medium > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            </CardTitle>
            <CardDescription>Medium</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className={`${result.summary.low > 0 ? 'border-blue-300 dark:border-blue-800' : ''}`}>
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-medium flex justify-between items-center">
              {result.summary.low}
              <Info className={`h-5 w-5 ${result.summary.low > 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </CardTitle>
            <CardDescription>Low</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className={`${result.summary.info > 0 ? 'border-gray-300 dark:border-gray-700' : ''}`}>
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-medium flex justify-between items-center">
              {result.summary.info}
              <Info className={`h-5 w-5 ${result.summary.info > 0 ? 'text-gray-500' : 'text-muted-foreground'}`} />
            </CardTitle>
            <CardDescription>Info</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {hasFindings ? (
        <Card>
          <CardHeader>
            <CardTitle>Security Findings</CardTitle>
            <CardDescription>
              {normalizedFindings.length} {normalizedFindings.length === 1 ? 'issue' : 'issues'} found in {result.repository}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-7 mb-6">
                <TabsTrigger value="all">All ({normalizedFindings.length})</TabsTrigger>
                <TabsTrigger value="critical" disabled={criticalFindings.length === 0}>
                  Critical ({criticalFindings.length})
                </TabsTrigger>
                <TabsTrigger value="high" disabled={highFindings.length === 0}>
                  High ({highFindings.length})
                </TabsTrigger>
                <TabsTrigger value="medium" disabled={mediumFindings.length === 0}>
                  Medium ({mediumFindings.length})
                </TabsTrigger>
                <TabsTrigger value="low" disabled={lowFindings.length === 0}>
                  Low ({lowFindings.length})
                </TabsTrigger>
                <TabsTrigger value="info" disabled={infoFindings.length === 0}>
                  Info ({infoFindings.length})
                </TabsTrigger>
                <TabsTrigger value="raw">
                  Raw Data
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                  {renderFindingItems(normalizedFindings)}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="critical" className="space-y-4">
                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                  {renderFindingItems(criticalFindings)}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="high" className="space-y-4">
                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                  {renderFindingItems(highFindings)}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="medium" className="space-y-4">
                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                  {renderFindingItems(mediumFindings)}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="low" className="space-y-4">
                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                  {renderFindingItems(lowFindings)}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="info" className="space-y-4">
                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                  {renderFindingItems(infoFindings)}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="raw" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" /> Raw JSON Data
                    </CardTitle>
                    <CardDescription>Complete scan result in JSON format</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">{rawJson}</pre>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={downloadRawJson}>
                      <Download className="h-4 w-4 mr-2" /> Download JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyRawJson}>
                      <Code className="h-4 w-4 mr-2" /> Copy to Clipboard
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-medium mb-2">No vulnerabilities found</h3>
            <p className="text-muted-foreground">
              Great job! Your repository passed all security checks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

