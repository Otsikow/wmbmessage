import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TestimonyCategory } from "@/types/testimonies";
import {
  Bell,
  HeartHandshake,
  Lock,
  MessageCircleHeart,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Users,
} from "lucide-react";

const statusOptions = ["Ongoing", "Answered", "Converted to testimony"];

const encouragementTemplates = [
  "Praying with you today. You are not alone.",
  "Standing with you in faith and peace.",
  "Lifting this up in prayer right now.",
  "May God strengthen and comfort you today.",
  "Praying for wisdom and calm in every step.",
];

const initialRequests = [
  {
    id: "req-1",
    title: "Guidance for a new job transition",
    description:
      "As I navigate a new role, please pray for wisdom, calm, and a clear sense of direction.",
    category: "Personal",
    visibility: "Public",
    status: "Ongoing",
    prayerCount: 12,
    isOwner: false,
  },
  {
    id: "req-2",
    title: "Family unity and healing",
    description:
      "Please pray for restored relationships and peace in our home during a difficult season.",
    category: "Family",
    visibility: "Group-only",
    status: "Ongoing",
    prayerCount: 8,
    isOwner: true,
  },
  {
    id: "req-3",
    title: "Recovery after surgery",
    description:
      "Pray for a smooth recovery, strength, and good reports from the doctors this week.",
    category: "Health",
    visibility: "Anonymous public",
    status: "Answered",
    prayerCount: 21,
    isOwner: false,
  },
  {
    id: "req-4",
    title: "Urgent provision for rent",
    description:
      "Asking for prayer that unexpected provision comes through without stress or fear.",
    category: "Urgent",
    visibility: "Private",
    status: "Ongoing",
    prayerCount: 5,
    isOwner: true,
  },
];

