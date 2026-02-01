import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const getUserRole = (userId: string) =>
    userRoles.find((r) => r.user_id === userId)?.role || "user";

  const normalizeRole = (role: string) => role.replaceAll("_", " ");

  const stats = useMemo(() => {
    const total = profiles.length;
    const admins = profiles.filter((profile) =>
      ["admin", "super_admin"].includes(getUserRole(profile.id)),
    ).length;
    const moderators = profiles.filter((profile) =>
      ["moderator", "mod"].includes(getUserRole(profile.id)),
    ).length;
    const last30Days = profiles.filter((profile) => {
      const created = new Date(profile.created_at).getTime();
      const now = new Date().getTime();
      return now - created <= 1000 * 60 * 60 * 24 * 30;
    }).length;

    return { total, admins, moderators, last30Days };
  }, [profiles, userRoles]);

  const filteredProfiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return profiles.filter((profile) => {
      const role = getUserRole(profile.id);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesQuery =
        !query ||
        profile.full_name?.toLowerCase().includes(query) ||
        profile.email.toLowerCase().includes(query);
      return matchesRole && matchesQuery;
    });
  }, [profiles, searchQuery, roleFilter, userRoles]);

  const formatJoinDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              All registered accounts, roles, and activity insights.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Role policies
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite user
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UsersIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total users</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-semibold">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Moderators</p>
                  <p className="text-2xl font-semibold">{stats.moderators}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UsersIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">New in 30 days</p>
                  <p className="text-2xl font-semibold">{stats.last30Days}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search users by name or email"
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="super_admin">Super admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{filteredProfiles.length} results</Badge>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </div>

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
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-tight">
                            {profile.full_name || "Unassigned user"}
                          </p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {normalizeRole(role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell>{formatJoinDate(profile.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit roles</DropdownMenuItem>
                          <DropdownMenuItem>Reset password</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Suspend user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProfiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">No users found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or role filters.
                      </p>
                      <Button size="sm" variant="outline" onClick={handleClearFilters}>
                        Clear filters
                      </Button>
                    </div>
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
