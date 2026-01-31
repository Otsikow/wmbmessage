import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildChurchShareDetails } from "@/utils/messageChurchShare";
import { MessageChurch } from "@/types/messageChurches";
import { Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

interface MessageChurchShareMenuProps {
  church: MessageChurch;
  mapLink?: string;
  buttonLabel?: string;
  buttonSize?: ButtonProps["size"];
  buttonVariant?: ButtonProps["variant"];
  className?: string;
}

export default function MessageChurchShareMenu({
  church,
  mapLink,
  buttonLabel = "Share",
  buttonSize = "default",
  buttonVariant = "outline",
  className,
}: MessageChurchShareMenuProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const { text, title, url } = buildChurchShareDetails(church, {
    baseUrl,
    includeWhatsApp: true,
    mapLink,
  });

  const shareUrl = url;
  const shareText = text;
  const shareTitle = title;

  const openShareWindow = (shareLink: string) => {
    if (typeof window === "undefined") return;
    window.open(shareLink, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast.error("Clipboard access is not available in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard.");
    } catch (error) {
      console.error("Copy failed", error);
      toast.error("Unable to copy the link right now.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Share2 className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={() =>
            openShareWindow(
              `mailto:?subject=${encodeURIComponent(`Message Church: ${shareTitle}`)}&body=${encodeURIComponent(shareText)}`,
            )
          }
        >
          <Mail className="mr-2 h-4 w-4" /> Email
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}
        >
          <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleCopyLink()}>
          <Copy className="mr-2 h-4 w-4" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            openShareWindow(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            )
          }
        >
          <Share2 className="mr-2 h-4 w-4" /> Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
