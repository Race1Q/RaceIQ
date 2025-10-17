# AI Features Deployment Guide for Azure

This guide covers deploying the AI features to Azure App Service with proper environment configuration.

## ✅ Pre-Deployment Checklist

- [ ] Gemini API key obtained from https://aistudio.google.com/app/apikey
- [ ] Tested locally with `node test-gemini.js`
- [ ] Confirmed model name works (`gemini-2.0-flash-exp`)
- [ ] Backend running successfully locally
- [ ] All code committed to Git (except `.env` and `test-gemini.js`)

## 🚀 Azure App Service Configuration

### Step 1: Configure Environment Variables

In **Azure Portal** → Your App Service → **Configuration** → **Application settings**

Add these environment variables:

```bash
# AI Configuration (REQUIRED)
AI_FEATURES_ENABLED=true
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
AI_NEWS_TTL_MIN=60
AI_BIO_TTL_H=48
AI_TRACK_TTL_H=24

# Environment (Important for cache path!)
NODE_ENV=production
```

**Important:** Make sure `NODE_ENV=production` is set! This enables the persistent cache path at `/home/.cache`.

### Step 2: Verify Other Required Variables

Ensure these are also set (you should already have them):

```bash
# Database
DATABASE_URL=postgresql://...your_supabase_url...

# Auth0
AUTH0_ISSUER_URL=https://dev-6mvzvr3totwc6rkd.us.auth0.com/
AUTH0_AUDIENCE=https://api.raceiq.dev
AUTH0_DOMAIN=dev-6mvzvr3totwc6rkd.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Port (Usually auto-set by Azure)
PORT=8080
```

### Step 3: Deploy Your Code

```bash
# Commit your changes (make sure .env is NOT committed!)
git add .
git commit -m "Add AI features with production-ready caching"
git push origin main

# Azure will auto-deploy if configured, or deploy manually:
# Via Azure CLI:
az webapp deployment source config-zip \
  --resource-group your-resource-group \
  --name your-app-name \
  --src backend.zip
```

### Step 4: Verify Deployment

After deployment, check the logs in Azure Portal → Your App Service → **Log stream**

Look for:
```
[Nest] ... LOG [PersistentCacheService] No existing cache file found, starting with empty cache
[Nest] ... LOG [GeminiService] Gemini service initialized with model: gemini-2.0-flash-exp
[Nest] ... LOG [NestApplication] Nest application successfully started
```

## 🧪 Testing in Production

### Test 1: Check API Quota Endpoint

```bash
curl https://your-app.azurewebsites.net/api/ai/quota
```

Expected response:
```json
{
  "remaining": 1500,
  "limit": 1500,
  "used": 0
}
```

### Test 2: Get AI News

```bash
curl https://your-app.azurewebsites.net/api/ai/news
```

First request will take 2-5 seconds (calling Gemini).
Second request will be instant (cached).

### Test 3: Get Driver Bio

```bash
curl https://your-app.azurewebsites.net/api/ai/driver/609/bio
```

### Test 4: Get Track Preview

```bash
curl https://your-app.azurewebsites.net/api/ai/track/monza/preview
```

## 📁 Cache Persistence on Azure

### How It Works

```
Azure App Service Container
├── /home/.cache/          ← Persistent storage (survives restarts!)
│   └── ai-cache.json
├── /app/                  ← Your application code (ephemeral)
│   └── backend/
└── Environment Variables  ← Configuration
```

Azure App Service automatically provides persistent storage at `/home/*`. Your cache will:

✅ **Survive app restarts**  
✅ **Survive redeployments** (in most cases)  
✅ **Be shared across all users**  
✅ **Persist between container updates**  

### Cache Location by Environment

| Environment | Cache Path | Persistence |
|------------|------------|-------------|
| **Local Development** | `./backend/.cache/ai-cache.json` | Git-ignored |
| **Azure Production** | `/home/.cache/ai-cache.json` | Persistent storage |

This is automatically handled by the code:
```typescript
process.env.NODE_ENV === 'production' 
  ? join('/home', '.cache')  // Azure persistent
  : join(process.cwd(), '.cache')  // Local
```

## 📊 Monitoring in Production

### Monitor API Usage

Create a simple monitoring endpoint or check logs:

```bash
# View real-time logs
az webapp log tail --name your-app-name --resource-group your-resource-group

# Look for these log messages:
[GeminiService] Gemini service initialized with model: gemini-2.0-flash-exp
[QuotaService] AI API calls today: 10/1500
[PersistentCacheService] Loaded 5 cached AI responses from disk
[PersistentCacheService] Cache HIT: news:f1
```

### Check Quota via API

```bash
# Get current quota status
curl https://your-app.azurewebsites.net/api/ai/quota

# Response shows usage:
{
  "remaining": 1485,
  "limit": 1500,
  "used": 15
}
```

### Cache Statistics

The cache file at `/home/.cache/ai-cache.json` will look like:

```json
{
  "news:f1": {
    "data": { ... },
    "expiresAt": 1760038362090
  },
  "bio:609:2025": {
    "data": { ... },
    "expiresAt": 1760207721283
  }
}
```

