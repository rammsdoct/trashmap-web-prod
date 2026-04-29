# PresaWatch Web — Deployment Guide

## Overview

PresaWatch Web is deployed on **Azure Static Web Apps** (Free tier) in **Canada Central** region.

Deployment is fully automated via GitHub Actions CI/CD pipeline. Every push to `main` triggers build + deploy.

---

## Architecture

```
GitHub repo (rammsdoct/trashmap-web-prod)
    ↓ push to main
    ↓
GitHub Actions CI/CD
    ├─ npm install
    ├─ npm run build → dist/
    └─ Deploy to Azure Static Web Apps
        ↓
Azure Static Web Apps (*.azurestaticapps.net)
    ├─ Serves SPA
    ├─ Auth: Firebase + Google Sign-In
    ├─ Maps: Google Maps API
    └─ Backend: Azure API endpoint
```

---

## Prerequisites

Before first deployment, ensure these are configured:

### 1. Azure Account
- **Account:** danke@dankenet.net / Rogue851129
- **Subscription:** Default Azure Subscription
- **Region:** Canada Central
- **Tier:** Free (included)

### 2. GitHub Repository
- **Repo:** https://github.com/rammsdoct/trashmap-web-prod
- **Visibility:** Public
- **Branch:** main (protected)

### 3. Firebase Project
- **Project:** presawatch
- **Account:** rammsdoct@gmail.com
- **Auth Methods:** Google Sign-In enabled

### 4. Google Cloud Console
- **Project:** PresaWatch
- **APIs:** Maps JavaScript API, OAuth 2.0 Consent Screen

---

## Pre-Deployment Checklist

Before first deploy, verify these configurations:

### GitHub Secrets

All environment variables are stored as GitHub Secrets (no hardcoding):

```
Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:

| Secret Name | Example | Source |
|---|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | (deployment token) | Azure Portal → Static Web App → Manage |
| `VITE_FIREBASE_API_KEY` | AIzaSyCJ-T_cwN6... | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | presawatch.firebaseapp.com | Firebase Console → Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | presawatch | Firebase Console → Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | presawatch.appspot.com | Firebase Console → Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 344850391677 | Firebase Console → Cloud Messaging |
| `VITE_FIREBASE_APP_ID` | 1:344850391677:web:... | Firebase Console → Project Settings |
| `VITE_GOOGLE_SIGNIN_CLIENT_ID` | 344850391677-1tb14ebp1hl2g4c... | Google Cloud Console → OAuth 2.0 Client IDs |
| `VITE_GOOGLE_MAPS_API_KEY` | AIzaSyAo-HNT-KZEs0lhff... | Google Cloud Console → API Keys |
| `VITE_API_URL` | https://trashmap-api-.../reports | Azure API Backend URL |

**Note:** VITE_API_URL should include `/reports` path (full endpoint).

### Azure Static Web App

1. Create resource in Azure Portal:
   - **Resource type:** Static Web App (Free)
   - **Region:** Canada Central
   - **Linked GitHub repo:** rammsdoct/trashmap-web-prod
   - **Branch:** main

2. Get deployment token:
   - Azure Portal → Static Web App → Manage Deployment Token
   - Copy full token → GitHub Settings → Secrets → `AZURE_STATIC_WEB_APPS_API_TOKEN`

### Firebase Configuration

1. **Add authorized domains:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `*.azurestaticapps.net`
   - Example: `presawatch-web-{random}.azurestaticapps.net`

2. **Verify Google Sign-In:**
   - Sign-In Providers → Google (enabled)
   - Web SDK configuration is present

### Google Cloud Console

1. **Maps API:**
   - Enabled: Maps JavaScript API
   - Restrictions: HTTP referrers
   - Allowed domains: `*.azurestaticapps.net`

2. **OAuth 2.0:**
   - Client type: Web application
   - Authorized origins: `https://*.azurestaticapps.net`
   - Authorized redirect URIs: `https://presawatch.firebaseapp.com/__/auth/handler`

### Backend CORS

The backend API (Azure API App Service) should accept requests from Static Web App:

```javascript
// Example CORS config (Node.js Express)
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',           // Local dev
    /\.azurestaticapps\.net$/          // All Azure Static Web Apps
  ]
}));
```

**Verify:** Make test request from deployed app to `/reports` endpoint.

---

## Deployment Process

### Automatic Deployment (Normal)

1. Make changes locally
2. Commit to `main` branch
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Feature: description"
   git push origin main
   ```
4. GitHub Actions automatically:
   - ✅ Checks out code
   - ✅ Installs Node 20
   - ✅ Runs `npm ci` (clean install)
   - ✅ Builds with `npm run build` (generates `dist/`)
   - ✅ Deploys to Azure Static Web Apps
5. Monitor deployment:
   - GitHub → Actions tab → Latest run
   - Azure Portal → Static Web App → Deployments

### Manual Build Test (Local)

Before pushing, test build locally:

```bash
# Set environment variables
export VITE_FIREBASE_API_KEY=your_key
export VITE_FIREBASE_AUTH_DOMAIN=presawatch.firebaseapp.com
# ... (set all other VITE_ variables)

# Build
npm run build

