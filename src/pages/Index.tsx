import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import DailyVerseCard from "@/components/DailyVerseCard";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <section className="container mx-auto px-4 py-8 max-w-4xl">
          <DailyVerseCard />
        </section>
      </main>
      <Navigation />
    </div>
  );
};

export default Index;
