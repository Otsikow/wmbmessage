import { Calendar, Eye, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);

export default function BookingCard() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">Bookings</h1>
        <p className="text-muted-foreground">Live feed of every confirmed booking with notification status.</p>
      </div>

      <Card className="w-full bg-card text-card-foreground border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">All bookings</CardTitle>
          <CardDescription className="text-muted-foreground">Sorted newest first so nothing is missed.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Booking Item */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="font-mono bg-secondary text-secondary-foreground px-3 py-1 rounded-full">1d5bce54</Badge>
                <span className="text-muted-foreground text-sm">2 Jan 2026, 22:06</span>
              </div>
              <div className="text-right">
                <span className="text-foreground font-medium">Deep Clean</span>
              </div>
            </div>

            {/* Date Row */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>2026-01-03 at 10:30 AM</span>
              <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">Unknown</Badge>
            </div>

            <div className="border-t border-border my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Contact Info */}
              <div className="space-y-3">
                <div className="font-semibold text-lg text-foreground">Eric Arthur</div>
                <div className="text-muted-foreground space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>eric777arthur@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+4479426647596</span>
                  </div>
                  <div className="flex items-start gap-2">
                     {/* Using MapPin specifically even if not in image as it fits context, but image has just text. */}
                    <span>54 Blakey Close TS10 4PB</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Statuses */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Assigned to</label>
                    <Select>
                      <SelectTrigger className="w-full">
                         <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
                  <div>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Unknown</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border my-4" />

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                <Eye className="mr-2 h-4 w-4" />
                View details
              </Button>
              <Button variant="outline" className="border-input bg-background hover:bg-accent hover:text-accent-foreground">
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="border-input bg-background hover:bg-accent hover:text-accent-foreground"
                onClick={() => window.location.href = 'mailto:eric777arthur@gmail.com'}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
