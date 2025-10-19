import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";

export default function WMBSermons() {
  const navigate = useNavigate();
  
  const sermons = [
    {
      title: "The Spoken Word is the Original Seed",
      date: "March 18, 1962",
      location: "Jeffersonville, IN",
    },
    {
      title: "The Seven Church Ages",
      date: "December 1960",
      location: "Jeffersonville, IN",
    },
    {
      title: "Christ is the Mystery of God Revealed",
      date: "July 28, 1963",
      location: "Jeffersonville, IN",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/more")}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold">WMB Sermons</h1>
              <p className="text-sm text-muted-foreground">
                William Branham's sermons
              </p>
            </div>
          </div>

          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search sermons..."
                className="pl-10 h-12"
              />
            </div>
          </Card>

          <div className="space-y-4">
            {sermons.map((sermon) => (
              <Card
                key={sermon.title}
                className="p-6 hover:shadow-elegant transition-shadow cursor-pointer"
              >
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{sermon.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{sermon.date}</span>
                    <span>•</span>
                    <span>{sermon.location}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
