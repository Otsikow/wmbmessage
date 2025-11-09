import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

export default function Collections() {
  const collections = [
    { name: "My Favorites", count: 12, color: "bg-primary" },
    { name: "Daily Reading", count: 8, color: "bg-secondary" },
    { name: "Study Notes", count: 24, color: "bg-accent" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
              <BackButton />
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Collections</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Organize your favorite verses
                </p>
              </div>
            </div>
            <Button className="shrink-0 w-full sm:w-auto" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Collection</span>
              <span className="sm:hidden">New Collection</span>
            </Button>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <div
                key={collection.name}
                className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${collection.color} opacity-20 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{collection.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {collection.count} verses
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
