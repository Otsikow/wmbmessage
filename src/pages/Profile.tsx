import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock, LogOut, CheckCircle2, Clock, RefreshCcw } from 'lucide-react';
import Header from '@/components/Header';
import { getFriendlyErrorMessage } from '@/lib/errorHandling';
import { validateEmailOnly } from '@/lib/validation/auth';

const RESEND_TIMEOUT_SECONDS = 60;

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth/sign-in');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setFullName(data.full_name || '');
          setEmail(data.email || user.email || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not update your profile. Please try again shortly.',
          'update-profile'
        ),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not update your password right now. Please try again later.',
          'change-password'
        ),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const { sanitized, errors } = validateEmailOnly(email);
    setEmail(sanitized.email);

    if (errors.length > 0) {
      toast({
        title: 'Invalid email address',
        description: errors.join('\n'),
        variant: 'destructive',
      });
      return;
    }

    setResendLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: sanitized.email,
      });

      if (error) throw error;

      setResendCountdown(RESEND_TIMEOUT_SECONDS);
      toast({
        title: 'Verification email sent',
        description: 'We have sent a new verification link to your inbox.',
      });
    } catch (error) {
      toast({
        title: 'Unable to resend email',
        description: getFriendlyErrorMessage(
          error,
          'We could not resend the verification email. Please try again later.',
          'resend-verification'
        ),
        variant: 'destructive',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not sign you out safely. Please refresh and try again.',
          'sign-out'
        ),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">
                    {fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                  {user?.email_confirmed_at ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Pending verification
                    </Badge>
                  )}
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                {!user?.email_confirmed_at && (
                  <div className="space-y-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-4 text-sm">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>
                        Your email is awaiting verification. Check your inbox or request a new
                        confirmation email.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={resendLoading || resendCountdown > 0}
                      >
                        {resendLoading ? (
                          <>
                            <RefreshCcw className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Sending...
                          </>
                        ) : resendCountdown > 0 ? (
                          `Resend in ${resendCountdown}s`
                        ) : (
                          <>
                            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                            Resend verification email
                          </>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        We'll send the link to {email || 'your registered email'}.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button onClick={handleChangePassword} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
