import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="MessageGuide Logo" className="h-10 w-10" />
          <span className="text-xl font-bold bg-hero-gradient bg-clip-text text-transparent">
            MessageGuide
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/reader" className="text-sm font-medium transition-colors hover:text-primary">
            Bible Reader
          </Link>
          <Link to="/wmb-sermons" className="text-sm font-medium transition-colors hover:text-primary">
            WMB Sermons
          </Link>
          <Link to="/search" className="text-sm font-medium transition-colors hover:text-primary">
            Search
          </Link>
          <Link to="/collections" className="text-sm font-medium transition-colors hover:text-primary">
            Collections
          </Link>
          <Link to="/auth/sign-in">
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </Link>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
