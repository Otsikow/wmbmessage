import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  User,
  Mail,
  Lock,
  LogOut,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Bell,
  Calendar,
  Megaphone,
} from 'lucide-react';
import Header from '@/components/Header';
import { getFriendlyErrorMessage } from '@/lib/errorHandling';
import { Switch } from '@/components/ui/switch';

interface AccountSettingsState {
  emailNotifications: boolean;
  weeklySummary: boolean;
  productUpdates: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [accountSettings, setAccountSettings] = useState<AccountSettingsState>({
    emailNotifications: false,
    weeklySummary: false,
    productUpdates: false,
  });
  const [updatingSetting, setUpdatingSetting] = useState<keyof AccountSettingsState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          setAvatarPath(data.avatar_url);

          if (data.avatar_url) {
            if (data.avatar_url.startsWith('http')) {
              setAvatarUrl(data.avatar_url);
            } else {
              const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.avatar_url);
              setAvatarUrl(publicUrlData?.publicUrl ?? null);
            }
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const metadata = user.user_metadata?.account_settings as Partial<AccountSettingsState> | undefined;
    if (metadata) {
      setAccountSettings((prev) => ({
        emailNotifications:
          typeof metadata.emailNotifications === 'boolean'
            ? metadata.emailNotifications
            : prev.emailNotifications,
        weeklySummary:
          typeof metadata.weeklySummary === 'boolean'
            ? metadata.weeklySummary
            : prev.weeklySummary,
        productUpdates:
          typeof metadata.productUpdates === 'boolean'
            ? metadata.productUpdates
            : prev.productUpdates,
      }));
    }
  }, [user]);

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

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!user) return;

    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Image too large',
        description: 'Please choose an image smaller than 5MB.',
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const safeExt = fileExt ? `.${fileExt}` : '';
      const fileName = `${user.id}-${Date.now()}${safeExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl ?? null;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarPath(filePath);
      setAvatarUrl(publicUrl);
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error uploading avatar',
        description: getFriendlyErrorMessage(
          error,
          'We could not upload your new avatar right now. Please try again.',
          'upload-avatar'
        ),
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      if (avatarPath && !avatarPath.startsWith('http')) {
        const { error: removeError } = await supabase.storage.from('avatars').remove([avatarPath]);
        if (removeError) throw removeError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarPath(null);
      setAvatarUrl(null);
      toast({
        title: 'Avatar removed',
        description: 'Your profile picture has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error removing avatar',
        description: getFriendlyErrorMessage(
          error,
          'We could not remove your avatar right now. Please try again later.',
          'remove-avatar'
        ),
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
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

  const handleAccountSettingChange = async (
    key: keyof AccountSettingsState,
    value: boolean
  ) => {
    if (!user) return;

    const previousValue = accountSettings[key];
    const updatedSettings = {
      ...accountSettings,
      [key]: value,
    } as AccountSettingsState;

    setAccountSettings(updatedSettings);
    setUpdatingSetting(key);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          account_settings: updatedSettings,
        },
      });

      if (error) throw error;

      toast({
        title: 'Settings updated',
        description: 'Your account preferences have been saved.',
      });
    } catch (error) {
      setAccountSettings((prev) => ({
        ...prev,
        [key]: previousValue,
      }));

      toast({
        title: 'Error updating settings',
        description: getFriendlyErrorMessage(
          error,
          'We could not update that preference right now. Please try again.',
          'update-account-setting'
        ),
        variant: 'destructive',
      });
    } finally {
      setUpdatingSetting(null);
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
                  <AvatarImage src={avatarUrl ?? ''} />
                  <AvatarFallback className="text-2xl">
                    {fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Avatar
                    </Button>
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a square image (JPG or PNG, up to 5MB) for the best results.
                  </p>
                </div>
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
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
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
                <SettingsIcon className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage communication preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts about important account activity.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={accountSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange('emailNotifications', checked)
                  }
                  disabled={updatingSetting === 'emailNotifications'}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Weekly summary</p>
                    <p className="text-sm text-muted-foreground">
                      Get a weekly recap of new sermons and study guides.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={accountSettings.weeklySummary}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange('weeklySummary', checked)
                  }
                  disabled={updatingSetting === 'weeklySummary'}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Product updates</p>
                    <p className="text-sm text-muted-foreground">
                      Hear about new features and improvements first.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={accountSettings.productUpdates}
                  onCheckedChange={(checked) =>
                    handleAccountSettingChange('productUpdates', checked)
                  }
                  disabled={updatingSetting === 'productUpdates'}
                />
              </div>
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
