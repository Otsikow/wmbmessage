import { Link } from "react-router-dom";
import { User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logoImage from "@/assets/logo-final.png";
import BackButton from "@/components/BackButton";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";

interface HeaderProps {
  showBackButton?: boolean;
  backButtonFallbackPath?: string;
}

export default function Header({
  showBackButton = false,
  backButtonFallbackPath = "/",
}: HeaderProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const mobileNavLinks = [
    { label: "Bible", path: "/bible" },
    { label: "Churches", path: "/message-churches" },
    { label: "Events", path: "/events" },
    { label: "Prayer", path: "/prayer-board" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/10 dark:border-white/5 shadow-glass animate-nav-slide-up">
      <div className="container flex flex-col gap-1 px-3 py-2 md:gap-2 md:px-4 md:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            {showBackButton ? (
              <BackButton fallbackPath={backButtonFallbackPath} className="shrink-0" />
            ) : null}
            <Link to="/" aria-label="Go to homepage" className="flex items-center space-x-1.5 md:space-x-3 group">
              <img 
                src={logoImage} 
                alt="MessageGuide Logo" 
                className="h-8 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
              <span className="text-base md:text-xl font-bold text-gradient-blue-purple">
                MessageGuide
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <ThemeToggle />

            <nav className="hidden lg:flex items-center space-x-1">
              <Link to="/bible" className="text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:text-primary hover:bg-primary/10">
                Bible
              </Link>
              <Link to="/messages" className="text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:text-primary hover:bg-primary/10">
                Messages
              </Link>
              <Link to="/message-churches" className="text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:text-emerald-600 hover:bg-emerald-500/10">
                Churches
              </Link>
              <Link to="/search" className="text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:text-primary hover:bg-primary/10">
                Search
              </Link>
              <Link to="/library" className="text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:text-primary hover:bg-primary/10">
                Library
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={`${user.email} avatar`} />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth/sign-in">
                  <Button variant="default" size="sm" className="ml-2">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="lg:hidden">
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth/sign-in" className="lg:hidden">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        <nav className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-primary hover:bg-primary/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <PageBreadcrumbs className="hidden sm:block" />
      </div>
    </header>
  );
}
