import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Heart, Users, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import logoImage from "@/assets/logo-final.png";
import crossImage from "@/assets/cross-sunrise.jpg";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={crossImage} alt="Cross at Sunrise" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/more")} className="md:hidden shrink-0">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">About MessageGuide</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Our mission and vision</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center space-y-4">
            <img src={logoImage} alt="MessageGuide Logo" className="h-16 sm:h-20 w-auto mx-auto" />
            <h2 className="text-xl sm:text-2xl font-bold">MessageGuide</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your comprehensive guide to scripture and prophetic messages
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">Our Mission</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    To provide believers with powerful tools to study the Bible, explore William Marrion Branham's sermons, 
                    and discover the profound connections between scripture and prophetic messages.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">Our Community</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Join thousands of believers worldwide who use MessageGuide to deepen their understanding 
                    of God's Word and grow in their faith journey.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-accent shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">Our Features</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-2">
                    <li>• Complete Bible with powerful search capabilities</li>
                    <li>• WMB sermon library with cross-references</li>
                    <li>• Note-taking and highlighting tools</li>
                    <li>• Collections for organizing your study</li>
                    <li>• Daily inspirational quotes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Version 1.0.0 • © 2025 MessageGuide
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ♥ for believers everywhere
            </p>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
