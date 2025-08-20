# Fix for "Unable to verify authorization code" Error

This error can occur due to several reasons:

## 1. Browser Cookie Issues
The most common cause is corrupted cookies or localStorage data from previous auth attempts.

**Fix:**
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. On the left sidebar, under "Storage", click "Clear site data"
4. Refresh the page and try again

## 2. Time Sync Issues
If your computer's clock is out of sync, OAuth can fail.

**Fix:**
- Make sure your computer's date and time are set correctly
- On Mac: System Preferences → Date & Time → Set date and time automatically

## 3. Supabase Session Issues
Sometimes Supabase's session handling gets stuck.

**Fix - Try Manual Session Clear:**
Open the browser console and run:
```javascript
localStorage.clear()
sessionStorage.clear()
// Delete all cookies for localhost
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

## 4. Try Different Browser
Try logging in using:
- Chrome Incognito mode
- A different browser (Firefox, Safari)
- This will rule out browser-specific issues

## 5. Check Network Tab
1. Open DevTools Network tab
2. Try to login
3. Look for the OAuth callback request
4. Check if there are any failed requests or specific error messages

## 6. Temporary Workaround
Use the "Use Email Instead" option to create an account with email/password while we debug the OAuth issue.