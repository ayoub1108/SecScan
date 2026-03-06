
import { useScanStore } from '@/hooks/useScanStore';
import { ScanResult } from '@/types/scanner';
import { Calendar, Trash2, AlertCircle, AlertTriangle, Info, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export const ScanHistory = () => {
  const { history, deleteResult, clearHistory } = useScanStore();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Add effect to ensure component shows loading state until history is loaded
  useEffect(() => {
    console.log('ScanHistory component mounted, history length:', history.length);
    setIsLoaded(true);
  }, []);
  
  const handleClearHistory = () => {
    clearHistory();
  };
  
  const handleDeleteResult = (id: string) => {
    deleteResult(id);
  };
  
  const getSeverityCount = (result: ScanResult, severity: keyof ScanResult['summary']) => {
    return result.summary[severity];
  };
  
  const getTotalIssues = (result: ScanResult) => {
    return result.findings.length;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading state until history is loaded
  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center rounded-full p-3 bg-primary-blue/10 text-primary-blue animate-pulse">
          <Calendar className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Loading History...</h1>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center rounded-full p-3 bg-primary-blue/10 text-primary-blue">
          <Calendar className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">No Scan History</h1>
        <p className="text-muted-foreground">
          You haven't performed any security scans yet.
        </p>
        <Button 
          onClick={() => navigate('/scanner')}
          className="mt-4 bg-primary-blue hover:bg-primary-blue/90 text-white"
        >
          Start a Scan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  console.log('Rendering scan history items:', history.length);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
        <Button
          variant="outline"
          onClick={handleClearHistory}
          className="text-sm"
        >
          Clear History
          <Trash2 className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {history.map((result) => (
          <Card key={result.id} className="overflow-hidden transition-all hover:shadow-md neo-blur">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg md:text-xl">{result.repository}</CardTitle>
                  <CardDescription>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(result.timestamp)}
                    </span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteResult(result.id)}
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <AlertCircle className={`h-4 w-4 ${result.summary.critical > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span>{result.summary.critical} Critical</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className={`h-4 w-4 ${result.summary.high > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <span>{result.summary.high} High</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className={`h-4 w-4 ${result.summary.medium > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <span>{result.summary.medium} Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <Info className={`h-4 w-4 ${result.summary.low > 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <span>{result.summary.low + result.summary.info} Low/Info</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                variant="outline"
                className="w-full justify-center bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300"
                onClick={() => {
                  toast.success(`Viewing results for ${result.repository}`);
                  navigate('/scanner', { state: { result } });
                }}
              >
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
