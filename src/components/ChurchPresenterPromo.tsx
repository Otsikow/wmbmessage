import { ArrowRight, Presentation } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CHURCH_PRESENTER, CHURCH_PRESENTER_PATH } from "@/lib/churchPresenter";

export default function ChurchPresenterPromo() {
  return (
    <section
      aria-labelledby="church-presenter-promo-title"
      className="home-content"
    >
      <div className="flex flex-col gap-5 rounded-2xl border border-primary/20 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Presentation className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 id="church-presenter-promo-title" className="text-xl font-bold sm:text-2xl">
              {CHURCH_PRESENTER.title}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Project songs, KJV Scripture and William Branham messages during church
              services. Works offline after download.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="min-h-[44px] w-full shrink-0 sm:w-auto">
          <Link to={CHURCH_PRESENTER_PATH}>
            Download &amp; setup
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
