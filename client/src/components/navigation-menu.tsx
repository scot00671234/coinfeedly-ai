import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MenuIcon, XIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";

interface NavigationMenuProps {
  currentPath?: string;
}

export function NavigationMenu({ currentPath = "/" }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: Event) => {
      const target = e.target as Element;
      if (!target.closest('[data-menu-container]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", description: "View AI predictions and analytics" },
    { path: "/analysis", label: "Analysis", description: "Market indices and sentiment analysis" },
    { path: "/about", label: "About", description: "Learn about our platform and methodology" },
    { path: "/faq", label: "FAQ", description: "Frequently asked questions" },
    { path: "/blog", label: "Blog", description: "Insights and market analysis" },
    { path: "/policy", label: "Policy", description: "Terms and privacy policy" },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="relative" data-menu-container>
      {/* Menu Toggle Button */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-10 w-10 p-0 hover:bg-muted/80 transition-colors flex items-center justify-center"
          data-testid="menu-toggle"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <MenuIcon 
              className={`absolute h-4 w-4 transition-all duration-300 ${
                isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
              }`} 
            />
            <XIcon 
              className={`absolute h-4 w-4 transition-all duration-300 ${
                isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
              }`} 
            />
          </div>
        </Button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-16 right-4 z-50 w-72 max-h-[calc(100vh-5rem)] bg-background border border-border/50 rounded-xl shadow-2xl transition-all duration-300 ease-out flex flex-col ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{ 
          minHeight: '280px',
          maxHeight: 'min(520px, calc(100vh - 5rem))'
        }}
      >
        {/* Menu Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/30">
          <div className="flex items-center space-x-3">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-foreground"></div>
            <span className="font-medium text-foreground text-sm">AIForecast Hub</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Navigate to different sections
          </p>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto p-2 nav-scrollbar">
          {menuItems.map((item, index) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`group relative p-3 rounded-lg transition-all duration-200 hover:bg-muted/60 cursor-pointer mb-1 ${
                  isActive(item.path) 
                    ? 'bg-muted/80 border border-border/30' 
                    : 'hover:translate-x-1'
                }`}
                style={{
                  animationDelay: isOpen ? `${index * 40}ms` : '0ms'
                }}
                data-testid={`menu-item-${item.path.replace('/', '')}`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className={`font-medium text-sm transition-colors ${
                      isActive(item.path) 
                        ? 'text-foreground' 
                        : 'text-foreground group-hover:text-foreground'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 leading-tight">
                      {item.description}
                    </div>
                  </div>
                  {isActive(item.path) && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0 ml-2"></div>
                  )}
                </div>

                {/* Hover indicator */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-60'
                }`}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Menu Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border/30">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-muted-foreground/60"></div>
            <p className="text-xs text-muted-foreground font-medium">
              AIForecast Hub
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}