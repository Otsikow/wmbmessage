import { useState } from "react";
import { Copy, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReadingPlans } from "@/contexts/ReadingPlanContext";
import { useToast } from "@/components/ui/use-toast";

export const ReadingPlanAdmin = () => {
  const { plans, getPlanDays } = useReadingPlans();
  const { toast } = useToast();
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);

  const handleCopy = (planId: string) => {
    const payload = {
      plan: plans.find((plan) => plan.id === planId),
      days: getPlanDays(planId),
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPlanId(planId);
    toast({ title: "Plan exported", description: "JSON copied to clipboard." });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" /> Bible Reading Plans
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review every plan available to readers and export them for Supabase seeding.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">{plan.planType} · {plan.durationDays} days</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopy(plan.id)}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  {copiedPlanId === plan.id ? "Copied" : "Export"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingPlanAdmin;
