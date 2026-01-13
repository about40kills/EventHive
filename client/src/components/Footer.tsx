import { Calendar, Github } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">EventHive</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover and manage amazing events with ease
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Browse Events</span>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Create Account</span>
                </Link>
              </li>
              <li>
                <Link href="/create-event">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">For Organizers</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Help Center</span>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Contact Us</span>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">FAQ</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/privacy">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/terms">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">Cookie Policy</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <p>© 2025 EventHive. All rights reserved.</p>
            <a
              href="https://github.com/about40kills"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