# Preview built output
npm run preview
```

---

## Monitoring & Logs

### GitHub Actions Logs

```
GitHub → rammsdoct/trashmap-web-prod
→ Actions tab
→ Latest "Deploy PresaWatch Web → Azure Static Web Apps"
→ build_and_deploy job
```

Key sections:
- **Install dependencies:** Logs npm version, cache hits
- **Build:** Vite output, bundle size
- **Deploy to Azure:** Deployment status, URL

### Azure Portal Logs

```
Azure Portal
→ Static Web Apps
→ [Your Web App Name]
→ Deployments
→ Latest deployment
→ Details (logs, performance)
```

### Health Check URL

Once deployed:
```
https://[app-name].azurestaticapps.net/
```

Expected: PresaWatch login page loads, Google Sign-In button appears.

---

## Troubleshooting

### Build Fails in GitHub Actions

**Check:** Environment variables in secrets are exactly named as expected (case-sensitive).

```bash
# View what was passed in workflow
GitHub → Actions → [Failed Run] → build_and_deploy → Build step
```

**Fix:** Update secrets in GitHub Settings.

### Deployment Succeeds But App Shows 404

**Cause:** `output_location: dist` in workflow doesn't match actual build output.

**Check:** 
```bash
npm run build
ls -la dist/
cat dist/index.html
```

**Fix:** Verify `output_location` in `.github/workflows/azure-static-web-apps.yml`:
```yaml
- name: Deploy to Azure Static Web Apps
  uses: Azure/static-web-apps-deploy@v1
  with:
    output_location: "dist"  # Must match your build output
```

### Firebase Auth Fails: "Unauthorized Domain"

**Cause:** Deployed domain not added to Firebase authorized list.

**Fix:**
1. Copy exact domain from Azure Portal (e.g., `presawatch-web-abc123.azurestaticapps.net`)
2. Firebase Console → Authentication → Authorized domains → Add
3. Or add wildcard: `*.azurestaticapps.net`

### Google Sign-In Fails: "Invalid Client ID"

**Cause:** `VITE_GOOGLE_SIGNIN_CLIENT_ID` secret not set or mismatched.

**Fix:**
1. Google Cloud Console → OAuth 2.0 Client IDs (type: Web application)
2. Copy Client ID exactly
3. GitHub Settings → Secrets → Update `VITE_GOOGLE_SIGNIN_CLIENT_ID`
4. Re-run deployment

### Maps Not Loading: "API Key Restricted"

**Cause:** Maps API key restricted to different domain or HTTP referrers not configured.

**Fix:**
1. Google Cloud Console → API Keys → [Your Maps Key]
2. Restrictions → HTTP referrers (websites)
3. Add: `*.azurestaticapps.net/*`

---

## Rollback

If deployment breaks production:

### Option 1: Revert Commit (Recommended)

```bash
# Identify bad commit
git log --oneline

# Revert
git revert <commit-sha>
git push origin main

# GitHub Actions will auto-deploy the revert
```

### Option 2: Redeploy Previous Build

In Azure Portal:
1. Static Web Apps → Deployments
2. Find last successful deployment
3. Click → "Redeploy"

---

## Performance & Optimization

### Bundle Size

After building, check:
```bash
npm run build
# Look at dist/ directory size
```

Vite will show bundle size breakdown.

### Deployment Time

Typical deployments take 2-5 minutes:
- Install deps: ~30s
- Build (Vite): ~20s
- Deploy to Azure: ~30s
- DNS propagation: ~1-2 min

---

## Security Considerations

### Secrets Management

✅ All sensitive values in GitHub Secrets  
✅ `.env.local` is gitignored (dev only)  
✅ No hardcoded API keys in source code  

### HTTPS

✅ Azure Static Web Apps provides free HTTPS  
✅ All connections encrypted  

### CORS

✅ Backend whitelists `*.azurestaticapps.net`  
✅ No open CORS (no `*` origin)  

### Authentication

✅ Firebase Auth: Server-validated tokens  
✅ Google OAuth: Uses official Google SDK  
✅ API: Bearer token in Authorization header  

---

## First-Time Setup Checklist

- [ ] Azure Static Web App created in Canada Central
- [ ] Deployment token retrieved and stored in `AZURE_STATIC_WEB_APPS_API_TOKEN` secret
- [ ] All 10 `VITE_*` secrets set in GitHub
- [ ] Firebase authorized domain includes `*.azurestaticapps.net`
- [ ] Google Maps API restricted to `*.azurestaticapps.net`
- [ ] Google Sign-In OAuth updated for Static Web App domain
- [ ] Backend CORS allows `*.azurestaticapps.net`
- [ ] Test push to `main` branch triggers GitHub Actions
- [ ] Deployment completes successfully (green checkmark)
- [ ] Web app loads at `https://[app-name].azurestaticapps.net/`
- [ ] Firebase login works
- [ ] Google Sign-In works
- [ ] Maps load and display
- [ ] API calls to backend succeed
- [ ] Rollback plan tested (able to revert commits)

---

## Support & Contacts

| Service | Contact | Account |
|---|---|---|
| Azure | danke@dankenet.net | Rogue851129 |
| GitHub | rammsdoct | (repo owner) |
| Firebase | rammsdoct@gmail.com | (project owner) |
| Google Cloud | (same as Firebase) | OAuth 2.0 Project |

---

## Additional Resources

- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions for Azure](https://github.com/Azure/static-web-apps-deploy)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

---

**Last Updated:** W7 Implementation  
**Status:** Ready for First Deployment  
**Build System:** Vite  
**Deployment Platform:** Azure Static Web Apps (Free)
