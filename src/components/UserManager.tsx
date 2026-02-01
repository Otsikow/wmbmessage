import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const getUserRole = (userId: string) =>
    userRoles.find((r) => r.user_id === userId)?.role || "user";

  const roleOptions = useMemo(() => {
    const roles = new Set<string>(["user"]);
    userRoles.forEach((role) => roles.add(role.role));
    return ["all", ...Array.from(roles).sort()];
  }, [userRoles]);

  const filteredProfiles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      const role = getUserRole(profile.id);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      if (!search) return matchesRole;

      const name = profile.full_name?.toLowerCase() ?? "";
      const email = profile.email?.toLowerCase() ?? "";
      return matchesRole && (name.includes(search) || email.includes(search));
    });
  }, [profiles, query, roleFilter, getUserRole]);

  const totalUsers = profiles.length;
  const adminUsers = profiles.filter((profile) => getUserRole(profile.id) === "admin").length;
  const lastSevenDays = profiles.filter((profile) => {
    const createdAt = new Date(profile.created_at).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return createdAt >= sevenDaysAgo;
  }).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage accounts, permissions, and onboarding activity.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">Invite user</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Total users", totalUsers, "All registered accounts."],
              ["Admins", adminUsers, "Users with full access."],
              ["New (7 days)", lastSevenDays, "Recent sign-ups."],
            ].map(([label, value, helper]) => (
              <Card key={label} className="border-muted/50">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <div className="text-2xl font-semibold">{value}</div>
                  <CardDescription>{helper}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <Input
                placeholder="Search by name or email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="md:max-w-xs"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="md:max-w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "all" ? "All roles" : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredProfiles.length} of {totalUsers} users
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => {
                  const role = getUserRole(profile.id);
                  const initials = profile.full_name
                    ?.split(" ")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{initials || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{profile.full_name || "—"}</div>
                            <div className="text-xs text-muted-foreground">ID: {profile.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge variant={role === "admin" ? "default" : "secondary"}>
                          {role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-sm font-medium">No matching users</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or role filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
