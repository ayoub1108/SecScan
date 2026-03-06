import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  Search, 
  AlertTriangle, 
  ArrowRight, 
  BarChart, 
  Github,
  Terminal,
  Package,
  FileWarning,
  Activity,
  RefreshCw,
  Lightbulb,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/layout/AppShell';
import { ScannerForm } from '@/components/scanner/ScannerForm';
import { SEO } from '@/components/layout/SEO';

const Index = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <SEO 
        title="AI-Powered Code Security Analysis | Code  Scanner"
        description="Discover real vulnerabilities with our AI-powered security scanner. Built with OpenAI Agents to provide intelligent scanning of your code repositories."
        keywords="security scanner, code security, OpenAI, AI agents, vulnerability detection, static analysis, dependency scanning, GitHub integration"
      />
      
      <section className="py-12 md:py-24 space-y-24">
        {/* Hero Section */}
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-10 w-10 text-primary-blue" />
              <Bot className="h-8 w-8 text-primary-blue" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter animate-fade-in">
              Code scanner 
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px] mx-auto animate-fade-in animation-delay-100">
              Discover real vulnerabilities, track security posture, and protect your applications with our AI-powered security scanner built using OpenAI Agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in animation-delay-200">
              <Button 
                className="bg-primary-blue hover:bg-primary-blue/90 text-white"
                size="lg"
                onClick={() => navigate('/scanner')}
              >
                Start Scanning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/about')}
              >
                Learn More
                <Lightbulb className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl animate-fade-in animation-delay-300">
            <Card className="neo-blur">
              <CardHeader className="space-y-1">
                <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                  <Search className="h-6 w-6 text-primary-blue" />
                </div>
                <CardTitle className="text-xl">Static Analysis</CardTitle>
                <CardDescription>
                  Find vulnerabilities in your code with our functional AI-powered scanner
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="neo-blur">
              <CardHeader className="space-y-1">
                <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                  <Activity className="h-6 w-6 text-primary-blue" />
                </div>
                <CardTitle className="text-xl">Continuous Monitoring</CardTitle>
                <CardDescription>
                  Track security posture over time with local browser storage
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="neo-blur">
              <CardHeader className="space-y-1">
                <div className="bg-primary-blue/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                  <Github className="h-6 w-6 text-primary-blue" />
                </div>
                <CardTitle className="text-xl">GitHub Integration</CardTitle>
                <CardDescription>
                  Create issues for critical findings in your repositories
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        
        {/* How it works section */}
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter">How It Works</h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Our security scanner leverages OpenAI Agents to provide comprehensive security analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-2 animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center">
                  <Terminal className="h-8 w-8 text-primary-blue" />
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-primary-blue flex items-center justify-center text-white font-medium">
                  1
                </div>
              </div>
              <h3 className="text-lg font-medium mt-4">Code Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI agents scan your code for vulnerabilities and secrets
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2 animate-fade-in animation-delay-100">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center">
                  <Package className="h-8 w-8 text-primary-blue" />
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-primary-blue flex items-center justify-center text-white font-medium">
                  2
                </div>
              </div>
              <h3 className="text-lg font-medium mt-4">Dependency Check</h3>
              <p className="text-sm text-muted-foreground">
                Identifies known vulnerabilities in your project dependencies
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2 animate-fade-in animation-delay-200">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center">
                  <FileWarning className="h-8 w-8 text-primary-blue" />
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-primary-blue flex items-center justify-center text-white font-medium">
                  3
                </div>
              </div>
              <h3 className="text-lg font-medium mt-4">Configuration Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Validates security settings in configuration files
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2 animate-fade-in animation-delay-300">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-primary-blue" />
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-primary-blue flex items-center justify-center text-white font-medium">
                  4
                </div>
              </div>
              <h3 className="text-lg font-medium mt-4">Reporting</h3>
              <p className="text-sm text-muted-foreground">
                Generates detailed reports with actionable recommendations
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="container px-4 md:px-6">
          <div className="rounded-2xl bg-primary-blue p-8 md:p-12 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-blue to-primary-dark opacity-90"></div>
            <div className="relative z-10">
              <div className="max-w-3xl mx-auto text-center text-white space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter">Ready to secure your code?</h2>
                <p className="text-lg opacity-90">
                  Start scanning your repositories today with our OpenAI Agent-powered edge function and identify security vulnerabilities in real-time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button className="bg-white text-primary-blue hover:bg-white/90" size="lg" onClick={() => navigate('/scanner')}>
                    Start Scanning Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