## 🔧 Troubleshooting

### Issue: "GEMINI_API_KEY is not configured"

**Solution:** Check Azure App Service → Configuration → Application settings
- Verify `GEMINI_API_KEY` is set
- Click **Save** after adding
- Restart the app

### Issue: "GEMINI_MODEL is not configured"

**Solution:** Add `GEMINI_MODEL=gemini-2.0-flash-exp` to Application settings

### Issue: All requests return fallback data

**Symptoms:** News shows "F1 news is temporarily unavailable"

**Debug steps:**
1. Check logs for Gemini API errors
2. Verify `NODE_ENV=production` is set
3. Test API key with local test script
4. Check Azure App Service logs for errors

### Issue: Cache not persisting across restarts

**Solution:** Verify `NODE_ENV=production` is set in Azure configuration.

Without this, the cache will use `process.cwd()` which is ephemeral.

### Issue: 404 errors on all Gemini models

**Solution:** Your API key might be invalid or for a different service.
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Update `GEMINI_API_KEY` in Azure settings
4. Restart the app

## 📈 Performance Expectations

### First Request (Cache Miss)
```
Response time: 2-5 seconds
Gemini API call: Yes
Status: 200 OK
```

### Subsequent Requests (Cache Hit)
```
Response time: 50-150ms
Gemini API call: No
Status: 200 OK
```

### After Cache Expires
- News: Refreshes every 60 minutes
- Driver Bios: Refreshes every 48 hours
- Track Previews: Refreshes every 24 hours

## 💰 Free Tier Usage Estimate

### Daily API Calls (Typical)

| Feature | TTL | Calls/Day |
|---------|-----|-----------|
| News | 60 min | 24 |
| Driver Bios (20 drivers) | 48 hours | 10 |
| Track Previews (10 tracks) | 24 hours | 10 |
| **Total** | | **~44 calls/day** |

**Usage:** ~3% of daily quota (1,500 requests/day)  
**Headroom:** 97% available for traffic spikes  

### With 1000 Users/Day

Thanks to caching, all 1000 users share the same cached responses!
- First user triggers API call → cached
- Next 999 users get cached response → no API calls

**Result:** Still only ~44 API calls/day regardless of user count! 🎉

## 🔒 Security Best Practices

### ✅ DO:
- Set environment variables in Azure Portal (not in code)
- Use `.gitignore` for `.env` files
- Rotate API keys periodically
- Monitor quota to prevent abuse
- Use HTTPS for all API calls (automatic on Azure)

### ❌ DON'T:
- Commit API keys to Git
- Share API keys in documentation
- Use the same API key for dev and production
- Expose API keys in frontend code

## 📝 Post-Deployment Checklist

After deploying, verify:

- [ ] Backend health check: `GET /api/health` (if you have one)
- [ ] AI quota endpoint: `GET /api/ai/quota`
- [ ] AI news endpoint: `GET /api/ai/news`
- [ ] Driver bio endpoint: `GET /api/ai/driver/609/bio`
- [ ] Track preview endpoint: `GET /api/ai/track/monza/preview`
- [ ] Check Azure logs for startup messages
- [ ] Verify cache is being created at `/home/.cache/ai-cache.json`
- [ ] Test frontend integration at your Static Web App URL
- [ ] Monitor quota over 24 hours to ensure within limits

## 🎯 Frontend Configuration

Your frontend (Azure Static Web App) needs to point to the backend API.

In `frontend/public/api-base.js` or similar:
```javascript
const API_BASE_URL = 'https://your-backend-app.azurewebsites.net';
```

Or use environment variables in Static Web App configuration.

## 🚨 Quota Alerts (Optional)

Set up alerts if you approach quota limits:

### Create a custom monitoring endpoint:

```typescript
// In ai.controller.ts
@Get('quota/alert')
async getQuotaAlert() {
  const remaining = this.quotaService.getRemaining();
  if (remaining < 300) {
    return { alert: true, message: 'Approaching daily quota limit!' };
  }
  return { alert: false };
}
```

### Use Azure Application Insights:

Configure custom metrics to track API usage and set alerts.

## 📚 Additional Resources

- **Google AI Studio:** https://aistudio.google.com/
- **Gemini API Docs:** https://ai.google.dev/docs
- **Azure App Service Docs:** https://learn.microsoft.com/en-us/azure/app-service/
- **Azure Persistent Storage:** https://learn.microsoft.com/en-us/azure/app-service/configure-connect-to-azure-storage

## ✅ Success Indicators

Your deployment is successful when:

1. ✅ All 3 AI endpoints return valid data (not fallback)
2. ✅ Cache file exists at `/home/.cache/ai-cache.json` (check via SSH/Kudu)
3. ✅ Second request to same endpoint is much faster (cached)
4. ✅ Logs show: `"Gemini service initialized with model: gemini-2.0-flash-exp"`
5. ✅ Quota endpoint shows reasonable usage (< 100 calls/day)
6. ✅ Frontend displays AI-generated content with "AI-generated" badges

---

**Ready to Deploy?** Follow the steps above and your AI features will work perfectly in production! 🚀

