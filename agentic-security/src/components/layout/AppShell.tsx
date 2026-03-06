
import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sun, Moon, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  useEffect(() => {
    // Apply the theme class to the html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save the theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full transition-transform hover:scale-110"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? 
            <Sun className="h-5 w-5 text-yellow-300" /> : 
            <Moon className="h-5 w-5 text-slate-700" />
          }
        </Button>
      </Navbar>
      
      <main className="flex-1 px-4 py-6 md:px-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      <footer className="py-6 px-4 md:px-6 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <p>&copy; {new Date().getFullYear()} Code scanner</p>
            <p className="text-xs">Supported by the <a href="https://agentics.org" target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">Agentics Foundation</a></p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/agenticsorg/agentic-security" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </a>
            <nav className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/about" className="hover:text-foreground transition-colors">About</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};
