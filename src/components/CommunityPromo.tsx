import { Link } from "react-router-dom";
import { HeartHandshake, CalendarDays, MessageSquareHeart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const communityFeatures = [
  {
    icon: HeartHandshake,
    title: "Prayer Board",
    description: "Share prayer requests and lift each other up in faith",
    path: "/prayer-board",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
  {
    icon: MessageSquareHeart,
    title: "Testimonies",
    description: "Read and share powerful testimonies of God's faithfulness",
    path: "/testimonies",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: CalendarDays,
    title: "Events",
    description: "Find conventions, revivals, and fellowship gatherings",
    path: "/events",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
];

export default function CommunityPromo() {
  return (
    <section className="relative py-8 px-4">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Sparkles className="h-4 w-4" />
          <span>Community</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Connect with Believers
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Join our community of believers. Share prayers, testimonies, and find fellowship events near you.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {communityFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.path} to={feature.path} className="group">
              <Card className={cn(
                "relative overflow-hidden border-border/50 h-full transition-all duration-300",
                "hover:border-primary/30 hover:shadow-lg hover:-translate-y-1",
                "bg-gradient-to-br",
                feature.gradient
              )}>
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    "bg-background/80 shadow-sm group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <Icon className={cn("h-6 w-6", feature.iconColor)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary hover:bg-primary/10 mt-2"
                  >
                    Explore →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
