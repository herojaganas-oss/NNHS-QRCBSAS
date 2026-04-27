# Complete Online Deployment Guide - NNHS Attendance System

**Version**: 4.5  
**Last Updated**: April 27, 2026

---

## 🎯 What You're Deploying

A complete attendance system with:
- **Backend**: Flask (Python) with MySQL database
- **Frontend**: React + TypeScript
- **Admin Registration**: Built-in (no database scripts needed!)

---

## ❓ About Supabase vs Railway

### Supabase
- ❌ **Not Recommended** for this project
- Uses PostgreSQL (your app uses MySQL)
- Would require rewriting all database code
- Backend hosting is limited

### Railway ✅ **RECOMMENDED**
- ✅ **Perfect for this project**
- Provides Python backend hosting
- Provides MySQL database (exactly what you need!)
- Both backend + database in ONE place
- Free tier: $5 credit/month

---

## 📋 What You Need

1. **GitHub Account** (free) - to store code
2. **Railway Account** (free) - for backend + MySQL
3. **Vercel Account** (free) - for frontend
4. **15-20 minutes** of your time

---

## 🚀 Step-by-Step Deployment

### STEP 1: Push to GitHub (5 minutes)

#### 1.1: Create GitHub Repository

1. Go to [github.com](https://github.com) and login
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `nnhs-attendance-system`
   - **Description**: "QR Code-Based Student Attendance Monitoring System"
   - **Visibility**: Choose **Public** (free) or **Private** (also free)
   - **DO NOT** check "Initialize with README" (we already have one)
4. Click **"Create repository"**
5. **Keep this page open** - you'll need the commands shown

#### 1.2: Push Your Code

GitHub will show you commands like this. Copy them and run in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/nnhs-attendance-system.git
git push -u origin main
```

**If you get authentication error**, GitHub will guide you to create a **Personal Access Token**:
- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` permissions
- Use this token as your password when pushing

**Important**: The code has already been committed (by me). You just need to add the remote and push!

---

### STEP 2: Deploy Backend to Railway (8 minutes)

#### 2.1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub

#### 2.2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `nnhs-attendance-system`
4. Railway will automatically detect it's a Python app!

#### 2.3: Add MySQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway will create and start a MySQL database
3. It takes about 30 seconds to provision

#### 2.4: Configure Backend Environment Variables

1. Click on your **backend service** (not the MySQL)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

```
MYSQL_HOST
Value: Click "Add Reference" → Select MySQL → MYSQLHOST

MYSQL_PORT
Value: Click "Add Reference" → Select MySQL → MYSQLPORT

MYSQL_USER
Value: Click "Add Reference" → Select MySQL → MYSQLUSER

MYSQL_PASSWORD
Value: Click "Add Reference" → Select MySQL → MYSQLPASSWORD

MYSQL_DB
Value: nnhs_attendance

SECRET_KEY
Value: [Generate one - see below]

FLASK_ENV
Value: production
```

**Generate SECRET_KEY**: Run this command in your terminal:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Copy the output and paste it as SECRET_KEY value.

#### 2.5: Set Root Directory

1. Still in backend service settings
2. Go to **"Settings"** tab
3. Under **"Service"**, find **"Root Directory"**
4. Set it to: `backend`
5. Click **"Deploy"**

#### 2.6: Wait for Deployment

- Railway will install dependencies and start your backend
- Watch the **"Deployments"** tab
- When it says **"SUCCESS"**, your backend is live!
- Click **"View Logs"** to see the output

#### 2.7: Get Your Backend URL

1. In your backend service, go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL (something like `https://nnhs-backend-production-xxxx.up.railway.app`)
5. **Save this URL** - you'll need it for Vercel!

---

### STEP 3: Deploy Frontend to Vercel (5 minutes)

#### 3.1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel

#### 3.2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your `nnhs-attendance-system` repository
3. Click **"Import"**

#### 3.3: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 3.4: Add Environment Variable

1. Scroll down to **"Environment Variables"**
2. Add this variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-backend-url.railway.app/api`
   - **IMPORTANT**: Replace with YOUR Railway backend URL from Step 2.7
   - **IMPORTANT**: Add `/api` at the end!

3. Click **"Deploy"**

#### 3.5: Wait for Build

- Vercel will build your frontend
- Takes about 2-3 minutes
- When done, you'll see **"Congratulations!"**
- Click **"Visit"** to see your live site!

#### 3.6: Get Your Frontend URL

Your site is now live at:
```
https://nnhs-attendance-system.vercel.app
```
(or similar - Vercel will show you the exact URL)

---

### STEP 4: Initialize Database (3 minutes)

Your backend is running but the database is empty. Let's initialize it:

#### Method A: Using Railway CLI (Recommended)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```
This opens a browser for authentication.

3. Link to your project:
```bash
cd backend
railway link
```
Select your project from the list.

4. Run database initialization:
```bash
railway run python init_database.py
```

This creates:
- 28 classrooms (16 Junior High + 12 Senior High)
- Tables for students, teachers, attendance, etc.
- Default admin (admin/admin123) - **Change this after deployment!**

#### Method B: Skip init_database.py (Use Web Registration)

You can skip the database initialization script and just:
1. Visit your live site
2. Click **"Create Admin Account"**
3. Fill in your details
4. The system will automatically create the necessary tables!

**Note**: If you use Method B, you'll need to manually add classrooms through the admin dashboard.

---

### STEP 5: First Login & Setup (5 minutes)

#### 5.1: Visit Your Live Site

Go to your Vercel URL: `https://nnhs-attendance-system.vercel.app`

#### 5.2: Create Admin Account

**If you used Method B (no init_database.py)**:
1. Click **"Create Admin Account"** link
2. Fill in:
   - Username: (your choice)
   - Password: (min 6 chars)
   - Security Question: (recommended!)
   - Security Answer: (recommended!)
3. Click "Create Admin Account"
4. **Success!** Now login

**If you used Method A (init_database.py)**:
1. Login with: `admin` / `admin123`
2. **Immediately go to Settings and change password!**

#### 5.3: Set Up Your System

1. **Change Admin Password**:
   - Go to Settings
   - Enter current password
   - Enter new password
   - Save

2. **Add Security Question** (if not set):
   - Still in Settings
   - Enter security question
   - Enter answer
   - Save

3. **Add Classrooms** (if you skipped init_database.py):
   - Go to Admin Dashboard
   - Classroom Management
   - Add each classroom manually

4. **Add Students**:
   - Student Management → Add Student
   - Fill in details
   - Save

5. **Add Teachers**:
   - Teacher Management → Add Teacher
   - Fill in details
   - Assign schedules

---

## ✅ Verification Checklist

After deployment, test these:

- [ ] Can visit frontend URL
- [ ] Login page loads
- [ ] Admin registration works (or login if you used init_database)
- [ ] Can add students
- [ ] Can add teachers
- [ ] Teacher can login
- [ ] Scanner works
- [ ] Attendance records display
- [ ] CSV export works

---

## 🔧 Troubleshooting

### Frontend shows "Network Error"

**Cause**: Frontend can't reach backend

**Fix**:
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Check `VITE_API_URL` is set correctly
3. Make sure it ends with `/api`
4. Make sure Railway backend is running
5. Redeploy frontend: Deployments → Three dots → Redeploy

### Backend crashes or won't start

**Cause**: Missing environment variables or database issue

**Fix**:
1. Go to Railway → Your Backend Service → Variables
2. Verify ALL variables are set
3. Check Deploy Logs for error messages
4. Make sure MySQL database is running

### "Admin already exists" error

**Cause**: You ran init_database.py AND tried to create admin via web

**Fix**:
- This is normal! Only ONE admin is allowed
- Just login with the existing admin credentials
- To reset: Go to Railway → MySQL → Query → Run: `DELETE FROM admin;`

### Can't login to Railway CLI

**Fix**:
```bash
# Logout first
railway logout

# Login again
railway login
```

### Vercel build fails

**Cause**: Missing dependencies or build errors

**Fix**:
1. Check build logs in Vercel
2. Common issues:
   - Node version mismatch
   - Missing environment variables
   - npm install errors
3. Try redeploying: Deployments → Redeploy

---

## 💰 Cost Breakdown

| Service | What You Get | Cost |
|---------|-------------|------|
| **GitHub** | Code hosting, unlimited repos | **FREE** |
| **Railway** | Backend + MySQL, $5 credit/month | **FREE** |
| **Vercel** | Frontend, unlimited sites, 100GB bandwidth | **FREE** |
| **Total** | Complete system online | **$0/month** |

**Important**: 
- Railway $5 credit renews monthly
- For small-medium schools, this is enough
- If you exceed: Railway charges ~$5/month
- Vercel is always free for this usage

---

## 🔒 Security Checklist

After deployment:

- [ ] Changed default admin password (if used init_database)
- [ ] Set security question
- [ ] Backend SECRET_KEY is strong (32+ characters)
- [ ] No .env files committed to GitHub
- [ ] HTTPS enabled (automatic on Vercel/Railway)

---

## 📱 Accessing Your System

**Teachers & Students**:
- Visit: `https://nnhs-attendance-system.vercel.app`
- Teachers login with credentials you create
- Students scan QR codes with their devices

**Admin**:
- Same URL
- Click "Admin" tab before logging in
- Full system control

---

## 🎉 You're Done!

Your NNHS Attendance System is now FULLY ONLINE!

- ✅ Backend running on Railway with MySQL
- ✅ Frontend live on Vercel
- ✅ Accessible from anywhere
- ✅ Admin registration ready
- ✅ Free hosting (for typical school usage)

---

## 📞 Need Help?

**Common Commands**:

```bash
# Check Railway logs
railway logs

# Redeploy Railway backend
railway up

# Check Railway status
railway status

# Link to different project
railway unlink
railway link
```

**Resources**:
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Your System Guide: See `SYSTEM_GUIDE.md`

---

**Status**: ✅ Ready to Deploy  
**Time Required**: 15-20 minutes  
**Cost**: $0/month  
**Difficulty**: Easy (follow steps carefully)

🎓 **Nahawan National High School** - Let's Go Online!
