import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Palette, 
  Database,
  Upload,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { UserProfile, NotificationSettings, APIKeySettings } from "@/types/settings";


export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    campaignAlerts: true,
    budgetWarnings: true,
    performanceReports: false,
    systemUpdates: true
  });

  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    timezone: 'UTC-05:00',
    language: 'en'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [apiKeys, setApiKeys] = useState<APIKeySettings>({
    facebookAccessToken: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    sendgridApiKey: ''
  });

  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    retry: false,
  });

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (profileData: UserProfile) => {
      return await apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Update notifications mutation
  const notificationsMutation = useMutation({
    mutationFn: async (notificationPrefs: NotificationSettings) => {
      return await apiRequest('/api/user/notifications', {
        method: 'PUT',
        body: JSON.stringify(notificationPrefs)
      });
    },
    onSuccess: () => {
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notifications",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const passwordMutation = useMutation({
    mutationFn: async (passwordUpdateData: any) => {
      return await apiRequest('/api/user/password', {
        method: 'PUT',
        body: JSON.stringify(passwordUpdateData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Update API keys mutation
  const apiKeysMutation = useMutation({
    mutationFn: async (apiKeyData: APIKeySettings) => {
      return await apiRequest('/api/user/api-keys', {
        method: 'PUT',
        body: JSON.stringify(apiKeyData)
      });
    },
    onSuccess: () => {
      toast({
        title: "API Keys Updated",
        description: "Your API keys have been saved securely.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API keys",
        variant: "destructive",
      });
    },
  });

  // Initialize settings when data is loaded
  useEffect(() => {
    if (settings && typeof settings === 'object') {
      if ('profile' in settings && settings.profile && typeof settings.profile === 'object') {
        setProfile((prev: UserProfile) => ({
          ...prev,
          ...(settings.profile as Partial<UserProfile>)
        }));
      }
      if ('notifications' in settings && settings.notifications && typeof settings.notifications === 'object') {
        setNotifications(settings.notifications as NotificationSettings);
      }
    }
  }, [settings, notifications]);

  const handleSaveProfile = () => {
    profileMutation.mutate(profile);
  };

  const handleSaveNotifications = () => {
    notificationsMutation.mutate(notifications);
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    passwordMutation.mutate(passwordData);
  };

  const handleSaveApiKeys = () => {
    apiKeysMutation.mutate(apiKeys);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Badge variant="outline" className="bg-sacura-primary/10 text-sacura-primary border-sacura-primary/20">
          Pro Plan
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG or SVG. Max size 2MB.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Profile Form */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={profile.timezone}
                          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Configure how you want to receive notifications and alerts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, email: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, push: checked })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Campaign Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Alerts about campaign performance and status
                          </p>
                        </div>
                        <Switch
                          checked={notifications.campaignAlerts}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, campaignAlerts: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Budget Warnings</Label>
                          <p className="text-sm text-muted-foreground">
                            Warnings when campaign budgets are running low
                          </p>
                        </div>
                        <Switch
                          checked={notifications.budgetWarnings}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, budgetWarnings: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Performance Reports</Label>
                          <p className="text-sm text-muted-foreground">
                            Weekly and monthly performance summaries
                          </p>
                        </div>
                        <Switch
                          checked={notifications.performanceReports}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, performanceReports: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>System Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Updates about new features and maintenance
                          </p>
                        </div>
                        <Switch
                          checked={notifications.systemUpdates}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, systemUpdates: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and authentication settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Active Sessions</Label>
                          <p className="text-sm text-muted-foreground">
                            Manage devices that are currently signed in
                          </p>
                        </div>
                        <Button variant="outline">View Sessions</Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSavePassword}
                        disabled={passwordMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Keys Tab */}
              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                    <CardDescription>
                      Manage your API keys and external service integrations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label>Facebook Access Token</Label>
                          <p className="text-sm text-muted-foreground">
                            Used for Facebook Ads API integration
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Connected
                          </Badge>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label>OpenAI API Key</Label>
                          <p className="text-sm text-muted-foreground">
                            Required for AI-powered content generation
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Connected
                          </Badge>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label>Claude API Key</Label>
                          <p className="text-sm text-muted-foreground">
                            Used for advanced AI analysis and insights
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Connected
                          </Badge>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize the look and feel of your dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg cursor-pointer hover:border-sacura-primary">
                            <div className="w-full h-20 bg-white border rounded mb-2"></div>
                            <p className="text-sm text-center">Light</p>
                          </div>
                          <div className="p-4 border rounded-lg cursor-pointer hover:border-sacura-primary">
                            <div className="w-full h-20 bg-gray-900 border rounded mb-2"></div>
                            <p className="text-sm text-center">Dark</p>
                          </div>
                          <div className="p-4 border rounded-lg cursor-pointer hover:border-sacura-primary">
                            <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 border rounded mb-2"></div>
                            <p className="text-sm text-center">System</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Compact Mode</Label>
                            <p className="text-sm text-muted-foreground">
                              Reduce spacing and use smaller components
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Animations</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable smooth transitions and animations
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>
                        <Save className="w-4 h-4 mr-2" />
                        Save Appearance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
      </Tabs>
    </div>
  );
}