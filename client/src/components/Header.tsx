import { Button } from "@/components/ui/button";
import { Menu, Calendar, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: 'attendee' | 'organizer';
  userName?: string;
  onLogout?: () => void;
}

export function Header({ isAuthenticated = false, userRole, userName, onLogout }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    onLogout?.();
    setLocation('/');
  };


  const handleLogoClick = () => {
    window.location.reload();
  }

  const navItems = [
    { label: 'Events', path: '/events' },
    { label: 'About', path: '/about' },
  ];

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
            className={location === item.path ? "bg-accent" : ""}
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
            className={location === '/dashboard' ? "bg-accent" : ""}
          >
            Dashboard
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

            <div onClick={handleLogoClick} className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2" data-testid="link-home">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">EventHive</span>
            </div>
          

          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium" data-testid="text-username">{userName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="link-login">Login</Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="link-register">Sign Up</Button>
                </Link>
              </div>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
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
