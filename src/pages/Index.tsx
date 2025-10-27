import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import DailyVerseCard from "@/components/DailyVerseCard";
import DailyQuote from "@/components/DailyQuote";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        
        {/* Daily Quote and Messages Section - Positioned after Hero */}
        <section className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          {/* Daily Quote - Always available (no database required) */}
          <DailyQuote />
          
          {/* Daily Verse and Sermon Quote - Requires database */}
          <DailyVerseCard />
        </section>
      </main>
      <Navigation />
    </div>
  );
};

export default Index;
