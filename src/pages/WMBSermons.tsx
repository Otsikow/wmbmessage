import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Calendar, MapPin, BookOpen } from "lucide-react";
import churchInteriorImage from "@/assets/church-interior.jpg";

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
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={churchInteriorImage} alt="Church Interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold">WMB Sermons</h1>
                <p className="text-sm text-muted-foreground">Explore William Marrion Branham's teachings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search sermons..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12" />
            </div>
          </Card>

          <div className="space-y-4">
            {filteredSermons.map((sermon) => (
              <Card key={sermon.title} className="p-6 hover:shadow-elegant transition-shadow cursor-pointer">
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <h3 className="font-semibold text-lg">{sermon.title}</h3>
                    <Badge variant="secondary"><BookOpen className="h-3 w-3 mr-1" />{sermon.verseCount} verses</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" /><span>{sermon.date}</span>
                    <span>•</span>
                    <MapPin className="h-4 w-4" /><span>{sermon.location}</span>
                  </div>
                  <p className="text-sm">{sermon.excerpt}</p>
                  <Button variant="outline" size="sm">View Cross-References</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
