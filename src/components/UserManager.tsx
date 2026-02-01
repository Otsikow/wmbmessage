import { useMemo, useState } from "react";
import { Download, Mail, Search, ShieldCheck, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
  const [sortOrder, setSortOrder] = useState("newest");

  const roleByUserId = useMemo(
    () => new Map(userRoles.map((role) => [role.user_id, role.role])),
    [userRoles],
  );
  const getUserRole = (userId: string) => roleByUserId.get(userId) || "user";

  const stats = useMemo(() => {
    const total = profiles.length;
    const rolesCount = profiles.reduce<Record<string, number>>((acc, profile) => {
      const role = getUserRole(profile.id);
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const now = Date.now();
    const recent = profiles.filter((profile) => {
      const created = new Date(profile.created_at).getTime();
      return now - created <= 1000 * 60 * 60 * 24 * 30;
    }).length;

    return {
      total,
      admins: rolesCount.admin || 0,
      moderators: rolesCount.moderator || 0,
      recent,
    };
  }, [profiles, roleByUserId]);

  const filteredProfiles = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const filtered = profiles.filter((profile) => {
      const role = getUserRole(profile.id);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesSearch =
        normalized.length === 0 ||
        profile.email.toLowerCase().includes(normalized) ||
        (profile.full_name || "").toLowerCase().includes(normalized);
      return matchesRole && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [profiles, roleByUserId, roleFilter, searchTerm, sortOrder]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const roleBadgeStyles = (role: string) => {
    switch (role) {
      case "admin":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
      case "moderator":
        return "border-blue-500/40 bg-blue-500/10 text-blue-200";
      default:
        return "border-muted bg-muted/40 text-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage access, roles, and onboarding status from one place.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite user
            </Button>
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total users", value: stats.total },
            { label: "Admins", value: stats.admins },
            { label: "Moderators", value: stats.moderators },
            { label: "New this month", value: stats.recent },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border bg-muted/40 p-3"
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="moderator">Moderators</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              {filteredProfiles.length} shown
            </Badge>
          </div>
        </div>
        <Separator />
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const role = getUserRole(profile.id);
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{profile.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">ID: {profile.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${roleBadgeStyles(role)}`}
                      >
                        {role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(profile.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" title="Send email">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Review permissions">
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProfiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No users match this filter. Try adjusting the search or role
                    selection.
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
