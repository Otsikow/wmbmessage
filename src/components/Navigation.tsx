import { Link, useLocation } from "react-router-dom";
import { BookOpen, Ellipsis, House, Music, TextSearch } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: House, label: "Home", routes: ["/"] },
  { path: "/bible", icon: BookOpen, label: "Bible", routes: ["/bible", "/reader", "/search"] },
  { path: "/messages", icon: TextSearch, label: "Messages", routes: ["/messages", "/wmb-sermons", "/message-reader", "/study-notes"] },
  { path: "/songs", icon: Music, label: "Songs", routes: ["/songs"] },
  { path: "/more", icon: Ellipsis, label: "More", routes: ["/more", "/message-churches", "/events", "/prayer-board", "/testimonies", "/downloads", "/share", "/calendar", "/plans", "/library", "/notes", "/profile", "/help", "/about"] },
];

export default function Navigation() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav aria-label="Main tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid h-[var(--mobile-tab-height)] max-w-md grid-cols-5 px-1">
        {tabs.map(({ path, icon: Icon, label, routes }) => {
          const active = routes.some((route) => pathname === route || (route !== "/" && pathname.startsWith(route + "/")));
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? (pathname === path ? "page" : "location") : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                active ? "text-primary" : "text-muted-foreground active:bg-muted",
              )}
            >
              <span className={cn("grid h-7 w-12 place-items-center rounded-full", active && "bg-primary/10")}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
              </span>
              <span className={cn("text-[11px] leading-none", active ? "font-semibold" : "font-medium")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
