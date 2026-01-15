import { Button } from "@/components/ui/button";
import { Menu, Calendar, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: 'attendee' | 'organizer';
  userName?: string;
  onLogout?: () => void;
}

export function Header({ isAuthenticated = false, userRole, userName, onLogout }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = location === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout?.();
    setLocation('/');
  };

  const navItems = [
    { label: 'Events', path: '/events' },
    { label: 'About', path: '/about' },
  ];

  // Determine header styling based on state
  // If we are on home and not scrolled, we want transparent background and potential white text
  const isTransparent = isHome && !isScrolled;

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          onClick={() => setMobileOpen(false)}
        >
          <Button
            variant="ghost"
            data-testid={`link-${item.label.toLowerCase()}`}
            className={cn(
              location === item.path ? "bg-accent" : "",
              isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""
            )}
          >
            {item.label}
          </Button>
        </Link>
      ))}
      {isAuthenticated && (
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          <Button
            variant="ghost"
            data-testid="link-dashboard"
            className={cn(
              location === '/dashboard' ? "bg-accent" : "",
              isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""
            )}
          >
            Dashboard
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-all duration-300",
        isTransparent
          ? "bg-transparent border-transparent"
          : "bg-background/80 backdrop-blur-xl border-border supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setLocation('/');
            }}
            className={cn(
              "flex items-center gap-2 hover-elevate rounded-lg px-3 py-2 cursor-pointer hover:no-underline transition-colors",
              isTransparent ? "text-white" : "text-foreground"
            )}
            data-testid="link-home"
          >
            <Calendar className={cn("h-6 w-6", isTransparent ? "text-white" : "text-primary")} />
            <span className="text-xl font-bold">EventHive</span>
          </a>


          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className={isTransparent ? "text-white hover:bg-white/10 hover:text-white" : ""} />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className={cn("flex items-center gap-2 px-3", isTransparent ? "text-white" : "")}>
                  <User className={cn("h-4 w-4", isTransparent ? "text-white/80" : "text-muted-foreground")} />
                  <span className="text-sm font-medium" data-testid="text-username">{userName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  data-testid="button-logout"
                  className={isTransparent ? "text-white hover:bg-white/10 hover:text-white" : ""}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="link-login" className={isTransparent ? "text-white hover:bg-white/10 hover:text-white" : ""}>Login</Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="link-register" className={isTransparent ? "bg-white text-black hover:bg-white/90" : ""}>Sign Up</Button>
                </Link>
              </div>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu" className={isTransparent ? "text-white hover:bg-white/10" : ""}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 border-t mt-4 pt-4">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{userName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">Login</Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full justify-start">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
