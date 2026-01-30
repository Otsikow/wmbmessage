import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  FileAudio,
  FileText,
  HandHeart,
  Headphones,
  MessageCircle,
  Mic,
  ShieldCheck,
  Upload,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { commentTemplates, testimonies } from "@/data/testimonies";
import { useToast } from "@/hooks/use-toast";
import { TestimonyCategory, TestimonyIdentity, testimonyCategoryLabels } from "@/types/testimonies";

export default function Testimonies() {
  const { toast } = useToast();
  const [identityPreference, setIdentityPreference] = useState<TestimonyIdentity>("full_name");
  const [format, setFormat] = useState<"text" | "audio">("text");
  const [commentDraft, setCommentDraft] = useState("");
  const [category, setCategory] = useState<TestimonyCategory>("healing");
  const [happenedAt, setHappenedAt] = useState("");
  const [beforeStory, setBeforeStory] = useState("");
  const [changeStory, setChangeStory] = useState("");
  const [transcript, setTranscript] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [consentToShare, setConsentToShare] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitted">("idle");

  const remainingCharacters = 180 - commentDraft.length;
  const categoryOptions = useMemo(
    () =>
      (Object.entries(testimonyCategoryLabels) as Array<[TestimonyCategory, string]>).map(
        ([value, label]) => ({ value, label }),
      ),
    [],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!category) {
      toast({ title: "Select a testimony category.", description: "Choose the best fit before submitting." });
      return;
    }

    if (!happenedAt) {
      toast({ title: "Add a date.", description: "Tell us when the testimony happened." });
      return;
    }

    if (!beforeStory.trim() || !changeStory.trim()) {
      toast({
        title: "Complete the required prompts.",
        description: "Please share what the situation was and how it changed.",
      });
      return;
    }

    if (format === "audio" && !transcript.trim()) {
      toast({
        title: "Add a transcript.",
        description: "Audio testimonies need a transcript before submission.",
      });
      return;
    }

    if (identityPreference !== "anonymous" && !displayName.trim()) {
      toast({
        title: "Add a display name.",
        description: "Tell us the name you want shown publicly.",
      });
      return;
    }

    if (!consentToShare) {
      toast({
        title: "Consent required.",
        description: "Please confirm that your testimony can be shared publicly.",
      });
      return;
    }

    setSubmissionStatus("submitted");
    toast({
      title: "Testimony submitted.",
      description: "Thank you! Your testimony is now pending admin review.",
    });
  };

  const isSubmitDisabled =
    !happenedAt ||
    !beforeStory.trim() ||
    !changeStory.trim() ||
    !consentToShare ||
    (format === "audio" && !transcript.trim()) ||
    (identityPreference !== "anonymous" && !displayName.trim());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 py-3 px-4">
          <BackButton />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Community</p>
            <h1 className="text-2xl font-bold">Testimonies</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 container max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-10">
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle>Share what God has done</CardTitle>
            <CardDescription>
              Stories of healing, provision, and transformation build faith. Every testimony is reviewed to
              keep this space safe, joyful, and orderly.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Structured prompts</p>
                <p className="text-sm text-muted-foreground">Guided fields prevent rambling.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarClock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">3-minute max audio</p>
                <p className="text-sm text-muted-foreground">Auto-transcribed and editable.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Moderated feed</p>
                <p className="text-sm text-muted-foreground">Pending until approved by admins.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="submit">
          <CardHeader>
            <CardTitle>Submit a testimony</CardTitle>
            <CardDescription>
              Select a format and fill in every required prompt. “Other” categories are routed to manual
              review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Tabs value={format} onValueChange={(value) => setFormat(value as "text" | "audio")}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="text" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Text testimony
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="gap-2">
                    <FileAudio className="h-4 w-4" />
                    Audio testimony
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4 space-y-4">
                  <div className="rounded-lg border border-dashed border-border p-4 bg-background">
                    <p className="text-sm text-muted-foreground">
                      Write your testimony in a clear, short paragraph. The structured prompts below will guide
                      you.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="audio" className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          Record in-app
                        </CardTitle>
                        <CardDescription>Max 3 minutes. Use a quiet space.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button type="button" variant="secondary" className="w-full gap-2">
                          <Headphones className="h-4 w-4" />
                          Start recording
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload audio
                        </CardTitle>
                        <CardDescription>MP3, M4A, WAV up to 3 minutes.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Input type="file" accept="audio/*" />
                        <p className="text-xs text-muted-foreground">
                          Audio will be auto-transcribed. Review and edit before submitting.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transcript">Transcript (auto-generated)</Label>
                    <Textarea
                      id="transcript"
                      placeholder="Edit the transcript before submitting."
                      className="min-h-[120px]"
                      value={transcript}
                      onChange={(event) => setTranscript(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ensure the transcript matches your recording and removes sensitive details if needed.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Testimony category *</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as TestimonyCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((categoryOption) => (
                        <SelectItem key={categoryOption.value} value={categoryOption.value}>
                          {categoryOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    “Other” categories are reviewed manually before publishing.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="happenedAt">When did this happen? *</Label>
                  <Input
                    id="happenedAt"
                    type="date"
                    value={happenedAt}
                    onChange={(event) => setHappenedAt(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="before">What was the situation before? *</Label>
                <Textarea
                  id="before"
                  placeholder="Describe the need, struggle, or situation."
                  className="min-h-[120px]"
                  value={beforeStory}
                  onChange={(event) => setBeforeStory(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="change">What changed? *</Label>
                <Textarea
                  id="change"
                  placeholder="Share the turning point and outcome."
                  className="min-h-[120px]"
                  value={changeStory}
                  onChange={(event) => setChangeStory(event.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Identity & privacy</Label>
                <RadioGroup
                  value={identityPreference}
                  onValueChange={(value) => setIdentityPreference(value as TestimonyIdentity)}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <label className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer">
                    <RadioGroupItem value="full_name" />
                    <span className="text-sm font-medium">Full name</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer">
                    <RadioGroupItem value="first_name" />
                    <span className="text-sm font-medium">First name only</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer">
                    <RadioGroupItem value="anonymous" />
                    <span className="text-sm font-medium">Anonymous</span>
                  </label>
                </RadioGroup>
                {identityPreference !== "anonymous" && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                      id="displayName"
                      placeholder="Enter the name to show publicly"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent"
                    checked={consentToShare}
                    onCheckedChange={(checked) => setConsentToShare(checked === true)}
                  />
                  <Label htmlFor="consent" className="text-sm leading-relaxed">
                    I permit this testimony to be shared publicly.
                  </Label>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-border p-4 bg-muted/40 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">Submission status</p>
                  <p className="text-sm text-muted-foreground">
                    {submissionStatus === "submitted"
                      ? "Thanks! Your testimony is pending admin review before it is published."
                      : "All testimonies are saved as pending until an admin approves them."}
                  </p>
                </div>
                <Button type="submit" className="gap-2" variant="default" disabled={isSubmitDisabled}>
                  Submit testimony
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderation workflow</CardTitle>
            <CardDescription>
              Admins review every testimony, can edit for clarity, flag sensitive content, or reject submissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="font-semibold">Pending queue</p>
              <p className="text-sm text-muted-foreground">New entries await approval.</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="font-semibold">Sensitive flag</p>
              <p className="text-sm text-muted-foreground">Mark testimonies needing discretion.</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="font-semibold">Edit & approve</p>
              <p className="text-sm text-muted-foreground">Admins can tighten language before publishing.</p>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Testimony feed</h2>
              <p className="text-sm text-muted-foreground">
                Read approved testimonies. Audio entries include a play button and transcript preview.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="#submit">Share yours</Link>
            </Button>
          </div>
          <div className="grid gap-6">
            {testimonies.map((testimony) => (
              <Card key={testimony.id}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{testimony.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{testimony.happenedAt}</p>
                    </div>
                    <Badge variant="secondary">{testimonyCategoryLabels[testimony.category]}</Badge>
                  </div>
                  <CardDescription>{testimony.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testimony.hasAudio && (
                    <div className="rounded-lg border border-border p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <FileAudio className="h-4 w-4" />
                          Audio testimony
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimony.transcriptPreview}
                        </p>
                      </div>
                      <Button type="button" variant="secondary" className="gap-2">
                        <Headphones className="h-4 w-4" />
                        Play audio
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="gap-2">
                      <HandHeart className="h-4 w-4 text-rose-500" />
                      Encouraged ❤️ {testimony.engagements.encouraged}
                    </Button>
                    <Button type="button" variant="outline" className="gap-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-500" />
                      Prayed 🙏 {testimony.engagements.prayed}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      disabled={testimony.commentsLocked}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Comment 💬 {testimony.engagements.comments}
                    </Button>
                    {testimony.commentsLocked && (
                      <Badge variant="outline" className="border-amber-400 text-amber-600">
                        Comments locked
                      </Badge>
                    )}
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/40">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Encouragement comments</p>
                      <span className="text-xs text-muted-foreground">180 character limit</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {commentTemplates.map((template) => (
                        <Button key={template.id} type="button" variant="secondary" size="sm">
                          {template.label}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share a short encouragement only."
                      maxLength={180}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Only encouragements. No advice, debates, or preaching.</span>
                      <span>{remainingCharacters} characters left</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card className="border-amber-200/80 bg-amber-50/30">
          <CardHeader className="flex flex-row items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>Security & abuse prevention</CardTitle>
              <CardDescription>
                Automated checks keep out money requests, miracle selling, and spam. Admins can lock
                comments at any time.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-amber-200/80 p-4 bg-background">
              <p className="font-semibold">Rate-limited submissions</p>
              <p className="text-sm text-muted-foreground">Protects the feed from spam.</p>
            </div>
            <div className="rounded-lg border border-amber-200/80 p-4 bg-background">
              <p className="font-semibold">Auto-flagged keywords</p>
              <p className="text-sm text-muted-foreground">Money requests trigger review.</p>
            </div>
            <div className="rounded-lg border border-amber-200/80 p-4 bg-background">
              <p className="font-semibold">Admin comment locks</p>
              <p className="text-sm text-muted-foreground">Sensitive testimonies stay safe.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
