# Azure Deployment Guide

## The Problem
Your app works locally but fails on Azure because:
1. **Local Development**: Vite dev server proxies `/api/*` to `http://localhost:3000` (NestJS backend)
2. **Azure Deployment**: No proxy exists, so API calls fail with 405 Method Not Allowed

## Solution: Deploy Backend to Azure

### Step 1: Deploy NestJS Backend to Azure App Service

1. **Build the backend**:
   ```bash
   cd backend
   npm run build
   ```

2. **Deploy to Azure App Service**:
   - Create a new Azure App Service (Node.js runtime)
   - Deploy your built backend
   - Note the URL (e.g., `https://your-app-name.azurewebsites.net`)

### Step 2: Update Frontend Configuration

1. **Update `frontend/public/config.production.js`**:
   ```javascript
   window.env = {
       VITE_API_BASE_URL: "https://YOUR_ACTUAL_BACKEND_URL.azurewebsites.net",
       // ... other config
   };
   ```

2. **Set environment variables in Azure Static Web Apps**:
   - Go to your Static Web App in Azure Portal
   - Navigate to Configuration → Application settings
   - Add these environment variables:
     - `VITE_API_BASE_URL`: Your backend URL
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase key
     - `VITE_AUTH0_DOMAIN`: Your Auth0 domain
     - `VITE_AUTH0_CLIENT_ID`: Your Auth0 client ID
     - `VITE_AUTH0_AUDIENCE`: Your Auth0 audience

### Step 3: Update Auth0 Configuration

1. **Add your Azure frontend URL to Auth0**:
   - Go to Auth0 Dashboard → Applications
   - Add `https://your-frontend-domain.azurestaticapps.net` to:
     - Allowed Callback URLs
     - Allowed Logout URLs
     - Allowed Web Origins

2. **Update CORS settings in your backend**:
   ```typescript
   // In your main.ts
   app.enableCors({
     origin: [
       'http://localhost:5173', // Local dev
       'https://your-frontend-domain.azurestaticapps.net' // Azure
     ],
     credentials: true
   });
   ```

### Step 4: Redeploy Frontend

1. **Commit and push your changes**
2. **GitHub Actions will automatically redeploy** (if configured)
3. **Or manually redeploy** from Azure Portal

## Alternative: Use Azure Functions

If you prefer serverless, you can convert your NestJS endpoints to Azure Functions:

1. **Create Azure Functions project**
2. **Convert your NestJS controllers to Functions**
3. **Update frontend to use Function URLs**

## Testing

After deployment:
1. **Test user registration** on the deployed site
2. **Check browser console** for any remaining errors
3. **Verify API calls** are going to the correct backend URL

## Troubleshooting

- **405 Method Not Allowed**: Backend not deployed or CORS not configured
- **CORS errors**: Check backend CORS configuration
- **Auth0 errors**: Verify Auth0 configuration includes Azure URLs
- **Environment variables**: Ensure all required variables are set in Azure
