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
      description: `${dailyContent.bible_book} ${dailyContent.bible_chapter}:${dailyContent.bible_verse}`,
    });
  }, [dailyContent, error, loading, recordActivity]);

  const handleCopy = async () => {
    if (!dailyContent) return;

    const text = appendShareAttribution(
      `Daily Inspiration\n\n📖 ${dailyContent.bible_book} ${dailyContent.bible_chapter}:${dailyContent.bible_verse}\n"${dailyContent.bible_verse_text}"\n\n💬 ${dailyContent.sermon_paragraph?.sermon.title}\n"${dailyContent.sermon_paragraph?.content}"`
    );

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Daily content copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!dailyContent) return;

    const text = appendShareAttribution(
      `Daily Inspiration\n\n📖 ${dailyContent.bible_book} ${dailyContent.bible_chapter}:${dailyContent.bible_verse}\n"${dailyContent.bible_verse_text}"\n\n💬 ${dailyContent.sermon_paragraph?.sermon.title}\n"${dailyContent.sermon_paragraph?.content}"`
    );

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Inspiration - MessageGuide",
          text: text,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast({
            title: "Error",
            description: "Failed to share content",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshContent();
    setIsRefreshing(false);
    toast({
      title: "Refreshed!",
      description: "New daily content loaded",
    });
  };

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

  // Gracefully hide the component if there's an error or no content
  // The DailyQuote component will still be visible as a fallback
  if (error || !dailyContent) {
    return null;
  }

  return (
    <Card variant="glass" hoverable={false} className="w-full">
      <CardHeader>
        <CardTitle glass className="flex items-center gap-2 text-2xl">
          <span className="glass-icon text-primary">
            <Book className="h-6 w-6" />
          </span>
          Daily Inspiration
        </CardTitle>
        <CardDescription glass>
          Your daily verse and quote for {new Date().toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent glass className="space-y-6">
        {/* Bible Verse Section */}
        <div className="space-y-3 p-4 rounded-[16px] bg-white/[0.04] backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2">
            <span className="glass-icon text-primary">
              <Book className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-lg glass-heading">
              {dailyContent.bible_book} {dailyContent.bible_chapter}:{dailyContent.bible_verse}
            </h3>
          </div>
          <p className="reader-typography glass-body italic leading-relaxed">
            "{dailyContent.bible_verse_text}"
          </p>
        </div>

        {/* Sermon Quote Section */}
        {dailyContent.sermon_paragraph && (
          <div className="space-y-3 p-4 rounded-[16px] bg-white/[0.04] backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2">
              <span className="glass-icon text-primary">
                <MessageSquare className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-lg glass-heading">
                {dailyContent.sermon_paragraph.sermon.title}
              </h3>
            </div>
            <p className="text-sm glass-body">
              {new Date(dailyContent.sermon_paragraph.sermon.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              • {dailyContent.sermon_paragraph.sermon.location}
            </p>
            <p className="reader-typography glass-body leading-relaxed">
              {dailyContent.sermon_paragraph.content}
            </p>
          </div>
        )}

        {/* Action Buttons */}
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
          <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1 border-white/20 hover:border-white/30 hover:bg-white/10">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 border-white/20 hover:border-white/30 hover:bg-white/10">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyVerseCard;
