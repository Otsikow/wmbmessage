import { useMemo, useState } from "react";
import { Brain, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { ScriptureRange } from "@/types/readingPlans";
import { cn } from "@/lib/utils";

const formatScriptureLabel = (range: ScriptureRange) => {
  const chapterPart =
    range.chapterStart === range.chapterEnd
      ? `${range.chapterStart}`
      : `${range.chapterStart}-${range.chapterEnd}`;

  let versePart = "";
  if (
    range.chapterStart === range.chapterEnd &&
    typeof range.verseStart === "number"
  ) {
    if (typeof range.verseEnd === "number" && range.verseEnd !== range.verseStart) {
      versePart = `:${range.verseStart}-${range.verseEnd}`;
    } else {
      versePart = `:${range.verseStart}`;
    }
  }

  return `${range.book} ${chapterPart}${versePart}`;
};

interface AiReflectionCardProps {
  summary: string;
  reflectionQuestion: string;
  scriptures: ScriptureRange[];
}

export const AiReflectionCard = ({
  summary,
  reflectionQuestion,
  scriptures,
}: AiReflectionCardProps) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const navigate = useNavigate();

  const scriptureLabels = useMemo(
    () =>
      scriptures.map((range) => ({
        key: `${range.book}-${range.chapterStart}-${range.chapterEnd}-${range.verseStart ?? ""}-${range.verseEnd ?? ""}`,
        label: formatScriptureLabel(range),
      })),
    [scriptures],
  );

  const handleScriptureClick = (range: ScriptureRange) => {
    const params = new URLSearchParams({
      book: range.book,
      chapter: String(range.chapterStart),
    });

    if (typeof range.verseStart === "number") {
      params.set("verse", String(range.verseStart));
    }

    navigate(`/bible?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5 text-primary" /> AI Devotional Coach
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Smart summaries, reflection prompts, and instant explanations.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Summary</p>
          <p className="text-foreground">{summary}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Reflection</p>
          <p className="text-foreground">{reflectionQuestion}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Scriptures</p>
          {scriptureLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1 text-foreground">
              {scriptureLabels.map(({ key, label }, index) => (
                <div key={key} className="inline-flex items-center text-sm">
                  <button
                    type="button"
                    onClick={() => handleScriptureClick(scriptures[index])}
                    className={cn(
                      "font-medium text-primary transition-colors",
                      "hover:text-primary/80 hover:underline",
                    )}
                  >
                    {label}
                  </button>
                  {index < scriptureLabels.length - 1 && <span className="ml-1 text-muted-foreground">,</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No scriptures assigned.</p>
          )}
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setShowExplanation((prev) => !prev)}
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          {showExplanation ? "Hide" : "Explain this scripture"}
        </Button>
        {showExplanation && (
          <p className="rounded-lg border border-border/60 bg-muted/50 p-3 text-foreground">
            This reading highlights how God's story unfolds. Notice repeated themes,
            pray the promises aloud, and journal any personal instruction you sense.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AiReflectionCard;
