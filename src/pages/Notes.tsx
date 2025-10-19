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
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/more")}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Notes</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Your study notes and reflections
                </p>
              </div>
            </div>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Note</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <div className="space-y-4">
            {notes.map((note) => (
              <Card
                key={note.title}
                className="p-6 hover:shadow-elegant transition-shadow cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{note.title}</h3>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.preview}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
