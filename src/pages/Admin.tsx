import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Shield, Database, Book, MessageSquare, Link2 } from 'lucide-react';
import Header from '@/components/Header';
import BibleManager from '@/components/BibleManager';
import SermonManager from '@/components/SermonManager';
import CrossRefManager from '@/components/CrossRefManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bibleVerses: 0,
    sermons: 0,
    crossRefs: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/sign-in');
      return;
    }

    if (!roleLoading && !isAdmin) {
      navigate('/');
      return;
    }

    if (isAdmin) {
      fetchData();
      fetchStats();
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*')
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfiles(profilesRes.data || []);
      setUserRoles(rolesRes.data || []);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Unable to load user information. Please check your connection and Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [versesCount, sermonsCount, crossRefsCount] = await Promise.all([
        supabase.from('bible_verses').select('*', { count: 'exact', head: true }),
        supabase.from('sermons').select('*', { count: 'exact', head: true }),
        supabase.from('cross_references').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        bibleVerses: versesCount.count || 0,
        sermons: sermonsCount.count || 0,
        crossRefs: crossRefsCount.count || 0,
      });
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setErrorMessage('Unable to load dashboard statistics. Please try again later.');
    }
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage content, users, and system settings
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Admin data unavailable</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="w-full min-w-max gap-2 bg-muted/60 p-1 md:grid md:grid-cols-5 md:gap-0">
                <TabsTrigger value="overview" className="w-full whitespace-nowrap">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="bible" className="w-full whitespace-nowrap">
                <Book className="h-4 w-4 mr-2" />
                Bible
                </TabsTrigger>
                <TabsTrigger value="sermons" className="w-full whitespace-nowrap">
                <MessageSquare className="h-4 w-4 mr-2" />
                Sermons
                </TabsTrigger>
                <TabsTrigger value="crossrefs" className="w-full whitespace-nowrap">
                <Link2 className="h-4 w-4 mr-2" />
                Cross Refs
                </TabsTrigger>
                <TabsTrigger value="users" className="w-full whitespace-nowrap">
                <Users className="h-4 w-4 mr-2" />
                Users
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bible Verses</CardTitle>
                    <Book className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.bibleVerses.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sermons</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.sermons}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cross References</CardTitle>
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.crossRefs}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profiles.length}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system health</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authentication</span>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Services</span>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Admin Users</CardTitle>
                    <CardDescription>Current administrators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Admins</span>
                        <span className="text-2xl font-bold">
                          {userRoles.filter(r => r.role === 'admin').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Moderators</span>
                        <span className="text-2xl font-bold">
                          {userRoles.filter(r => r.role === 'moderator').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Regular Users</span>
                        <span className="text-2xl font-bold">
                          {userRoles.filter(r => r.role === 'user').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bible">
              <BibleManager />
            </TabsContent>

            <TabsContent value="sermons">
              <SermonManager />
            </TabsContent>

            <TabsContent value="crossrefs">
              <CrossRefManager />
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              {profile.full_name || 'N/A'}
                            </TableCell>
                            <TableCell className="whitespace-normal break-words">
                              {profile.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getUserRole(profile.id) === 'admin' ? 'default' : 'secondary'}>
                                {getUserRole(profile.id)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
