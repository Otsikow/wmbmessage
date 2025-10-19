import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, MessageSquare } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Help() {
  const navigate = useNavigate();
  
  const faqs = [
    {
      question: "How do I search for Bible verses?",
      answer: "Use the Search page to find verses by keywords, topics, or references. You can also search within specific books or across the entire Bible."
    },
    {
      question: "Can I take notes while reading?",
      answer: "Yes! Click on any verse to add notes, highlights, or bookmarks. All your notes are saved in the Notes section."
    },
    {
      question: "How do I access WMB sermons?",
      answer: "Navigate to the More tab and select 'WMB Sermons' to explore William Marrion Branham's sermons with cross-referenced Bible verses."
    },
    {
      question: "Is the app available offline?",
      answer: "Yes, downloaded content can be accessed offline. Enable auto-download in Settings for automatic offline access."
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/more")}
              className="md:hidden shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Help & Support</h1>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center space-y-4">
              <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto" />
              <h2 className="text-lg sm:text-xl font-semibold">How can we help you?</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Find answers to common questions below
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="bg-card border border-border rounded-lg">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="px-4 sm:px-6 text-sm sm:text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 text-xs sm:text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Still need help?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Contact our support team for personalized assistance
              </p>
              <Button className="w-full sm:w-auto">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
