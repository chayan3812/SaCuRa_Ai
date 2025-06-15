# Facebook OAuth Configuration Guide

## Current OAuth Flow Status
✅ OAuth routes configured in application
✅ Callback handling implemented 
✅ Token exchange working
⚠️ Facebook App redirect URI configuration needed

## Required Facebook App Configuration

### In your Facebook App (Meta Developer Console):

1. **Valid OAuth Redirect URIs** - Add these URLs:
   - `https://sa-cura-live-sopiahank.replit.app/api/facebook/callback`
   - `https://sa-cura-live-sopiahank.replit.app/`

2. **App Domain** - Add:
   - `sa-cura-live-sopiahank.replit.app`

3. **Required Permissions** - Ensure these are approved:
   - pages_manage_metadata
   - pages_read_engagement
   - pages_manage_posts
   - pages_read_user_content
   - business_management

## Current OAuth Flow:
1. User clicks "Connect New Page" button
2. Redirects to: `/api/facebook/auth`
3. Application generates Facebook OAuth URL
4. User is redirected to Facebook's authorization page (EXTERNAL - This is correct!)
5. User authorizes the app on Facebook
6. Facebook redirects back to: `/api/facebook/callback`
7. Application exchanges code for access token
8. Connected pages are stored in database
9. User is redirected back to dashboard with success message

## Why External Page Appears:
The external Facebook page is REQUIRED by Facebook's OAuth security standards. Users must authenticate directly on Facebook's servers, not within your application, to ensure security and prevent credential theft.

## Next Steps:
1. Log into Meta Developer Console (developers.facebook.com)
2. Navigate to your app (ID: 4026499934285415)
3. Go to "Facebook Login" → "Settings"
4. Add the redirect URI: `https://sa-cura-live-sopiahank.replit.app/api/facebook/callback`
5. Save changes
6. Test the OAuth flow again

## Testing the Flow:
Once configured, the complete flow will work:
- Click "Connect New Page"
- Authorize on Facebook (external page - this is normal!)
- Get redirected back to your dashboard
- See connected Facebook pages in the Connected Accounts section