# W7 Deployment Setup — Manual Configuration Steps

Este archivo documenta los pasos manuales requeridos para completar el setup de deployment en Azure.

**Estado:** Documentación lista  
**Workflow:** ✅ Listo (espera secrets y Azure Static Web App)  
**Build:** ✅ Configurado (`npm run build` → `dist/`)

---

## Step 1: Create Azure Static Web App

### CLI (Recommended)

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create \
  --name presawatch-rg \
  --location canadacentral

# Create Static Web App
az staticwebapp create \
  --name presawatch-web-prod \
  --resource-group presawatch-rg \
  --source https://github.com/rammsdoct/trashmap-web-prod \
  --location canadacentral \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

### Azure Portal (Manual)

1. Go to: https://portal.azure.com
2. **Create a resource** → Search "Static Web App"
3. **Basics:**
   - Resource group: Create new: `presawatch-rg`
   - Name: `presawatch-web-prod`
   - Plan: **Free**
   - Region: **Canada Central**
4. **Deployment details:**
   - Source: **GitHub**
   - GitHub account: rammsdoct
   - Organization: rammsdoct
   - Repository: trashmap-web-prod
   - Branch: **main**
5. **Build details:**
   - Build presets: **Custom**
   - App location: **/**
   - API location: (leave empty)
   - Output location: **dist**
6. Click **Review + create** → **Create**

### Get Deployment Token

Once created:

1. Azure Portal → Static Web Apps → **presawatch-web-prod**
2. **Manage deployment token** (left sidebar)
3. Copy full token
4. **Store in GitHub Secrets:**
   - GitHub repo → Settings → Secrets and variables → Actions
   - New secret: `AZURE_STATIC_WEB_APPS_API_TOKEN` → Paste token

---

## Step 2: Set All GitHub Secrets

**Location:** https://github.com/rammsdoct/trashmap-web-prod/settings/secrets/actions

Create these secrets (values from `.env.local`):

```bash
AZURE_STATIC_WEB_APPS_API_TOKEN=<from Azure Portal>
VITE_FIREBASE_API_KEY=AIzaSyCJ-T_cwN6F-8SVOB48fIqqbTJSDtSoGz8
VITE_FIREBASE_AUTH_DOMAIN=presawatch.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=presawatch
VITE_FIREBASE_STORAGE_BUCKET=presawatch.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=344850391677
VITE_FIREBASE_APP_ID=1:344850391677:web:be62d08cb1fc8e68ce4714
VITE_GOOGLE_SIGNIN_CLIENT_ID=344850391677-1tb14ebp1hl2g4calkbnaamo49gle79f.apps.googleusercontent.com
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAo-HNT-KZEs0lhffiKyUUmpIhxoyb_kCM
VITE_API_URL=https://trashmap-api-presamordor-e0csfsedadffd9ey.canadacentral-01.azurewebsites.net/reports
```

**⚠️ IMPORTANT:** Do NOT expose these values. Each secret is encrypted and only available during CI/CD runs.

---

## Step 3: Firebase Configuration

### Add Authorized Domain

1. Go to: https://console.firebase.google.com
2. Project: **presawatch**
3. Authentication → Settings → Authorized domains
4. Click **Add domain**
5. Enter: `*.azurestaticapps.net` (wildcard for all Static Web Apps)
   - OR: Enter exact domain when known: `presawatch-web-prod.azurestaticapps.net`

### Verify Google Sign-In

1. Authentication → Sign-in method
2. **Google** must be **Enabled** (green toggle)
3. Web SDK configuration shows API keys (should match secrets)

---

## Step 4: Google Cloud Console Configuration

### Maps API

1. Go to: https://console.cloud.google.com
2. Project: **PresaWatch**
3. APIs & Services → API Keys
4. Open key used for Maps: (looks like `AIzaSyAo-HNT-KZEs0lhff...`)
5. **Key restrictions:**
   - Application type: **HTTP referrers (websites)**
   - Referrer list: Add line
     ```
     *.azurestaticapps.net/*
     ```
6. Save

### OAuth 2.0 Client ID

1. APIs & Services → Credentials
2. Find: Web application (OAuth 2.0 Client ID)
3. **Authorized origins:** Add
   ```
   https://*.azurestaticapps.net
   ```
4. **Authorized redirect URIs:** Already should have
   ```
   https://presawatch.firebaseapp.com/__/auth/handler
   ```
5. Save

---

## Step 5: Backend CORS Configuration

Verify backend (API App Service) allows Static Web App domain.

### Check Current CORS Settings

```bash
# If deployed on Azure API App Service:
# Azure Portal → App Service → [your-api] → CORS

# Should have:
# - Allowed origins: *.azurestaticapps.net
#   OR
# - Allowed origins: <specific domain>
```

### Update CORS (if needed)

**Option A: Allow Wildcard (Open)**
```bash
az webapp cors add --name <api-app-name> \
  --resource-group <rg-name> \
  --allowed-origins "*"
```

**Option B: Restrict to Azure Static Web Apps**
```bash
az webapp cors add --name <api-app-name> \
  --resource-group <rg-name> \
  --allowed-origins "https://*.azurestaticapps.net"
```

---

## Step 6: Test Deployment

### Trigger GitHub Actions

```bash
cd /path/to/trashmap-web-prod
git add .
git commit -m "W7: Azure deploy setup"
git push origin main
```

### Monitor Build

1. GitHub repo → Actions tab
2. Wait for "Deploy PresaWatch Web → Azure Static Web Apps" to run
3. Check workflow steps:
   - ✅ Checkout
   - ✅ Setup Node
   - ✅ Install dependencies
   - ✅ Build (should show dist/ created)
   - ✅ Deploy to Azure

### Verify Deployment

Once deployment succeeds:

1. **Get deployment URL:**
   - Azure Portal → Static Web App → Overview → URL
   - Example: `https://presawatch-web-abc123.azurestaticapps.net`

2. **Test in browser:**
   ```
   https://presawatch-web-abc123.azurestaticapps.net
   ```
   Expected:
   - ✅ Login page loads
   - ✅ "Sign in with Google" button appears
   - ✅ Maps visible (if on map page)
   - ✅ No 404 or 500 errors

3. **Test Firebase Login:**
   - Click "Sign in with Google"
   - Should open Google OAuth flow
   - Should return to app logged in

4. **Test API Calls:**
   - Go to any page that loads reports
   - Check DevTools → Network
   - API calls to `VITE_API_URL` should succeed (200 status)

---

## Troubleshooting During Setup

### Azure Static Web App fails to create

- **Error:** "Invalid repository"
  - Solution: Ensure GitHub repo is public or linked account has access
  
- **Error:** "Invalid branch"
  - Solution: Ensure `main` branch exists and is pushed
  
- **Error:** "Build failed"
  - Check Azure portal → Static Web App → Deployments → View logs

### Secrets not picked up in workflow

- **Symptom:** Build fails with "undefined" for VITE_* variables
- **Check:** GitHub Settings → Secrets are spelled exactly as in workflow
- **Fix:** Update secrets one by one, re-run workflow

### Firebase login fails

- **Error:** "Unauthorized domain"
- **Fix:** 
  1. Copy exact URL from browser (e.g., `presawatch-web-abc123.azurestaticapps.net`)
  2. Firebase Console → Authentication → Authorized domains → Add exact domain
  3. Wait 5-10 minutes for propagation
  4. Refresh app

### Maps not showing

- **Error:** "Maps API Key is restricted"
- **Fix:**
  1. Google Cloud Console → API Keys
  2. Edit Maps key → Restrictions → Add `*.azurestaticapps.net/*`
  3. Wait 5 minutes
  4. Hard refresh browser (Ctrl+Shift+R)

---

## Manual Testing Checklist

After deployment, test these:

- [ ] Page loads (no 404)
- [ ] Login page renders
- [ ] Google Sign-In button appears
- [ ] Can click "Sign in with Google"
- [ ] OAuth flow completes
- [ ] User logged in (see display name)
- [ ] Maps page loads (if applicable)
- [ ] Maps show tile layer
- [ ] Can interact with map (pan, zoom)
- [ ] API calls succeed (check Network tab)
- [ ] No CORS errors in console
- [ ] No undefined env variables in console
- [ ] Performance acceptable (load time < 3s)

---

## Post-Deployment

Once everything works:

1. **Create DNS record** (optional, for custom domain):
   ```bash
   # If you want: presawatch.example.com instead of *.azurestaticapps.net
   az staticwebapp hostname set \
     --name presawatch-web-prod \
     --resource-group presawatch-rg \
     --hostname presawatch.example.com
   ```

2. **Set up monitoring:**
   - Azure Portal → Static Web App → Monitoring
   - Enable Application Insights (optional)

3. **Configure caching:**
   - Azure Portal → Static Web App → Configuration
   - Set cache control headers for dist files

4. **Enable staging environment:**
   ```bash
   git push origin develop  # Creates staging slot automatically
   ```

---

## Quick Reference

| Item | Value |
|---|---|
| App Name | presawatch-web-prod |
| Resource Group | presawatch-rg |
| Region | Canada Central |
| Plan | Free |
| Repository | rammsdoct/trashmap-web-prod |
| Branch | main |
| Build Output | dist |
| Deployment | Automatic on push |
| Domain | *.azurestaticapps.net |

---

## Support Contacts

- **Azure:** danke@dankenet.net / Rogue851129
- **GitHub:** rammsdoct (repo owner)
- **Firebase:** rammsdoct@gmail.com
- **GCP:** Same as Firebase

---

**Last Updated:** W7 Implementation  
**Next:** Coordinate with other teams (W5/W6) before final deployment
