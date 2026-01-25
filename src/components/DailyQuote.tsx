import { useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { CalendarDays, Quote, Share2, Copy, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { appendShareAttribution, getBrandUrl } from "@/lib/share";

import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import wmbPillarOfFire from "@/assets/wmb-pillar-of-fire.jpg";
import { getReadingForDate } from "@/data/dailyReadings";

// Icons
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 4.16v1.912h4.141l-.542 3.667h-3.599v7.98c0 .106-.01.21-.028.312a8.775 8.775 0 0 1-5.06-2.428 8.815 8.815 0 0 1-1.428-2.608c-.03-.13-.053-.26-.07-.394z"/></svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><title>Telegram</title><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
);

export default function DailyQuote() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const reading = useMemo(() => getReadingForDate(selectedDate), [selectedDate]);

  const buildShareText = () => {
    return appendShareAttribution(
      `Daily Quote – ${format(selectedDate, "MMMM d, yyyy")}\n\n📖 Scripture Reading\n"${reading.verse.text}"\n— ${reading.verse.reference}\n\n💬 Message Insight\n"${reading.message.text}"\n— ${reading.message.reference}`
    );
  };

  const handleCopy = async () => {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Daily quote copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy content.",
        variant: "destructive",
      });
    }
  };

  const shareUrl = getBrandUrl();
  const shareText = buildShareText();

  const shareLinks = [
    {
      name: "Email",
      icon: Mail,
      action: () => window.open(`mailto:?subject=Daily Quote – ${format(selectedDate, "MMMM d, yyyy")}&body=${encodeURIComponent(shareText)}`, "_blank"),
      className: "hover:bg-orange-100 text-orange-600 dark:hover:bg-orange-900/20 dark:text-orange-400",
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"),
      className: "hover:bg-green-100 text-green-600 dark:hover:bg-green-900/20 dark:text-green-400",
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank"),
      className: "hover:bg-blue-100 text-blue-500 dark:hover:bg-blue-900/20 dark:text-blue-400",
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank"),
      className: "hover:bg-blue-100 text-blue-700 dark:hover:bg-blue-900/20 dark:text-blue-500",
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank"),
      className: "hover:bg-blue-100 text-blue-800 dark:hover:bg-blue-900/20 dark:text-blue-300",
    },
  ];

  return (
    <Card variant="glass" className="relative overflow-hidden shadow-depth border-primary/20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={wmbPillarOfFire} 
          alt="" 
          className="w-full h-full object-cover object-top"
          loading="eager"
        />
        {/* Premium gradient overlay with depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60 dark:from-background/98 dark:via-background/90 dark:to-background/75" />
        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-30" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-5 sm:p-6 md:p-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4 items-start text-left">
              <Quote className="h-8 w-8 sm:h-9 sm:w-9 text-primary icon-neon flex-shrink-0 mt-1 float" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gradient-blue-purple">
                  Daily Quote
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore today&apos;s scripture reading alongside a message quote from William Branham. Use the calendar to revisit previous days.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-10 w-10 rounded-full glass glass-neon-primary hover:scale-110 transition-all duration-300"
                aria-label="Copy quote"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-primary icon-neon" />
                )}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full glass glass-neon-primary hover:scale-110 transition-all duration-300"
                    aria-label="Share quote"
                  >
                    <Share2 className="h-5 w-5 text-primary icon-neon" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Quote</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    {shareLinks.map((link) => (
                      <Button
                        key={link.name}
                        variant="outline"
                        className={`flex flex-col items-center justify-center h-24 gap-2 transition-colors ${link.className}`}
                        onClick={link.action}
                      >
                        <link.icon className="h-8 w-8" />
                        <span className="text-xs font-medium">{link.name}</span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full glass glass-neon-primary hover:scale-110 transition-all duration-300"
                    aria-label="Open calendar"
                  >
                    <CalendarDays className="h-5 w-5 text-primary icon-neon" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 glass rounded-glass" align="end">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Select a date to view its quote
                    </h4>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(startOfDay(date))}
                      defaultMonth={selectedDate}
                      weekStartsOn={0}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 p-4 glass-subtle rounded-glass border border-secondary/10">
            <h4 className="text-lg font-semibold text-gradient-blue-purple">Message Insight</h4>
            <blockquote className="text-base md:text-lg leading-relaxed text-foreground/90 italic">
              “{reading.message.text}”
            </blockquote>
            <p className="text-sm text-muted-foreground font-medium">
              — {reading.message.reference}
            </p>
          </div>

          <div className="space-y-2 p-4 glass-subtle rounded-glass border border-primary/10">
            <h4 className="text-lg font-semibold text-gradient-blue-purple">Scripture Reading</h4>
            <blockquote className="reader-typography text-base md:text-lg leading-relaxed text-foreground/90">
              “{reading.verse.text}”
            </blockquote>
            <p className="text-sm font-semibold text-primary">
              — {reading.verse.reference}
            </p>
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}
