# W7 Deployment — Quick Reference

## Status: ✅ READY FOR MANUAL CONFIGURATION

All code, documentation, and CI/CD workflow are complete.  
Awaiting Azure/GitHub/Firebase/GCP console configuration.

---

## 📊 Deliverables Completed

| Item | File | Status |
|---|---|---|
| Deployment Guide | `DEPLOY.md` | ✅ Complete |
| Manual Setup Steps | `DEPLOYMENT_STEPS.md` | ✅ Complete |
| CI/CD Workflow | `.github/workflows/azure-static-web-apps.yml` | ✅ Ready |
| Code Build Config | `vite.config.js` + `package.json` | ✅ Ready |
| Git Commit | `83926c6` | ✅ Created |

---

## 🎯 What's Configured

### Code & Build
- ✅ Vite build: `npm run build` → `dist/`
- ✅ Environment variables: All 10 VITE_* vars referenced
- ✅ GitHub repo: Public, main branch available

### GitHub Actions Workflow
- ✅ Trigger: On push to main
- ✅ Build: Node 20 + npm ci + npm run build
- ✅ Deploy: Azure Static Web Apps action v1
- ✅ Secrets: All 10 referenced with correct names
  ```
  AZURE_STATIC_WEB_APPS_API_TOKEN
  VITE_FIREBASE_API_KEY
  VITE_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_PROJECT_ID
  VITE_FIREBASE_STORAGE_BUCKET
  VITE_FIREBASE_MESSAGING_SENDER_ID
  VITE_FIREBASE_APP_ID
  VITE_GOOGLE_SIGNIN_CLIENT_ID
  VITE_GOOGLE_MAPS_API_KEY
  VITE_API_URL
  ```

### Documentation
- ✅ Full deployment guide: Monitoring, troubleshooting, rollback
- ✅ Step-by-step console configuration
- ✅ Security considerations
- ✅ Performance notes

---

## ⏳ What Needs Manual Configuration

### 1️⃣ Azure Portal (5 min)

```
Azure Portal → Create Static Web App
├─ Name: presawatch-web-prod
├─ Region: Canada Central
├─ Plan: Free
├─ GitHub Repo: rammsdoct/trashmap-web-prod
├─ Branch: main
├─ Output: dist
└─ → Get Deployment Token → GitHub Secret: AZURE_STATIC_WEB_APPS_API_TOKEN
```

**Resource:** See DEPLOYMENT_STEPS.md → Step 1

### 2️⃣ GitHub Settings (3 min)

```
GitHub Settings → Secrets and variables → Actions
├─ AZURE_STATIC_WEB_APPS_API_TOKEN (from Azure)
├─ VITE_FIREBASE_API_KEY
├─ VITE_FIREBASE_AUTH_DOMAIN
├─ VITE_FIREBASE_PROJECT_ID
├─ VITE_FIREBASE_STORAGE_BUCKET
├─ VITE_FIREBASE_MESSAGING_SENDER_ID
├─ VITE_FIREBASE_APP_ID
├─ VITE_GOOGLE_SIGNIN_CLIENT_ID
├─ VITE_GOOGLE_MAPS_API_KEY
└─ VITE_API_URL
```

**Resource:** See DEPLOYMENT_STEPS.md → Step 2  
**Values:** From .env.local in repo (not committed)

### 3️⃣ Firebase Console (2 min)

```
Firebase Console → presawatch project
├─ Authentication → Authorized domains
│  └─ Add: *.azurestaticapps.net
└─ Verify: Google Sign-In enabled
```

**Resource:** See DEPLOYMENT_STEPS.md → Step 3

### 4️⃣ Google Cloud Console (3 min)

```
Google Cloud Console → PresaWatch project
├─ Maps API Key → Restrictions
│  └─ HTTP referrers: *.azurestaticapps.net/*
└─ OAuth 2.0 → Web app credentials
   └─ Authorized origins: https://*.azurestaticapps.net
```

**Resource:** See DEPLOYMENT_STEPS.md → Step 4

### 5️⃣ Backend CORS (1 min)

```
Azure API App Service → CORS
└─ Allowed origins: https://*.azurestaticapps.net OR *
```

**Resource:** See DEPLOYMENT_STEPS.md → Step 5

---

## 🚀 Quick Start (After Configuration)

1. **Complete manual config above** (~15 minutes)

