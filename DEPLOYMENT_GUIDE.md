# Complete Deployment Guide - Railway & Vercel

## Prerequisites
- GitHub account
- Railway account (railway.app)
- Vercel account (vercel.com)
- Git installed

---

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `nnhs-attendance-system`
3. Do NOT initialize with README (we already have one)

### 1.2 Push Your Code
```bash
cd "c:\Users\User\Downloads\NNHS QRCBSAMS (github)"
git remote add origin https://github.com/YOUR_USERNAME/nnhs-attendance-system.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Setup Railway Project
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize GitHub and select `nnhs-attendance-system`

### 2.2 Add MySQL Database
1. In your Railway project, click **"+ Add"**
2. Select **"Add MySQL"**
3. This automatically creates database service and provides connection variables

### 2.3 Configure Environment Variables
In Railway dashboard, go to **"Variables"** and add:

```
MYSQL_HOST = ${{ MySQL.MYSQLHOST }}
MYSQL_PORT = ${{ MySQL.MYSQLPORT }}
MYSQL_USER = ${{ MySQL.MYSQLUSER }}
MYSQL_PASSWORD = ${{ MySQL.MYSQLPASSWORD }}
MYSQL_DB = nnhs_attendance

FLASK_ENV = production
SECRET_KEY = (run: python3 -c "import secrets; print(secrets.token_hex(32))")

CORS_ORIGINS = https://yourdomain.vercel.app
```

### 2.4 Deploy
1. Railway automatically detects Procfile
2. Click **"Deploy"**
3. Wait for deployment to complete
4. Copy the generated domain (looks like: `project-name-production.railway.app`)

### 2.5 Initialize Database
Once backend is live:
```bash
curl https://your-railway-url.railway.app/api/init-db
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **"Import Git Repository"**
3. Paste: `https://github.com/YOUR_USERNAME/nnhs-attendance-system`
4. Click **"Import"**

### 3.2 Configure Environment Variables
In Vercel project settings, add:

```
VITE_API_URL = https://your-railway-url.railway.app/api
```

### 3.3 Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Your frontend will be live at: `your-project-name.vercel.app`

---

## Step 4: Connect Frontend to Backend

### 4.1 Update CORS on Railway
Go back to Railway backend variables and update:
```
CORS_ORIGINS = https://your-project-name.vercel.app
```

### 4.2 Test Connection
1. Visit your Vercel domain
2. Login page should load
3. Try logging in to test backend connectivity

---

## Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Verify all env variables are set
- Ensure MySQL database is initialized

### Frontend shows blank page
- Check browser console for errors
- Verify VITE_API_URL is correct
- Check CORS settings on backend

### Database connection errors
- Verify MySQL credentials in Railway
- Check that database `nnhs_attendance` exists
- Run init script from Step 2.5

### Custom Domain (Optional)

**For Railway:**
1. Go to project settings
2. Add custom domain under **"Domains"**
3. Update DNS records

**For Vercel:**
1. Go to project settings → **"Domains"**
2. Add your domain
3. Follow DNS setup instructions

---

## Monitoring & Logs

**Railway Logs:**
- Dashboard → Project → Logs tab
- View real-time logs and errors

**Vercel Logs:**
- Dashboard → Project → Deployments
- Click deployment to see build logs

---

## Cost Estimates

- **Railway**: $5-15/month (includes MySQL)
- **Vercel**: Free tier available (Hobby)
- **Custom Domain**: ~$10-15/year

---

## Security Checklist

- ✅ SECRET_KEY is random (not hardcoded)
- ✅ CORS_ORIGINS limited to your domain
- ✅ No credentials in git repo
- ✅ .env.example provided (no actual values)
- ✅ Environment variables used for sensitive data
- ✅ HTTPS enforced on both platforms

---

## Next Steps

1. Add your username to the GitHub command above
2. Create GitHub repo
3. Run `git push` command
4. Follow Railway deployment steps
5. Follow Vercel deployment steps
6. Test the live application

**Need help?** Check the logs in Railway and Vercel dashboards for specific error messages.
