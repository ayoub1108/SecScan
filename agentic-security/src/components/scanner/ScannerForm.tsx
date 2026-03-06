import { ScanningModal } from './ScanningModal';
import { useState, useEffect } from 'react';
import { useScanStore } from '@/hooks/useScanStore';  
import { ScanResult } from '@/types/scanner';
import { Shield, AlertCircle, Info, ArrowRight, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanResults } from './ScanResults';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AdvancedScanOptions {
  useWebSearch: boolean;
  sendReport: boolean;
  recipientEmail: string;
  createIssues: boolean;
  includeRecommendations: boolean;
  customDepth: string;
  customFileTypes: string;
  scanHistory: boolean;
  forceFreshScan: boolean;
}

interface ScannerFormProps {
  onScanStart?: (repository: string) => void;
}

export const ScannerForm = ({ onScanStart }: ScannerFormProps) => {
  const { runScan, loading, currentScan, checkRecentScan } = useScanStore();
  const [scanComplete, setScanComplete] = useState(false);
  const [repository, setRepository] = useState('agenticsorg/agentic-security');
  const [branch, setBranch] = useState('main');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [formComplete, setFormComplete] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedScanOptions>({
    useWebSearch: false,
    sendReport: false,
    recipientEmail: '',
    createIssues: false,
    includeRecommendations: true,
    customDepth: '3',
    customFileTypes: 'js,ts,py,rb,go,java,php',
    scanHistory: false,
    forceFreshScan: false
  });
  
  // Effect to handle auto-redirection when scan completes
  useEffect(() => {
    if (!loading && scanComplete && result) {
      // Small delay to allow the scanning animation to complete
      const timer = setTimeout(() => {
        setFormComplete(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, scanComplete, result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repository) return;
    
    if (onScanStart) {
      onScanStart(repository);
    }
    
    try {
      console.log("Starting scan process for:", repository, branch);
      
      setScanComplete(false);
      
      if (!advancedOptions.forceFreshScan) {
        const recentScan = checkRecentScan(repository, branch);
        if (recentScan) {
          console.log("Found recent scan, reusing results:", recentScan);
          toast.success("Using recent scan results");
          setResult(recentScan);
          setFormComplete(true);
          return recentScan;
        } else {
          console.log("No recent scan found, proceeding with new scan");
        }
      } else {
        console.log("Force fresh scan enabled, skipping recent scan check");
      }
      
      console.log("Starting new scan with parameters:", {
        repository,
        branch,
        advanced: advancedOptions
      });
      
      const scanResult = await runScan({ 
        repository, 
        branch,
        useWebSearch: advancedOptions.useWebSearch,
        sendReport: advancedOptions.sendReport && advancedOptions.recipientEmail ? true : false,
        recipient: advancedOptions.recipientEmail,
        createIssues: advancedOptions.createIssues,
        includeRecommendations: advancedOptions.includeRecommendations,
        scanDepth: parseInt(advancedOptions.customDepth) || 3,
        fileTypes: advancedOptions.customFileTypes.split(',').map(t => t.trim()),
        scanHistory: advancedOptions.scanHistory
      });
      
      console.log("Scan completed successfully. Results:", scanResult);
      console.log("Findings count:", scanResult.findings.length);
      console.log("Summary:", scanResult.summary);
      
      setResult(scanResult);
      setScanComplete(true);
      return scanResult;
    } catch (error) {
      console.error('Scan failed:', error);
      return null;
    }
  };

  const resetForm = () => {
    setFormComplete(false);
    setResult(null);
  };

  const handleAdvancedOptionChange = (field: keyof AdvancedScanOptions, value: any) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (formComplete && result) {
    return (
      <div className="space-y-8 animate-fade-in">
        <ScanResults result={result} />
        <div className="flex justify-center">
          <Button onClick={resetForm} variant="outline" className="mt-4">
            New Scan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScanningModal isOpen={loading} status="scanning" repository={repository} />
      

    <div className="space-y-8">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full p-3 bg-primary-blue/10 text-primary-blue mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Security Scanner</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Scan your code repository for security vulnerabilities and best practices
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto neo-blur animate-scale-in">
        <CardHeader>
          <CardTitle>Repository Scanner</CardTitle>
          <CardDescription>
            Enter a repository path to analyze its security posture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="repository" className="text-sm font-medium">
                Repository Path
              </label>
              <Input
                id="repository"
                placeholder="owner/repository"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                required
                className="transition-all duration-300 focus-visible:ring-primary-blue"
              />
              <p className="text-xs text-muted-foreground">
                Example: agenticsorg/agentic-security
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="branch" className="text-sm font-medium">
                Branch
              </label>
              <Input
                id="branch"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="transition-all duration-300 focus-visible:ring-primary-blue"
              />
            </div>
            
            <Collapsible
              open={showAdvanced}
              onOpenChange={setShowAdvanced}
              className="w-full border rounded-md p-2"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-2">
                  <span>Advanced Options</span>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="useWebSearch"
                      checked={advancedOptions.useWebSearch}
                      onCheckedChange={(checked) => 
                        handleAdvancedOptionChange('useWebSearch', Boolean(checked))
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="useWebSearch"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Use Web Search
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Enhance scan with latest CVEs from the web
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="createIssues"
                      checked={advancedOptions.createIssues}
                      onCheckedChange={(checked) => 
                        handleAdvancedOptionChange('createIssues', Boolean(checked))
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="createIssues"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Create GitHub Issues
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Automatically create issues for critical findings
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="scanHistory"
                      checked={advancedOptions.scanHistory}
                      onCheckedChange={(checked) => 
                        handleAdvancedOptionChange('scanHistory', Boolean(checked))
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="scanHistory"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Historical Analysis
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Compare with previous scans
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="includeRecommendations"
                      checked={advancedOptions.includeRecommendations}
                      onCheckedChange={(checked) => 
                        handleAdvancedOptionChange('includeRecommendations', Boolean(checked))
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="includeRecommendations"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include Recommendations
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Add fix recommendations to findings
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="customDepth" className="text-sm font-medium">
                      Scan Depth
                    </label>
                    <Input
                      id="customDepth"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="3"
                      value={advancedOptions.customDepth}
                      onChange={(e) => handleAdvancedOptionChange('customDepth', e.target.value)}
                      className="transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="customFileTypes" className="text-sm font-medium">
                      File Types
                    </label>
                    <Input
                      id="customFileTypes"
                      placeholder="js,ts,py,rb,go,java,php"
                      value={advancedOptions.customFileTypes}
                      onChange={(e) => handleAdvancedOptionChange('customFileTypes', e.target.value)}
                      className="transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="sendReport"
                      checked={advancedOptions.sendReport}
                      onCheckedChange={(checked) => 
                        handleAdvancedOptionChange('sendReport', Boolean(checked))
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="sendReport"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Send Email Report
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Send a detailed security report via email
                      </p>
                    </div>
                  </div>
                  
                  {advancedOptions.sendReport && (
                    <div className="mt-2">
                      <Input
                        id="recipientEmail"
                        type="email"
                        placeholder="recipient@example.com"
                        value={advancedOptions.recipientEmail}
                        onChange={(e) => handleAdvancedOptionChange('recipientEmail', e.target.value)}
                        className="transition-all duration-300"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-start space-x-2 pt-2 border-t">
                  <Checkbox 
                    id="forceFreshScan"
                    checked={advancedOptions.forceFreshScan}
                    onCheckedChange={(checked) => 
                      handleAdvancedOptionChange('forceFreshScan', Boolean(checked))
                    }
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="forceFreshScan"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Force Fresh Scan
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Always perform a new scan even if recent results exist
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Button 
              type="submit" 
              disabled={loading || !repository}
              className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-pulse">Scanning</span>
                </span>
              ) : (
                <span className="flex items-center">
                  Scan Repository
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-4 border-t pt-4">
          <div className="flex items-start space-x-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
            <p>
              Recent scan results are reused if available (within 24 hours) for faster performance.
            </p>
          </div>
          <div className="flex items-start space-x-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-orange-500" />
            <p>
              This scanner uses a real edge function to analyze repositories. Results are stored in your browser.
            </p>
          </div>
          <div className="flex items-start space-x-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            <p>
              For additional enterprise security features, consider GitHub Advanced Security or other commercial solutions.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  );
};
