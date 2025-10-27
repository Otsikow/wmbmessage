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

export default function Header() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
            <Link to="/bible" className="text-sm font-medium transition-colors hover:text-primary">
              Bible
            </Link>
            <Link to="/messages" className="text-sm font-medium transition-colors hover:text-primary">
              Messages
            </Link>
            <Link to="/search" className="text-sm font-medium transition-colors hover:text-primary">
              Search
            </Link>
            <Link to="/cross-references" className="text-sm font-medium transition-colors hover:text-primary">
              References
            </Link>
            <Link to="/library" className="text-sm font-medium transition-colors hover:text-primary">
              Library
            </Link>
            <Link to="/settings" className="text-sm font-medium transition-colors hover:text-primary">
              Settings
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
    </header>
  );
}
