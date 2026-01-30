import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  "Personal",
  "Family",
  "Health",
  "Financial",
  "Immigration / Visa",
  "Church / Ministry",
  "Thanksgiving",
  "Urgent",
];

const PRIVACY_LEVELS = [
  { value: "Public", description: "Visible to everyone" },
  { value: "Group-only", description: "Visible to your group" },
  { value: "Anonymous public", description: "Public without your name" },
  { value: "Private", description: "Admin & prayer team only" },
];

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  category: "",
  visibility: "",
};

export default function CreatePrayer() {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const navigate = useNavigate();
  const remainingDescription = 500 - formState.description.length;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      toast.error("Prayer title is required.");
      return;
    }
    if (!formState.description.trim()) {
      toast.error("Please add a short description.");
      return;
    }
    if (!formState.category) {
      toast.error("Please select a prayer category.");
      return;
    }
    if (!formState.visibility) {
      toast.error("Please select a privacy level.");
      return;
    }

    toast.success("Prayer request submitted for review.");
    setFormState(INITIAL_FORM_STATE);
    navigate("/prayer-board");
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <BackButton fallbackPath="/prayer-board" />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Submit a prayer request</h1>
              <p className="text-sm text-muted-foreground">
                Share the need clearly so the community can support you well.
              </p>
            </div>
          </div>

          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Prayer request details</h2>
                <p className="text-sm text-muted-foreground">
                  Requests are reviewed to keep the board safe and supportive.
                </p>
              </div>
              <Badge variant="outline">Prayer board</Badge>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="prayer-title">Title *</Label>
                <Input
                  id="prayer-title"
                  value={formState.title}
                  onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                  placeholder="Short title"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prayer-description">Description *</Label>
                  <span className={`text-xs ${remainingDescription < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {remainingDescription} characters left
                  </span>
                </div>
                <Textarea
                  id="prayer-description"
                  value={formState.description}
                  maxLength={500}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                  placeholder="Share the need in a few sentences"
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prayer category *</Label>
                  <Select
                    value={formState.category}
                    onValueChange={(value) => setFormState({ ...formState, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Privacy level *</Label>
                  <Select
                    value={formState.visibility}
                    onValueChange={(value) => setFormState({ ...formState, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIVACY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                {PRIVACY_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center justify-between py-1">
                    <span className="font-medium text-foreground">{level.value}</span>
                    <span>{level.description}</span>
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full">
                Submit request
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
