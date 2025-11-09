import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { useCalendar } from "@/contexts/CalendarContext";
import BackButton from "@/components/BackButton";

export default function Calendar() {
  const { events, addEvent, deleteEvent } = useCalendar();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
  });

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    
    addEvent({
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate || new Date(),
    });
    
    setNewEvent({ title: "", description: "", date: new Date() });
    setIsDialogOpen(false);
    toast.success("Event added successfully");
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
    toast.success("Event deleted");
  };

  const filteredEvents = selectedDate
    ? events.filter(
        (event) =>
          format(event.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      )
    : events;

  const sortedEvents = [...events].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <BackButton fallbackPath="/more" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Calendar</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Event</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Bible Study"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Weekly bible study group"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate ? format(selectedDate, "PPP") : "Select a date from the calendar"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent}>Add Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Select Date</h2>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {selectedDate
                  ? `Events on ${format(selectedDate, "PPP")}`
                  : "All Upcoming Events"}
              </h2>
              
              {(selectedDate ? filteredEvents : sortedEvents).length === 0 ? (
                <Card className="p-8 text-center border-border/50">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {selectedDate ? "No events on this date" : "No events scheduled"}
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(selectedDate ? filteredEvents : sortedEvents).map((event) => (
                    <Card key={event.id} className="p-4 sm:p-6 border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <CalendarIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-base sm:text-lg">{event.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {format(event.date, "PPP")}
                            </p>
                            {event.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
