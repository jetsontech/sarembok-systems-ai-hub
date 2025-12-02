@echo off
echo.
echo 🚀 Nexus 365 Backend Deployment Helper
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial Nexus 365 backend commit"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo.
echo 📋 Next Steps:
echo.
echo 1. Create a GitHub repository:
echo    - Go to https://github.com/new
echo    - Name it: nexus-365-backend
echo    - Don't initialize with README
echo    - Click 'Create repository'
echo.
echo 2. Push your code:
echo    git remote add origin https://github.com/YOUR_USERNAME/nexus-365-backend.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy to Render:
echo    - Go to https://render.com
echo    - Click 'New +' → 'Web Service'
echo    - Connect your GitHub repo
echo    - Use these settings:
echo      • Build Command: pip install -r requirements.txt
echo      • Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
echo      • Instance Type: Free
echo.
echo 4. Update Vercel:
echo    - Go to your Vercel project settings
echo    - Add environment variable:
echo      VITE_BACKEND_URL = https://your-backend.onrender.com
echo    - Redeploy
echo.
echo 📚 For detailed instructions, see DEPLOYMENT.md
echo.
pause
