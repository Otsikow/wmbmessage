import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquareText, ShieldCheck, Flag, Archive, Pencil, CheckCircle2, XCircle } from 'lucide-react';

type ModerationRole = 'admin' | 'moderator' | 'user';

interface AdminModerationDashboardProps {
  role: ModerationRole;
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
  const isAdmin = role === 'admin';
  const actionDisabledText = isAdmin
    ? 'Admin access granted.'
    : 'Admin only action. Escalate if needed.';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending testimonies</CardTitle>
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 awaiting edits</p>
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
            {reviewQueue.testimonies.map((item) => (
              <div key={item.id} className="rounded-lg border border-muted p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.submittedAt} · {item.category}</p>
                  </div>
                  <Badge variant="secondary">{item.id}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    Comment
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
                : 'Moderators can approve, reject, edit, comment, and hide threads. Admin approval is required for deletions and locks.'}
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
