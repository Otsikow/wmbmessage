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
import { Search, ShieldCheck } from "lucide-react";

const verifiedOnlyDefault = true;

export default function MessageChurchDirectory() {
  const [churches, setChurches] = useState<MessageChurch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(verifiedOnlyDefault);
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
