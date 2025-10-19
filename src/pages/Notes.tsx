import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Notes() {
  const navigate = useNavigate();
  
  const notes = [
    {
      title: "John 3:16 - God's Love",
      date: "2 days ago",
      preview: "Reflecting on the depth of God's love and sacrifice...",
    },
    {
      title: "Genesis Study Notes",
      date: "1 week ago",
      preview: "Creation account and its significance for understanding...",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/more")}
                className="md:hidden shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Notes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Your study notes and reflections
                </p>
              </div>
            </div>
            <Button className="shrink-0 w-full sm:w-auto" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Note</span>
              <span className="sm:hidden">New Note</span>
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {notes.map((note) => (
              <div
                key={note.title}
                className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <h3 className="font-semibold text-base sm:text-lg flex-1">{note.title}</h3>
                    <span className="text-xs text-muted-foreground shrink-0">{note.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {note.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
