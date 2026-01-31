import { MessageChurch } from "@/types/messageChurches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatWhatsAppLink } from "@/utils/phone";
import { buildChurchDetailsPath, buildChurchShareDetails } from "@/utils/messageChurchShare";
import { Link } from "react-router-dom";
import { MapPin, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

interface MessageChurchCardProps {
  church: MessageChurch;
}

export default function MessageChurchCard({ church }: MessageChurchCardProps) {
  const handleShare = async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shareLink = `${baseUrl}${buildChurchDetailsPath(church.id)}`;
    const { text, title, url } = buildChurchShareDetails(church, {
      baseUrl,
      includeWhatsApp: true,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url: shareLink });
        toast.success("Church details ready to share.");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text.replace(url, shareLink));
        toast.success("Church details copied to clipboard.");
        return;
      }

      toast.error("Sharing is not supported in this browser.");
    } catch (error) {
      console.error("Share failed", error);
      toast.error("Unable to share church details right now.");
    }
  };

  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link
              to={buildChurchDetailsPath(church.id)}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              {church.church_name}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {church.city}, {church.country_name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pastor/Contact: <span className="text-foreground">{church.pastor_or_contact_name}</span>
            </p>
          </div>
          {church.verified && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              Verified
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <a href={formatWhatsAppLink(church.whatsapp_number)} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" asChild>
            <Link to={buildChurchDetailsPath(church.id)}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
