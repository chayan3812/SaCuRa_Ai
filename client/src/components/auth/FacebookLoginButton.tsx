/**
 * Custom Facebook Login Button with Dialog and Access Token Management
 * Implements advanced Facebook Login features for production use
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Shield, CheckCircle, AlertCircle, User, Settings } from 'lucide-react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookLoginStatus {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  };
}

interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

const FacebookLoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<FacebookLoginStatus | null>(null);
  const [userInfo, setUserInfo] = useState<FacebookUserInfo | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const { toast } = useToast();

  // Facebook App configuration
  const FACEBOOK_APP_ID = '1089937202820114';
  const REQUIRED_PERMISSIONS = [
    'email',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_show_list',
    'pages_messaging',
    'pages_read_user_content',
    'publish_to_groups'
  ];

  useEffect(() => {
    initializeFacebookSDK();
  }, []);

  const initializeFacebookSDK = () => {
    if (window.FB) {
      setIsSDKLoaded(true);
      checkLoginStatus();
      return;
    }

    // Load Facebook SDK
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v21.0'
      });

      setIsSDKLoaded(true);
      checkLoginStatus();
    };

    // Load SDK script
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.head.appendChild(script);
  };

  const checkLoginStatus = () => {
    if (!window.FB) return;

    window.FB.getLoginStatus((response: FacebookLoginStatus) => {
      setLoginStatus(response);
      if (response.status === 'connected') {
        fetchUserInfo();
        fetchUserPermissions();
      }
    });
  };

  const fetchUserInfo = () => {
    if (!window.FB) return;

    window.FB.api('/me', { fields: 'id,name,email,picture' }, (response: FacebookUserInfo) => {
      if (response && !response.error) {
        setUserInfo(response);
      }
    });
  };

  const fetchUserPermissions = () => {
    if (!window.FB) return;

    window.FB.api('/me/permissions', (response: any) => {
      if (response && response.data) {
        const grantedPermissions = response.data
          .filter((perm: any) => perm.status === 'granted')
          .map((perm: any) => perm.permission);
        setPermissions(grantedPermissions);
      }
    });
  };

  const handleCustomLogin = () => {
    if (!window.FB || !isSDKLoaded) {
      toast({
        title: "SDK Not Ready",
        description: "Facebook SDK is still loading. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Custom login dialog with specific permissions
    window.FB.login((response: FacebookLoginStatus) => {
      setIsLoading(false);
      
      if (response.status === 'connected') {
        setLoginStatus(response);
        fetchUserInfo();
        fetchUserPermissions();
        
        toast({
          title: "Login Successful",
          description: "Successfully connected to Facebook with required permissions.",
        });

        // Send access token to backend
        if (response.authResponse) {
          sendTokenToBackend(response.authResponse.accessToken);
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Unable to connect to Facebook. Please check your permissions.",
          variant: "destructive"
        });
      }
    }, {
      scope: REQUIRED_PERMISSIONS.join(','),
      return_scopes: true,
      auth_type: 'rerequest'
    });
  };

  const sendTokenToBackend = async (accessToken: string) => {
    try {
      const response = await fetch('/api/facebook/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: accessToken,
          permissions: permissions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send token to backend');
      }

      const data = await response.json();
      console.log('Token sent to backend successfully:', data);
    } catch (error) {
      console.error('Error sending token to backend:', error);
      toast({
        title: "Backend Sync Failed",
        description: "Connected to Facebook but failed to sync with backend.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    if (!window.FB) return;

    window.FB.logout((response: any) => {
      setLoginStatus(null);
      setUserInfo(null);
      setPermissions([]);
      
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from Facebook.",
      });
    });
  };

  const requestAdditionalPermissions = () => {
    if (!window.FB) return;

    setIsLoading(true);

    const missingPermissions = REQUIRED_PERMISSIONS.filter(
      perm => !permissions.includes(perm)
    );

    if (missingPermissions.length === 0) {
      setIsLoading(false);
      toast({
        title: "All Permissions Granted",
        description: "You have already granted all required permissions.",
      });
      return;
    }

    window.FB.login((response: FacebookLoginStatus) => {
      setIsLoading(false);
      
      if (response.status === 'connected') {
        fetchUserPermissions();
        toast({
          title: "Permissions Updated",
          description: "Successfully updated Facebook permissions.",
        });
      }
    }, {
      scope: missingPermissions.join(','),
      auth_type: 'rerequest'
    });
  };

  const getPermissionStatus = () => {
    const granted = permissions.filter(perm => REQUIRED_PERMISSIONS.includes(perm));
    const missing = REQUIRED_PERMISSIONS.filter(perm => !permissions.includes(perm));
    return { granted, missing };
  };

  if (!isSDKLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Loading Facebook SDK...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { granted, missing } = getPermissionStatus();
  const isConnected = loginStatus?.status === 'connected';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Facebook className="h-5 w-5 text-blue-600" />
          <span>Facebook Integration</span>
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Connect your Facebook account to enable automated posting, customer message monitoring, and advanced analytics.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleCustomLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4" />
                  <span>Connect Facebook Account</span>
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Info */}
            {userInfo && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {userInfo.picture && (
                  <img 
                    src={userInfo.picture.data.url} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{userInfo.name}</p>
                  {userInfo.email && (
                    <p className="text-sm text-gray-600">{userInfo.email}</p>
                  )}
                </div>
                <Badge variant="outline">
                  <User className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
            )}

            {/* Permissions Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Permission Status</h4>
              <div className="grid grid-cols-1 gap-2">
                {granted.map(permission => (
                  <div key={permission} className="flex items-center justify-between p-2 bg-green-50 rounded text-xs">
                    <span className="capitalize">{permission.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Granted
                    </Badge>
                  </div>
                ))}
                {missing.map(permission => (
                  <div key={permission} className="flex items-center justify-between p-2 bg-red-50 rounded text-xs">
                    <span className="capitalize">{permission.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {missing.length > 0 && (
                <Button 
                  onClick={requestAdditionalPermissions}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Grant Missing Permissions
                </Button>
              )}
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </div>

            {/* Access Token Info */}
            {loginStatus?.authResponse && (
              <Alert>
                <AlertDescription className="text-xs">
                  Access token active. Expires in: {Math.floor(parseInt(loginStatus.authResponse.expiresIn) / 3600)} hours
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacebookLoginButton;