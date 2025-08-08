# 🚀 Railway Deployment Guide - Car Workshop System

## ✅ Configuration Fixed

The following files have been configured to force Railway to use PHP/Composer:

### Files Created/Updated:
- ✅ **Removed `package.json`** (was causing npm detection)
- ✅ **Updated `nixpacks.toml`** (forces PHP 8.2)
- ✅ **Created `Procfile`** (Railway start command)
- ✅ **Updated `railway.json`** (deployment configuration)
- ✅ **Created `.railwayignore`** (ignore unnecessary files)
- ✅ **Updated `composer.lock`** (ensures Composer detection)

## 🔧 Railway Settings

### Build Configuration:
```
Build Command: composer install --no-dev --optimize-autoloader --no-interaction
Start Command: php -S 0.0.0.0:$PORT -t . backend/server.php
```

### Environment Variables:
```
PORT=8080 (auto-set by Railway)
APP_ENV=production
APP_DEBUG=false
```

## 🚀 Deployment Steps

### Method 1: GitHub Integration (Recommended)
1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Configure Railway for PHP/Composer deployment"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway will now detect PHP and use Composer

### Method 2: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## 🎯 Expected Build Process

Railway should now:
1. ✅ Detect PHP project (not Node.js)
2. ✅ Install PHP 8.2 and Composer
3. ✅ Run `composer install --no-dev --optimize-autoloader`
4. ✅ Start with `php -S 0.0.0.0:$PORT -t . backend/server.php`

## 🌐 After Deployment

Your app will be available at:
- `https://your-app-name.railway.app/` (Main page)
- `https://your-app-name.railway.app/book.html` (Booking)
- `https://your-app-name.railway.app/admin.html` (Admin)

## 🔍 Troubleshooting

If you still see npm errors:
1. Make sure `package.json` is deleted
2. Ensure `composer.json` and `composer.lock` exist
3. Check that `nixpacks.toml` specifies PHP
4. Redeploy from Railway dashboard

## ✅ Success Indicators

You'll know it's working when you see:
- "Installing PHP 8.2" in build logs
- "Running composer install" in build logs
- "Starting PHP server" in deploy logs
- No npm-related errors

The deployment should now work correctly! 🎉