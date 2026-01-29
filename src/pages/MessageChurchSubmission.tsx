import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/countries";
import { MessageChurchSubmissionPayload } from "@/types/messageChurches";
import { isValidE164, normalizePhoneNumber } from "@/utils/phone";
import { CheckCircle2 } from "lucide-react";

const MESSAGE_AFFILIATION = "Message of the Hour";

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

export default function MessageChurchSubmission() {
  const [step, setStep] = useState(1);
  const [affirmation, setAffirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<MessageChurchSubmissionPayload>({
    church_name: "",
    message_affiliation: MESSAGE_AFFILIATION,
    pastor_or_contact_name: "",
    pastor_title: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state_region: "",
    postal_code: "",
    country_code: "",
    country_name: "",
    whatsapp_number: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    services_schedule_text: "",
    notes_public: "",
  });

  const updateField = (field: keyof MessageChurchSubmissionPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === formData.country_code),
    [formData.country_code],
  );

  const isStepOneValid = affirmation;
  const isStepTwoValid = formData.church_name.trim() && formData.pastor_or_contact_name.trim();
  const isStepThreeValid =
    formData.address_line_1.trim() && formData.city.trim() && formData.country_code.trim();
  const isStepFourValid = () => {
    const normalizedWhatsapp = normalizePhoneNumber(formData.whatsapp_number);
    if (!isValidE164(normalizedWhatsapp)) return false;
    if (formData.contact_email && !emailRegex.test(formData.contact_email)) return false;
    if (formData.contact_phone && !isValidE164(normalizePhoneNumber(formData.contact_phone))) return false;
    return true;
  };

  const stepIsValid = () => {
    switch (step) {
      case 1:
        return isStepOneValid;
      case 2:
        return isStepTwoValid;
      case 3:
        return isStepThreeValid;
      case 4:
        return isStepFourValid();
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!stepIsValid()) return;
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCountryChange = (value: string) => {
    const country = countries.find((entry) => entry.code === value);
    setFormData((prev) => ({
      ...prev,
      country_code: value,
      country_name: country?.name || "",
    }));
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    const normalizedWhatsapp = normalizePhoneNumber(formData.whatsapp_number);
    const normalizedPhone = formData.contact_phone ? normalizePhoneNumber(formData.contact_phone) : "";

    if (!affirmation) {
      setErrorMessage("You must confirm this is a Message Church aligned with the Message of the Hour.");
      return;
    }

    if (!isValidE164(normalizedWhatsapp)) {
      setErrorMessage("WhatsApp number must include country code and follow E.164 format (e.g. +233...).");
      return;
    }

    if (formData.contact_email && !emailRegex.test(formData.contact_email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (formData.contact_phone && !isValidE164(normalizedPhone)) {
      setErrorMessage("Contact phone must include country code and follow E.164 format.");
      return;
    }

    setLoading(true);

    const payload: MessageChurchSubmissionPayload = {
      ...formData,
      message_affiliation: MESSAGE_AFFILIATION,
      whatsapp_number: normalizedWhatsapp,
      contact_phone: normalizedPhone || undefined,
      pastor_title: formData.pastor_title || undefined,
      address_line_2: formData.address_line_2 || undefined,
      state_region: formData.state_region || undefined,
      postal_code: formData.postal_code || undefined,
      contact_email: formData.contact_email || undefined,
      website_url: formData.website_url || undefined,
      services_schedule_text: formData.services_schedule_text || undefined,
      notes_public: formData.notes_public || undefined,
      country_name: selectedCountry?.name || formData.country_name,
    };

    try {
      const [duplicateWhatsapp, duplicateNameCity, submissionWhatsapp] = await Promise.all([
        supabase.from("message_churches").select("id").eq("whatsapp_number", normalizedWhatsapp).maybeSingle(),
        supabase
          .from("message_churches")
          .select("id")
          .ilike("church_name", formData.church_name.trim())
          .ilike("city", formData.city.trim())
          .eq("country_code", formData.country_code)
          .maybeSingle(),
        supabase
          .from("message_church_submissions")
          .select("id")
          .filter("submitted_church_payload->>whatsapp_number", "eq", normalizedWhatsapp)
          .maybeSingle(),
      ]);

      const duplicatesFound =
        duplicateWhatsapp.data || duplicateNameCity.data || submissionWhatsapp.data;

      const status = duplicatesFound ? "NEEDS_REVIEW" : "PENDING";
      const adminNotes = duplicatesFound
        ? "Potential duplicate detected (matching name/city/country or WhatsApp)."
        : null;

      const { error } = await supabase.from("message_church_submissions").insert({
        submitted_church_payload: payload,
        affirmation_checkbox: true,
        status,
        admin_notes: adminNotes,
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting message church:", error);
      setErrorMessage("Submission failed. Please verify your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header showBackButton />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="py-10 text-center space-y-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h2 className="text-2xl font-semibold">Submission received</h2>
                <p className="text-emerald-700">
                  Thank you. Your Message Church has been submitted for verification.
                </p>
                <Button asChild>
                  <Link to="/message-churches">Return to directory</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
        <div className="md:hidden">
          <Navigation />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Submit a Message Church</CardTitle>
              <CardDescription>
                Please provide accurate details. All submissions are reviewed before they appear publicly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {[
                  "Confirmation",
                  "Church Details",
                  "Location",
                  "Contact",
                  "Review & Submit",
                ].map((label, index) => (
                  <span
                    key={label}
                    className={`rounded-full px-3 py-1 border ${
                      step === index + 1
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {index + 1}. {label}
                  </span>
                ))}
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Submission issue</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      This directory is reserved exclusively for Message Churches aligned with the Message of the Hour.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="affirmation"
                      checked={affirmation}
                      onCheckedChange={(checked) => setAffirmation(checked === true)}
                    />
                    <Label htmlFor="affirmation" className="text-sm leading-relaxed">
                      I confirm this is a Message Church aligned with the Message of the Hour.
                    </Label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="churchName">Church name *</Label>
                    <Input
                      id="churchName"
                      value={formData.church_name}
                      onChange={(event) => updateField("church_name", event.target.value)}
                      placeholder="e.g. Faith Message Tabernacle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pastorName">Pastor / Contact name *</Label>
                    <Input
                      id="pastorName"
                      value={formData.pastor_or_contact_name}
                      onChange={(event) => updateField("pastor_or_contact_name", event.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pastorTitle">Pastor title</Label>
                    <Input
                      id="pastorTitle"
                      value={formData.pastor_title || ""}
                      onChange={(event) => updateField("pastor_title", event.target.value)}
                      placeholder="Pastor, Minister, Elder, Brother"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address1">Address line 1 *</Label>
                    <Input
                      id="address1"
                      value={formData.address_line_1}
                      onChange={(event) => updateField("address_line_1", event.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address2">Address line 2</Label>
                    <Input
                      id="address2"
                      value={formData.address_line_2 || ""}
                      onChange={(event) => updateField("address_line_2", event.target.value)}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateRegion">State / Region</Label>
                    <Input
                      id="stateRegion"
                      value={formData.state_region || ""}
                      onChange={(event) => updateField("state_region", event.target.value)}
                      placeholder="State or region"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postal_code || ""}
                      onChange={(event) => updateField("postal_code", event.target.value)}
                      placeholder="Postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country_code} onValueChange={handleCountryChange}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp number * (E.164)</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp_number}
                      onChange={(event) => updateField("whatsapp_number", event.target.value)}
                      placeholder="+233XXXXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must include country code, e.g. +233, +44, +1.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact email</Label>
                    <Input
                      id="email"
                      value={formData.contact_email || ""}
                      onChange={(event) => updateField("contact_email", event.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact phone (optional)</Label>
                    <Input
                      id="phone"
                      value={formData.contact_phone || ""}
                      onChange={(event) => updateField("contact_phone", event.target.value)}
                      placeholder="+233XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website_url || ""}
                      onChange={(event) => updateField("website_url", event.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="services">Service schedule</Label>
                    <Textarea
                      id="services"
                      value={formData.services_schedule_text || ""}
                      onChange={(event) => updateField("services_schedule_text", event.target.value)}
                      placeholder="e.g. Sunday 10:00 AM, Wednesday 7:00 PM"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Public notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes_public || ""}
                      onChange={(event) => updateField("notes_public", event.target.value)}
                      placeholder="Short doctrinal or service note"
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                    <h3 className="text-lg font-semibold">Review details</h3>
                    <p className="text-sm text-muted-foreground">
                      Please confirm the information below is accurate before submitting.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Church name</p>
                      <p className="font-medium">{formData.church_name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Pastor / Contact</p>
                      <p className="font-medium">
                        {formData.pastor_title ? `${formData.pastor_title} ` : ""}
                        {formData.pastor_or_contact_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">City / Country</p>
                      <p className="font-medium">
                        {formData.city}, {selectedCountry?.name || formData.country_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">WhatsApp</p>
                      <p className="font-medium">{normalizePhoneNumber(formData.whatsapp_number)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-3">
                <Button variant="ghost" asChild>
                  <Link to="/message-churches">Cancel</Link>
                </Button>
                <div className="flex gap-2">
                  {step > 1 && (
                    <Button variant="outline" onClick={handlePrevious}>
                      Back
                    </Button>
                  )}
                  {step < 5 && (
                    <Button onClick={handleNext} disabled={!stepIsValid()}>
                      Continue
                    </Button>
                  )}
                  {step === 5 && (
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Submitting..." : "Submit for Verification"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
