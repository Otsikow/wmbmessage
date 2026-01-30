import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TestimonyCategory, testimonyCategoryLabels } from '@/types/testimonies';
import { MessageSquareText, ShieldCheck, Flag, Archive, Pencil, CheckCircle2, XCircle } from 'lucide-react';

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

const reviewQueue = {
  testimonies: [
    {
      id: 'TS-241',
      name: 'Jordan Matthews',
      submittedAt: '2h ago',
      category: 'Healing',
      excerpt: 'Shared how the prayer team supported their recovery journey.',
    },
    {
      id: 'TS-240',
      name: 'Avery Collins',
      submittedAt: '5h ago',
      category: 'Provision',
      excerpt: 'Offered testimony about a new job after community prayer.',
    },
  ],
  prayers: [
    {
      id: 'PR-118',
      name: 'Mika Bryant',
      submittedAt: '45m ago',
      category: 'Family',
      flagReason: 'Multiple reports for personal info',
    },
    {
      id: 'PR-117',
      name: 'Devin Hall',
      submittedAt: '3h ago',
      category: 'Health',
      flagReason: 'Potentially harmful advice',
    },
  ],
};

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

const commentThreads = [
  {
    id: 'CT-55',
    title: 'Healing prayer follow-ups',
    status: 'Active',
    reports: 2,
    lastUpdate: '20m ago',
  },
  {
    id: 'CT-54',
    title: 'Provision testimony comments',
    status: 'Needs review',
    reports: 4,
    lastUpdate: '1h ago',
  },
  {
    id: 'CT-53',
    title: 'Prayer request thread - Teens',
    status: 'Locked',
    reports: 1,
    lastUpdate: 'Yesterday',
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
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCountLabel = pendingLoading ? '—' : pendingTestimonies.length.toString();
  const pendingSubLabel = pendingLoading
    ? 'Refreshing review queue...'
    : pendingTestimonies.length === 0
      ? 'No testimonies awaiting review'
      : `${pendingTestimonies.length} awaiting review`;

  const formatExcerpt = (text: string) => (text.length > 140 ? `${text.slice(0, 137).trim()}...` : text);

  const formatSubmittedAt = (value: string) =>
    new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  const resolveDisplayName = (identity: string | null, name: string | null) => {
    if (identity === 'anonymous') return 'Anonymous';
    return name?.trim() || 'Unnamed submitter';
  };

  const fetchPendingTestimonies = async () => {
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

      const mapped = (data ?? []).map((item) => ({
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
  };

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

  useEffect(() => {
    fetchPendingTestimonies();
  }, [isAdmin]);

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
            <CardTitle className="text-sm font-medium">Flagged prayers</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">2 urgent reviews</p>
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
                    <Badge variant="secondary">{item.id}</Badge>
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
                    <Button size="sm" variant="outline" disabled={isTestimonyActionDisabled} title={testimonyActionDisabledText}>
                      <MessageSquareText className="mr-2 h-4 w-4" />
                      Comment
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
            <CardTitle>Flagged prayer requests</CardTitle>
            <CardDescription>Resolve safety and privacy concerns quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewQueue.prayers.map((item) => (
              <div key={item.id} className="rounded-lg border border-muted p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.submittedAt} · {item.category}</p>
                  </div>
                  <Badge variant="destructive">Flagged</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.flagReason}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm" variant="ghost" disabled={!isAdmin} title={actionDisabledText}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comment moderation</CardTitle>
          <CardDescription>Manage discussion safety across prayer and testimony threads.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thread</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Last update</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commentThreads.map((thread) => (
                  <TableRow key={thread.id}>
                    <TableCell className="font-medium">
                      {thread.title}
                      <p className="text-xs text-muted-foreground">{thread.id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={thread.status === 'Locked' ? 'secondary' : 'default'}>
                        {thread.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{thread.reports}</TableCell>
                    <TableCell>{thread.lastUpdate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline">Hide</Button>
                        <Button size="sm" variant="destructive" disabled={!isAdmin} title={actionDisabledText}>
                          Delete
                        </Button>
                        <Button size="sm" variant="secondary" disabled={!isAdmin} title={actionDisabledText}>
                          Lock thread
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
            <CardTitle>Repeat contributors</CardTitle>
            <CardDescription>Top users returning to engage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['S. Rivera', 'K. Adams', 'M. Johnson', 'T. Clarke'].map((name) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{name}</span>
                <Badge variant="secondary">3+ submissions</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role-based access</CardTitle>
            <CardDescription>Permissions are enforced per role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Signed-in role</span>
              <Badge variant="default">{role}</Badge>
            </div>
            <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
              {isAdmin
                ? 'Admins can approve, reject, edit, archive, delete, and lock threads.'
                : 'Moderators can review queues, leave notes, and hide threads. Admin approval is required for testimony decisions, deletions, and locks.'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action logs</CardTitle>
            <CardDescription>Every moderation action is recorded.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-muted p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{log.action}</span>
                    <Badge variant="secondary">{log.result}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {log.actor} · {log.target} · {log.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
