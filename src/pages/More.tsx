import { Link } from "react-router-dom";
import {
  ChevronRight,
  Church,
  HelpCircle,
  Presentation,
  Info,
  Download,
  Share2,
  Calendar,
  CalendarDays,
  MessageSquare,
  FileText,
  Library as LibraryIcon,
  Target,
  HeartHandshake,
  User,
} from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CHURCH_PRESENTER, CHURCH_PRESENTER_PATH } from "@/lib/churchPresenter";

export default function More() {
  const sections = [
    {
      title: "Study Tools",
      items: [
        { icon: LibraryIcon, label: "My Library", path: "/library" },
        { icon: Target, label: "Reading Plans", path: "/plans" },
        { icon: FileText, label: "My Notes", path: "/notes" },
        { icon: FileText, label: "Message Study Notes", path: "/study-notes" },
        { icon: MessageSquare, label: "William Branham Messages", path: "/messages" },
        { icon: MessageSquare, label: "Sermon Study Tools", path: "/wmb-sermons" },
        { icon: Calendar, label: "Calendar", path: "/calendar" },
      ],
    },
    {
      title: "Content",
      items: [
        { icon: Download, label: "Downloads", path: "/downloads" },
        {
          icon: Presentation,
          label: CHURCH_PRESENTER.title,
          path: CHURCH_PRESENTER_PATH,
        },
        { icon: Share2, label: "Share", path: "/share" },
      ],
    },
    {
      title: "Community",
      items: [
        { icon: CalendarDays, label: "Events", path: "/events" },
        {
          icon: Church,
          label: "Find a Church",
          path: "/message-churches",
        },
        {
          icon: HeartHandshake,
          label: "Prayer Board",
          path: "/prayer-board",
        },
        {
          icon: HeartHandshake,
          label: "Testimonies",
          path: "/testimonies",
        },
      ],
    },
    {
      title: "Account & Support",
      items: [
        { icon: User, label: "Profile & Settings", path: "/profile?tab=settings" },
        { icon: HelpCircle, label: "Help", path: "/help" },
        { icon: Info, label: "About", path: "/about" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Header />
      <main className="w-full flex-1 py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-3xl mx-auto">
          <h1 className="mb-6 text-[2rem] font-bold leading-tight tracking-tight sm:mb-8 sm:text-4xl">More</h1>

          <div className="space-y-6 sm:space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="px-2 text-sm font-semibold text-muted-foreground">
                  {section.title}
                </h2>

                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border/70 bg-card">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <Link to={item.path} className="flex min-h-[3.25rem] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none active:bg-muted">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1 text-base font-medium">{item.label}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <Navigation />
    </div>
  );
}
