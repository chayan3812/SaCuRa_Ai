// Facebook Authentication Service with Login Button Integration
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
    statusChangeCallback: (response: FacebookLoginResponse) => void;
    checkLoginState: () => void;
  }
}

export interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  };
}

export interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export class FacebookAuthService {
  private static instance: FacebookAuthService;
  private isInitialized = false;
  private loginCallbacks: ((response: FacebookLoginResponse) => void)[] = [];
  private currentUser: FacebookUserInfo | null = null;
  private currentToken: string | null = null;

  static getInstance(): FacebookAuthService {
    if (!FacebookAuthService.instance) {
      FacebookAuthService.instance = new FacebookAuthService();
    }
    return FacebookAuthService.instance;
  }

  constructor() {
    this.setupGlobalCallbacks();
    this.waitForFBInit();
  }

  private setupGlobalCallbacks() {
    // Global status change callback for Facebook SDK
    window.statusChangeCallback = (response: FacebookLoginResponse) => {
      console.log('Facebook login status:', response);
      this.handleStatusChange(response);
    };

    // Global login state checker for login button
    window.checkLoginState = () => {
      if (window.FB) {
        window.FB.getLoginStatus((response: FacebookLoginResponse) => {
          window.statusChangeCallback(response);
        });
      }
    };
  }

  private waitForFBInit() {
    const checkFB = () => {
      if (window.FB) {
        this.isInitialized = true;
        this.checkLoginStatus();
      } else {
        setTimeout(checkFB, 100);
      }
    };
    checkFB();
  }

  private handleStatusChange(response: FacebookLoginResponse) {
    switch (response.status) {
      case 'connected':
        // User logged into Facebook and your app
        this.currentToken = response.authResponse?.accessToken || null;
        this.fetchUserInfo();
        break;
      case 'not_authorized':
        // User logged into Facebook but not your app
        this.currentUser = null;
        this.currentToken = null;
        break;
      case 'unknown':
        // User not logged into Facebook
        this.currentUser = null;
        this.currentToken = null;
        break;
    }

    // Notify all registered callbacks
    this.loginCallbacks.forEach(callback => callback(response));
  }

  private async fetchUserInfo() {
    if (!window.FB || !this.currentToken) return;

    return new Promise<void>((resolve) => {
      window.FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo: FacebookUserInfo) => {
        if (userInfo && !userInfo.error) {
          this.currentUser = userInfo;
        }
        resolve();
      });
    });
  }

  // Public API Methods
  checkLoginStatus(): Promise<FacebookLoginResponse> {
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve({ status: 'unknown' });
        return;
      }

      window.FB.getLoginStatus((response: FacebookLoginResponse) => {
        this.handleStatusChange(response);
        resolve(response);
      });
    });
  }

  login(permissions: string[] = ['email', 'pages_show_list', 'pages_read_engagement']): Promise<FacebookLoginResponse> {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      window.FB.login((response: FacebookLoginResponse) => {
        this.handleStatusChange(response);
        resolve(response);
      }, { scope: permissions.join(',') });
    });
  }

  logout(): Promise<void> {
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve();
        return;
      }

      window.FB.logout(() => {
        this.currentUser = null;
        this.currentToken = null;
        resolve();
      });
    });
  }

  getCurrentUser(): FacebookUserInfo | null {
    return this.currentUser;
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }

  isConnected(): boolean {
    return !!this.currentToken && !!this.currentUser;
  }

  onStatusChange(callback: (response: FacebookLoginResponse) => void): () => void {
    this.loginCallbacks.push(callback);
    
    return () => {
      const index = this.loginCallbacks.indexOf(callback);
      if (index > -1) {
        this.loginCallbacks.splice(index, 1);
      }
    };
  }

  getUserPages(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!window.FB || !this.currentToken) {
        reject(new Error('Not authenticated'));
        return;
      }

      window.FB.api('/me/accounts', (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.data || []);
        }
      });
    });
  }

  getPageAccessToken(pageId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.FB || !this.currentToken) {
        reject(new Error('Not authenticated'));
        return;
      }

      window.FB.api(`/${pageId}`, { fields: 'access_token' }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.access_token);
        }
      });
    });
  }

  async subscribeToPageWebhooks(pageId: string, fields: string[] = ['feed', 'messages']): Promise<boolean> {
    try {
      const pageToken = await this.getPageAccessToken(pageId);
      
      const response = await fetch('/api/facebook/webhook/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          accessToken: pageToken,
          fields
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error subscribing to webhooks:', error);
      return false;
    }
  }
}

export const facebookAuth = FacebookAuthService.getInstance();