2. **Test deployment:**
   ```bash
   cd /path/to/trashmap-web-prod
   git add .
   git commit -m "Test: triggering deployment"
   git push origin main
   ```

3. **Monitor build:**
   - GitHub → Actions tab
   - Find "Deploy PresaWatch Web → Azure Static Web Apps"
   - Watch logs

4. **Test deployed app:**
   - Get URL from Azure Portal: Static Web App → Overview
   - Visit: https://[app-name].azurestaticapps.net
   - Test login, maps, API calls

---

## 📋 Verification Checklist

After configuration, verify these before declaring ready:

```
AZURE SETUP:
  [ ] Static Web App created in Canada Central
  [ ] Deployment token in GitHub AZURE_STATIC_WEB_APPS_API_TOKEN
  [ ] App name matches GitHub Actions (if applicable)

GITHUB SECRETS:
  [ ] All 10 VITE_* secrets set (not empty)
  [ ] Secret names are case-sensitive and exact
  [ ] AZURE_STATIC_WEB_APPS_API_TOKEN is full token (not truncated)

FIREBASE:
  [ ] *.azurestaticapps.net in authorized domains
  [ ] Google Sign-In enabled (green toggle)
  [ ] Project ID matches VITE_FIREBASE_PROJECT_ID

GOOGLE CLOUD:
  [ ] Maps API key restricted to *.azurestaticapps.net/*
  [ ] OAuth Client ID includes Static Web App origins
  [ ] Web app credentials type (not service account)

BACKEND:
  [ ] CORS allows *.azurestaticapps.net OR open
  [ ] /reports endpoint responding to GET requests
  [ ] Auth token validation working

GITHUB:
  [ ] main branch exists and is up to date
  [ ] .github/workflows/azure-static-web-apps.yml present
  [ ] Workflow file not modified (using standard version)

CODEBASE:
  [ ] DEPLOY.md in repo root
  [ ] DEPLOYMENT_STEPS.md in repo root
  [ ] W7 commit created (83926c6)
  [ ] npm run build works locally
  [ ] dist/ folder created by build
```

---

## 🔄 First Deployment (Test Run)

**Expected Timeline:** ~5-10 minutes

1. Push commit to main
2. GitHub Actions starts within 30 seconds
3. Build phase: ~20-30 seconds
4. Deploy phase: ~30-60 seconds
5. Propagation: ~1-2 minutes
6. Access at deployed URL

**Success Criteria:**
- ✅ All workflow steps green (checkmarks)
- ✅ Page loads without 404
- ✅ Login page visible
- ✅ Google Sign-In button clickable
- ✅ Maps render (if applicable)
- ✅ No console errors

---

## 🐛 Troubleshooting

### Build Fails
→ Check GitHub Actions logs → See DEPLOY.md Troubleshooting section

### Deployment succeeds but app shows 404
→ Verify output_location: "dist" in workflow → Check dist/ folder exists locally

### Firebase auth fails
→ Add exact domain to Firebase authorized domains (wait 5 min for propagation)

### Maps not loading
→ Add domain to Google Maps API restrictions → Hard refresh (Ctrl+Shift+R)

---

## 📞 Support

| Issue | Reference |
|---|---|
| Full deployment guide | `DEPLOY.md` |
| Step-by-step setup | `DEPLOYMENT_STEPS.md` |
| Troubleshooting | `DEPLOY.md` → Troubleshooting section |
| Rollback procedure | `DEPLOY.md` → Rollback section |

---

## 📝 Credentials Reference

| Service | Account | Password |
|---|---|---|
| Azure | danke@dankenet.net | Rogue851129 |
| GitHub | rammsdoct | (repo owner, use personal token) |
| Firebase | rammsdoct@gmail.com | 4431851129rogue |
| Google Cloud | Same as Firebase | (Same) |

---

## 🎬 Next Milestones

1. ✅ W7 Code Ready (current)
2. ⏳ **Manual Configuration** (15 min, user action)
3. ⏳ First Deployment Test (push to main)
4. ⏳ Production Ready (after smoke tests pass)
5. ⏳ Monitoring & Maintenance (ongoing)

---

**Created:** W7 Implementation  
**Status:** Code & Documentation Complete, Awaiting Portal Configuration  
**Estimated Setup Time:** 15-20 minutes  
**Estimated First Deploy Time:** 5-10 minutes
