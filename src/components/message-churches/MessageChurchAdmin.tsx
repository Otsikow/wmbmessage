import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageChurch, MessageChurchSubmission, MessageChurchSubmissionPayload } from "@/types/messageChurches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatWhatsAppLink, isValidE164, normalizePhoneNumber } from "@/utils/phone";
import { useAuth } from "@/contexts/AuthContext";
import { countries } from "@/data/countries";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircle, Pencil, Plus, RefreshCw } from "lucide-react";

const MESSAGE_AFFILIATION = "Message of the Hour";

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

type ChurchFormState = {
  id?: string;
  church_name: string;
  pastor_or_contact_name: string;
  pastor_title?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_region?: string;
  postal_code?: string;
  country_code: string;
  country_name: string;
  whatsapp_number: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  services_schedule_text?: string;
  notes_public?: string;
  status: MessageChurch["status"];
  verified: boolean;
};

const emptyChurchForm: ChurchFormState = {
  church_name: "",
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
  status: "DRAFT",
  verified: false,
};

export default function MessageChurchAdmin() {
  const { user } = useAuth();
  const [churches, setChurches] = useState<MessageChurch[]>([]);
  const [submissions, setSubmissions] = useState<MessageChurchSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedChurchIds, setSelectedChurchIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [churchDialogOpen, setChurchDialogOpen] = useState(false);
  const [churchForm, setChurchForm] = useState<ChurchFormState>(emptyChurchForm);
  const [churchDialogMode, setChurchDialogMode] = useState<"create" | "edit">("create");

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewSubmission, setReviewSubmission] = useState<MessageChurchSubmission | null>(null);
  const [reviewPayload, setReviewPayload] = useState<MessageChurchSubmissionPayload | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [needsReviewDialogOpen, setNeedsReviewDialogOpen] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [churchesRes, submissionsRes] = await Promise.all([
        supabase.from("message_churches").select("*").order("created_at", { ascending: false }),
        supabase.from("message_church_submissions").select("*").order("created_at", { ascending: false }),
      ]);

      if (churchesRes.error) throw churchesRes.error;
      if (submissionsRes.error) throw submissionsRes.error;

      setChurches((churchesRes.data || []) as MessageChurch[]);
      setSubmissions((submissionsRes.data || []) as MessageChurchSubmission[]);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching message church admin data:", error);
      setErrorMessage("Unable to load message church admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSelectChurch = (churchId: string, checked: boolean) => {
    setSelectedChurchIds((prev) =>
      checked ? [...prev, churchId] : prev.filter((id) => id !== churchId),
    );
  };

  const handleBulkApply = async () => {
    if (!bulkAction || !selectedChurchIds.length) return;

    const updates: Partial<MessageChurch> = {};
    const now = new Date().toISOString();

    if (bulkAction === "publish") {
      updates.status = "PUBLISHED";
    }
    if (bulkAction === "archive") {
      updates.status = "ARCHIVED";
    }
    if (bulkAction === "verify") {
      updates.verified = true;
      updates.verified_at = now;
      updates.verified_by_admin_id = user?.id || null;
    }
    if (bulkAction === "unverify") {
      updates.verified = false;
      updates.verified_at = null;
      updates.verified_by_admin_id = null;
    }

    try {
      const { error } = await supabase
        .from("message_churches")
        .update(updates)
        .in("id", selectedChurchIds);

      if (error) throw error;
      setSelectedChurchIds([]);
      setBulkAction("");
      fetchAll();
    } catch (error) {
      console.error("Error applying bulk action:", error);
      setErrorMessage("Bulk update failed. Please try again.");
    }
  };

  const openCreateDialog = () => {
    setChurchDialogMode("create");
    setChurchForm(emptyChurchForm);
    setChurchDialogOpen(true);
  };

  const openEditDialog = (church: MessageChurch) => {
    setChurchDialogMode("edit");
    setChurchForm({
      id: church.id,
      church_name: church.church_name,
      pastor_or_contact_name: church.pastor_or_contact_name,
      pastor_title: church.pastor_title || "",
      address_line_1: church.address_line_1,
      address_line_2: church.address_line_2 || "",
      city: church.city,
      state_region: church.state_region || "",
      postal_code: church.postal_code || "",
      country_code: church.country_code,
      country_name: church.country_name,
      whatsapp_number: church.whatsapp_number,
      contact_email: church.contact_email || "",
      contact_phone: church.contact_phone || "",
      website_url: church.website_url || "",
      services_schedule_text: church.services_schedule_text || "",
      notes_public: church.notes_public || "",
      status: church.status,
      verified: church.verified,
    });
    setChurchDialogOpen(true);
  };

  const handleChurchFormChange = (field: keyof ChurchFormState, value: string | boolean) => {
    setChurchForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChurchCountryChange = (value: string) => {
    const selected = countries.find((country) => country.code === value);
    setChurchForm((prev) => ({
      ...prev,
      country_code: value,
      country_name: selected?.name || prev.country_name,
    }));
  };

  const validateChurchForm = () => {
    if (!churchForm.church_name.trim()) return "Church name is required.";
    if (!churchForm.pastor_or_contact_name.trim()) return "Pastor/contact name is required.";
    if (!churchForm.address_line_1.trim()) return "Address line 1 is required.";
    if (!churchForm.city.trim()) return "City is required.";
    if (!churchForm.country_code.trim()) return "Country is required.";

    const normalizedWhatsapp = normalizePhoneNumber(churchForm.whatsapp_number);
    if (!isValidE164(normalizedWhatsapp)) {
      return "WhatsApp number must be in E.164 format with country code.";
    }

    if (churchForm.contact_email && !emailRegex.test(churchForm.contact_email)) {
      return "Please enter a valid contact email.";
    }

    if (churchForm.contact_phone && !isValidE164(normalizePhoneNumber(churchForm.contact_phone))) {
      return "Contact phone must be in E.164 format.";
    }

    return null;
  };

  const handleSaveChurch = async () => {
    const validationError = validateChurchForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const normalizedWhatsapp = normalizePhoneNumber(churchForm.whatsapp_number);
    const normalizedContactPhone = churchForm.contact_phone
      ? normalizePhoneNumber(churchForm.contact_phone)
      : null;
    const now = new Date().toISOString();

    const payload = {
      church_name: churchForm.church_name.trim(),
      message_affiliation: MESSAGE_AFFILIATION,
      pastor_or_contact_name: churchForm.pastor_or_contact_name.trim(),
      pastor_title: churchForm.pastor_title?.trim() || null,
      address_line_1: churchForm.address_line_1.trim(),
      address_line_2: churchForm.address_line_2?.trim() || null,
      city: churchForm.city.trim(),
      state_region: churchForm.state_region?.trim() || null,
      postal_code: churchForm.postal_code?.trim() || null,
      country_code: churchForm.country_code,
      country_name: churchForm.country_name,
      whatsapp_number: normalizedWhatsapp,
      contact_email: churchForm.contact_email?.trim() || null,
      contact_phone: normalizedContactPhone,
      website_url: churchForm.website_url?.trim() || null,
      services_schedule_text: churchForm.services_schedule_text?.trim() || null,
      notes_public: churchForm.notes_public?.trim() || null,
      status: churchForm.status,
      verified: churchForm.verified,
      verified_at: churchForm.verified ? now : null,
      verified_by_admin_id: churchForm.verified ? user?.id || null : null,
    };

    try {
      if (churchDialogMode === "create") {
        const { error } = await supabase.from("message_churches").insert(payload);
        if (error) throw error;
      } else if (churchForm.id) {
        const { error } = await supabase
          .from("message_churches")
          .update(payload)
          .eq("id", churchForm.id);
        if (error) throw error;
      }

      setChurchDialogOpen(false);
      setErrorMessage(null);
      fetchAll();
    } catch (error) {
      console.error("Error saving message church:", error);
      setErrorMessage("Unable to save message church. Please try again.");
    }
  };

  const openReviewDialog = (submission: MessageChurchSubmission) => {
    const payload = submission.submitted_church_payload as MessageChurchSubmissionPayload;
    setReviewSubmission(submission);
    setReviewPayload({
      ...payload,
      whatsapp_number: normalizePhoneNumber(payload.whatsapp_number || ""),
    });
    setReviewNotes(submission.admin_notes || "");
    setReviewDialogOpen(true);
  };

  const handleApproveSubmission = async () => {
    if (!reviewSubmission || !reviewPayload) return;
    const normalizedWhatsapp = normalizePhoneNumber(reviewPayload.whatsapp_number);

    if (!isValidE164(normalizedWhatsapp)) {
      setErrorMessage("WhatsApp number must be in E.164 format.");
      return;
    }

    try {
      const now = new Date().toISOString();
      const { error: churchError } = await supabase.from("message_churches").insert({
        church_name: reviewPayload.church_name,
        message_affiliation: MESSAGE_AFFILIATION,
        pastor_or_contact_name: reviewPayload.pastor_or_contact_name,
        pastor_title: reviewPayload.pastor_title || null,
        address_line_1: reviewPayload.address_line_1,
        address_line_2: reviewPayload.address_line_2 || null,
        city: reviewPayload.city,
        state_region: reviewPayload.state_region || null,
        postal_code: reviewPayload.postal_code || null,
        country_code: reviewPayload.country_code,
        country_name: reviewPayload.country_name,
        latitude: reviewPayload.latitude || null,
        longitude: reviewPayload.longitude || null,
        whatsapp_number: normalizedWhatsapp,
        contact_email: reviewPayload.contact_email || null,
        contact_phone: reviewPayload.contact_phone ? normalizePhoneNumber(reviewPayload.contact_phone) : null,
        website_url: reviewPayload.website_url || null,
        services_schedule_text: reviewPayload.services_schedule_text || null,
        notes_public: reviewPayload.notes_public || null,
        status: "PUBLISHED",
        verified: true,
        verified_at: now,
        verified_by_admin_id: user?.id || null,
      });

      if (churchError) throw churchError;

      const { error: submissionError } = await supabase
        .from("message_church_submissions")
        .update({
          status: "APPROVED",
          admin_notes: reviewNotes || null,
        })
        .eq("id", reviewSubmission.id);

      if (submissionError) throw submissionError;

      setReviewDialogOpen(false);
      setReviewSubmission(null);
      setReviewPayload(null);
      fetchAll();
    } catch (error) {
      console.error("Error approving submission:", error);
      setErrorMessage("Failed to approve submission. Please try again.");
    }
  };

  const openRejectionDialog = (submission: MessageChurchSubmission) => {
    setReviewSubmission(submission);
    setRejectionReason("");
    setRejectionDialogOpen(true);
  };

  const handleRejectSubmission = async () => {
    if (!reviewSubmission || !rejectionReason.trim()) {
      setErrorMessage("Rejection reason is required.");
      return;
    }

    try {
      const { error } = await supabase
        .from("message_church_submissions")
        .update({
          status: "REJECTED",
          rejection_reason: rejectionReason.trim(),
          admin_notes: reviewNotes || null,
        })
        .eq("id", reviewSubmission.id);

      if (error) throw error;
      setRejectionDialogOpen(false);
      setReviewSubmission(null);
      setReviewNotes("");
      fetchAll();
    } catch (error) {
      console.error("Error rejecting submission:", error);
      setErrorMessage("Unable to reject submission.");
    }
  };

  const openNeedsReviewDialog = (submission: MessageChurchSubmission) => {
    setReviewSubmission(submission);
    setReviewNotes(submission.admin_notes || "");
    setNeedsReviewDialogOpen(true);
  };

  const handleNeedsReview = async () => {
    if (!reviewSubmission) return;
    try {
      const { error } = await supabase
        .from("message_church_submissions")
        .update({
          status: "NEEDS_REVIEW",
          admin_notes: reviewNotes || null,
        })
        .eq("id", reviewSubmission.id);

      if (error) throw error;
      setNeedsReviewDialogOpen(false);
      setReviewSubmission(null);
      setReviewNotes("");
      fetchAll();
    } catch (error) {
      console.error("Error marking submission for review:", error);
      setErrorMessage("Unable to update submission status.");
    }
  };

  const renderStatusBadge = (status: MessageChurch["status"] | MessageChurchSubmission["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-emerald-600 text-white">Published</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">Archived</Badge>;
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "APPROVED":
        return <Badge className="bg-emerald-600 text-white">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "NEEDS_REVIEW":
        return <Badge className="bg-amber-500 text-white">Needs Review</Badge>;
      case "PENDING":
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const submissionRows = useMemo(() => {
    return submissions.map((submission) => ({
      ...submission,
      payload: submission.submitted_church_payload as MessageChurchSubmissionPayload,
    }));
  }, [submissions]);

  return (
    <Card className="border-border/60">
      <CardContent className="py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Message Churches</h2>
            <p className="text-sm text-muted-foreground">
              Manage verified Message of the Hour churches and review public submissions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAll}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Church
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Message Church Admin</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="churches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="churches">Churches</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="churches" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Publish selected</SelectItem>
                  <SelectItem value="archive">Archive selected</SelectItem>
                  <SelectItem value="verify">Mark verified</SelectItem>
                  <SelectItem value="unverify">Mark unverified</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkApply} disabled={!bulkAction || !selectedChurchIds.length}>
                Apply
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedChurchIds.length} selected
              </span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Church</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Loading churches...
                      </TableCell>
                    </TableRow>
                  ) : (
                    churches.map((church) => (
                      <TableRow key={church.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedChurchIds.includes(church.id)}
                            onCheckedChange={(checked) => handleSelectChurch(church.id, checked === true)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{church.church_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {church.pastor_or_contact_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {church.city}, {church.country_name}
                        </TableCell>
                        <TableCell>{renderStatusBadge(church.status)}</TableCell>
                        <TableCell>
                          {church.verified ? (
                            <Badge className="bg-emerald-600 text-white">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={formatWhatsAppLink(church.whatsapp_number)} target="_blank" rel="noreferrer">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Test
                            </a>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(church)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Church</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Loading submissions...
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissionRows.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{submission.payload?.church_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {submission.payload?.pastor_or_contact_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {submission.payload?.city}, {submission.payload?.country_name}
                        </TableCell>
                        <TableCell>{renderStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={formatWhatsAppLink(submission.payload?.whatsapp_number || "")}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Test
                            </a>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button size="sm" onClick={() => openReviewDialog(submission)}>
                              Review & Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openNeedsReviewDialog(submission)}>
                              Needs Review
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openRejectionDialog(submission)}>
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={churchDialogOpen} onOpenChange={setChurchDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {churchDialogMode === "create" ? "Add Message Church" : "Edit Message Church"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Message affiliation</Label>
              <Input value={MESSAGE_AFFILIATION} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Church name *</Label>
              <Input
                value={churchForm.church_name}
                onChange={(event) => handleChurchFormChange("church_name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Pastor / Contact *</Label>
              <Input
                value={churchForm.pastor_or_contact_name}
                onChange={(event) => handleChurchFormChange("pastor_or_contact_name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Pastor title</Label>
              <Input
                value={churchForm.pastor_title || ""}
                onChange={(event) => handleChurchFormChange("pastor_title", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address line 1 *</Label>
              <Input
                value={churchForm.address_line_1}
                onChange={(event) => handleChurchFormChange("address_line_1", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address line 2</Label>
              <Input
                value={churchForm.address_line_2 || ""}
                onChange={(event) => handleChurchFormChange("address_line_2", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input value={churchForm.city} onChange={(event) => handleChurchFormChange("city", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>State / Region</Label>
              <Input
                value={churchForm.state_region || ""}
                onChange={(event) => handleChurchFormChange("state_region", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Postal code</Label>
              <Input
                value={churchForm.postal_code || ""}
                onChange={(event) => handleChurchFormChange("postal_code", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country *</Label>
              <Select value={churchForm.country_code} onValueChange={handleChurchCountryChange}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>WhatsApp *</Label>
              <Input
                value={churchForm.whatsapp_number}
                onChange={(event) => handleChurchFormChange("whatsapp_number", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={churchForm.contact_email || ""}
                onChange={(event) => handleChurchFormChange("contact_email", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={churchForm.contact_phone || ""}
                onChange={(event) => handleChurchFormChange("contact_phone", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={churchForm.website_url || ""}
                onChange={(event) => handleChurchFormChange("website_url", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Service schedule</Label>
              <Textarea
                value={churchForm.services_schedule_text || ""}
                onChange={(event) => handleChurchFormChange("services_schedule_text", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Public notes</Label>
              <Textarea
                value={churchForm.notes_public || ""}
                onChange={(event) => handleChurchFormChange("notes_public", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={churchForm.status}
                onValueChange={(value) => handleChurchFormChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Verified</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={churchForm.verified}
                  onCheckedChange={(checked) => handleChurchFormChange("verified", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {churchForm.verified ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setChurchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChurch}>
              {churchDialogMode === "create" ? "Create" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review & Approve Submission</DialogTitle>
          </DialogHeader>
          {reviewPayload && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Church name</Label>
                  <Input
                    value={reviewPayload.church_name}
                    onChange={(event) =>
                      setReviewPayload({ ...reviewPayload, church_name: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pastor / Contact</Label>
                  <Input
                    value={reviewPayload.pastor_or_contact_name}
                    onChange={(event) =>
                      setReviewPayload({
                        ...reviewPayload,
                        pastor_or_contact_name: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={reviewPayload.whatsapp_number}
                    onChange={(event) =>
                      setReviewPayload({ ...reviewPayload, whatsapp_number: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address line 1</Label>
                  <Input
                    value={reviewPayload.address_line_1}
                    onChange={(event) =>
                      setReviewPayload({ ...reviewPayload, address_line_1: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={reviewPayload.city}
                    onChange={(event) => setReviewPayload({ ...reviewPayload, city: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={reviewPayload.country_code}
                    onValueChange={(value) => {
                      const selected = countries.find((country) => country.code === value);
                      setReviewPayload({
                        ...reviewPayload,
                        country_code: value,
                        country_name: selected?.name || reviewPayload.country_name,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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

              <div className="space-y-2">
                <Label>Admin notes</Label>
                <Textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApproveSubmission}>Approve & Publish</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={needsReviewDialogOpen} onOpenChange={setNeedsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Needs Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Admin notes</Label>
              <Textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNeedsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleNeedsReview}>Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection reason *</Label>
              <Textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Admin notes</Label>
              <Textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectSubmission}>
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
