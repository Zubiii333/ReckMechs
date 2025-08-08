# Railway CLI Deployment Commands

## Install Railway CLI
```bash
npm install -g @railway/cli
```

## Deploy Steps
```bash
# 1. Login to Railway
railway login

# 2. Initialize project
railway init

# 3. Deploy
railway up

# 4. Set environment variables (if needed)
railway variables set PORT=8080

# 5. View logs
railway logs

# 6. Open deployed app
railway open
```

## Alternative: One-command deploy
```bash
railway login && railway init && railway up
```