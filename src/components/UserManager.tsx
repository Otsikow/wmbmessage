import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

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

export default function UserManager({
  profiles,
  userRoles,
}: UserManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const roleByUserId = useMemo(
    () => new Map(userRoles.map((r) => [r.user_id, r.role])),
    [userRoles],
  );

  const getUserRole = (userId: string) =>
    roleByUserId.get(userId) || "user";

  const filteredProfiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return profiles.filter((profile) => {
      const role = getUserRole(profile.id);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesSearch =
        !term ||
        profile.email.toLowerCase().includes(term) ||
        (profile.full_name ?? "").toLowerCase().includes(term);

      return matchesRole && matchesSearch;
    });
  }, [profiles, roleByUserId, roleFilter, searchTerm]);

  const totalUsers = profiles.length;
  const adminCount = profiles.filter(
    (p) => getUserRole(p.id) === "admin",
  ).length;
  const invitedCount = profiles.filter((p) => !p.full_name).length;
  const newThisWeek = profiles.filter((p) => {
    const created = new Date(p.created_at).getTime();
    return created >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;

  const formatRoleLabel = (role: string) =>
    role.charAt(0).toUpperCase() + role.slice(1);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
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
              Manage access, roles, and onboarding across the platform.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite user
            </Button>
            <Button size="sm" className="gap-2">
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Stat label="Total users" value={totalUsers} icon={<Users />} />
          <Stat label="Admins" value={adminCount} icon={<ShieldCheck />} />
          <Stat label="Invited" value={invitedCount} icon={<Clock />} />
          <Stat label="New this week" value={newThisWeek} icon={<CheckCircle2 />} />
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
                const invited = !profile.full_name;

                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {(profile.full_name?.[0] ||
                              profile.email[0]).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {profile.full_name || "Invited user"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatRoleLabel(role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={invited ? "outline" : "default"}>
                        {invited ? "Invited" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(profile.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
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
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No users match the current filters.
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

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-sm">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
