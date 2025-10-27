import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  StickyNote, 
  Calendar,
  Download,
  Share2,
  Settings,
  HelpCircle,
  Info,
  Mail,
  FileText,
  Shield,
  Heart,
  Mic
} from "lucide-react";
import logoImage from "@/assets/logo-final.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="MessageGuide Logo" 
                className="h-10 w-auto" 
              />
              <span className="text-lg font-bold text-primary">
                MessageGuide
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your comprehensive guide to scripture and prophetic messages. Study the Bible, explore sermons, and grow in faith.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>Made for believers worldwide</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Features
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/reader" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Bible Reader
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Scripture
                </Link>
              </li>
              <li>
                <Link 
                  to="/wmb-sermons" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mic className="h-3.5 w-3.5" />
                  WMB Sermons
                </Link>
              </li>
              <li>
                <Link 
                  to="/collections" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  Collections
                </Link>
              </li>
              <li>
                <Link 
                  to="/notes" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  My Notes
                </Link>
              </li>
              <li>
                <Link 
                  to="/calendar" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Reading Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Info className="h-3.5 w-3.5" />
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Help & Support
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </li>
              <li>
                <Link 
                  to="/downloads" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  Downloads
                </Link>
              </li>
              <li>
                <Link 
                  to="/share" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share App
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Legal & Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:support@messageguide.com" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  support@messageguide.com
                </a>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} MessageGuide. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/help" className="hover:text-primary transition-colors">
                Help
              </Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
