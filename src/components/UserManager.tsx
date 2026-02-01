import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Download,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Clock,
} from "lucide-react";
import { useMemo, useState } from "react";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AdminUserRole {
  user_id: string;
  role: string;
}

interface UserManagerProps {
  profiles: AdminProfile[];
  userRoles: AdminUserRole[];
}

export default function UserManager({ profiles, userRoles }: UserManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const getUserRole = (userId: string) =>
    userRoles.find((r) => r.user_id === userId)?.role || "user";
  const filteredProfiles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return profiles.filter((profile) => {
      const role = getUserRole(profile.id);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        profile.email.toLowerCase().includes(normalizedSearch) ||
        (profile.full_name ?? " ").toLowerCase().includes(normalizedSearch);
      return matchesRole && matchesSearch;
    });
  }, [profiles, roleFilter, searchTerm, userRoles]);

  const totalUsers = profiles.length;
  const adminCount = profiles.filter(
    (profile) => getUserRole(profile.id) === "admin",
  ).length;
  const invitedCount = profiles.filter((profile) => !profile.full_name).length;
  const newThisWeek = profiles.filter((profile) => {
    const createdAt = new Date(profile.created_at).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return createdAt >= sevenDaysAgo;
  }).length;

  const formatRoleLabel = (role: string) =>
    role
      .split("_")
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" ");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl">Users</CardTitle>
            <CardDescription>
              Manage access, roles, and onboarding for every account.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite user
            </Button>
            <Button className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Add admin
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full lg:w-56">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total users</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{totalUsers}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              All active and invited accounts.
            </p>
          </div>
          <div className="rounded-lg border bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Admins</p>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{adminCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Elevated access across the platform.
            </p>
          </div>
          <div className="rounded-lg border bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Invited</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{invitedCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting profile completion.
            </p>
          </div>
          <div className="rounded-lg border bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">New this week</p>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{newThisWeek}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Joined within the last 7 days.
            </p>
          </div>
        </div>
        <Separator />
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const role = getUserRole(profile.id);
                const isInvited = !profile.full_name;
                return (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {(profile.full_name?.[0] || profile.email[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {profile.full_name || "Invited user"}
                        </p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatRoleLabel(role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isInvited ? "outline" : "default"}>
                      {isInvited ? "Invited" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(profile.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit role</DropdownMenuItem>
                        <DropdownMenuItem>Send reset link</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Deactivate user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
              })}
              {filteredProfiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No users found matching this view.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
