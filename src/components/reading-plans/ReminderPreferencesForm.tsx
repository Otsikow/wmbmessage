import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReminderPreferences } from "@/types/readingPlans";

interface ReminderPreferencesFormProps {
  preferences: ReminderPreferences;
  onChange: (update: Partial<ReminderPreferences>) => void;
}

export const ReminderPreferencesForm = ({
  preferences,
  onChange,
}: ReminderPreferencesFormProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Daily Reminder</CardTitle>
      <CardDescription>
        Customize push notifications so you never miss a day.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Enable reminders</p>
          <p className="text-xs text-muted-foreground">
            We'll respect your preferences even when offline.
          </p>
        </div>
        <Switch
          checked={preferences.enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label>Preferred time</Label>
        <Select
          value={preferences.preferredWindow}
          onValueChange={(value: "morning" | "evening" | "custom") =>
            onChange({ preferredWindow: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a window" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning (5-11 AM)</SelectItem>
            <SelectItem value="evening">Evening (6-10 PM)</SelectItem>
            <SelectItem value="custom">Custom time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {preferences.preferredWindow === "morning" && (
        <div className="space-y-1">
          <Label htmlFor="morning-time">Morning time</Label>
          <Input
            id="morning-time"
            type="time"
            value={preferences.morningTime}
            onChange={(event) => onChange({ morningTime: event.target.value })}
          />
        </div>
      )}

      {preferences.preferredWindow === "evening" && (
        <div className="space-y-1">
          <Label htmlFor="evening-time">Evening time</Label>
          <Input
            id="evening-time"
            type="time"
            value={preferences.eveningTime}
            onChange={(event) => onChange({ eveningTime: event.target.value })}
          />
        </div>
      )}

      {preferences.preferredWindow === "custom" && (
        <div className="space-y-1">
          <Label htmlFor="custom-time">Custom time</Label>
          <Input
            id="custom-time"
            type="time"
            value={preferences.customTime}
            onChange={(event) => onChange({ customTime: event.target.value })}
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
        <div>
          <p className="text-sm font-medium">Push notifications</p>
          <p className="text-xs text-muted-foreground">
            We'll send gentle nudges near your reminder time.
          </p>
        </div>
        <Switch
          checked={preferences.pushEnabled}
          onCheckedChange={(checked) => onChange({ pushEnabled: checked })}
        />
      </div>
    </CardContent>
  </Card>
);

export default ReminderPreferencesForm;
