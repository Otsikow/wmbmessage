import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, RefreshCw, Book, MessageSquare } from "lucide-react";
import { useDailyContent } from "@/hooks/useDailyContent";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useEngagement } from "@/contexts/EngagementContext";
import { appendShareAttribution } from "@/lib/share";

const DailyVerseCard = () => {
  const { dailyContent, loading, error, refreshContent } = useDailyContent();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { recordActivity } = useEngagement();

  useEffect(() => {
    if (!dailyContent || loading || error) return;

    recordActivity("daily-devotional", {
      description: `${dailyContent.verse_book} ${dailyContent.verse_chapter}:${dailyContent.verse_verse}`,
    });
  }, [dailyContent, error, loading, recordActivity]);

  const buildShareText = () => {
    if (!dailyContent) return "";

    let text = `Daily Inspiration\n\n📖 ${dailyContent.verse_book} ${dailyContent.verse_chapter}:${dailyContent.verse_verse}\n"${dailyContent.verse_text}"`;
    
    if (dailyContent.quote_text) {
      text += `\n\n💬 "${dailyContent.quote_text}"`;
      if (dailyContent.quote_source) {
        text += `\n— ${dailyContent.quote_source}`;
      }
    }

    return appendShareAttribution(text);
  };

  const handleCopy = async () => {
    const text = buildShareText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Daily content copied to clipboard.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy content.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (!text) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Inspiration - MessageGuide",
          text,
        });
      } catch (err) {
        // Ignore aborted share
        if ((err as Error).name !== "AbortError") {
          toast({
            title: "Error",
            description: "Failed to share content.",
            variant: "destructive",
          });
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshContent();
    setIsRefreshing(false);

    toast({
      title: "Refreshed!",
      description: "New daily content loaded.",
    });
  };

  /* ─────────────────────────────
     LOADING STATE
  ───────────────────────────── */
  if (loading) {
    return (
      <Card variant="glass" hoverable={false} className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-4 w-64 mt-2 bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-3/4 bg-white/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ─────────────────────────────
     ERROR OR EMPTY → DO NOT BREAK PAGE
  ───────────────────────────── */
  if (error || !dailyContent) {
    return null;
  }

  /* ─────────────────────────────
     MAIN UI
  ───────────────────────────── */
  return (
    <Card variant="glass" hoverable={false} className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl glass-heading">
          <span className="glass-icon text-primary">
            <Book className="h-6 w-6" />
          </span>
          Daily Inspiration
        </CardTitle>

        <CardDescription glass>
          Your daily verse and quote for{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </CardDescription>
      </CardHeader>

      <CardContent glass className="space-y-6">

        {/* Bible Verse */}
        <div className="space-y-3 p-4 rounded-[16px] bg-white/[0.04] backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2">
            <span className="glass-icon text-primary">
              <Book className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-lg glass-heading">
              {dailyContent.verse_book} {dailyContent.verse_chapter}:{dailyContent.verse_verse}
            </h3>
          </div>

          <p className="reader-typography glass-body italic leading-relaxed">
            "{dailyContent.verse_text}"
          </p>
        </div>

        {/* Quote */}
        {dailyContent.quote_text && (
          <div className="space-y-3 p-4 rounded-[16px] bg-white/[0.04] backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2">
              <span className="glass-icon text-primary">
                <MessageSquare className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-lg glass-heading">
                Daily Quote
              </h3>
            </div>

            <p className="reader-typography glass-body leading-relaxed">
              "{dailyContent.quote_text}"
            </p>

            {dailyContent.quote_source && (
              <p className="text-sm glass-body">
                — {dailyContent.quote_source}
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex-1 border-white/20 hover:border-white/30 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 hover:border-white/30 hover:bg-white/10"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 hover:border-white/30 hover:bg-white/10"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyVerseCard;
