# 🚀 GitHub Push & Deployment Guide

## Your Project is Ready!

Your NNHS Attendance System is now configured for deployment on **Railway** (backend) and **Vercel** (frontend). Follow these steps to get live!

---

## 📋 Quick Summary

✅ Git initialized locally  
✅ All files committed  
✅ Deployment configs created:
- `Procfile` - for Railway deployment
- `railway.json` - Railway configuration
- `vercel.json` - Vercel configuration
- `.env.example` - Environment variables template
- Health check endpoints added to backend

---

## STEP 1: Create GitHub Repository

### 1️⃣ On GitHub.com

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `nnhs-attendance-system`
3. **Description:** QR Code Based Student Attendance Monitoring System
4. **Visibility:** Public (Vercel requires this for free tier)
5. ⚠️ **DO NOT** check "Initialize this repository with:"
6. Click **"Create repository"**

### 2️⃣ In Your Terminal

```bash
cd "c:\Users\User\Downloads\NNHS QRCBSAMS (github)"
```

**Replace YOUR_USERNAME with your actual GitHub username:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/nnhs-attendance-system.git
git branch -M main
git push -u origin main
```

Example:
```bash
git remote add origin https://github.com/johnsmith/nnhs-attendance-system.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Deploy Backend to Railway

### 2️⃣ Railway Setup

1. Go to [railway.app](https://railway.app)
2. **Sign up** (GitHub login recommended)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. **Connect** your GitHub account
6. Select **`nnhs-attendance-system`** repository
7. Click **"Deploy"**

⏳ Railway will auto-detect the Python backend

### 2️⃣ Add MySQL Database

1. In your Railway dashboard, click **"+ Add"**
2. Select **"Add MySQL"**
3. This automatically creates a MySQL service
4. Click the **MySQL plugin** to see connection details

### 2️⃣ Set Environment Variables

Click **"Variables"** in your Railway project and add these:

```
MYSQL_HOST         = ${{ MySQL.MYSQLHOST }}
MYSQL_PORT         = ${{ MySQL.MYSQLPORT }}
MYSQL_USER         = ${{ MySQL.MYSQLUSER }}
MYSQL_PASSWORD     = ${{ MySQL.MYSQLPASSWORD }}
MYSQL_DB           = nnhs_attendance

FLASK_ENV          = production
SECRET_KEY         = (see below)
CORS_ORIGINS       = https://YOUR-FRONTEND.vercel.app
```

#### Generate SECRET_KEY

Run this once:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and paste it as `SECRET_KEY` value.

### 2️⃣ View Deployment

1. Go to **"Deployments"** tab
2. Wait for green ✅ status
3. Click on the domain (e.g., `nnhs-backend-production.railway.app`)
4. Test the backend at `/api/health`
5. **Copy the domain** - you'll need it for Vercel!

### 2️⃣ Initialize Database

Once backend is live, initialize the database:

```bash
curl https://YOUR-RAILWAY-DOMAIN.railway.app/api/init-db
```

Response should show: `Admin account created with password admin123`

---

## STEP 3: Deploy Frontend to Vercel

### 3️⃣ Vercel Setup

1. Go to [vercel.com](https://vercel.com)
2. **Sign up** (GitHub login recommended)
3. Click **"Add New..."** → **"Project"**
4. Select **"Import Git Repository"**
5. Paste: `https://github.com/YOUR_USERNAME/nnhs-attendance-system`
6. Click **"Import"**

### 3️⃣ Configure Build Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install` (should auto-detect)

### 3️⃣ Set Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL = https://YOUR-RAILWAY-DOMAIN.railway.app/api
```

Example:
```
VITE_API_URL = https://nnhs-backend-production.railway.app/api
```

### 3️⃣ Deploy

1. Click **"Deploy"**
2. Wait for build to complete ✅
3. You'll get a live URL like: `https://nnhs-attendance-system.vercel.app`
4. **Copy this URL!**

---

## STEP 4: Connect Frontend to Backend

Go back to Railway and update the CORS variable:

```
CORS_ORIGINS = https://YOUR-VERCEL-DOMAIN.vercel.app
```

Example:
```
CORS_ORIGINS = https://nnhs-attendance-system.vercel.app
```

---

## ✅ Testing the Live Application

### Test 1: Load the Frontend
1. Visit your Vercel URL
2. Should show login page

### Test 2: Test Backend Connection
1. Open browser console (F12)
2. Try logging in with `admin` / `admin123`
3. Check console for errors

### Test 3: Database Connection
1. Visit: `https://YOUR-RAILWAY-DOMAIN.railway.app/api/health`
2. Should return: `{"status": "ok", "version": "1.0"}`

---

## 📝 Default Credentials

- **Username:** `admin`
- **Password:** `admin123`
- ⚠️ **Change immediately in production!**

---

## 🔐 Security Checklist

Before sharing with others:

- [ ] Changed admin password
- [ ] Set strong SECRET_KEY (not the default)
- [ ] Verified CORS_ORIGINS is correct
- [ ] No `.env` file in git (only `.env.example`)
- [ ] MySQL credentials are from Railway (not hardcoded)
- [ ] HTTPS is enforced on both platforms

---

## 🆘 Troubleshooting

### Backend won't deploy on Railway

**Check logs:**
1. Railway dashboard → Deployments → Logs
2. Common issues:
   - Missing environment variables
   - Python version mismatch
   - MySQL connection failed

**Solution:**
- Verify all env vars from Step 2
- Ensure MySQL database was added
- Redeploy from Railway dashboard

### Frontend shows blank page

**Debug:**
1. Open DevTools (F12) → Console
2. Look for network errors
3. Check if VITE_API_URL is correct

**Solution:**
- Verify `VITE_API_URL` in Vercel env vars
- Check backend CORS_ORIGINS includes your Vercel domain
- Redeploy on Vercel (Settings → Deployments → Redeploy)

### Login not working

**Check:**
1. Backend is deployed and `/api/health` responds
2. `CORS_ORIGINS` includes your Vercel domain
3. Database was initialized (`/api/init-db`)

**Solution:**
- Check browser console for CORS errors
- Verify backend is running (check Railway logs)
- Reset admin password: `/api/init-db`

### Database Connection Error

**Solution:**
1. Go to Railway MySQL database
2. Verify credentials are correct
3. Ensure database `nnhs_attendance` exists
4. Run initialization: `/api/init-db`

---

## 📞 Need More Help?

- **Railway docs:** https://docs.railway.app
- **Vercel docs:** https://vercel.com/docs
- **Flask-CORS:** https://flask-cors.readthedocs.io

---

## 🎉 You're Done!

Your NNHS Attendance System is now live on the cloud! 🚀

**Share these URLs:**
- Frontend: `https://YOUR-VERCEL-DOMAIN.vercel.app`
- Backend API: `https://YOUR-RAILWAY-DOMAIN.railway.app/api`

---

## Optional: Add Custom Domain

### For Railway Backend:
1. Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (follow Railway's guide)

### For Vercel Frontend:
1. Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (follow Vercel's guide)

---

## Monitoring & Logs

**Railway Logs:**
- Dashboard → Project → Logs tab
- Real-time logs and errors

**Vercel Logs:**
- Dashboard → Project → Deployments
- Click deployment for build logs
- Logs → Runtime Logs for live errors

---

**Last Updated:** April 28, 2026  
**Status:** ✅ Ready for Production
