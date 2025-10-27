import { Link, useNavigate } from "react-router-dom";
import { Settings, HelpCircle, Info, Download, Share2, Calendar, MessageSquare, FileText, ArrowLeft, Library as LibraryIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function More() {
  const navigate = useNavigate();
  
  const sections = [
    {
      title: "Study Tools",
      items: [
        { icon: LibraryIcon, label: "My Library", path: "/library" },
        { icon: FileText, label: "My Notes", path: "/notes" },
        { icon: MessageSquare, label: "WMB Sermons", path: "/wmb-sermons" },
        { icon: Calendar, label: "Calendar", path: "/calendar" },
      ],
    },
    {
      title: "Content",
      items: [
        { icon: Download, label: "Downloads", path: "/downloads" },
        { icon: Share2, label: "Share", path: "/share" },
      ],
    },
    {
      title: "Account & Support",
      items: [
        { icon: Settings, label: "Settings", path: "/settings" },
        { icon: HelpCircle, label: "Help", path: "/help" },
        { icon: Info, label: "About", path: "/about" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 w-full py-6 sm:py-8 pb-24 md:pb-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="md:hidden shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">More</h1>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  {section.title}
                </h2>
                <div className="bg-card border border-border rounded-lg divide-y divide-border">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                        <span className="flex-1 font-medium text-sm sm:text-base">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
