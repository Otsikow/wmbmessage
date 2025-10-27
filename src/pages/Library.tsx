import { useNavigate } from "react-router-dom";
import { ArrowLeft, Book, BookOpen, Bookmark, Calendar, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Library() {
  const navigate = useNavigate();

  const libraryItems = [
    {
      title: "Bible Translations",
      description: "Access different Bible translations and versions",
      icon: Book,
      path: "/bible",
      count: "1 translation"
    },
    {
      title: "WMB Sermons",
      description: "William Branham's sermon collection",
      icon: BookOpen,
      path: "/messages",
      count: "1,200+ sermons"
    },
    {
      title: "Saved Collections",
      description: "Your personal scripture collections",
      icon: Bookmark,
      path: "/collections",
      count: "View collections"
    },
    {
      title: "Reading Plans",
      description: "Structured Bible reading schedules",
      icon: Calendar,
      path: "/calendar",
      count: "Start reading"
    },
    {
      title: "Notes & Highlights",
      description: "Your personal study notes",
      icon: FileText,
      path: "/notes",
      count: "View notes"
    },
    {
      title: "Downloads",
      description: "Offline access to scriptures",
      icon: Download,
      path: "/downloads",
      count: "Manage downloads"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="md:hidden shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Library</h1>
            <p className="text-sm text-muted-foreground">Your spiritual resource center</p>
          </div>
        </div>
      </div>

      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {libraryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                onClick={() => navigate(item.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                  </div>
                  <CardTitle className="text-lg mt-4">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
