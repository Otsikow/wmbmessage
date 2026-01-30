import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  Mail,
  Lock,
  LogOut,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCcw,
  SunMoon,
  Palette,
  Type,
  BookOpen,
  RotateCcw,
  MessageCircle,
  MailCheck,
  BellRing,
} from "lucide-react";
import Header from "@/components/Header";
import { getFriendlyErrorMessage } from "@/lib/errorHandling";
import { validateEmailOnly } from "@/lib/validation/auth";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import EngagementSummary from "@/components/engagement/EngagementSummary";
import EngagementPrompt from "@/components/engagement/EngagementPrompt";
import RetentionNotificationPreferences from "@/components/retention/RetentionNotificationPreferences";
import { useScriptureFontOptions, type ScriptureFontId } from "@/hooks/useScriptureFontOptions";

interface AccountSettingsState {
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  eventDigestEmail: boolean;
  eventReminderEmail: boolean;
}

const RESEND_TIMEOUT_SECONDS = 60;
const AVATAR_BUCKET = "user-uploads";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    settings,
    updateSettings,
    resetSettings,
    loading: settingsLoading,
  } = useSettings();
  const scriptureFontOptions = useScriptureFontOptions();

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [accountSettings, setAccountSettings] = useState<AccountSettingsState>({
    whatsappNotifications: true,
    emailNotifications: false,
    eventDigestEmail: false,
    eventReminderEmail: false,
  });
  const [updatingSetting, setUpdatingSetting] =
    useState<keyof AccountSettingsState | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setFullName(data.full_name || "");
          setEmail(data.email || user.email || "");
          setAvatarPath(data.avatar_url);

          if (data.avatar_url) {
            if (data.avatar_url.startsWith("http")) {
              setAvatarUrl(data.avatar_url);
            } else {
              const { data: publicUrlData } = supabase.storage
                .from(AVATAR_BUCKET)
                .getPublicUrl(data.avatar_url);
              setAvatarUrl(publicUrlData?.publicUrl ?? null);
            }
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const metadata =
      user.user_metadata?.account_settings as
        | Partial<AccountSettingsState>
        | undefined;

    if (metadata) {
      setAccountSettings((prev) => ({
        whatsappNotifications:
          typeof metadata.whatsappNotifications === "boolean"
            ? metadata.whatsappNotifications
            : prev.whatsappNotifications,
        emailNotifications:
          typeof metadata.emailNotifications === "boolean"
            ? metadata.emailNotifications
            : prev.emailNotifications,
        eventDigestEmail:
          typeof metadata.eventDigestEmail === "boolean"
            ? metadata.eventDigestEmail
            : prev.eventDigestEmail,
        eventReminderEmail:
          typeof metadata.eventReminderEmail === "boolean"
            ? metadata.eventReminderEmail
            : prev.eventReminderEmail,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getFriendlyErrorMessage(
          error,
          "We could not update your profile. Please try again shortly.",
          "update-profile",
        ),
        variant: "destructive",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!user) return;

    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please choose an image smaller than 5MB.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const safeExt = fileExt ? `.${fileExt}` : "";
      const fileName = `${user.id}-${Date.now()}${safeExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl ?? null;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setAvatarPath(filePath);
      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error uploading avatar",
        description: getFriendlyErrorMessage(
          error,
          "We could not upload your new avatar right now. Please try again.",
          "upload-avatar",
        ),
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      if (avatarPath && !avatarPath.startsWith("http")) {
        const { error: removeError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .remove([avatarPath]);
        if (removeError) throw removeError;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setAvatarPath(null);
      setAvatarUrl(null);
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error removing avatar",
        description: getFriendlyErrorMessage(
          error,
          "We could not remove your avatar right now. Please try again later.",
          "remove-avatar",
        ),
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: getFriendlyErrorMessage(
          error,
          "We could not update your password right now. Please try again later.",
          "change-password",
        ),
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAccountSettingChange = async (
    key: keyof AccountSettingsState,
    value: boolean,
  ) => {
    if (!user) return;

    const previousValue = accountSettings[key];
    const updatedSettings = { ...accountSettings, [key]: value };
    setAccountSettings(updatedSettings);
    setUpdatingSetting(key);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { account_settings: updatedSettings },
      });
      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your account preferences have been saved.",
      });
    } catch (error) {
      setAccountSettings((prev) => ({ ...prev, [key]: previousValue }));
      toast({
        title: "Error updating settings",
        description: getFriendlyErrorMessage(
          error,
          "We could not update that preference right now. Please try again.",
          "update-account-setting",
        ),
        variant: "destructive",
      });
    } finally {
      setUpdatingSetting(null);
    }
  };

  const handleResendVerification = async () => {
    const { sanitized, errors } = validateEmailOnly(email);
    setEmail(sanitized.email);

    if (errors.length > 0) {
      toast({
        title: "Invalid email address",
        description: errors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: sanitized.email,
      });
      if (error) throw error;

      setResendCountdown(RESEND_TIMEOUT_SECONDS);
      toast({
        title: "Verification email sent",
        description: "A new verification link has been sent to your inbox.",
      });
    } catch (error) {
      toast({
        title: "Unable to resend email",
        description: getFriendlyErrorMessage(
          error,
          "We could not resend the verification email. Please try again later.",
          "resend-verification",
        ),
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: getFriendlyErrorMessage(
          error,
          "We could not sign you out safely. Please refresh and try again.",
          "sign-out",
        ),
        variant: "destructive",
      });
    }
  };

  const joinedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not recorded";

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Your Profile</h1>
              <p className="text-muted-foreground">
                Manage your personal information, communication settings, and app
                preferences.
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Card>
            <CardContent className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl ?? ""} />
                  <AvatarFallback className="text-xl">
                    {fullName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">
                    {fullName || user?.email || "Unnamed user"}
                  </p>
                  <p className="text-sm text-muted-foreground break-all">{email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {user?.email_confirmed_at ? (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Email verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Verification pending
                      </Badge>
                    )}
                    <Badge variant="outline">Member</Badge>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 md:text-right">
                <div>
                  <p className="font-medium text-foreground">Member since</p>
                  <p>{joinedAt}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Last active</p>
                  <p>{lastSignIn}</p>
                </div>
              </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <EngagementPrompt />
          <EngagementSummary />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 bg-muted p-1">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <SettingsIcon className="h-4 w-4" /> Preferences
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your name and profile image. Email changes require
                    contacting support.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarUrl ?? ""} />
                        <AvatarFallback className="text-2xl">
                          {fullName?.charAt(0)?.toUpperCase() || "U"}
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
                          Upload a square JPG or PNG (max 5MB).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
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
                  </div>

                  {!user?.email_confirmed_at && (
                    <div className="space-y-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-4 text-sm">
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <p>
                          Your email is awaiting verification. Check your inbox or
                          request a new confirmation email.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          onClick={handleResendVerification}
                          variant="secondary"
                          disabled={resendLoading || resendCountdown > 0}
                        >
                          {resendLoading ? (
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                          ) : (
                            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                          )}
                          {resendCountdown > 0
                            ? `Resend in ${resendCountdown}s`
                            : "Resend verification email"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          We'll send the link to {email || "your registered email"}.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={handleUpdateProfile}
                      disabled={profileSaving}
                    >
                      {profileSaving && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Communication Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose your channels for clean, mobile-friendly event updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      key: "whatsappNotifications",
                      icon: (
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      ),
                      title: "WhatsApp alerts",
                      desc: "Keep WhatsApp as your primary channel for event updates.",
                    },
                    {
                      key: "emailNotifications",
                      icon: <MailCheck className="h-5 w-5 text-muted-foreground" />,
                      title: "Email notifications",
                      desc: "Enable non-promotional emails without affecting WhatsApp alerts.",
                    },
                    {
                      key: "eventDigestEmail",
                      icon: <Calendar className="h-5 w-5 text-muted-foreground" />,
                      title: "Weekly event digest",
                      desc: "Receive a weekly roundup of upcoming events.",
                      requiresEmail: true,
                    },
                    {
                      key: "eventReminderEmail",
                      icon: <BellRing className="h-5 w-5 text-muted-foreground" />,
                      title: "Event reminder (24 hours before)",
                      desc: "Get a reminder email a day before each event.",
                      requiresEmail: true,
                    },
                  ].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {setting.icon}
                        <div>
                          <p className="font-medium">{setting.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {setting.desc}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={
                          accountSettings[
                            setting.key as keyof AccountSettingsState
                          ]
                        }
                        onCheckedChange={(checked) =>
                          handleAccountSettingChange(
                            setting.key as keyof AccountSettingsState,
                            checked,
                          )
                        }
                        disabled={
                          updatingSetting === setting.key ||
                          (setting.requiresEmail &&
                            !accountSettings.emailNotifications)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <RetentionNotificationPreferences />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SunMoon className="h-5 w-5" />
                    Appearance & Theme
                  </CardTitle>
                  <CardDescription>
                    Tailor the interface to suit your environment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">Dark mode</p>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes.
                      </p>
                    </div>
                    <Switch
                      checked={settings.theme === "dark"}
                      onCheckedChange={(checked) =>
                        updateSettings({ theme: checked ? "dark" : "light" })
                      }
                      disabled={settingsLoading}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="colorScheme" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color scheme
                    </Label>
                    <Select
                      value={settings.colorScheme}
                      onValueChange={(value) =>
                        updateSettings({
                          colorScheme: value as typeof settings.colorScheme,
                        })
                      }
                      disabled={settingsLoading}
                    >
                      <SelectTrigger id="colorScheme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cool">Cool</SelectItem>
                        <SelectItem value="high-contrast">
                          High contrast
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Interface font size
                    </Label>
                    <Slider
                      value={[settings.fontSize]}
                      min={14}
                      max={24}
                      step={1}
                      onValueChange={([value]) =>
                        updateSettings({ fontSize: value ?? settings.fontSize })
                      }
                      disabled={settingsLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current size: {settings.fontSize}px
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Reading Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how scriptures and study notes are presented.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">App font family</Label>
                      <Select
                        value={settings.fontFamily}
                        onValueChange={(value) =>
                          updateSettings({
                            fontFamily: value as typeof settings.fontFamily,
                          })
                        }
                        disabled={settingsLoading}
                      >
                        <SelectTrigger id="fontFamily">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="monospace">Monospace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="readerFontFamily">Reader font</Label>
                      <Select
                        value={settings.readerFontFamily}
                        onValueChange={(value) =>
                          updateSettings({
                            readerFontFamily: value as ScriptureFontId,
                          })
                        }
                        disabled={settingsLoading}
                      >
                        <SelectTrigger id="readerFontFamily">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {scriptureFontOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id} className="py-2">
                              <div className="flex flex-col text-left">
                                <span className="text-sm font-semibold text-foreground">
                                  {option.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                                <span
                                  className="text-sm text-foreground/80"
                                  style={{ fontFamily: option.stack }}
                                >
                                  {option.preview}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bibleVersion">Preferred Bible translation</Label>
                      <Select
                        value={settings.bibleVersion}
                        onValueChange={(value) =>
                          updateSettings({ bibleVersion: value })
                        }
                        disabled={settingsLoading}
                      >
                        <SelectTrigger id="bibleVersion">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KJV">King James (KJV)</SelectItem>
                          <SelectItem value="NIV">
                            New International (NIV)
                          </SelectItem>
                          <SelectItem value="ESV">English Standard (ESV)</SelectItem>
                          <SelectItem value="NKJV">New King James (NKJV)</SelectItem>
                          <SelectItem value="NLT">New Living (NLT)</SelectItem>
                          <SelectItem value="NASB">
                            New American Standard (NASB)
                          </SelectItem>
                          <SelectItem value="AMP">Amplified (AMP)</SelectItem>
                          <SelectItem value="CSB">Christian Standard (CSB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetSettings}
                    disabled={settingsLoading}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset reading preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Choose a strong password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
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
                  </div>

                  <Button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                  >
                    {passwordSaving && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
