import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import DailyVerseCard from "@/components/DailyVerseCard";
import FeaturedSermons from "@/components/FeaturedSermons";
import EngagementPrompt from "@/components/engagement/EngagementPrompt";
import EngagementSummary from "@/components/engagement/EngagementSummary";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import { ReadingPlanWidget } from "@/components/reading-plans/ReadingPlanWidget";
import MessageChurchesPromo from "@/components/MessageChurchesPromo";
import CommunityPromo from "@/components/CommunityPromo";
import Footer from "@/components/Footer";
import HomeStats from "@/components/HomeStats";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { loading: authLoading } = useAuth();
  const { loading: settingsLoading } = useSettings();
  const isInitializing = authLoading || settingsLoading;

  if (isInitializing) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
        {/* Subtle mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="relative flex flex-col items-center gap-4 text-center glass rounded-glass p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary animate-pulse-soft">
            <Loader2 className="h-7 w-7 animate-spin icon-neon" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gradient-blue-purple">
              Preparing your experience
            </p>
            <p className="text-sm text-muted-foreground">
              Loading authentication, settings, and personalization…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 space-y-4">
        <SectionErrorBoundary section="Header" description="The main navigation header failed to render.">
          <Header />
        </SectionErrorBoundary>

        <main className="space-y-6">
          <SectionErrorBoundary section="Hero" description="The hero content is temporarily unavailable.">
            <Hero />
          </SectionErrorBoundary>

          {/* Community Section - Prayer, Testimonies, Events */}
          <SectionErrorBoundary
            section="Community"
            description="The community section could not load."
          >
            <CommunityPromo />
          </SectionErrorBoundary>

          {/* Message Churches Directory - Prominent CTA */}
          <SectionErrorBoundary
            section="Message Churches"
            description="The churches directory promo could not load."
          >
            <MessageChurchesPromo />
          </SectionErrorBoundary>

          <SectionErrorBoundary
            section="Featured sermons"
            description="We couldn't load the featured sermons feed."
          >
            <FeaturedSermons />
          </SectionErrorBoundary>

          {/* Daily Messages Section - Positioned after Hero */}
          <section className="relative container mx-auto max-w-4xl space-y-6 px-4 py-8">
            {/* Subtle mesh gradient for this section */}
            <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none -z-10" />
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

          <SectionErrorBoundary
            section="Community impact stats"
            description="We couldn't load the community stats section."
          >
            <HomeStats />
          </SectionErrorBoundary>
        </main>
      </div>

      <Footer />
      <SectionErrorBoundary section="Navigation" description="The persistent navigation failed to load.">
        <Navigation />
      </SectionErrorBoundary>
    </div>
  );
};

export default Index;
