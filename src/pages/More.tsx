import { Link, useNavigate } from "react-router-dom";
import { Settings, HelpCircle, Info, Download, Share2, Calendar, MessageSquare, FileText, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function More() {
  const navigate = useNavigate();
  
  const sections = [
    {
      title: "Study Tools",
      items: [
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
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">More</h1>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h2>
              <Card className="divide-y divide-border">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
