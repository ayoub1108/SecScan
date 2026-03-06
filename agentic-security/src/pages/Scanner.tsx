
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useScanStore } from '@/hooks/useScanStore';
import { AppShell } from '@/components/layout/AppShell';
import { ScannerForm } from '@/components/scanner/ScannerForm';
import { ScanResults } from '@/components/scanner/ScanResults';
import { ScanResult } from '@/types/scanner';
import { Button } from '@/components/ui/button';
import { ScanningModal } from '@/components/scanner/ScanningModal';

const Scanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentScan, loading } = useScanStore();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [scanningStatus, setScanningStatus] = useState<'scanning' | 'success' | 'error'>('scanning');
  const [repository, setRepository] = useState('');
  const [scanComplete, setScanComplete] = useState(false);

  // Check if result was passed from history page
  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      setShowForm(false);
    } else if (currentScan) {
      setResult(currentScan);
      setShowForm(false);
    }
  }, [location.state, currentScan]);

  // Handle loading state changes and control scan status
  useEffect(() => {
    if (loading) {
      setScanningStatus('scanning');
      setScanComplete(false);
    } else if (currentScan && showForm) {
      // Scan has just finished but we're still showing the form
      setScanningStatus('success');
      setScanComplete(true);
    }
  }, [loading, currentScan, showForm]);

  // Handle automatic redirection to results when scan completes
  useEffect(() => {
    if (scanComplete && currentScan) {
      // Show success state briefly before redirecting
      const timer = setTimeout(() => {
        setResult(currentScan);
        setShowForm(false);
        setScanComplete(false);
      }, 1500); // Delay for 1.5 seconds to show success animation
      
      return () => clearTimeout(timer);
    }
  }, [scanComplete, currentScan]);

  const handleNewScan = () => {
    setResult(null);
    setShowForm(true);
  };

  const handleScanStart = (repo: string) => {
    setRepository(repo);
    // Ensure we're showing the form while loading is happening
    setShowForm(true);
  };

  return (
    <AppShell>
      <div className="container px-4 md:px-6 py-8">
        {showForm ? (
          <ScannerForm onScanStart={handleScanStart} />
        ) : (
          <div className="space-y-8 animate-fade-in">
            <ScanResults result={result as ScanResult} />
            <div className="flex justify-center">
              <Button onClick={handleNewScan} variant="outline" className="mt-4">
                New Scan
              </Button>
            </div>
          </div>
        )}
        
        <ScanningModal 
          isOpen={loading || scanComplete} 
          status={scanningStatus}
          repository={repository}
        />
      </div>
    </AppShell>
  );
};

export default Scanner;
