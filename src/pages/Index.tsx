import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import DailyVerseCard from "@/components/DailyVerseCard";
import FeaturedSermons from "@/components/FeaturedSermons";
import EngagementPrompt from "@/components/engagement/EngagementPrompt";
import EngagementSummary from "@/components/engagement/EngagementSummary";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />

        <FeaturedSermons />

        {/* Daily Messages Section - Positioned after Hero */}
        <section className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          {/* Daily Verse and Sermon Quote - Requires database */}
          <DailyVerseCard />

          <EngagementPrompt />

          <EngagementSummary />
        </section>
      </main>
      <Navigation />
    </div>
  );
};

export default Index;
