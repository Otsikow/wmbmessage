import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Collections() {
  const navigate = useNavigate();
  
  const collections = [
    { name: "My Favorites", count: 12, color: "bg-primary" },
    { name: "Daily Reading", count: 8, color: "bg-secondary" },
    { name: "Study Notes", count: 24, color: "bg-accent" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Collections</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize your favorite verses
                </p>
              </div>
            </div>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Collection</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {collections.map((collection) => (
              <Card
                key={collection.name}
                className="p-6 hover:shadow-elegant transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg ${collection.color} opacity-20`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {collection.count} verses
                    </p>
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
