import { Link } from "react-router-dom";
import { HeartHandshake, CalendarDays, MessageSquareHeart, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Import community images
import prayerImage from "@/assets/community-prayer.png";
import testimoniesImage from "@/assets/community-testimonies.jpg";
import eventsImage from "@/assets/community-events.png";

const communityFeatures = [
  {
    icon: HeartHandshake,
    title: "Prayer Board",
    description: "Share prayer requests and pray for one another",
    path: "/prayer-board",
    image: prayerImage,
    imagePosition: "center", // hands centered
  },
  {
    icon: MessageSquareHeart,
    title: "Testimonies",
    description: "Read and share powerful testimonies of God's faithfulness",
    path: "/testimonies",
    image: testimoniesImage,
    imagePosition: "center", // Bible centered with light
  },
  {
    icon: CalendarDays,
    title: "Events",
    description: "Find conventions, revivals, and fellowship gatherings",
    path: "/events",
    image: eventsImage,
    imagePosition: "bottom", // crowd at bottom
  },
];

export default function CommunityPromo() {
  return (
    <section className="relative py-10 px-4">
      {/* Section Header */}
      <div className="text-center mb-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {communityFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link 
              key={feature.path} 
              to={feature.path} 
              className="group block"
            >
              <article className={cn(
                "relative overflow-hidden rounded-2xl h-72 sm:h-80",
                "shadow-lg hover:shadow-2xl transition-all duration-500 ease-out",
                "hover:-translate-y-2"
              )}>
                {/* Background Image with enhanced zoom */}
                <div 
                  className={cn(
                    "absolute inset-0 bg-cover bg-no-repeat",
                    "transform-gpu transition-transform duration-700 ease-out",
                    "scale-100 group-hover:scale-105 group-hover:brightness-110"
                  )}
                  style={{ 
                    backgroundImage: `url(${feature.image})`,
                    backgroundPosition: feature.imagePosition === "bottom" ? "center bottom" : "center center",
                  }}
                />
                
                {/* Gradient Overlay for Readability */}
                <div className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                )} />
                
                {/* Content positioned at bottom */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  {/* Icon Badge */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl mb-3",
                    "bg-white/15 backdrop-blur-md border border-white/20",
                    "flex items-center justify-center",
                    "group-hover:bg-white/25 transition-all duration-300",
                    "group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                  )}>
                    <Icon className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                  
                  {/* Text Content */}
                  <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                    {feature.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed mb-3 drop-shadow-md">
                    {feature.description}
                  </p>
                  
                  {/* CTA Link with underline animation */}
                  <div className="flex items-center gap-1 text-white/90 text-sm font-medium group-hover:text-white transition-colors">
                    <span className="relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-white/80 after:origin-left after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                      Explore
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
