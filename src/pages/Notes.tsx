import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Notes() {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Notes</h1>
              <p className="text-muted-foreground mt-2">
                Your personal study notes and reflections
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Note
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
