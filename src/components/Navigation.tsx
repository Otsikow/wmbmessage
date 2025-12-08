import { Link, useLocation } from "react-router-dom";
import { Home, Book, Search, BookOpen, Library as LibraryIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/bible", icon: Book, label: "Bible" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/messages", icon: BookOpen, label: "Messages" },
  { path: "/library", icon: LibraryIcon, label: "Library" },
];

export default function Navigation() {
  const location = useLocation();

  // Hide navigation on auth pages
  const hideNav = location.pathname.startsWith('/auth');

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-inset-bottom">
      {/* Glass navigation bar with premium styling */}
      <div className="mx-2 mb-2 rounded-glass glass glass-elevated border border-white/10 dark:border-white/5 shadow-depth">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-12 transition-all duration-300 ease-out rounded-xl mx-0.5",
                  isActive
                    ? "text-primary bg-primary/15 dark:bg-primary/20 shadow-inner"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mb-0.5 transition-all duration-300", 
                    isActive && "scale-110 icon-neon"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
