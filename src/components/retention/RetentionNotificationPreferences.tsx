import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  PRAYER_CATEGORIES,
  useRetentionNotifications,
  type RetentionTrigger,
} from "@/contexts/RetentionNotificationContext";
import { Bell, Mail, HeartHandshake, CheckCircle2, Sparkles } from "lucide-react";

const TRIGGER_CONFIG: Array<{
  key: RetentionTrigger;
  title: string;
  description: string;
  example: string;
  icon: JSX.Element;
}> = [
  {
    key: "new-prayer-request",
    title: "New prayer request",
    description: "When someone asks for prayer in your chosen categories.",
    example: "Someone asked for prayer today — will you pray with them?",
    icon: <HeartHandshake className="h-5 w-5 text-muted-foreground" />,
  },
  {
    key: "prayer-answered",
    title: "Prayer marked as answered",
    description: "A gentle update when a prayer you follow is answered.",
    example: "Your prayer was marked as answered.",
    icon: <CheckCircle2 className="h-5 w-5 text-muted-foreground" />,
  },
  {
    key: "encouragement-received",
    title: "Encouragement received",
    description: "Stay encouraged when someone responds to your testimony.",
    example: "You received an encouragement today.",
    icon: <Sparkles className="h-5 w-5 text-muted-foreground" />,
  },
];

export default function RetentionNotificationPreferences() {
  const { toast } = useToast();
  const {
    preferences,
    updatePreferences,
    setCategoryPreference,
    sendNotification,
    history,
  } = useRetentionNotifications();
  const hasEnabledChannel = preferences.channels.push || preferences.channels.email;

  const handleTest = (trigger: RetentionTrigger) => {
    if (!hasEnabledChannel) {
      toast({
        title: "Select a channel",
        description: "Enable push or email to send a preview.",
      });
      return;
    }

    const category = preferences.categories[0];
    const results = sendNotification({ trigger, category });

    if (results.length === 0) {
      toast({
        title: "Notifications paused",
        description: "Enable this trigger to send a preview.",
      });
      return;
    }

    const delivered = results.filter((result) => result.status === "sent");
    const blocked = results.filter((result) => result.status === "suppressed");

    if (delivered.length > 0) {
      toast({
        title: "Preview sent",
        description: delivered.map((result) => result.message).join(" "),
      });
    }

    if (blocked.length > 0) {
      toast({
        title: "Daily limit reached",
        description: "We only send one push and one email each day.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Prayer & Testimony Notifications
        </CardTitle>
        <CardDescription>
          Choose how you want to hear about prayer updates. We send at most one push and
          one email per day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Enable prayer & testimony alerts</p>
            <p className="text-sm text-muted-foreground">
              Pause all prayer and testimony notifications at once.
            </p>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(checked) => updatePreferences({ enabled: checked })}
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Channels
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Gentle reminders on your device.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.channels.push}
                onCheckedChange={(checked) =>
                  updatePreferences({ channels: { ...preferences.channels, push: checked } })
                }
                disabled={!preferences.enabled}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a calm note in your inbox.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.channels.email}
                onCheckedChange={(checked) =>
                  updatePreferences({ channels: { ...preferences.channels, email: checked } })
                }
                disabled={!preferences.enabled}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Prayer categories
          </p>
          <div className="flex flex-wrap gap-3">
            {PRAYER_CATEGORIES.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
              >
                <Checkbox
                  checked={preferences.categories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    setCategoryPreference(category.id, Boolean(checked))
                  }
                  disabled={!preferences.enabled}
                />
                <span>{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Triggers
          </p>
          <div className="space-y-4">
            {TRIGGER_CONFIG.map((trigger) => (
              <div
                key={trigger.key}
                className="flex flex-col gap-3 rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {trigger.icon}
                    <div>
                      <p className="font-medium">{trigger.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {trigger.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.triggers[trigger.key]}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        triggers: { ...preferences.triggers, [trigger.key]: checked },
                      })
                    }
                    disabled={!preferences.enabled}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">Example</Badge>
                  <p className="text-sm text-muted-foreground">{trigger.example}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(trigger.key)}
                    disabled={!preferences.enabled}
                  >
                    Send preview
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Last push: {history.push || "Not yet"} · Last email:{" "}
                    {history.email || "Not yet"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
