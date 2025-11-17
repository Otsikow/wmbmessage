import { useState } from "react";
import { Brain, ExternalLink, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScriptureRange } from "@/types/readingPlans";
import { formatScriptureRange, getReaderLinkForRange } from "@/lib/scripture";

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
          {scriptures.length ? (
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-foreground">
              {scriptures.map((range) => (
                <Link
                  key={`${range.book}-${range.chapterStart}-${range.chapterEnd}-${range.verseStart ?? 0}-${range.verseEnd ?? 0}`}
                  to={getReaderLinkForRange(range)}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {formatScriptureRange(range)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No specific passages assigned.</p>
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
