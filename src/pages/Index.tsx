import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CardGroupCascade from "@/components/CardGroupCascade";
import Navigation from "@/components/Navigation";
import DailyVerseCard from "@/components/DailyVerseCard";
import FeaturedSermons from "@/components/FeaturedSermons";
import EngagementPrompt from "@/components/engagement/EngagementPrompt";
import EngagementSummary from "@/components/engagement/EngagementSummary";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import { ReadingPlanWidget } from "@/components/reading-plans/ReadingPlanWidget";

const Index = () => {
  return (
    <div className="min-h-screen space-y-4">
      <SectionErrorBoundary section="Header" description="The main navigation header failed to render.">
        <Header />
      </SectionErrorBoundary>

      <main className="space-y-6">
        <SectionErrorBoundary section="Hero" description="The hero content is temporarily unavailable.">
          <Hero />
        </SectionErrorBoundary>

        <SectionErrorBoundary
          section="Feature showcase"
          description="We couldn't load the devotional feature showcase."
        >
          <CardGroupCascade />
        </SectionErrorBoundary>

        <SectionErrorBoundary
          section="Featured sermons"
          description="We couldn't load the featured sermons feed."
        >
          <FeaturedSermons />
        </SectionErrorBoundary>

        {/* Daily Messages Section - Positioned after Hero */}
        <section className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
          <SectionErrorBoundary
            section="Reading plan"
            description="We couldn't load your reading plan widget."
          >
            <ReadingPlanWidget />
          </SectionErrorBoundary>
          {/* Daily Verse and Sermon Quote - Requires database */}
          <SectionErrorBoundary
            section="Daily verse"
            description="Unable to load the daily scripture reading."
          >
            <DailyVerseCard />
          </SectionErrorBoundary>

          <SectionErrorBoundary
            section="Engagement prompt"
            description="We couldn't load today's engagement questions."
          >
            <EngagementPrompt />
          </SectionErrorBoundary>

          <SectionErrorBoundary
            section="Engagement summary"
            description="A summary of your recent engagement could not be displayed."
          >
            <EngagementSummary />
          </SectionErrorBoundary>
        </section>
      </main>

      <SectionErrorBoundary section="Navigation" description="The persistent navigation failed to load.">
        <Navigation />
      </SectionErrorBoundary>
    </div>
  );
};

export default Index;
