# EventHive Deployment Guide

This guide will walk you through hosting your EventHive application for free using **Render** (for the Backend) and **Vercel** (for the Frontend), and connecting a custom domain.

## Prerequisites

1.  **Code is pushed to GitHub**: You just did this!
2.  **MongoDB Connection String**: Have your `MONGO_URI` ready (from your `.env` file).
3.  **Cloudinary Credentials**: Have your Cloud Name, API Key, and API Secret ready.

---

## Part 1: Deploy Backend (Render)

We will deploy the `server` folder as a Node.js service.

1.  **Create an account** on [Render.com](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`EventHive`).
4.  Configure the service:
    *   **Name**: `eventhive-backend` (or similar)
    *   **Root Directory**: `server` (Important!)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**:
    *   Scroll down to "Environment Variables" and add these (copy the values from your local `.env`):
        *   `MONGO_URI`
        *   `JWT_SECRET`
        *   `CLOUDINARY_CLOUD_NAME`
        *   `CLOUDINARY_API_KEY`
        *   `CLOUDINARY_API_SECRET`
        *   `NODE_ENV`: `production`
6.  Click **Create Web Service**.
7.  **Wait for deployment**. Once it says "Live", copy the **URL** (e.g., `https://eventhive-backend.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploy Frontend (Vercel)

We will deploy the main project root as a Vite app.

1.  **Create an account** on [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your `EventHive` repository.
4.  Configure the project:
    *   **Root Directory**: `.` (Default, leave as is).
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Build Command**: `npm run build` (Default).
    *   **Output Directory**: `dist/public` (Important: This must match your vite config).
5.  **Environment Variables**:
    *   Add the following variable:
        *   `VITE_SERVER_URL`: Paste your **Render Backend URL** from Part 1.
        *   **Important**: Do NOT include a trailing slash (e.g., use `https://eventhive-backend.onrender.com`, NOT `.../`).
6.  Click **Deploy**.

---

## Part 3: Connect Custom Domain

Once your Frontend is deployed on Vercel:

1.  Go to your **Vercel Project Dashboard**.
2.  Click **Settings** -> **Domains**.
3.  Enter your domain (e.g., `eventhive.com` or `www.eventhive.com`).
4.  **Configure DNS**:
    *   Vercel will show you the DNS records (A Record or CNAME) you need to add.
    *   Log in to where you bought your domain (Namecheap, GoDaddy, etc.).
    *   Add the records provided by Vercel.
5.  Wait for the changes to propagate (usually takes a few minutes).

---

## Troubleshooting

*   **Images not loading**: Check that `VITE_SERVER_URL` is correct in Vercel settings and has no trailing slash.
*   **Backend "Not Found"**: Ensure you set the `Root Directory` to `server` in Render settings.
