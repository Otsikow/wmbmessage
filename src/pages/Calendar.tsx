import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Calendar() {
  const navigate = useNavigate();
  
  const events = [
    { id: 1, date: "2025-10-25", title: "Bible Study", description: "Weekly bible study group" },
    { id: 2, date: "2025-10-27", title: "Sermon Review", description: "Review WMB sermon" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/more")}
                className="md:hidden shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Calendar</h1>
            </div>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Event</span>
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <CalendarIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-base sm:text-lg">{event.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{event.date}</p>
                    <p className="text-xs sm:text-sm">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
