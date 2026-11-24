import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const featuredSermons = [
  {
    code: "64-0614M",
    title: "The Unveiling of God",
    date: "1964-06-14",
    excerpt: "Explore how Christ is revealed to the Bride in the closing hours of the Gentile dispensation.",
    tags: ["Revelation", "Christ", "Prophecy"],
  },
  {
    code: "65-1204",
    title: "The Rapture",
    date: "1965-12-04",
    excerpt: "A prophetic look at the catching away of the Bride and our preparation for His coming.",
    tags: ["Second Coming", "Hope", "Preparation"],
  },
  {
    code: "63-0901M",
    title: "The Token",
    date: "1963-09-01",
    excerpt: "A call to apply the Token in every home and experience the Holy Spirit personally.",
    tags: ["Holy Spirit", "Family", "Consecration"],
  },
  {
    code: "63-0728",
    title: "Christ Is the Mystery of God Revealed",
    date: "1963-07-28",
    excerpt: "Explore the mystery hidden before the foundation of the world and the believer’s place in the Body of Christ.",
    tags: ["Mystery", "Identity"],
  },
];

const sermonDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function FeaturedSermons() {
  return (
    <section aria-labelledby="featured-messages-title" className="home-content py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="featured-messages-title" className="text-2xl font-bold tracking-tight text-gradient-blue-purple sm:text-3xl">
            Featured messages
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Selected sermons by William Marrion Branham.
          </p>
        </div>
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/messages">
            Browse all messages
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featuredSermons.map((sermon) => (
          <Link
            key={sermon.code}
            to={`/messages?${new URLSearchParams({ message: sermon.code })}`}
            aria-label={`Read ${sermon.title}`}
            className="group flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary supports-[grid-template-rows:subgrid]:row-span-5 supports-[grid-template-rows:subgrid]:grid supports-[grid-template-rows:subgrid]:grid-rows-subgrid sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <time dateTime={sermon.date} className="text-muted-foreground">
                {sermonDate.format(new Date(sermon.date))}
              </time>
              <span aria-hidden="true" className="text-muted-foreground">·</span>
              <span className="font-medium text-primary">{sermon.code}</span>
            </div>
            <h3 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">{sermon.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{sermon.excerpt}</p>
            <ul aria-label="Topics" className="flex flex-wrap content-start gap-1.5">
              {sermon.tags.map((tag) => (
                <li key={tag} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {tag}
                </li>
              ))}
            </ul>
            <span className="mt-auto flex items-center gap-2 border-t pt-3 text-sm font-semibold text-primary">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Read message
              <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
