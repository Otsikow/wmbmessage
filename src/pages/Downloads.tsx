import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";

type DownloadItem = {
  id: number;
  title: string;
  description: string;
  type: string;
  size: string;
  icon: typeof FileText;
  href: string;
};

const downloads: DownloadItem[] = [
  {
    id: 1,
    title: "Bible Reading Plan",
    description: "A simple weekly rhythm that alternates Old and New Testament readings.",
    type: "PDF",
    size: "0.8 KB",
    icon: BookOpen,
    href: "/downloads/bible-reading-plan.pdf",
  },
  {
    id: 2,
    title: "Sermon Notes Template",
    description: "Printable template with space for Scripture references, key points, and next steps.",
    type: "PDF",
    size: "0.8 KB",
    icon: FileText,
    href: "/downloads/sermon-notes-template.pdf",
  },
];

export default function Downloads() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <BackButton fallbackPath="/more" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Downloads</h1>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Printable resources you can take offline. Tap the download icon to grab a fresh copy
            anytime.
          </p>

          <div className="space-y-3 sm:space-y-4">
            {downloads.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary shrink-0" aria-hidden />
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-semibold text-base leading-tight">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {item.type} • {item.size}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0" asChild>
                      <a
                        href={item.href}
                        download
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Download ${item.title}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
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
