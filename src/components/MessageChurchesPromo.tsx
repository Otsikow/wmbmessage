import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, ShieldCheck, ArrowRight } from "lucide-react";

export default function MessageChurchesPromo() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-8">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <CardContent className="relative z-10 py-10 px-6 md:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left side - Icon and content */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Verified Churches Worldwide
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  Find a Message Church
                  <span className="text-primary"> Near You</span>
                </h2>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto lg:mx-0">
                  Connect with verified Message of the Hour churches around the world. 
                  Fellowship with believers who share your faith.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Global Directory</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Direct WhatsApp Contact</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Admin Verified</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Link to="/message-churches">
                    <MapPin className="mr-2 h-5 w-5" />
                    Browse Churches
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="border-primary/30 hover:bg-primary/5"
                >
                  <Link to="/message-churches/submit">
                    Submit Your Church
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right side - Visual element */}
            <div className="hidden md:flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-emerald-600" />
                </div>
                {/* Floating badges */}
                <div className="absolute -top-2 -right-2 bg-background border border-border rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                  🌍 Global
                </div>
                <div className="absolute -bottom-2 -left-2 bg-emerald-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                  ✓ Verified
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
