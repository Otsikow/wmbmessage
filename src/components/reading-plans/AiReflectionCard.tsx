import { useState } from "react";
import { Brain, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AiReflectionCardProps {
  summary: string;
  reflectionQuestion: string;
  scriptures: string;
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
          <p className="text-foreground">{scriptures}</p>
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
