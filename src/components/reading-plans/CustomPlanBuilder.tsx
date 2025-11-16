import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CustomPlanInput } from "@/types/readingPlans";

interface CustomPlanBuilderProps {
  onCreate: (input: CustomPlanInput) => void;
}

type DayDraft = {
  id: number;
  title: string;
  book: string;
  chapterStart: number;
  chapterEnd: number;
};

const emptyDay = (index: number): DayDraft => ({
  id: index,
  title: `Day ${index}`,
  book: "John",
  chapterStart: 1,
  chapterEnd: 1,
});

export const CustomPlanBuilder = ({ onCreate }: CustomPlanBuilderProps) => {
  const [title, setTitle] = useState("Custom Plan");
  const [description, setDescription] = useState("A personalized journey through Scripture.");
  const [difficulty, setDifficulty] = useState("medium");
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [tags, setTags] = useState("custom,personal");
  const [days, setDays] = useState<DayDraft[]>([emptyDay(1), emptyDay(2), emptyDay(3)]);

  const updateDay = (id: number, updates: Partial<DayDraft>) => {
    setDays((previous) => previous.map((day) => (day.id === id ? { ...day, ...updates } : day)));
  };

  const addDay = () => {
    setDays((previous) => [...previous, emptyDay(previous.length + 1)]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload: CustomPlanInput = {
      title,
      description,
      difficulty: difficulty as CustomPlanInput["difficulty"],
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      themeColor,
      dailyReadings: days.map((day) => ({
        title: day.title,
        scriptures: [
          {
            book: day.book,
            chapterStart: Number(day.chapterStart),
            chapterEnd: Number(day.chapterEnd),
          },
        ],
      })),
    };
    onCreate(payload);
  };

  return (
    <Card className="border-dashed border-primary/60">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create a Custom Plan</CardTitle>
          <CardDescription>
            Build a short plan for a small group, youth team, or discipleship cohort.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="plan-title">Title</Label>
              <Input id="plan-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="plan-color">Theme color</Label>
              <Input id="plan-color" type="color" value={themeColor} onChange={(event) => setThemeColor(event.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={(event) => setTags(event.target.value)} />
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {days.map((day) => (
              <div key={day.id} className="rounded-xl border border-border/60 p-3">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="space-y-1">
                    <Label>Day title</Label>
                    <Input
                      value={day.title}
                      onChange={(event) => updateDay(day.id, { title: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Book</Label>
                    <Input
                      value={day.book}
                      onChange={(event) => updateDay(day.id, { book: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Chapter start</Label>
                    <Input
                      type="number"
                      min={1}
                      value={day.chapterStart}
                      onChange={(event) => updateDay(day.id, { chapterStart: Number(event.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Chapter end</Label>
                    <Input
                      type="number"
                      min={1}
                      value={day.chapterEnd}
                      onChange={(event) => updateDay(day.id, { chapterEnd: Number(event.target.value) })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={addDay}>
            <Plus className="mr-2 h-4 w-4" /> Add another day
          </Button>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Publish Custom Plan ({days.length} days)
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CustomPlanBuilder;
