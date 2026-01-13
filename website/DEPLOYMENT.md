# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to website folder**:
   ```bash
   cd website
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Set **Root Directory** to `website`
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty - static site)
   - **Output Directory**: (leave empty)
6. Click "Deploy"

### Option 3: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to Vercel Dashboard
3. Click "Add New Project"
4. Select your repository
5. Configure:
   - **Root Directory**: `website`
   - **Framework Preset**: Other
6. Click "Deploy"

## Project Configuration

The website is configured with:
- **vercel.json**: Routing and caching configuration
- **package.json**: Project metadata
- Static files: HTML, CSS, JS

## Custom Domain

After deployment:
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables

No environment variables needed for this static site.

## Updates

To update the website:
1. Make changes to files in `website/` folder
2. Commit and push to Git (if using Git integration)
3. Or run `vercel --prod` again from the website folder

## Build Settings

- **Framework**: Static Site
- **Build Command**: (none needed)
- **Output Directory**: (root)
- **Install Command**: (none needed)
