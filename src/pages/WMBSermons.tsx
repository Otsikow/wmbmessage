import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Calendar, MapPin, BookOpen } from "lucide-react";
import churchInteriorImage from "@/assets/church-interior.jpg";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function WMBSermons() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const sermons = [
    { title: "The Spoken Word is the Original Seed", date: "March 18, 1962", location: "Jeffersonville, IN", excerpt: "God's Word is the original seed. Any seed will bring forth after its kind.", verseCount: 156 },
    { title: "Christ is the Mystery of God Revealed", date: "July 28, 1963", location: "Jeffersonville, IN", excerpt: "Christ is God's mystery revealed to His people in this last day.", verseCount: 203 },
    { title: "The Seven Church Ages", date: "December 1960", location: "Jeffersonville, IN", excerpt: "The seven church ages represent the complete history of the church.", verseCount: 178 },
  ];

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={churchInteriorImage} alt="Church Interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="md:hidden shrink-0">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">WMB Sermons</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Explore William Marrion Branham's teachings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full py-6 sm:py-8 pb-24 md:pb-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input 
                placeholder="Search sermons..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base" 
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {filteredSermons.map((sermon) => (
              <div key={sermon.title} className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <h3 className="font-semibold text-base sm:text-lg leading-tight">{sermon.title}</h3>
                    <Badge variant="secondary" className="self-start text-xs shrink-0">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {sermon.verseCount} verses
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{sermon.date}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{sermon.location}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{sermon.excerpt}</p>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto mt-2">
                    View Cross-References
                  </Button>
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
