import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  Facebook,
  FileAudio,
  FileText,
  HandHeart,
  Headphones,
  MoreHorizontal,
  Square,
  Trash2,
  Link as LinkIcon,
  Mail,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { commentTemplates, testimonies } from "@/data/testimonies";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { appendShareAttribution, buildShareUrl } from "@/lib/share";
import { TestimonyCategory, TestimonyIdentity, testimonyCategoryLabels } from "@/types/testimonies";

const isTestimonyCategory = (value: string | null): value is TestimonyCategory => {
  if (!value) return false;
  return [
    "healing",
    "financial_breakthrough",
    "family_marriage",
    "salvation_growth",
    "deliverance",
    "career_education",
    "other",
  ].includes(value);
};

export default function Testimonies() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const isSignedIn = Boolean(user);
  const navigate = useNavigate();
  const prefillSource = searchParams.get("source");
  const prefillBefore = searchParams.get("before") ?? "";
  const prefillChange = searchParams.get("change") ?? "";
  const prefillCategory = searchParams.get("category");
  const prefillFromPrayer = prefillSource === "prayer";

  const [identityPreference, setIdentityPreference] = useState<TestimonyIdentity>("full_name");
  const [format, setFormat] = useState<"text" | "audio">("text");
  const [commentDraft, setCommentDraft] = useState("");
  const [category, setCategory] = useState<TestimonyCategory>(
    isTestimonyCategory(prefillCategory) ? prefillCategory : "healing",
  );
  const [happenedAt, setHappenedAt] = useState("");
  const [beforeStory, setBeforeStory] = useState(() => (prefillFromPrayer ? prefillBefore : ""));
  const [changeStory, setChangeStory] = useState(() => (prefillFromPrayer ? prefillChange : ""));
  const [transcript, setTranscript] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [consentToShare, setConsentToShare] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitted">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioFile, setRecordedAudioFile] = useState<File | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<BlobPart[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const clearRecording = useCallback(() => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setRecordedAudioFile(null);
  }, [recordedAudioUrl]);

  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
    stopRecordingTimer();
    setIsRecording(false);
  }, [stopRecordingTimer]);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast({
          title: "Recording unavailable.",
          description: "Your browser does not support microphone access.",
        });
        return;
      }

      clearRecording();
      setRecordingSeconds(0);
      recordingChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordingChunksRef.current, { type: mediaRecorder.mimeType });
        const file = new File([audioBlob], "testimony-recording.webm", { type: audioBlob.type });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioFile(file);
        setRecordedAudioUrl(url);
        recordingChunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      recordingStreamRef.current = stream;
      mediaRecorder.start();
      setIsRecording(true);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 179) {
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Unable to access microphone", error);
      toast({
        title: "Microphone blocked.",
        description: "Enable microphone permissions to record audio.",
      });
    }
  }, [clearRecording, stopRecording, toast]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl, stopRecording]);

  useEffect(() => {
    if (prefillFromPrayer) {
      setBeforeStory(prefillBefore);
      setChangeStory(prefillChange);
      setCategory(isTestimonyCategory(prefillCategory) ? prefillCategory : "healing");
      return;
    }

    setBeforeStory("");
    setChangeStory("");
  }, [prefillBefore, prefillCategory, prefillChange, prefillFromPrayer]);

  const remainingCharacters = 180 - commentDraft.length;
  const categoryOptions = useMemo(
    () =>
      (Object.entries(testimonyCategoryLabels) as Array<[TestimonyCategory, string]>).map(
        ([value, label]) => ({ value, label }),
      ),
    [],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({
        title: "Sign in required.",
        description: "Please sign in to submit a testimony.",
      });
      navigate("/auth/sign-in");
      return;
    }

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

    setIsSubmitting(true);
    try {
      const trimmedChange = changeStory.trim();
      const excerpt = trimmedChange.length > 140 ? `${trimmedChange.slice(0, 137).trim()}...` : trimmedChange;

      const { error } = await supabase.from("testimonies").insert({
        user_id: user?.id ?? null,
        category,
        situation_before: beforeStory.trim(),
        change_summary: trimmedChange,
        happened_at: happenedAt,
        identity_preference: identityPreference,
        display_name: identityPreference === "anonymous" ? null : displayName.trim(),
        consent_public: true,
        excerpt,
      });

      if (error) throw error;

      setSubmissionStatus("submitted");
      toast({
        title: "Testimony submitted.",
        description: "Thank you! Your testimony is now pending admin review.",
      });
    } catch (error) {
      console.error("Unable to submit testimony", error);
      toast({
        title: "Unable to submit testimony.",
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !happenedAt ||
    !beforeStory.trim() ||
    !changeStory.trim() ||
    !consentToShare ||
    (format === "audio" && !transcript.trim()) ||
    (identityPreference !== "anonymous" && !displayName.trim()) ||
    isSubmitting ||
    !isSignedIn;

  const getTestimonySharePayload = (testimony: (typeof testimonies)[number]) => {
    const url = buildShareUrl(`/testimonies/${testimony.id}`);
    const message = appendShareAttribution(`${testimony.name} — ${testimony.excerpt}\n${url}`);
    return { url, message };
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async (testimony: (typeof testimonies)[number]) => {
    const { url } = getTestimonySharePayload(testimony);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied.", description: "Share it by text or social media." });
      return;
    }
    toast({ title: "Copy unavailable.", description: "Please copy the link manually." });
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (isRecording) {
      stopRecording();
    }
    clearRecording();
    const url = URL.createObjectURL(file);
    setRecordedAudioFile(file);
    setRecordedAudioUrl(url);
  };

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
            {prefillFromPrayer && (
              <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
                <p className="font-medium">Prayer update detected</p>
                <p className="text-xs text-emerald-700">
                  We brought over your prayer request context so you can finish this testimony quickly.
                </p>
              </div>
            )}
            {!isSignedIn && (
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Sign in to submit a testimony.{" "}
                <Link to="/auth/sign-in" className="text-primary underline">
                  Sign in
                </Link>
              </div>
            )}
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
                        <div className="space-y-3">
                          <Button
                            type="button"
                            variant={isRecording ? "default" : "secondary"}
                            className="w-full gap-2"
                            onClick={() => (isRecording ? stopRecording() : void startRecording())}
                          >
                            {isRecording ? (
                              <>
                                <Square className="h-4 w-4" />
                                Stop recording
                              </>
                            ) : (
                              <>
                                <Headphones className="h-4 w-4" />
                                Start recording
                              </>
                            )}
                          </Button>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{isRecording ? "Recording..." : "Up to 3:00 minutes"}</span>
                            <span>{formatDuration(recordingSeconds)}</span>
                          </div>
                          {recordedAudioUrl && (
                            <div className="space-y-2">
                              <audio className="w-full" controls src={recordedAudioUrl} />
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>{recordedAudioFile?.name ?? "Recorded audio"}</span>
                                <Button type="button" size="sm" variant="ghost" onClick={clearRecording}>
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
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
                        <Input type="file" accept="audio/*" onChange={handleAudioUpload} />
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
                    {isSubmitting
                      ? "Submitting your testimony..."
                      : submissionStatus === "submitted"
                      ? "Thanks! Your testimony is pending admin review before it is published."
                      : "All testimonies are saved as pending until an admin approves them."}
                  </p>
                </div>
                <Button type="submit" className="gap-2" variant="default" disabled={isSubmitDisabled}>
                  {isSignedIn ? (isSubmitting ? "Submitting..." : "Submit testimony") : "Sign in to submit"}
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

                  <div className="rounded-lg border border-border/60 bg-muted/40 p-4 space-y-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">Share this testimony</p>
                        <p className="text-xs text-muted-foreground">
                          Invite someone with the official MessageGuide link.
                        </p>
                      </div>
                      <Badge variant="outline" className="self-start">
                        messageguide.org
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Tap the menu to choose a sharing option.
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="outline" size="icon" aria-label="Share options">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onSelect={() => {
                              const { message } = getTestimonySharePayload(testimony);
                              openShareWindow(`https://wa.me/?text=${encodeURIComponent(message)}`);
                            }}
                            className="gap-2"
                          >
                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                            WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              const { url } = getTestimonySharePayload(testimony);
                              openShareWindow(
                                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                              );
                            }}
                            className="gap-2"
                          >
                            <Facebook className="h-4 w-4 text-blue-600" />
                            Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              const { message } = getTestimonySharePayload(testimony);
                              openShareWindow(
                                `mailto:?subject=${encodeURIComponent("A testimony to encourage you")}&body=${encodeURIComponent(message)}`
                              );
                            }}
                            className="gap-2"
                          >
                            <Mail className="h-4 w-4 text-sky-600" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => void handleCopyLink(testimony)}
                            className="gap-2"
                          >
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            Copy link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/40">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Encouragement comments</p>
                      <span className="text-xs text-muted-foreground">180 character limit</span>
                    </div>
                    {!isSignedIn && (
                      <p className="text-xs text-muted-foreground">
                        Sign in to leave an encouragement comment.{" "}
                        <Link to="/auth/sign-in" className="text-primary underline">
                          Sign in
                        </Link>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {commentTemplates.map((template) => (
                        <Button key={template.id} type="button" variant="secondary" size="sm" disabled={!isSignedIn}>
                          {template.label}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share a short encouragement only."
                      maxLength={180}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      disabled={!isSignedIn}
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
