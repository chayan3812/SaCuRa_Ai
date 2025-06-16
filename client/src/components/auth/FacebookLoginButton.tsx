import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { facebookAuth, type FacebookLoginResponse } from '@/services/facebookAuth';
import { 
  LogIn, 
  LogOut, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Facebook,
  Settings
} from 'lucide-react';

interface FacebookLoginButtonProps {
  configId?: string;
  onLogin?: (response: FacebookLoginResponse) => void;
  onLogout?: () => void;
  showUserInfo?: boolean;
  permissions?: string[];
}

export default function FacebookLoginButton({
  configId = '1089937202820114',
  onLogin,
  onLogout,
  showUserInfo = true,
  permissions = ['email', 'pages_show_list', 'pages_read_engagement', 'pages_read_user_content']
}: FacebookLoginButtonProps) {
  const [loginStatus, setLoginStatus] = useState<FacebookLoginResponse['status']>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userPages, setUserPages] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Set up status change listener
    const unsubscribe = facebookAuth.onStatusChange((response) => {
      setLoginStatus(response.status);
      setIsLoading(false);
      
      if (response.status === 'connected') {
        setUserInfo(facebookAuth.getCurrentUser());
        loadUserPages();
        onLogin?.(response);
      } else {
        setUserInfo(null);
        setUserPages([]);
        onLogout?.();
      }
    });

    // Initial status check
    checkInitialLoginStatus();

    return unsubscribe;
  }, [onLogin, onLogout]);

  const checkInitialLoginStatus = async () => {
    setIsLoading(true);
    try {
      const response = await facebookAuth.checkLoginStatus();
      setLoginStatus(response.status);
      
      if (response.status === 'connected') {
        setUserInfo(facebookAuth.getCurrentUser());
        await loadUserPages();
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPages = async () => {
    try {
      const pages = await facebookAuth.getUserPages();
      setUserPages(pages);
    } catch (error) {
      console.error('Error loading user pages:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await facebookAuth.login(permissions);
      
      if (response.status === 'connected') {
        toast({
          title: "Facebook Login Successful",
          description: "You're now connected to Facebook. Setting up webhook subscriptions...",
        });
      } else {
        toast({
          title: "Login Required",
          description: "Please complete Facebook login to continue.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login to Facebook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await facebookAuth.logout();
      toast({
        title: "Logged Out",
        description: "Successfully logged out from Facebook",
      });
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (loginStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not_authorized':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (loginStatus) {
      case 'connected':
        return 'Connected to Facebook';
      case 'not_authorized':
        return 'Facebook login required';
      default:
        return 'Not connected to Facebook';
    }
  };

  const getStatusColor = () => {
    switch (loginStatus) {
      case 'connected':
        return 'default';
      case 'not_authorized':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking Facebook connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            <span>Facebook Authentication</span>
          </CardTitle>
          <CardDescription>
            Connect your Facebook account to enable real-time page monitoring and automation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusMessage()}</span>
              <Badge variant={getStatusColor() as any}>
                {loginStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            {loginStatus !== 'connected' ? (
              <div className="space-y-2">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: `
                      <fb:login-button 
                        config_id="${configId}"
                        onlogin="checkLoginState();"
                        scope="${permissions.join(',')}"
                        size="large"
                        button_type="login_with">
                      </fb:login-button>
                    `
                  }}
                />
                
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  Connect Facebook Account
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Disconnect Facebook
              </Button>
            )}
          </div>

          {showUserInfo && loginStatus === 'connected' && userInfo && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {userInfo.picture ? (
                    <img
                      src={userInfo.picture.data.url}
                      alt={userInfo.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{userInfo.name}</p>
                  {userInfo.email && (
                    <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                  )}
                </div>
              </div>

              {userPages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Connected Pages ({userPages.length})</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {userPages.slice(0, 5).map((page) => (
                      <div key={page.id} className="flex items-center justify-between text-sm">
                        <span>{page.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {page.category}
                        </Badge>
                      </div>
                    ))}
                    {userPages.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{userPages.length - 5} more pages
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {loginStatus === 'connected' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Facebook integration active. Real-time webhooks are now monitoring your pages for customer interactions, 
            post engagement, and other events.
          </AlertDescription>
        </Alert>
      )}

      {loginStatus === 'not_authorized' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're logged into Facebook but need to authorize SaCuRa AI to access your pages. 
            Click the login button above to grant permissions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}