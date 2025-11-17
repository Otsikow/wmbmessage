import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

const PATH_LABELS: Record<string, string> = {
  "": "Home",
  bible: "Bible Reader",
  reader: "Bible Reader",
  messages: "Sermons",
  "wmb-sermons": "Sermons",
  "message-reader": "Message Reader",
  "cross-references": "Cross References",
  search: "Search",
  plans: "Reading Plans",
  library: "Library",
  collections: "Collections",
  notes: "Notes",
  daily: "Daily Verse",
  more: "More",
  calendar: "Calendar",
  downloads: "Downloads",
  share: "Share",
  help: "Help Center",
  about: "About",
  settings: "Settings",
  profile: "Profile",
  admin: "Admin Dashboard",
  auth: "Account",
  "sign-in": "Sign In",
  "sign-up": "Sign Up",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "verify-email": "Verify Email",
  privacy: "Privacy",
  terms: "Terms",
};

const formatSegment = (segment: string, previous?: string) => {
  if (!segment) return "";

  if (previous === "day") {
    return `Day ${segment}`;
  }

  if (previous === "plans") {
    return `Plan ${segment}`;
  }

  if (PATH_LABELS[segment]) {
    return PATH_LABELS[segment];
  }

  if (/^\d+$/.test(segment)) {
    return segment;
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export function PageBreadcrumbs({ className }: { className?: string }) {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const crumbs = [
      {
        label: PATH_LABELS[""] ?? "Home",
        href: "/",
      },
    ];

    let pathAccumulator = "";

    segments.forEach((segment, index) => {
      pathAccumulator += `/${segment}`;
      const label = formatSegment(segment, segments[index - 1]);
      const isVirtualDaySegment = segment === "day" && Boolean(segments[index + 1]);

      crumbs.push({
        label,
        href:
          index === segments.length - 1 || isVirtualDaySegment
            ? undefined
            : pathAccumulator,
      });
    });

    return crumbs;
  }, [location.pathname]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className={cn("text-xs sm:text-sm", className)}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${crumb.href ?? index}`}>
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default PageBreadcrumbs;
