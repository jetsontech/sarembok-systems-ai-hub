# 🚀 ONE-CLICK DEPLOYMENT

## Deploy to Render (Easiest Method)

Click this button to deploy instantly:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jetsontech/sarembok-systems-ai-hub)

### What This Does

1. ✅ Automatically reads `render.yaml` configuration
2. ✅ Sets up the backend service with correct settings
3. ✅ Deploys to Render's free tier
4. ✅ Provides you with the backend URL

### After Clicking

1. You'll be taken to Render
2. Click "Create Web Service"
3. Wait 5-10 minutes for deployment
4. Copy your backend URL (e.g., `https://nexus-365-backend.onrender.com`)

---

## Alternative: Manual Render Deployment

If the button doesn't work, use this direct link:

**<https://render.com/deploy?repo=https://github.com/jetsontech/sarembok-systems-ai-hub>**

Or manually create a service with these exact settings:

```yaml
Name: nexus-365-backend
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

---

## Next Step: Update Vercel

Once your backend is deployed, update your frontend:

1. Go to: <https://vercel.com/jets-projects-a83f6733/sarembok/settings/environment-variables>
2. Add new variable:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://nexus-365-backend.onrender.com` (your Render URL)
   - **Environments**: Production, Preview, Development
3. Redeploy: <https://vercel.com/jets-projects-a83f6733/sarembok>

---

## Verify Deployment

Test your backend:

```bash
curl https://your-backend-url.onrender.com/
```

Expected response:

```json
{
  "status": "online",
  "service": "Nexus 365 Backend",
  "version": "2.0"
}
```

---

## 🎉 You're Done

After both steps:

- ✅ Backend processes files
- ✅ Frontend connects automatically
- ✅ Users can upload and process media
- ✅ Works on mobile!
