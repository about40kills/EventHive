# Deployment Guide for EventHive (Cloudinary)

This guide provides step-by-step instructions to deploy your EventHive application using **Cloudinary** for image storage.

## 1. Hosting the Backend (Render)

We will use **Render** to host the backend because it offers a generous free tier for Node.js apps.

1.  **Push Code to GitHub**: Ensure your latest code (including the Cloudinary changes) is committed and pushed to GitHub.
2.  **Sign Up/Login** to [Render.com](https://render.com).
3.  **Create New Web Service**:
    *   Click **New +** and select **Web Service**.
    *   Connect your GitHub repository `EventHive`.
4.  **Configure Settings**:
    *   **Name**: `eventhive-backend` (or similar)
    *   **Root Directory**: `server` (Important!)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: Free
5.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these:
    *   `MONGO_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A long random secret string.
    *   `RESEND_API_KEY`: Your Resend API key.
    *   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
    *   `CLOUDINARY_API_KEY`: Your Cloudinary API Key.
    *   `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret.
    *   `CLIENT_URL`: The URL of your future frontend (e.g., `https://eventhive.vercel.app`).
6.  **Deploy**: Click **Create Web Service**.
    *   Wait for the deployment to finish. Render will give you a URL like `https://eventhive-backend.onrender.com`. **Copy this URL.**

## 2. Hosting the Frontend (Vercel)

We will use **Vercel** to host the React frontend.

1.  **Sign Up/Login** to [Vercel.com](https://vercel.com).
2.  **Add New Project**:
    *   Click **Add New...** -> **Project**.
    *   Import your `EventHive` repository.
3.  **Configure Settings**:
    *   **Root Directory**: Leave as `./` (the root of your repo) BUT...
    *   **Framework Preset**: Vite
    *   **Build Settings**:
        *   **Build Command**: `npm run build` (This runs the build script in your root package.json)
        *   **Output Directory**: `dist/public` (This is where the build artifacts are output)
4.  **Environment Variables**:
    *   `VITE_BACKEND_URL`: Paste your Render Backend URL here (e.g., `https://eventhive-backend.onrender.com`). **Do not add a trailing slash**.
5.  **Deploy**: Click **Deploy**.

## 3. Connect a Custom Domain (Optional)

If you want a professional domain like `www.myeventhive.com`:

1.  **Buy a domain** from Namecheap, GoDaddy, or through Vercel directly.
2.  **In Vercel**:
    *   Go to your Project Settings -> **Domains**.
    *   Add your domain (e.g., `myeventhive.com`).
    *   Vercel will give you DNS records (A Record and CNAME) to add to your domain registrar settings.
    *   Once added, Vercel automatically generates an SSL certificate (HTTPS) for you.

## Summary of URLs

*   **Frontend**: `https://your-project.vercel.app` (or your custom domain)
*   **Backend**: `https://your-backend.onrender.com`

**Note:** The first time you visit your Render backend, it might take 30-60 seconds to wake up (cold start). This is normal on the free tier.
