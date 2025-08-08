# Frontend-Only Deployment Guide

## For Netlify Deployment (Frontend Only)

### Build Settings:
- **Build command**: `echo "No build needed"`
- **Publish directory**: `frontend`
- **Base directory**: `/`

### Steps:
1. Deploy only the `frontend` folder to Netlify
2. Host the PHP backend separately on:
   - Railway.app
   - Heroku
   - DigitalOcean
   - Any PHP hosting service

### Update API URLs:
You'll need to update all API calls in the JavaScript files to point to your backend URL:

```javascript
// Change from:
fetch('./backend/api/get_appointments.php')

// To:
fetch('https://your-backend-url.railway.app/backend/api/get_appointments.php')
```

### Files to Update:
- `frontend/js/booking.js`
- `frontend/js/admin.js`

Replace all `./backend/api/` with your actual backend URL.