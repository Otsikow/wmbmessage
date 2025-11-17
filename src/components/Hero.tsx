import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Search, MessageSquare, FileText, Download, Sparkles, Target } from "lucide-react";
import DailyQuote from "@/components/DailyQuote";
import RecentBibleVerses from "@/components/RecentBibleVerses";
import heroImage from "@/assets/bible-hero-bg.jpg";
import logoImage from "@/assets/logo-hero.png";
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

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto justify-center">
            <Link to="/plans">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white shadow-glow"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Bible Reading Plans
              </Button>
            </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mt-12 w-full max-w-7xl">
            <Link to="/plans" className="block h-full">
              <Card className="p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-glow hover:border-primary transition-all cursor-pointer h-full bg-gradient-to-b from-primary/5 to-background">
                <Target className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-3">Bible Reading Plans</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Follow guided plans with streak tracking, notes, and bookmarks that stay in sync when you sign in.
                </p>
              </Card>
            </Link>
            <Link to="/reader" className="block h-full">
              <Card className="p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full">
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-3">Bible Reading</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Read scripture with powerful search, notes, and cross-references
                </p>
              </Card>
            </Link>
            <Link to="/wmb-sermons" className="block h-full">
              <Card className="p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-lg hover:border-secondary/50 transition-all cursor-pointer h-full">
                <MessageSquare className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-lg font-semibold mb-3">WMB Sermons</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Explore sermons with verse connections and deep insights
                </p>
              </Card>
            </Link>
            <Link to="/search" className="block h-full">
              <Card className="p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-lg hover:border-accent/50 transition-all cursor-pointer h-full">
                <Search className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-lg font-semibold mb-3">Smart Search</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Find verses, topics, and sermon quotes instantly
                </p>
              </Card>
            </Link>
            <Link to="/notes" className="block h-full">
              <Card className="p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full">
                <FileText className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create and organize your personal Bible study notes
                </p>
              </Card>
            </Link>
            <Link to="/downloads" className="block h-full">
              <Card className="p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-lg hover:border-secondary/50 transition-all cursor-pointer h-full">
                <Download className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-lg font-semibold mb-3">Downloads</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access offline Bibles and sermon resources
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </section>;
}