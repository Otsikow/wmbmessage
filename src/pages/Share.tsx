import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Mail, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import { buildShareAttribution } from "@/lib/share";

export default function Share() {
  const handleShare = (platform: string) => {
    toast.success(`Sharing on ${platform}!`);
  };

  const copyLink = () => {
    const linkWithBrand = `Shared via ${buildShareAttribution()}`;

    navigator.clipboard.writeText(linkWithBrand);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <BackButton fallbackPath="/more" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Share</h1>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center space-y-4">
              <Share2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto" />
              <h2 className="text-lg sm:text-xl font-semibold">Share MessageGuide</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Help others discover the power of scripture and prophetic messages
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleShare("Facebook")} 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-4 px-4 sm:px-6"
              >
                <Facebook className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="text-sm sm:text-base">Share on Facebook</span>
              </Button>
              <Button 
                onClick={() => handleShare("Twitter")} 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-4 px-4 sm:px-6"
              >
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="text-sm sm:text-base">Share on Twitter</span>
              </Button>
              <Button 
                onClick={() => handleShare("Email")} 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-4 px-4 sm:px-6"
              >
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="text-sm sm:text-base">Share via Email</span>
              </Button>
              <Button 
                onClick={copyLink} 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-4 px-4 sm:px-6"
              >
                <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="text-sm sm:text-base">Copy Link</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
