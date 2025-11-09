import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";

export default function Downloads() {
  const downloads = [
    { id: 1, title: "Bible Reading Plan", type: "PDF", size: "2.3 MB", icon: BookOpen },
    { id: 2, title: "Sermon Notes Template", type: "PDF", size: "1.1 MB", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <BackButton fallbackPath="/more" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Downloads</h1>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {downloads.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary shrink-0" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.type} • {item.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
