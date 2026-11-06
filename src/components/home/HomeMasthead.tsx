import { Link, useNavigate } from "react-router-dom";
import { BookMarked, LogOut, Menu, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-final.png";

const links = [
  { label: "Bible", path: "/reader" },
  { label: "Sermons", path: "/wmb-sermons" },
  { label: "Study Notes", path: "/study-notes" },
];

export default function HomeMasthead() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  return (
    <header className="home-masthead">
      <div className="home-container home-masthead-inner">
        <Link to="/" className="home-brand" aria-label="MessageGuide home">
          <img src={logo} alt="" width="36" height="36" />
          <span>MessageGuide</span>
        </Link>
        <nav className="home-desktop-nav" aria-label="Main navigation">
          {links.map(({ label, path }) => <Link key={path} to={path}>{label}</Link>)}
        </nav>
        <div className="home-header-controls">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu"><User aria-hidden="true" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="home-editorial-overlay">
                <DropdownMenuItem onClick={() => navigate("/profile")}><User />Profile & settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/library")}><BookMarked />My Library</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notes")}>My Notes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/plans")}>Reading progress</DropdownMenuItem>
                {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}><Shield />Admin Dashboard</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}><LogOut />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : <Button variant="ghost" asChild className="home-sign-in"><Link to="/auth/sign-in">Sign in</Link></Button>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="home-mobile-menu" aria-label="Open navigation menu"><Menu aria-hidden="true" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="home-editorial-overlay">
              {links.map(({ label, path }) => <DropdownMenuItem key={path} asChild><Link to={path}>{label}</Link></DropdownMenuItem>)}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/more">More from MessageGuide</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}