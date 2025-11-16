import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AiReflectionCard from "@/components/reading-plans/AiReflectionCard";
import { useReadingPlans } from "@/contexts/ReadingPlanContext";
import { Bookmark, Highlighter, BookOpenText } from "lucide-react";

const ReadingSession = () => {
  const { planId, dayNumber } = useParams<{ planId: string; dayNumber: string }>();
  const dayIndex = Number(dayNumber ?? "1");
  const navigate = useNavigate();
  const {
    plans,
    getPlanDays,
    progressMap,
    markDayComplete,
    toggleBookmarkDay,
    addNoteForDay,
  } = useReadingPlans();

  const plan = useMemo(() => plans.find((entry) => entry.id === planId), [planId, plans]);
  const planDays = useMemo(() => (plan ? getPlanDays(plan.id) : []), [getPlanDays, plan]);
  const day = planDays.find((entry) => entry.dayNumber === dayIndex);
  const progress = plan ? progressMap[plan.id] : undefined;
  const bookmarked = Boolean(progress?.bookmarkDays.includes(dayIndex));

  const [fontSize, setFontSize] = useState(18);
  const [highlighted, setHighlighted] = useState(false);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!plan) {
      return;
    }
    setNote(progress?.customNotes[dayIndex] ?? "");
  }, [dayIndex, plan, progress?.customNotes]);

  if (!plan || !day) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton />
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
          <p className="text-lg font-semibold">Reading assignment not found</p>
          <Button onClick={() => navigate("/plans")}>Back to plans</Button>
        </div>
      </div>
    );
  }

  const scriptureList = day.scriptures
    .map(
      (range) => `${range.book} ${range.chapterStart}${range.chapterEnd !== range.chapterStart ? `-${range.chapterEnd}` : ""}`,
    )
    .join(", ");

  const handleComplete = () => {
    markDayComplete(plan.id, day.dayNumber);
  };

  const handleBookmark = () => {
    toggleBookmarkDay(plan.id, day.dayNumber);
  };

  const handleSaveNote = () => {
    addNoteForDay(plan.id, day.dayNumber, note);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <main className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Reading Session</p>
              <CardTitle className="text-2xl">{plan.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Day {day.dayNumber} · {scriptureList}
              </p>
            </div>
            <Badge variant="outline">Estimated {day.estimatedMinutes} min</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleBookmark}>
                <Bookmark className="mr-2 h-4 w-4" /> {bookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              <Button variant={highlighted ? "default" : "outline"} size="sm" onClick={() => setHighlighted((prev) => !prev)}>
                <Highlighter className="mr-2 h-4 w-4" /> {highlighted ? "Highlight on" : "Highlight"}
              </Button>
              <Button size="sm" onClick={handleComplete}>
                Mark today complete
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Font size</p>
              <Slider
                value={[fontSize]}
                min={16}
                max={28}
                step={1}
                onValueChange={(value) => setFontSize(value[0])}
              />
            </div>
            <div
              className={`rounded-2xl border border-border/60 bg-card/80 p-6 leading-relaxed shadow-sm ${
                highlighted ? "bg-yellow-50 dark:bg-yellow-900/40" : ""
              }`}
              style={{ fontSize }}
            >
              <p className="mb-4 text-sm text-muted-foreground">
                Use the dedicated Bible reader for the full text. Today's assignment focuses on:
              </p>
              <p className="font-serif text-foreground">{day.summary}</p>
              <p className="mt-6 text-sm text-muted-foreground">
                Reflection: {day.reflectionQuestion}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <AiReflectionCard
            summary={day.summary}
            reflectionQuestion={day.reflectionQuestion}
            scriptures={day.scriptures}
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpenText className="h-5 w-5 text-primary" /> Session Notes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Capture insight or prayer prompts as you read.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What did the Lord highlight today?"
                className="min-h-[140px]"
              />
              <Button variant="outline" onClick={handleSaveNote}>
                Save note
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReadingSession;
