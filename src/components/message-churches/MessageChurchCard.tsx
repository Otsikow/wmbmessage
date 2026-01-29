import { MessageChurch } from "@/types/messageChurches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatWhatsAppLink } from "@/utils/phone";
import { Link } from "react-router-dom";
import { MapPin, MessageCircle } from "lucide-react";

interface MessageChurchCardProps {
  church: MessageChurch;
}

export default function MessageChurchCard({ church }: MessageChurchCardProps) {
  return (
    <Card className="border-border/60 bg-card/70 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link
              to={`/message-churches/${church.id}`}
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
          <Button variant="ghost" asChild>
            <Link to={`/message-churches/${church.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
