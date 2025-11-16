import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Search, MessageSquare, FileText, Download, Target } from "lucide-react";
import DailyQuote from "@/components/DailyQuote";
import RecentBibleVerses from "@/components/RecentBibleVerses";
import heroImage from "@/assets/bible-hero-bg.jpg";
import logoImage from "@/assets/logo-hero.png";
const quickActions = [
  {
    to: "/reader",
    icon: BookOpen,
    title: "Bible Reading",
    description: "Read scripture with powerful search, notes, and cross-references",
    accent: "text-primary",
    border: "hover:border-primary/50",
  },
  {
    to: "/messages",
    icon: MessageSquare,
    title: "WMB Sermons",
    description: "Explore sermons with verse connections and deep insights",
    accent: "text-secondary",
    border: "hover:border-secondary/50",
  },
  {
    to: "/search",
    icon: Search,
    title: "Smart Search",
    description: "Find verses, topics, and sermon quotes instantly",
    accent: "text-accent",
    border: "hover:border-accent/50",
  },
  {
    to: "/plans",
    icon: Target,
    title: "Reading Plans",
    description: "Stay consistent with guided journeys through the scriptures",
    accent: "text-primary",
    border: "hover:border-primary/50",
  },
  {
    to: "/notes",
    icon: FileText,
    title: "Notes",
    description: "Create and organize your personal Bible study notes",
    accent: "text-primary",
    border: "hover:border-primary/50",
  },
  {
    to: "/downloads",
    icon: Download,
    title: "Downloads",
    description: "Access offline Bibles and sermon resources",
    accent: "text-secondary",
    border: "hover:border-secondary/50",
  },
];

export default function Hero() {
  return <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Bible Study" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-background/70" />
      </div>
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up">
          <div className="mb-6">
            <img src={logoImage} alt="MessageGuide Logo" className="h-24 md:h-32 w-auto mx-auto drop-shadow-lg" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Your Guide to the
              <span className="block text-primary mt-2">Message of The Hour</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Read the Bible, explore William Marrion Branham's sermons, and discover connections between scripture and prophetic messages.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/reader">
              <Button size="lg" className="w-full sm:w-auto shadow-elegant hover:shadow-glow transition-all">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-5 w-5" />
                Search Scripture
              </Button>
            </Link>
            <Link to="/wmb-sermons">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <MessageSquare className="mr-2 h-5 w-5" />
                WMB Sermons
              </Button>
            </Link>
          </div>

          <div className="w-full max-w-5xl mt-12">
            <DailyQuote />
          </div>

          <div className="w-full max-w-6xl mt-12">
            <RecentBibleVerses />
          </div>

          <div className="w-full max-w-7xl mt-12 space-y-4">
            <div className="text-left w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Secondary features</p>
              <h2 className="text-2xl font-bold mt-2">Quick actions</h2>
              <p className="text-sm text-muted-foreground">
                Jump straight into study plans, downloads, and other supporting tools from the home page.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} to={action.to} className="block h-full">
                    <Card className={`p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full ${action.border}`}>
                      <Icon className={`h-10 w-10 mb-4 ${action.accent}`} />
                      <h3 className="text-lg font-semibold mb-3">{action.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>;
}