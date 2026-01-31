import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CalendarClock,
  CheckCircle2,
  Lock,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Send,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

type PendingEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  submittedBy: string;
  contactEmail: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
};

type ManagedEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'Scheduled' | 'Cancelled';
  commentsLocked: boolean;
  views: number;
  interested: number;
  going: number;
  attendanceConfirmed: number;
  whatsappDelivered: number;
  whatsappFailed: number;
  whatsappQueued: number;
};

type AdminLogEntry = {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  tone: 'info' | 'warning' | 'success';
};

const initialPendingEvents: PendingEvent[] = [
  {
    id: 'evt-204',
    title: 'Youth Revival Night',
    date: 'Dec 5, 2024',
    location: 'Downtown Auditorium',
    submittedBy: 'Olivia Parker',
    contactEmail: 'olivia.parker@example.com',
    category: 'Revival',
    priority: 'High',
  },
  {
    id: 'evt-205',
    title: 'Prayer & Worship Vigil',
    date: 'Dec 7, 2024',
    location: 'New Hope Chapel',
    submittedBy: 'Deacon Lee',
    contactEmail: 'deacon.lee@example.com',
    category: 'Prayer',
    priority: 'Medium',
  },
  {
    id: 'evt-206',
    title: 'Community Outreach Brunch',
    date: 'Dec 12, 2024',
    location: 'Grace Community Hall',
    submittedBy: 'Maria Scott',
    contactEmail: 'maria.scott@example.com',
    category: 'Outreach',
    priority: 'Low',
  },
];

const initialManagedEvents: ManagedEvent[] = [
  {
    id: 'evt-180',
    title: 'Citywide Thanksgiving Service',
    date: 'Nov 28, 2024',
    location: 'Central Plaza',
    status: 'Scheduled',
    commentsLocked: false,
    views: 28450,
    interested: 3890,
    going: 1730,
    attendanceConfirmed: 1540,
    whatsappDelivered: 1240,
    whatsappFailed: 38,
    whatsappQueued: 96,
  },
  {
    id: 'evt-181',
    title: 'Family Conference Weekend',
    date: 'Dec 14, 2024',
    location: 'Unity Convention Center',
    status: 'Scheduled',
    commentsLocked: true,
    views: 19320,
    interested: 2510,
    going: 1185,
    attendanceConfirmed: 945,
    whatsappDelivered: 980,
    whatsappFailed: 21,
    whatsappQueued: 44,
  },
  {
    id: 'evt-182',
    title: 'Volunteer Training Summit',
    date: 'Jan 10, 2025',
    location: 'Kingdom Training Hub',
    status: 'Scheduled',
    commentsLocked: false,
    views: 15110,
    interested: 1760,
    going: 820,
    attendanceConfirmed: 642,
    whatsappDelivered: 610,
    whatsappFailed: 17,
    whatsappQueued: 52,
  },
];

const initialLog: AdminLogEntry[] = [
  {
    id: 'log-01',
    timestamp: 'Today, 9:14 AM',
    action: 'Locked comments',
    detail: 'Family Conference Weekend',
    tone: 'warning',
  },
  {
    id: 'log-02',
    timestamp: 'Today, 8:40 AM',
    action: 'Sent update notification',
    detail: 'Citywide Thanksgiving Service',
    tone: 'success',
  },
  {
    id: 'log-03',
    timestamp: 'Yesterday, 4:05 PM',
    action: 'Edited event details',
    detail: 'Volunteer Training Summit',
    tone: 'info',
  },
];

const toneMap: Record<AdminLogEntry['tone'], string> = {
  info: 'bg-blue-500/10 text-blue-600',
  warning: 'bg-amber-500/10 text-amber-600',
  success: 'bg-emerald-500/10 text-emerald-600',
};

