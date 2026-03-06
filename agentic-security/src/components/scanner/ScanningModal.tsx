
import React, { useEffect } from 'react';
import { Shield, AlertCircle, Loader, ScanLine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ScanningModalProps {
  isOpen: boolean;
  status: 'scanning' | 'success' | 'error';
  repository: string;
}

export const ScanningModal = ({ isOpen, status, repository }: ScanningModalProps) => {
  // Force dialog to be open when isOpen is true
  const open = isOpen;
  const [progress, setProgress] = React.useState(0);
  
  // Animated progress that moves even during indeterminate state
  useEffect(() => {
    if (status === 'scanning') {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          // Randomize progress somewhat, but ensure it never reaches 100%
          // until the scan is complete
          const increment = Math.random() * 8;
          const nextProgress = prevProgress + increment;
          return nextProgress >= 95 ? 95 : nextProgress;
        });
      }, 800);
      
      return () => {
        clearInterval(timer);
        // Set to 100 when done
        if (status !== 'scanning') {
            // Reset progress to 100% when scan is complete
          setProgress(100);
        }
      };
    } else if (status === 'success') {
      setProgress(100);
    }
  }, [status]);
  
  return (
    <Dialog open={open} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === 'scanning' && 'Security Scan in Progress'}
            {status === 'success' && 'Security Scan Complete'}
            {status === 'error' && 'Security Scan Failed'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <div className="relative">
            {status === 'scanning' && (
              <div className="relative h-24 w-24 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-14 w-14 text-primary-blue" />
                </div>
                <div className="absolute inset-0 border-4 border-primary-blue/20 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-t-primary-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
                  style={{ animationDuration: '1.5s' }}
                ></div>
                <ScanLine className="absolute h-20 w-20 text-primary-blue animate-pulse" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="rounded-full bg-green-100 p-3 animate-scale-in">
                <Shield className="h-16 w-16 text-green-600" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="rounded-full bg-red-100 p-3 animate-scale-in">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-medium">
              {status === 'scanning' && `Scanning ${repository}`}
              {status === 'success' && 'Analysis complete'}
              {status === 'error' && 'An error occurred'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {status === 'scanning' && 'Analyzing code, dependencies, and security patterns...'}
              {status === 'success' && 'Redirecting to results...'}
              {status === 'error' && 'Please try again later'}
            </p>
          </div>
          
          {status === 'scanning' && (
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2 transition-all duration-700" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
