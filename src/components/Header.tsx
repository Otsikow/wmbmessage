import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import logoImage from "@/assets/logo-final.png";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80 border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 md:space-x-3">
          <img src={logoImage} alt="MessageGuide Logo" className="h-10 md:h-12 w-auto" />
          <span className="text-lg md:text-xl font-bold text-primary">
            MessageGuide
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/reader" className="text-sm font-medium transition-colors hover:text-primary">
              Bible
            </Link>
            <Link to="/search" className="text-sm font-medium transition-colors hover:text-primary">
              Search
            </Link>
            <Link to="/collections" className="text-sm font-medium transition-colors hover:text-primary">
              Collections
            </Link>
            <Link to="/notes" className="text-sm font-medium transition-colors hover:text-primary">
              Notes
            </Link>
            <Link to="/auth/sign-in">
              <Button variant="default" size="sm" className="ml-2">
                Sign In
              </Button>
            </Link>
          </nav>

          <Link to="/auth/sign-in" className="lg:hidden">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
