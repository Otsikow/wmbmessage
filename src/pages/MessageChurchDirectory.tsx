import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageChurch } from "@/types/messageChurches";
import { countries } from "@/data/countries";
import MessageChurchCard from "@/components/message-churches/MessageChurchCard";
import { MapPinned, Search, ShieldCheck } from "lucide-react";

const verifiedOnlyDefault = true;

export default function MessageChurchDirectory() {
  const [churches, setChurches] = useState<MessageChurch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(verifiedOnlyDefault);
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchChurches = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("message_churches")
        .select("*")
        .order("church_name", { ascending: true })
        .eq("status", "PUBLISHED");

      if (verifiedOnly) {
        query = query.eq("verified", true);
      }

      if (countryFilter !== "all") {
        query = query.eq("country_code", countryFilter);
      }

      if (cityFilter.trim()) {
        query = query.ilike("city", `%${cityFilter.trim()}%`);
      }

      if (searchTerm.trim()) {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(
          `church_name.ilike.${term},pastor_or_contact_name.ilike.${term},city.ilike.${term},country_name.ilike.${term}`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setChurches((data || []) as MessageChurch[]);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching message churches:", error);
      setErrorMessage("Unable to load the directory right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, [searchTerm, countryFilter, cityFilter, verifiedOnly]);

  useEffect(() => {
    if (!churches.length) {
      setSelectedChurchId(null);
      return;
    }
    if (!selectedChurchId || !churches.some((church) => church.id === selectedChurchId)) {
      setSelectedChurchId(churches[0]?.id ?? null);
    }
  }, [churches, selectedChurchId]);

  const selectedChurch = useMemo(
    () => churches.find((church) => church.id === selectedChurchId) ?? null,
    [churches, selectedChurchId],
  );

  const buildAddress = (church: MessageChurch) =>
    [
      church.address_line_1,
      church.address_line_2,
      church.city,
      church.state_region,
      church.postal_code,
      church.country_name,
    ]
      .filter(Boolean)
      .join(", ");

  const mapEmbedUrl = selectedChurch
    ? `https://www.google.com/maps?q=${encodeURIComponent(buildAddress(selectedChurch))}&output=embed`
    : "";
  const mapLinkUrl = selectedChurch
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildAddress(selectedChurch))}`
    : "";

  const countryOptions = useMemo(() => [{ code: "all", name: "All countries" }, ...countries], []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton />
      <main className="flex-1">
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl sm:text-3xl font-semibold">
                      Global Message Churches Directory
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Verified Message of the Hour churches worldwide. Submit a church for review to help the body stay connected.
                    </p>
                  </div>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link to="/message-churches/submit">Submit a Message Church</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Only verified Message Churches appear publicly.
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search church, city, pastor"
                      className="pl-9"
                    />
                  </div>
                  <Input
                    value={cityFilter}
                    onChange={(event) => setCityFilter(event.target.value)}
                    placeholder="Filter by city"
                  />
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Verified only</p>
                      <p className="text-xs text-muted-foreground">Admin-approved listings</p>
                    </div>
                    <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{churches.length} results</Badge>
                  <span>WhatsApp is the primary contact channel for every listing.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MapPinned className="h-5 w-5 text-emerald-600" />
                  Map view
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose a church to preview its location on the map and open directions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {churches.length ? (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <div className="space-y-3">
                      <Select
                        value={selectedChurchId ?? ""}
                        onValueChange={(value) => setSelectedChurchId(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a church" />
                        </SelectTrigger>
                        <SelectContent>
                          {churches.map((church) => (
                            <SelectItem key={church.id} value={church.id}>
                              {church.church_name} · {church.city}, {church.country_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedChurch && (
                        <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-4 text-sm">
                          <p className="font-semibold">{selectedChurch.church_name}</p>
                          <p className="text-muted-foreground">{buildAddress(selectedChurch)}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{selectedChurch.city}</Badge>
                            <Badge variant="secondary">{selectedChurch.country_name}</Badge>
                          </div>
                          <Button asChild size="sm" className="w-full">
                            <a href={mapLinkUrl} target="_blank" rel="noreferrer">
                              Open in Google Maps
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="min-h-[320px] overflow-hidden rounded-lg border border-border/60 bg-muted">
                      {selectedChurch ? (
                        <iframe
                          title={`Map for ${selectedChurch.church_name}`}
                          src={mapEmbedUrl}
                          className="h-full min-h-[320px] w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          Select a church to view its map.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    Map view will appear once churches are available.
                  </div>
                )}
              </CardContent>
            </Card>

            {errorMessage && (
              <Card className="border-destructive/40">
                <CardContent className="py-4 text-destructive">{errorMessage}</CardContent>
              </Card>
            )}

            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading directory...
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {churches.map((church) => (
                  <MessageChurchCard key={church.id} church={church} />
                ))}
                {!churches.length && !errorMessage && (
                  <Card className="md:col-span-2">
                    <CardContent className="py-10 text-center text-muted-foreground">
                      No verified Message Churches match your search yet.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
