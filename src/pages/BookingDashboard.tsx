import React from "react";
import {
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  LayoutDashboard,
  Info,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <title>WhatsApp</title>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const BookingDashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Reusing existing Header component or creating a similar header area */}
      <Header showBackButton={false} />

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl space-y-8">

        {/* Page Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
          <div className="p-2 bg-card rounded-md border border-border">
             <LayoutDashboard className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ream Admin Dashboard</h1>
            <p className="text-muted-foreground">Bookings, clients, staff and platform in one place.</p>
          </div>
        </div>

        {/* Booking Details Header */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Booking ID 1d5bce54-d77c-4cb8-a485-8d26fde1d331</div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-primary">Eric Arthur</h2>
                <Badge variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:text-white">Confirmed</Badge>
              </div>
              <p className="text-muted-foreground">Full booking details, communication tools, and status management.</p>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
              WhatsApp Unknown
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Main Info) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Service Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">SERVICE</div>
                    <h3 className="text-xl font-bold">Deep Clean</h3>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground font-normal py-1 px-3 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    2026-01-03 AT 10:30 AM
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">54 Blakey Close</div>
                      <div className="text-muted-foreground">TS10 4PB</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Info className="h-5 w-5" />
                    <span>Quoted total £380.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">CONTACT</div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-green-600 dark:text-green-500 font-medium">+4479426647596</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-green-600 dark:text-green-500 font-medium">eric777arthur@gmail.com</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                  <Button variant="secondary" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 dark:bg-secondary dark:text-secondary-foreground">
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </Button>
                  <Button variant="secondary" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 dark:bg-secondary dark:text-secondary-foreground">
                    <Mail className="h-4 w-4" /> Email
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">

            {/* Status Card */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">STATUS</div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Booking status</label>
                  <Select defaultValue="confirmed">
                    <SelectTrigger className="bg-zinc-900 text-white border-zinc-700 dark:bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned owner</label>
                  <Select defaultValue="unassigned">
                    <SelectTrigger className="bg-zinc-900 text-white border-zinc-700 dark:bg-background">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="john">John Doe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-muted-foreground">Assignments sync with inline updates on the table.</p>
              </CardContent>
            </Card>

            {/* Reminders Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">REMINDERS</div>
                  <Badge variant="outline" className="text-green-600 border-green-600/20 bg-green-500/10 dark:text-green-400 dark:border-green-400/20">
                    No no-shows
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">Keep client, staff, and admin in sync for the visit time.</p>

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">Client reminder</span>
                    <Badge variant="secondary" className="bg-white text-green-600 hover:bg-white/90 border border-border text-xs font-normal">
                      WhatsApp
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Send the arrival window and keep the client warm before the visit.
                  </p>
                  <div className="text-sm border-t border-border pt-3 text-muted-foreground">
                    Hi Eric Arthur, reminder for your Deep...
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard;
