
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield, History, Home, Info, Terminal, Database, Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavbarProps {
  children?: React.ReactNode;
}

export const Navbar = ({ children }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    
    
   
  ];

  // Function to handle menu click - scrolls to top
  const handleMenuClick = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    setIsOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Shield className="h-6 w-6 text-primary-blue" />
            <span className="hidden md:inline-block">Code scanner</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium hover:text-primary transition-colors relative group flex items-center gap-2"
            >
              <item.icon className="h-4 w-4 text-primary-blue" />
              {item.label}
              <span className="absolute -bottom-[1px] left-0 w-0 h-0.5 bg-primary-blue transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {children}
          
          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" onClick={handleMenuClick}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsOpen(false)}>
                      <Shield className="h-6 w-6 text-primary-blue" />
                      <span>Code scanner</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                </div>
                <nav className="flex-1 overflow-auto py-6 px-6">
                  <ul className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-primary-blue" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="p-6 border-t">
                  {children}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
