# Deployment Guide - Cache Busting Strategy

## Overview

This guide explains how to deploy updates to the Workout Tracker app with proper cache management to ensure users always see the latest version.

## The Problem

Service workers cache the app for offline access, but this means users may see old versions even after you deploy updates. The difference between regular and incognito sessions was caused by:
- **Regular sessions**: Served cached (old) version
- **Incognito sessions**: Always fetched fresh version (no service worker)

## The Solution

We've implemented an automatic cache-busting strategy with user notifications.

### Components

1. **Service Worker Versioning** (`public/service-worker.js`)
   - Includes `APP_VERSION` constant
   - Clears old caches automatically
   - Listens for skip waiting messages

2. **Update Notification Component** (`src/components/UpdateNotification.jsx`)
   - Detects when new version is available
   - Shows user-friendly notification banner
   - Allows users to update immediately or later

3. **Version Tracking**
   - Stores version in localStorage
   - Compares with new version on load
   - Triggers notification when versions differ

## Deployment Process

### Step 1: Update Version Number

Before deploying changes, increment the version in **TWO** places:

**File 1: `public/service-worker.js`**
```javascript
const APP_VERSION = 'v2.0.1'; // <-- Increment this
```

**File 2: `src/components/UpdateNotification.jsx`**
```javascript
const APP_VERSION = 'v2.0.1'; // <-- Match the service worker version
```

### Step 2: Commit and Deploy

```bash
git add .
git commit -m "Release v2.0.1: [Description of changes]"
git push origin main
```

Your deployment platform (Vercel, Netlify, etc.) will automatically deploy.

### Step 3: What Happens for Users

1. **First visit after deployment:**
   - New service worker detected
   - Update notification appears at bottom of screen
   - User can click "Update Now" or "Later"

2. **Click "Update Now":**
   - Service worker updated
   - Page reloads automatically
   - Fresh version loaded

3. **Click "Later":**
   - Notification dismissed
   - Will check again on next page load

## Version Numbering

Use semantic versioning: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (v2.0.0 → v3.0.0)
- **MINOR**: New features (v2.0.0 → v2.1.0)
- **PATCH**: Bug fixes (v2.0.0 → v2.0.1)

Examples:
- `v2.0.0` → `v2.0.1` (bug fix)
- `v2.0.1` → `v2.1.0` (new feature)
- `v2.1.0` → `v3.0.0` (major redesign)

## Testing the Update Flow

### Local Testing

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Build and preview:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Test update notification:**
   - Load the app (version v2.0.0)
   - Change version to v2.0.1 in both files
   - Rebuild: `npm run build && npm run preview`
   - Reload the page
   - You should see the update notification

### Production Testing

1. Deploy version v2.0.0
2. Visit site and use app normally
3. Deploy version v2.0.1
4. Reload the page (or wait 60 seconds for auto-check)
5. Update notification should appear
6. Click "Update Now" to verify it works

## Manual Cache Clearing (For Users)

If a user doesn't see updates, they can manually clear cache:

**Chrome/Edge:**
1. Press F12 (DevTools)
2. Go to "Application" tab
3. Click "Service Workers"
4. Click "Unregister"
5. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Firefox:**
1. Press F12 (DevTools)
2. Go to "Storage" tab
3. Find "Service Workers"
4. Click "Unregister"
5. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Troubleshooting

### Issue: Users Not Seeing Update Notification

**Possible causes:**
1. Version numbers don't match in both files
2. Service worker not registered properly
3. Browser cache needs clearing

**Solution:**
1. Verify versions match in both files
2. Check browser console for service worker errors
3. Try hard refresh or clear cache manually

### Issue: Update Button Does Nothing

**Possible causes:**
1. Service worker message not sent properly
2. Page not reloading

**Solution:**
1. Check browser console for errors
2. Try closing and reopening the browser
3. Clear cache manually

### Issue: Old Version Still Showing After Update

**Possible causes:**
1. Service worker cache not cleared
2. Browser has aggressive caching

**Solution:**
1. Wait 60 seconds for auto-update check
2. Close all tabs and reopen
3. Clear browser cache manually

## Best Practices

1. **Always increment version** before deploying changes
2. **Test locally** before deploying to production
3. **Use descriptive commit messages** with version number
4. **Document breaking changes** in version notes
5. **Monitor** for user reports of caching issues

## Quick Reference

| Action | File(s) to Update | Version Change |
|--------|------------------|----------------|
| Bug fix | Both files | v2.0.0 → v2.0.1 |
| New feature | Both files | v2.0.0 → v2.1.0 |
| Breaking change | Both files | v2.0.0 → v3.0.0 |

## Emergency Cache Clear

If you need to force all users to clear their cache immediately:

1. Change cache name in service worker:
   ```javascript
   const CACHE_NAME = `workout-tracker-${APP_VERSION}-emergency`;
   ```

2. Deploy immediately

3. All old caches will be deleted on next visit

## Support

For issues with the cache-busting system:
1. Check browser console for errors
2. Verify service worker is registered
3. Check if update notification component is rendering
4. Review service worker lifecycle in DevTools

---

**Current Version**: v2.0.0  
**Last Updated**: January 12, 2026
