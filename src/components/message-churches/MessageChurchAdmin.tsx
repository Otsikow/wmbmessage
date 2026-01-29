import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageChurch, MessageChurchSubmission, MessageChurchSubmissionPayload, parseSubmissionPayload } from "@/types/messageChurches";
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
  email?: string;
  website?: string;
  service_times?: string;
  description?: string;
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
  email: "",
  website: "",
  service_times: "",
  description: "",
  status: "PENDING",
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

    if (bulkAction === "publish") {
      updates.status = "PUBLISHED";
    }
    if (bulkAction === "archive") {
      updates.status = "ARCHIVED";
    }
    if (bulkAction === "verify") {
      updates.verified = true;
      updates.verified_by_admin_id = user?.id || null;
    }
    if (bulkAction === "unverify") {
      updates.verified = false;
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
      email: church.email || "",
      website: church.website || "",
      service_times: church.service_times || "",
      description: church.description || "",
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

    if (churchForm.email && !emailRegex.test(churchForm.email)) {
      return "Please enter a valid contact email.";
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
      email: churchForm.email?.trim() || null,
      website: churchForm.website?.trim() || null,
      service_times: churchForm.service_times?.trim() || null,
      description: churchForm.description?.trim() || null,
      status: churchForm.status,
      verified: churchForm.verified,
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
    const payload = parseSubmissionPayload(submission.submitted_church_payload);
    if (!payload) {
      setErrorMessage("Invalid submission payload.");
      return;
    }
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
        whatsapp_number: normalizedWhatsapp,
        email: reviewPayload.email || null,
        website: reviewPayload.website || null,
        service_times: reviewPayload.service_times || null,
        description: reviewPayload.description || null,
        status: "PUBLISHED",
        verified: true,
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
          admin_notes: `Rejection reason: ${rejectionReason.trim()}`,
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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-emerald-600 text-white">Published</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">Archived</Badge>;
      case "APPROVED":
        return <Badge className="bg-emerald-600 text-white">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "PENDING":
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const submissionRows = useMemo(() => {
    return submissions.map((submission) => ({
      ...submission,
      payload: parseSubmissionPayload(submission.submitted_church_payload),
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
            <TabsTrigger value="churches">Churches ({churches.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="churches" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Bulk action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="verify">Verify</SelectItem>
                  <SelectItem value="unverify">Unverify</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!bulkAction || selectedChurchIds.length === 0}
                onClick={handleBulkApply}
              >
                Apply to {selectedChurchIds.length} selected
              </Button>
            </div>

            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading churches...</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            churches.length > 0 && selectedChurchIds.length === churches.length
                          }
                          onCheckedChange={(checked) =>
                            setSelectedChurchIds(checked ? churches.map((c) => c.id) : [])
                          }
                        />
                      </TableHead>
                      <TableHead>Church Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {churches.map((church) => (
                      <TableRow key={church.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedChurchIds.includes(church.id)}
                            onCheckedChange={(checked) =>
                              handleSelectChurch(church.id, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{church.church_name}</TableCell>
                        <TableCell>{church.city}</TableCell>
                        <TableCell>{church.country_name}</TableCell>
                        <TableCell>{renderStatusBadge(church.status)}</TableCell>
                        <TableCell>
                          {church.verified ? (
                            <Badge className="bg-emerald-600 text-white">✓</Badge>
                          ) : (
                            <Badge variant="outline">—</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(church)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={formatWhatsAppLink(church.whatsapp_number)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {churches.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No churches yet. Add one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading submissions...</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Church Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.payload?.church_name || "Unknown"}
                        </TableCell>
                        <TableCell>{row.payload?.city || "—"}</TableCell>
                        <TableCell>{row.payload?.country_name || "—"}</TableCell>
                        <TableCell>{renderStatusBadge(row.status)}</TableCell>
                        <TableCell>
                          {new Date(row.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {row.status === "PENDING" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openReviewDialog(row)}
                                >
                                  Review
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openRejectionDialog(row)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {row.status !== "PENDING" && (
                              <span className="text-xs text-muted-foreground">Processed</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {submissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No submissions yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Church Create/Edit Dialog */}
        <Dialog open={churchDialogOpen} onOpenChange={setChurchDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {churchDialogMode === "create" ? "Add Church" : "Edit Church"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="church_name">Church name *</Label>
                  <Input
                    id="church_name"
                    value={churchForm.church_name}
                    onChange={(e) => handleChurchFormChange("church_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pastor_or_contact_name">Pastor / Contact *</Label>
                  <Input
                    id="pastor_or_contact_name"
                    value={churchForm.pastor_or_contact_name}
                    onChange={(e) => handleChurchFormChange("pastor_or_contact_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pastor_title">Title</Label>
                  <Input
                    id="pastor_title"
                    value={churchForm.pastor_title || ""}
                    onChange={(e) => handleChurchFormChange("pastor_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp (E.164) *</Label>
                  <Input
                    id="whatsapp_number"
                    value={churchForm.whatsapp_number}
                    onChange={(e) => handleChurchFormChange("whatsapp_number", e.target.value)}
                    placeholder="+233XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line_1">Address line 1 *</Label>
                  <Input
                    id="address_line_1"
                    value={churchForm.address_line_1}
                    onChange={(e) => handleChurchFormChange("address_line_1", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line_2">Address line 2</Label>
                  <Input
                    id="address_line_2"
                    value={churchForm.address_line_2 || ""}
                    onChange={(e) => handleChurchFormChange("address_line_2", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={churchForm.city}
                    onChange={(e) => handleChurchFormChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state_region">State / Region</Label>
                  <Input
                    id="state_region"
                    value={churchForm.state_region || ""}
                    onChange={(e) => handleChurchFormChange("state_region", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal code</Label>
                  <Input
                    id="postal_code"
                    value={churchForm.postal_code || ""}
                    onChange={(e) => handleChurchFormChange("postal_code", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={churchForm.country_code} onValueChange={handleChurchCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={churchForm.email || ""}
                    onChange={(e) => handleChurchFormChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={churchForm.website || ""}
                    onChange={(e) => handleChurchFormChange("website", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="service_times">Service times</Label>
                  <Textarea
                    id="service_times"
                    value={churchForm.service_times || ""}
                    onChange={(e) => handleChurchFormChange("service_times", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={churchForm.description || ""}
                    onChange={(e) => handleChurchFormChange("description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={churchForm.status}
                    onValueChange={(v) => handleChurchFormChange("status", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="verified"
                    checked={churchForm.verified}
                    onCheckedChange={(v) => handleChurchFormChange("verified", v)}
                  />
                  <Label htmlFor="verified">Verified</Label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setChurchDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChurch}>
                  {churchDialogMode === "create" ? "Create Church" : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
            </DialogHeader>
            {reviewPayload && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Church: </span>
                    <span className="font-medium">{reviewPayload.church_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pastor: </span>
                    <span>{reviewPayload.pastor_or_contact_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location: </span>
                    <span>
                      {reviewPayload.city}, {reviewPayload.country_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">WhatsApp: </span>
                    <span>{reviewPayload.whatsapp_number}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewNotes">Admin notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApproveSubmission}>
                    Approve & Publish
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this submission is being rejected..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleRejectSubmission}>
                  Reject Submission
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
