---
description: Deploy Nexus AI Hub to Vercel
---

# Deploy to Vercel

This workflow guides you through deploying the Nexus AI Hub to Vercel.

## Prerequisites

- Vercel CLI installed (`npm i -g vercel`)
- Vercel account

## Steps

1. **Login to Vercel**

    ```bash
    vercel login
    ```

2. **Initialize Project**
    Run the following command in the project root:

    ```bash
    vercel
    ```

    - Set up and deploy? [Y]
    - Which scope? [Select your scope]
    - Link to existing project? [N]
    - Project name? [nexus-ai-hub]
    - In which directory? [./]
    - Want to modify settings? [N]

3. **Production Deployment**
    Once initialized, deploy to production:

    ```bash
    vercel --prod
    ```

4. **Environment Variables**
    If you want to set the Gemini API key on the server (optional, as the app allows local storage override):

    ```bash
    vercel env add VITE_GEMINI_API_KEY
    ```
