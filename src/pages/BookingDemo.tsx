import BookingCard from "@/components/BookingCard";
import Header from "@/components/Header";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";

export default function BookingDemo() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SectionErrorBoundary section="Booking Demo">
          <BookingCard />
        </SectionErrorBoundary>
      </main>
    </div>
  );
}
