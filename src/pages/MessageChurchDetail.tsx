import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MessageChurch } from "@/types/messageChurches";
import { formatWhatsAppLink } from "@/utils/phone";
import { MapPin, MessageCircle } from "lucide-react";

export default function MessageChurchDetail() {
  const { id } = useParams<{ id: string }>();
  const [church, setChurch] = useState<MessageChurch | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("message_churches")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setChurch(data as MessageChurch);
        setErrorMessage(null);
      } catch (error) {
        console.error("Error fetching message church:", error);
        setErrorMessage("We couldn't find that listing.");
      } finally {
        setLoading(false);
      }
    };

    fetchChurch();
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Loading church details...</CardContent>
            </Card>
          )}

          {errorMessage && !loading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {errorMessage} <Link className="text-primary" to="/message-churches">Back to directory</Link>
              </CardContent>
            </Card>
          )}

          {church && !loading && (
            <Card className="relative overflow-hidden border-border/60 bg-white/80 shadow-lg ring-1 ring-border/40 backdrop-blur dark:bg-card/80">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
              <CardHeader className="space-y-3 pb-6 pt-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                      {church.church_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {church.address_line_1}
                        {church.address_line_2 ? `, ${church.address_line_2}` : ""}, {church.city}
                        {church.state_region ? `, ${church.state_region}` : ""}
                        {church.postal_code ? ` ${church.postal_code}` : ""}, {church.country_name}
                      </span>
                    </div>
                  </div>
                  {church.verified && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 uppercase tracking-wide"
                    >
                      Verified Message Church
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-7">
                <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Pastor / Contact
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {church.pastor_title ? `${church.pastor_title} ` : ""}
                    {church.pastor_or_contact_name}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                    <a href={formatWhatsAppLink(church.whatsapp_number)} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message Now on WhatsApp
                    </a>
                  </Button>
                  {church.email && (
                    <Button variant="outline" asChild className="bg-white/80 shadow-sm">
                      <a href={`mailto:${church.email}`}>Email</a>
                    </Button>
                  )}
                  {church.website && (
                    <Button variant="outline" asChild className="bg-white/80 shadow-sm">
                      <a href={church.website} target="_blank" rel="noreferrer">
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>

                {(church.service_times || church.description) && (
                  <div className="grid gap-6 border-t border-border/60 pt-6 sm:grid-cols-2">
                    {church.service_times && (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Service Schedule
                        </p>
                        <p className="text-base text-foreground">{church.service_times}</p>
                      </div>
                    )}

                    {church.description && (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notes</p>
                        <p className="text-base text-foreground">{church.description}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-700">
                  This directory is reserved for Message of the Hour churches. All listings are reviewed and verified by admins.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