export default function AdminEventsDashboard() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>(initialPendingEvents);
  const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>(initialManagedEvents);
  const [logEntries, setLogEntries] = useState<AdminLogEntry[]>(initialLog);

  const totals = useMemo(() => {
    return managedEvents.reduce(
      (acc, event) => {
        acc.views += event.views;
        acc.interested += event.interested;
        acc.going += event.going;
        acc.attendanceConfirmed += event.attendanceConfirmed;
        acc.whatsappDelivered += event.whatsappDelivered;
        acc.whatsappFailed += event.whatsappFailed;
        acc.whatsappQueued += event.whatsappQueued;
        return acc;
      },
      {
        views: 0,
        interested: 0,
        going: 0,
        attendanceConfirmed: 0,
        whatsappDelivered: 0,
        whatsappFailed: 0,
        whatsappQueued: 0,
      }
    );
  }, [managedEvents]);

  const addLogEntry = (action: string, detail: string, tone: AdminLogEntry['tone']) => {
    const timestamp = new Date().toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    setLogEntries((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp,
        action,
        detail,
        tone,
      },
      ...prev,
    ]);
  };

  const handleApproval = (eventId: string, approved: boolean) => {
    const event = pendingEvents.find((item) => item.id === eventId);
    if (!event) {
      return;
    }
    setPendingEvents((prev) => prev.filter((item) => item.id !== eventId));
    addLogEntry(
      approved ? 'Approved event' : 'Rejected event',
      event.title,
      approved ? 'success' : 'warning'
    );
    if (approved) {
      addLogEntry('Approval email sent', `${event.title} • ${event.contactEmail}`, 'info');
    }
  };

  const handleCancel = (eventId: string) => {
    const event = managedEvents.find((item) => item.id === eventId);
    if (!event) {
      return;
    }
    setManagedEvents((prev) =>
      prev.map((item) =>
        item.id === eventId ? { ...item, status: 'Cancelled' } : item
      )
    );
    addLogEntry('Cancelled event', event.title, 'warning');
  };

  const handleLockToggle = (eventId: string) => {
    const event = managedEvents.find((item) => item.id === eventId);
    if (!event) {
      return;
    }
    setManagedEvents((prev) =>
      prev.map((item) =>
        item.id === eventId ? { ...item, commentsLocked: !item.commentsLocked } : item
      )
    );
    addLogEntry(
      event.commentsLocked ? 'Unlocked comments' : 'Locked comments',
      event.title,
      event.commentsLocked ? 'info' : 'warning'
    );
  };

  const handleEdit = (eventId: string) => {
    const event = managedEvents.find((item) => item.id === eventId);
    if (event) {
      addLogEntry('Opened edit view', event.title, 'info');
    }
  };

  const handleSendUpdate = (eventId: string) => {
    const event = managedEvents.find((item) => item.id === eventId);
    if (event) {
      addLogEntry('Sent update notification', event.title, 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Admin Events Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Maintain quality, approve submissions, and monitor event health in real time.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-2">
          <CalendarClock className="h-4 w-4" />
          Live queue monitoring
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-2xl">{totals.views.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Across scheduled events
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interested</CardDescription>
            <CardTitle className="text-2xl">{totals.interested.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Followers waiting on updates
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Going</CardDescription>
            <CardTitle className="text-2xl">{totals.going.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Confirmed RSVPs
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attendance Confirmations</CardDescription>
            <CardTitle className="text-2xl">
              {totals.attendanceConfirmed.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Verified attendance check-ins
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>WhatsApp Delivery</CardDescription>
            <CardTitle className="text-2xl">
              {totals.whatsappDelivered.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Queued</span>
              <span className="font-medium text-foreground">
                {totals.whatsappQueued.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Failed</span>
              <span className="font-medium text-destructive">
                {totals.whatsappFailed.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Pending Event Approvals
            </CardTitle>
            <CardDescription>
              Review submissions before they appear on the public calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.location}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {event.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{event.date}</TableCell>
                      <TableCell>{event.submittedBy}</TableCell>
                      <TableCell>
                        <Badge
                          variant={event.priority === 'High' ? 'default' : 'secondary'}
                          className={event.priority === 'High' ? 'bg-rose-500 text-white' : ''}
                        >
                          {event.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(event.id, true)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproval(event.id, false)}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        All pending events have been reviewed.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Action Log</CardTitle>
            <CardDescription>Every admin action is tracked for accountability.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-4">
                {logEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${toneMap[entry.tone]}`}>
                        {entry.action}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium">{entry.detail}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Analytics & Actions</CardTitle>
          <CardDescription>
            Monitor engagement, confirmations, and manage live events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Interested</TableHead>
                  <TableHead>Going</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Admin Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.date} • {event.location}
                      </div>
                    </TableCell>
                    <TableCell>{event.views.toLocaleString()}</TableCell>
                    <TableCell>{event.interested.toLocaleString()}</TableCell>
                    <TableCell>{event.going.toLocaleString()}</TableCell>
                    <TableCell>{event.attendanceConfirmed.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {event.whatsappDelivered.toLocaleString()} delivered
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.whatsappQueued.toLocaleString()} queued •{' '}
                        {event.whatsappFailed.toLocaleString()} failed
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'Scheduled' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                      {event.commentsLocked && (
                        <Badge variant="outline" className="ml-2">
                          Comments locked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Open admin actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onSelect={() => handleEdit(event.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleCancel(event.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleSendUpdate(event.id)}>
                            <Send className="mr-2 h-4 w-4" />
                            Notify
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleLockToggle(event.id)}>
                            <Lock className="mr-2 h-4 w-4" />
                            {event.commentsLocked ? 'Unlock' : 'Lock'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => addLogEntry('Opened comments', event.title, 'info')}
                          >
                            <MessageSquareText className="mr-2 h-4 w-4" />
                            Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