const getPrivacyStyle = (visibility: string) => {
  switch (visibility) {
    case "Public":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Group-only":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Anonymous public":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Private":
      return "bg-slate-200 text-slate-700 border-slate-300";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function PrayerBoard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(initialRequests);
  const [prayedToday, setPrayedToday] = useState(false);
  const [encouragements, setEncouragements] = useState<Record<string, string>>({});
  const [testimonies, setTestimonies] = useState<
    Record<string, { title: string; story: string }>
  >({});
  const [softNotifications, setSoftNotifications] = useState({
    dailyNudge: true,
    answeredUpdates: true,
    newRequests: true,
  });

  const handlePrayed = (id: string) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? { ...request, prayerCount: request.prayerCount + 1 }
          : request,
      ),
    );
    setPrayedToday(true);
  };

  const handleEncouragementChange = (id: string, value: string) => {
    setEncouragements((prev) => ({ ...prev, [id]: value }));
  };

  const handleTemplateClick = (id: string, template: string) => {
    setEncouragements((prev) => ({ ...prev, [id]: template }));
  };

  const handleStatusChange = (id: string, status: string) => {
    setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status } : request)));
  };

  const handleTestimonyChange = (id: string, field: "title" | "story", value: string) => {
    setTestimonies((prev) => ({
      ...prev,
      [id]: {
        title: prev[id]?.title ?? "",
        story: prev[id]?.story ?? "",
        [field]: value,
      },
    }));
  };

  const resolveTestimonyCategory = (category: string): TestimonyCategory => {
    switch (category) {
      case "Health":
        return "healing";
      case "Family":
        return "family_marriage";
      case "Personal":
        return "salvation_growth";
      case "Urgent":
        return "deliverance";
      default:
        return "other";
    }
  };

  const handleLinkTestimony = (request: (typeof requests)[number]) => {
    const testimony = testimonies[request.id];
    const title = testimony?.title?.trim() ?? "";
    const story = testimony?.story?.trim() ?? "";
    const changeSummary = [title, story].filter(Boolean).join("\n\n");

    if (!changeSummary) {
      return;
    }

    const params = new URLSearchParams({
      source: "prayer",
      before: request.description,
      change: changeSummary,
      category: resolveTestimonyCategory(request.category),
    });

    navigate(`/testimonies?${params.toString()}#submit`);
  };

  const ownedRequests = useMemo(() => requests.filter((request) => request.isOwner), [requests]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBackButton />
      <main className="flex-1">
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold">Prayer Board</h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                Share prayer needs, lift one another daily, and build a quiet rhythm of encouragement. Every request is
                cared for with clear privacy controls and a focus on emotional safety.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-semibold">Prayer board feed</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Recent requests with prayer counts and encouragement.
                    </p>
                  </div>
                  <Badge variant="outline">{requests.length} active requests</Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {requests.map((request) => {
                    const encouragement = encouragements[request.id] ?? "";
                    const remainingEncouragement = 180 - encouragement.length;
                    const testimony = testimonies[request.id] ?? { title: "", story: "" };
                    const isTestimonyReady = Boolean(
                      [testimony.title, testimony.story].some((value) => value.trim().length > 0),
                    );

                    return (
                      <Card key={request.id} className="border-border/60 bg-card/80">
                        <CardHeader className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{request.category}</Badge>
                            <Badge className={`border ${getPrivacyStyle(request.visibility)}`}>
                              {request.visibility}
                            </Badge>
                            {request.status !== "Ongoing" && (
                              <Badge variant="outline">{request.status}</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl sm:text-2xl">{request.title}</CardTitle>
                          <p className="text-sm sm:text-base text-muted-foreground">{request.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span>{request.prayerCount} prayers</span>
                            {request.visibility === "Private" && (
                              <span className="flex items-center gap-1">
                                <Lock className="h-3.5 w-3.5" />
                                Admin & prayer team only
                              </span>
                            )}
                            {request.visibility === "Group-only" && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                Shared with your group
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button className="w-full sm:w-auto" onClick={() => handlePrayed(request.id)}>
                              I prayed 🙏
                            </Button>
                            <Button className="w-full sm:w-auto" variant="outline">
                              Send encouragement 💬
                            </Button>
                          </div>

                          <div className="rounded-lg border border-border p-3 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Encouragement (max 180 characters)</span>
                              <span className={`${remainingEncouragement < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {remainingEncouragement} left
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {encouragementTemplates.map((template) => (
                                <Button
                                  key={template}
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="whitespace-normal text-left"
                                  onClick={() => handleTemplateClick(request.id, template)}
                                >
                                  {template}
                                </Button>
                              ))}
                            </div>
                            <Textarea
                              value={encouragement}
                              maxLength={180}
                              onChange={(event) => handleEncouragementChange(request.id, event.target.value)}
                              placeholder="Share a short encouragement without advice, preaching, or debate."
                              rows={3}
                            />
                            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                              <span>No advice, no preaching, no debates.</span>
                              <Button
                                type="button"
                                size="sm"
                                className="w-full sm:w-auto"
                                disabled={!encouragement || encouragement.length > 180}
                                onClick={() => handleEncouragementChange(request.id, "")}
                              >
                                Send encouragement
                              </Button>
                            </div>
                          </div>

                          {request.isOwner && (
                            <div className="rounded-lg border border-border p-3 space-y-3">
                              <p className="text-sm font-medium">Update your prayer status</p>
                              <Select
                                value={request.status}
                                onValueChange={(value) => handleStatusChange(request.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {request.status === "Converted to testimony" && (
                                <div className="space-y-3">
                                  <p className="text-xs text-muted-foreground">
                                    Share a testimony to celebrate answered prayer.
                                  </p>
                                  <Input
                                    value={testimony.title}
                                    onChange={(event) =>
                                      handleTestimonyChange(request.id, "title", event.target.value)
                                    }
                                    placeholder="Testimony title"
                                  />
                                  <Textarea
                                    value={testimony.story}
                                    onChange={(event) =>
                                      handleTestimonyChange(request.id, "story", event.target.value)
                                    }
                                    placeholder="Short testimony (what God has done)"
                                    rows={3}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    We’ll carry your notes into the testimony form so you can finish the submission.
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => handleLinkTestimony(request)}
                                    disabled={!isTestimonyReady}
                                  >
                                    Continue to testimony submission
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-border/60 bg-card/80">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl">Submit a prayer request</CardTitle>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Send a new request through the dedicated prayer submission form.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full">
                      <Link to="/prayer-board/create">Create a prayer request</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Requests are reviewed to keep the board safe, focused, and supportive.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <HeartHandshake className="h-5 w-5 text-rose-500" />
                      Daily engagement
                    </CardTitle>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      A gentle reminder to pray for at least one request today.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {prayedToday ? "You prayed today" : "Pray for at least one request"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prayedToday
                            ? "Great work keeping your daily rhythm."
                            : "Tap “I prayed” on any request to log your prayer."}
                        </p>
                      </div>
                      <Badge variant={prayedToday ? "default" : "secondary"}>
                        {prayedToday ? "Complete" : "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Soft notifications</span>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        {(
                          [
                            {
                              key: "dailyNudge",
                              label: "Daily nudge (gentle, no spam)",
                              description: "One reminder if you have not prayed today.",
                            },
                            {
                              key: "answeredUpdates",
                              label: "Answered prayer updates",
                              description: "Celebrate when requests move to answered.",
                            },
                            {
                              key: "newRequests",
                              label: "New requests from your group",
                              description: "Be notified when your group adds a request.",
                            },
                          ] as const
                        ).map((item) => (
                          <div
                            key={item.key}
                            className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            <Switch
                              checked={softNotifications[item.key]}
                              onCheckedChange={(checked) =>
                                setSoftNotifications((prev) => ({ ...prev, [item.key]: checked }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Prayer streaks (private)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Visible only to you.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "3-day streak", value: "2/3", status: "Almost there" },
                        { label: "7-day streak", value: "4/7", status: "Keep going" },
                        { label: "30-day consistency", value: "12/30", status: "Building" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg border border-border p-3">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-2xl font-semibold">{item.value}</p>
                          <p className="text-xs text-muted-foreground">{item.status}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <Separator />

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="border-border/60 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageCircleHeart className="h-5 w-5 text-rose-500" />
                    Encouragement guidelines
                  </CardTitle>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Keep responses short, gentle, and supportive. No advice, no preaching, no debates.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Use template prompts to keep tone consistent and safe.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldOff className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span>Avoid sensitive advice, political debate, or financial requests.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-slate-500 mt-0.5" />
                    <span>Private requests remain visible only to admins and the prayer team.</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-xl">Moderation & safety</CardTitle>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Admins ensure requests remain safe and focused on prayer.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Approve or hide requests before they reach the public feed.</li>
                    <li>Flag sensitive content and lock comments when needed.</li>
                    <li>Automatic filters block money solicitations, visa fraud requests, and political content.</li>
                    <li>Private visibility keeps sensitive requests limited to admins and prayer teams.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {ownedRequests.length > 0 && (
              <Card className="border-border/60 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-xl">Your active requests</CardTitle>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Track status updates and testimonies in one place.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ownedRequests.map((request) => (
                      <div key={request.id} className="rounded-lg border border-border p-4 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{request.title}</p>
                          <Badge variant="outline">{request.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{request.prayerCount} prayers</p>
                        <p className="text-xs text-muted-foreground">Visibility: {request.visibility}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
