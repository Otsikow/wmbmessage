import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Download, FileText, BookOpen, Eye, FileDown, Presentation } from "lucide-react";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import { CHURCH_PRESENTER } from "@/lib/churchPresenter";

type DownloadItem = {
  id: number;
  title: string;
  description: string;
  type: string;
  size: string;
  icon: typeof FileText;
  href: string;
  updated: string;
  pages: string;
  highlights: string[];
};

const downloads: DownloadItem[] = [
  {
    id: 1,
    title: "Bible Reading Plan",
    description: "A simple weekly rhythm that alternates Old and New Testament readings.",
    type: "PDF",
    size: "0.7 KB",
    icon: BookOpen,
    href: "/downloads/bible-reading-plan.pdf",
    updated: "Updated weekly",
    pages: "1 page",
    highlights: ["Alternate Old + New Testament", "Simple weekly rhythm", "Print-ready layout"],
  },
  {
    id: 2,
    title: "Sermon Notes Template",
    description: "Printable template with space for Scripture references, key points, and next steps.",
    type: "PDF",
    size: "0.7 KB",
    icon: FileText,
    href: "/downloads/sermon-notes-template.pdf",
    updated: "Updated quarterly",
    pages: "1 page",
    highlights: ["Scripture reference blocks", "Key point prompts", "Next step planning"],
  },
];

export default function Downloads() {
  const { hash, key } = useLocation();
  const presenterHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (hash !== `#${CHURCH_PRESENTER.cardId}`) return;
    const frame = requestAnimationFrame(() => {
      presenterHeading.current?.focus({ preventScroll: true });
      presenterHeading.current?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <BackButton fallbackPath="/more" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Downloads</h1>
          </div>

          <section aria-labelledby={CHURCH_PRESENTER.cardId} className="mb-8">
            <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card">
              <CardContent className="grid gap-6 p-5 sm:p-7 md:grid-cols-2 md:gap-8">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Presentation className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2
                      id={CHURCH_PRESENTER.cardId}
                      ref={presenterHeading}
                      tabIndex={-1}
                      className="scroll-mt-6 text-xl font-bold sm:text-2xl"
                    >
                      {CHURCH_PRESENTER.title}
                    </h2>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                    {CHURCH_PRESENTER.description}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Includes {CHURCH_PRESENTER.contents}.
                  </p>
                  <Button asChild className="mt-5 min-h-[44px] w-full sm:w-auto">
                    <a
                      href={CHURCH_PRESENTER.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-describedby="church-presenter-download-details"
                    >
                      <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                      Download Church Presenter
                    </a>
                  </Button>
                  <p id="church-presenter-download-details" className="mt-2 text-xs text-muted-foreground">
                    {CHURCH_PRESENTER.format} · {CHURCH_PRESENTER.size} · Opens Google Drive in a new tab
                  </p>
                </div>

                <div className="border-t border-border pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <h3 className="font-semibold">Set up for a service</h3>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground marker:font-semibold marker:text-primary">
                    {CHURCH_PRESENTER.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Before the service, test a song and a Bible passage on the audience screen.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <h2 className="mb-2 text-xl font-semibold">Printable resources</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Download a PDF or preview it in a new tab before printing.
          </p>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              {downloads.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.id} variant="glass" hoverable>
                    <CardHeader className="flex flex-row items-start gap-4 pb-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <Badge variant="secondary">{item.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground">File size</p>
                          <p>{item.size}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Pages</p>
                          <p>{item.pages}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Refresh cadence</p>
                          <p>{item.updated}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Format</p>
                          <p>Print-ready PDF</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Included highlights
                        </p>
                        <ul className="grid gap-1 text-sm text-muted-foreground">
                          {item.highlights.map((highlight) => (
                            <li key={highlight} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-3">
                      <Button asChild>
                        <a href={item.href} download aria-label={`Download ${item.title}`}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Preview ${item.title}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Download className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">Make the most of your PDFs</h3>
                    <p className="text-sm text-muted-foreground">
                      Everything is ready for printing or sharing.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">1. Download</p>
                  <p>Grab the latest PDF and save it to your phone or desktop.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">2. Print or share</p>
                  <p>Use standard paper sizes, or send the PDF to your group chat.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">3. Revisit anytime</p>
                  <p>Come back here to download a fresh copy whenever you need it.</p>
                </div>
                <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                  Need another printable? Send us a note and we’ll add it here.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
