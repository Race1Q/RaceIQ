# AI Features Setup Guide

## Step 1: Get Your Gemini API Key

1. Visit **https://aistudio.google.com/app/apikey**
2. Click **"Get API key"** or **"Create API key"**
3. Select **"Create API key in new project"** (or use an existing project)
4. Copy the API key (it starts with `AIza...`)

**Important:** Make sure you're getting a **Google AI Studio** API key, NOT a Vertex AI key!

## Step 2: Test Your API Key

Before setting up the backend, let's verify your API key works:

1. **Edit the test script:**
   ```bash
   # Open backend/test-gemini.js
   # Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key
   ```

2. **Run the test:**
   ```bash
   cd backend
   node test-gemini.js
   ```

3. **Expected output:**
   ```
   📋 Attempting to list available models...
   ✅ Available models for your API key:
      - gemini-2.0-flash-exp
      - gemini-1.5-pro
      - gemini-1.5-flash
   
   🔍 Testing Gemini API with different model names...
   Testing: gemini-2.0-flash-exp
   ✅ SUCCESS with "gemini-2.0-flash-exp"
      Response: Hello
      ➡️ USE THIS MODEL NAME IN YOUR .env FILE
   
   ============================================================
   ✅ SUCCESS! Update your backend/.env file:
      GEMINI_MODEL=gemini-2.0-flash-exp
   ============================================================
   ```

## Step 3: Create Your .env File

1. **Create `backend/.env`** (if it doesn't exist)

2. **Add your configuration:**
   ```bash
   # Database Configuration (use your existing values)
   DATABASE_URL=postgresql://username:password@host:5432/database

   # Auth0 Configuration (use your existing values)
   AUTH0_ISSUER_URL=https://your-tenant.auth0.com/
   AUTH0_AUDIENCE=https://api.raceiq.dev

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # AI Configuration (REQUIRED)
   AI_FEATURES_ENABLED=true
   GEMINI_API_KEY=AIza...your_actual_key_here
   GEMINI_MODEL=gemini-2.0-flash-exp
   AI_NEWS_TTL_MIN=60
   AI_BIO_TTL_H=48
   AI_TRACK_TTL_H=24
   ```

3. **Important:** Replace:
   - `GEMINI_API_KEY` with your actual API key from Step 1
   - `GEMINI_MODEL` with the model name that worked in Step 2
   - Database and Auth0 values with your existing configuration

## Step 4: Start the Backend

```bash
cd backend
npm run start:dev
```

**Look for this in the logs:**
```
[Nest] ... LOG [GeminiService] Gemini service initialized with model: gemini-2.0-flash-exp
```

## Step 5: Test the AI Endpoints

```bash
# Test quota endpoint
curl http://localhost:3000/api/ai/quota

# Test news endpoint
curl http://localhost:3000/api/ai/news

# Test driver bio endpoint (replace 609 with any driver ID)
curl http://localhost:3000/api/ai/driver/609/bio
```

## Troubleshooting

### Error: "GEMINI_API_KEY is not configured"
- Make sure you created the `backend/.env` file
- Check that the `.env` file has `GEMINI_API_KEY=your_key`
- Restart the backend after creating/updating `.env`

### Error: "GEMINI_MODEL is not configured"
- Add `GEMINI_MODEL=gemini-2.0-flash-exp` to your `.env` file
- Use the model name that worked in the test script

### Error: "404 Not Found" for all models
- Your API key might be invalid or expired
- Try creating a new API key at https://aistudio.google.com/app/apikey
- Make sure you're using Google AI Studio key, not Vertex AI
- Run the test script again with the new key

### Error: "models/XXX is not found for API version v1beta"
- The model name in your `.env` doesn't match what your API key supports
- Run `node test-gemini.js` to find which model works
- Update `GEMINI_MODEL` in `.env` to match the working model

## Model Recommendations (as of 2024)

| Model Name | Speed | Quality | Free Tier Limit |
|------------|-------|---------|-----------------|
| `gemini-2.0-flash-exp` | ⚡ Very Fast | Excellent | 15 req/min |
| `gemini-1.5-flash` | ⚡ Fast | Good | 15 req/min |
| `gemini-1.5-pro` | 🐌 Slower | Excellent | 2 req/min |

**Recommended:** Use `gemini-2.0-flash-exp` if available, otherwise `gemini-1.5-flash`.

## Cache Location

AI responses are cached in: `backend/.cache/ai-cache.json`

This file persists between backend restarts to minimize API calls.

## Free Tier Limits

- **Gemini 1.5 Flash:** 1,500 requests per day
- **With caching:** You'll typically use 60-100 requests per day
- You can monitor usage at: `GET /api/ai/quota`

## Need Help?

- Google AI Studio: https://aistudio.google.com/
- API Docs: https://ai.google.dev/docs
- Get API Key: https://aistudio.google.com/app/apikey

