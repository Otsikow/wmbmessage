import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestimonyCategory, testimonyCategoryLabels } from '@/types/testimonies';
import { MessageSquareText, ShieldCheck, Flag, Archive, Pencil, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

type ModerationRole = 'admin' | 'moderator' | 'user';

interface AdminModerationDashboardProps {
  role: ModerationRole;
}

interface PendingTestimony {
  id: string;
  displayName: string;
  category: TestimonyCategory;
  excerpt: string;
  createdAt: string;
}

interface PendingEvent {
  id: string;
  title: string;
  type: string;
  city: string;
  startAt: string;
  submittedBy: string;
  contactInfo: string | null;
  createdAt: string;
}

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

const actionLogs = [
  {
    id: 'AL-901',
    actor: 'Admin · L. Chen',
    action: 'Approved testimony',
    target: 'TS-238',
    result: 'Published',
    time: 'Today 10:42 AM',
  },
  {
    id: 'AL-900',
    actor: 'Moderator · R. Patel',
    action: 'Hidden comment thread',
    target: 'PR-112',
    result: 'Hidden',
    time: 'Today 9:18 AM',
  },
  {
    id: 'AL-899',
    actor: 'Admin · L. Chen',
    action: 'Archived prayer request',
    target: 'PR-105',
    result: 'Archived',
    time: 'Yesterday 6:12 PM',
  },
];

const categoryActivity = [
  { name: 'Healing', percent: 68 },
  { name: 'Provision', percent: 52 },
  { name: 'Family', percent: 43 },
  { name: 'Guidance', percent: 31 },
];

export default function AdminModerationDashboard({ role }: AdminModerationDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === 'admin';
  const actionDisabledText = isAdmin
    ? 'Admin access granted.'
    : 'Admin only action. Escalate if needed.';
  const testimonyActionDisabledText = isAdmin
    ? 'Admin access granted.'
    : 'Only admins can approve or reject testimonies.';
  
  const [pendingTestimonies, setPendingTestimonies] = useState<PendingTestimony[]>([]);
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCountLabel = pendingLoading ? '—' : pendingTestimonies.length.toString();
  const pendingSubLabel = pendingLoading
    ? 'Refreshing review queue...'
    : pendingTestimonies.length === 0
      ? 'No testimonies awaiting review'
      : `${pendingTestimonies.length} awaiting review`;

  const eventsCountLabel = eventsLoading ? '—' : pendingEvents.length.toString();
  const eventsSubLabel = eventsLoading
    ? 'Loading events...'
    : pendingEvents.length === 0
      ? 'No events awaiting approval'
      : `${pendingEvents.length} pending`;

  const formatExcerpt = (text: string) => (text.length > 140 ? `${text.slice(0, 137).trim()}...` : text);

  const formatSubmittedAt = (value: string) =>
    new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  const resolveDisplayName = (identity: string | null, name: string | null) => {
    if (identity === 'anonymous') return 'Anonymous';
    return name?.trim() || 'Unnamed submitter';
  };

  const fetchPendingTestimonies = useCallback(async () => {
    if (!isAdmin) {
      setPendingTestimonies([]);
      setPendingLoading(false);
      return;
    }

    setPendingLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonies')
        .select('id, display_name, identity_preference, category, excerpt, change_summary, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data ?? []).map((item: any) => ({
        id: item.id,
        displayName: resolveDisplayName(item.identity_preference, item.display_name),
        category: item.category as TestimonyCategory,
        excerpt: formatExcerpt(item.excerpt?.trim() || item.change_summary?.trim() || 'No summary provided.'),
        createdAt: item.created_at,
      }));

      setPendingTestimonies(mapped);
      setPendingError(null);
    } catch (error) {
      console.error('Unable to load pending testimonies', error);
      setPendingError('Unable to load pending testimonies. Please check your connection.');
      setPendingTestimonies([]);
    } finally {
      setPendingLoading(false);
    }
  }, [isAdmin]);

  const fetchPendingEvents = useCallback(async () => {
    if (!isAdmin) {
      setPendingEvents([]);
      setEventsLoading(false);
      return;
    }

    setEventsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, type, city, start_at, contact_name, contact_info, created_at')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data ?? []).map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        city: item.city,
        startAt: item.start_at,
        submittedBy: item.contact_name || 'Unknown',
        contactInfo: item.contact_info,
        createdAt: item.created_at,
      }));

      setPendingEvents(mapped);
      setEventsError(null);
    } catch (error) {
      console.error('Unable to load pending events', error);
      setEventsError('Unable to load pending events.');
      setPendingEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [isAdmin]);

  const updateTestimonyStatus = async (id: string, status: 'approved' | 'rejected' | 'archived') => {
    if (!isAdmin) {
      toast({
        title: 'Admin access required.',
        description: 'Only admins can update testimony status.',
      });
      return;
    }

    setUpdatingId(id);
    try {
      const payload: Record<string, string | null> = { status };
      if (status === 'approved') {
        payload.approved_at = new Date().toISOString();
        payload.approved_by = user?.id ?? null;
      }

      const { error } = await supabase.from('testimonies').update(payload).eq('id', id);
      if (error) throw error;

      setPendingTestimonies((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: `Testimony ${status}.`,
        description: 'The review queue has been updated.',
      });
    } catch (error) {
      console.error('Unable to update testimony status', error);
      toast({
        title: 'Unable to update testimony.',
        description: 'Please try again or check your permissions.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const updateEventStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!isAdmin) {
      toast({
        title: 'Admin access required.',
        description: 'Only admins can approve or reject events.',
      });
      return;
    }

    setUpdatingId(id);
    try {
      const { error } = await supabase.from('events').update({ status }).eq('id', id);
      if (error) throw error;
      const event = pendingEvents.find((item) => item.id === id);
      const emailMatch = event?.contactInfo?.match(emailRegex)?.[0];
      setPendingEvents((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: `Event ${status.toLowerCase()}.`,
        description:
          status === 'APPROVED'
            ? emailMatch
              ? `Approval email sent to ${emailMatch}.`
              : 'Approval email queued for the submitter.'
            : 'The event queue has been updated.',
      });
    } catch (error) {
      console.error('Unable to update event status', error);
      toast({
        title: 'Unable to update event.',
        description: 'Please try again or check your permissions.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchPendingTestimonies();
    fetchPendingEvents();
  }, [fetchPendingEvents, fetchPendingTestimonies]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const channel = supabase
      .channel('moderation-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'testimonies' },
        () => {
          fetchPendingTestimonies();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchPendingEvents();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPendingEvents, fetchPendingTestimonies, isAdmin]);

  const testimonyCards = useMemo(() => pendingTestimonies, [pendingTestimonies]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending testimonies</CardTitle>
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCountLabel}</div>
            <p className="text-xs text-muted-foreground">{pendingSubLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsCountLabel}</div>
            <p className="text-xs text-muted-foreground">{eventsSubLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prayer → testimony rate</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.6%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily active prayer users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">48 repeat contributors</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Events Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-amber-500" />
            Pending Event Approvals
          </CardTitle>
          <CardDescription>Review submissions before they appear on the public calendar.</CardDescription>
        </CardHeader>
        <CardContent>
          {eventsError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {eventsError}
            </div>
          )}
          {!eventsLoading && pendingEvents.length === 0 && !eventsError && (
            <div className="rounded-lg border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
              No events are waiting for approval. Check back soon.
            </div>
          )}
          {pendingEvents.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEvents.map((event) => {
                    const isUpdating = updatingId === event.id;
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.city}</p>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(event.startAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{event.submittedBy}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={!isAdmin || isUpdating}
                              onClick={() => updateEventStatus(event.id, 'APPROVED')}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={!isAdmin || isUpdating}
                              onClick={() => updateEventStatus(event.id, 'REJECTED')}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending testimonies</CardTitle>
            <CardDescription>Review and publish fresh stories of faith.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {pendingError}
              </div>
            )}
            {!pendingLoading && testimonyCards.length === 0 && !pendingError && (
              <div className="rounded-lg border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                No testimonies are waiting for review. Check back soon.
              </div>
            )}
            {testimonyCards.map((item) => {
              const isUpdating = updatingId === item.id;
              const isTestimonyActionDisabled = !isAdmin || isUpdating;
              return (
                <div key={item.id} className="rounded-lg border border-muted p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSubmittedAt(item.createdAt)} · {testimonyCategoryLabels[item.category]}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.id.slice(0, 8)}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{item.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={isTestimonyActionDisabled}
                      title={testimonyActionDisabledText}
                      onClick={() => updateTestimonyStatus(item.id, 'approved')}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary" disabled={isTestimonyActionDisabled} title={testimonyActionDisabledText}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isTestimonyActionDisabled}
                      title={testimonyActionDisabledText}
                      onClick={() => updateTestimonyStatus(item.id, 'rejected')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isTestimonyActionDisabled}
                      title={testimonyActionDisabledText}
                      onClick={() => updateTestimonyStatus(item.id, 'archived')}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Action Log</CardTitle>
            <CardDescription>Every admin action is tracked for accountability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 rounded-lg border border-muted p-3">
                <div>
                  <Badge 
                    variant="outline" 
                    className={
                      log.action.includes('Approved') ? 'text-emerald-600 border-emerald-200' :
                      log.action.includes('Hidden') ? 'text-amber-600 border-amber-200' :
                      'text-blue-600 border-blue-200'
                    }
                  >
                    {log.action}
                  </Badge>
                  <p className="mt-1 font-medium">{log.target}</p>
                  <p className="text-xs text-muted-foreground">{log.actor}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Most active categories</CardTitle>
            <CardDescription>Prayer topics drawing the most engagement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryActivity.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="text-muted-foreground">{category.percent}%</span>
                </div>
                <Progress value={category.percent} className="mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of moderation activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-muted p-3">
              <span className="text-sm font-medium">Total approved today</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-muted p-3">
              <span className="text-sm font-medium">Pending reviews</span>
              <Badge variant="secondary">{pendingTestimonies.length + pendingEvents.length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-muted p-3">
              <span className="text-sm font-medium">Avg. response time</span>
              <Badge variant="secondary">2.4h</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
