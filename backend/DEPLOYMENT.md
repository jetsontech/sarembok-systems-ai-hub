# Nexus 365 Backend Deployment Guide

## Quick Deploy to Render.com (Recommended)

### Step 1: Prepare GitHub Repository

```bash
# Initialize git if not already done
cd backend
git init
git add .
git commit -m "Initial backend commit"

# Create a new repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/nexus-backend.git
git push -u origin main
```

### Step 2: Deploy to Render

1. Go to <https://render.com>
2. Sign up/Login (free tier available)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: nexus-365-backend
   - **Root Directory**: `backend` (if in monorepo) or leave blank
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. Copy your backend URL (e.g., `https://nexus-365-backend.onrender.com`)

### Step 3: Update Frontend

1. Go to Vercel dashboard
2. Open your project settings
3. Go to "Environment Variables"
4. Add new variable:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://nexus-365-backend.onrender.com` (your Render URL)
   - **Environment**: Production, Preview, Development
5. Save
6. Redeploy frontend

---

## Alternative: Deploy to Railway.app

### Step 1: Deploy

1. Go to <https://railway.app>
2. Sign up/Login
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Python and requirements.txt
6. Click "Deploy"
7. Copy your backend URL

### Step 2: Update Frontend

Same as Render Step 3 above.

---

## Alternative: Deploy Locally (Testing)

### Step 1: Run Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend will run at `http://localhost:8000`

### Step 2: Update Frontend

Create `.env.local` in frontend root:

```
VITE_BACKEND_URL=http://localhost:8000
```

Then run frontend:

```bash
npm run dev
```

---

## Verify Deployment

### Test Backend Health

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

### Test Audio Processing

```bash
curl -X POST https://your-backend-url.onrender.com/process-audio \
  -F "file=@test.wav" \
  -F "task=denoise" \
  --output processed.wav
```

---

## Troubleshooting

### "Build failed" on Render

- Check `requirements.txt` is in the correct directory
- Ensure Python version is compatible (3.11)
- Check build logs for specific errors

### "Backend unreachable" in frontend

- Verify `VITE_BACKEND_URL` is set correctly in Vercel
- Check backend is running (visit backend URL in browser)
- Ensure CORS is configured correctly

### "Processing takes too long"

- Render free tier has 60s timeout
- Large files may timeout
- Consider upgrading to paid tier or optimizing processing

---

## Environment Variables

### Backend (Render)

No environment variables needed for basic setup.

Optional:

- `MAX_FILE_SIZE`: Maximum upload size in bytes
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Frontend (Vercel)

Required:

- `VITE_BACKEND_URL`: Your backend URL

---

## Monitoring

### Render Dashboard

- View logs in real-time
- Monitor CPU/Memory usage
- Check deployment status

### Vercel Dashboard

- View frontend logs
- Monitor API calls
- Check build status

---

## Costs

### Render Free Tier

- ✅ 750 hours/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM
- ⚠️ Shared CPU

### Railway Free Tier

- ✅ $5 credit/month
- ✅ Automatic HTTPS
- ✅ No sleep
- ⚠️ Limited to credit usage

### Upgrade Options

- Render: $7/month for always-on
- Railway: Pay-as-you-go after free credit

---

## Next Steps After Deployment

1. ✅ Test all processing tasks
2. ✅ Monitor performance
3. ✅ Add custom domain (optional)
4. ✅ Enable analytics
5. ✅ Set up error tracking (Sentry)

---

## Support

If you encounter issues:

1. Check deployment logs
2. Verify environment variables
3. Test backend health endpoint
4. Review API_REFERENCE.md
5. Check CORS configuration
