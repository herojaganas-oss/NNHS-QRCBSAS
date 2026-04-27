# Deployment Checklist - NNHS Attendance System v4.5

## ✅ Pre-Deployment Verification

### Backend Files
- [x] `backend/app.py` - Main Flask application with admin registration endpoints
- [x] `backend/requirements.txt` - Python dependencies (includes gunicorn)
- [x] `backend/Procfile` - Railway deployment configuration
- [x] `backend/.env.example` - Environment variable template
- [x] Backend syntax check: PASSED

### Frontend Files
- [x] `src/app/pages/Login.tsx` - Login with admin registration link
- [x] `src/app/services/api.ts` - API service with production URL support
- [x] `package.json` - Build scripts configured
- [x] Frontend structure: VERIFIED

### Configuration Files
- [x] `.gitignore` - Protects sensitive files
- [x] `.env.example` - Frontend environment template
- [x] `SYSTEM_GUIDE.md` - Complete documentation

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "v4.5: NNHS Attendance System - Production Ready with Admin Registration"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nnhs-attendance-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `nnhs-attendance-system` repository
5. Click "Add MySQL" database
6. Configure environment variables in Railway dashboard:
   ```
   MYSQL_HOST=${MYSQLHOST}
   MYSQL_PORT=${MYSQLPORT}
   MYSQL_USER=${MYSQLUSER}
   MYSQL_PASSWORD=${MYSQLPASSWORD}
   MYSQL_DB=nnhs_attendance
   SECRET_KEY=<generate-with-command-below>
   FLASK_ENV=production
   ```

7. Generate SECRET_KEY:
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

8. Wait for deployment to complete
9. **Copy your Railway backend URL**: `https://your-backend-xxx.railway.app`

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `nnhs-attendance-system` repository
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-xxx.railway.app/api` (from Step 2)
7. Click "Deploy"
8. Wait 2-5 minutes for build

### Step 4: Initialize Database (Railway)

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run database initialization
railway run python backend/init_database.py
```

**Option B: Via Railway Web Interface**
1. Go to Railway → Your Backend Service
2. Click "Deploy Logs" → "Terminal"
3. Run: `python init_database.py`

### Step 5: First-Time Admin Registration

1. Go to your deployed Vercel URL: `https://nnhs-attendance-system.vercel.app`
2. Click **"Create Admin Account"** link (below "Forgot Password")
3. Fill in:
   - Username (required)
   - Password (min 6 characters, required)
   - Security Question (recommended)
   - Security Answer (recommended)
4. Click "Create Admin Account"
5. **Success!** You can now login

**Security Note**: The system only allows ONE admin account. If someone tries to create another admin, they'll get an error: "Admin account already exists. Only one admin is allowed."

## 🎯 Post-Deployment Testing

### Test Admin Registration
- [ ] Visit your Vercel URL
- [ ] Click "Create Admin Account" link
- [ ] Successfully create admin account
- [ ] Try creating another admin → Should show error
- [ ] Login with new admin credentials → Success

### Test Admin Functions
- [ ] Login as admin
- [ ] Add a student (Junior High: Grade 7-10)
- [ ] Add a student (Senior High: Grade 11-12)
- [ ] Add a teacher
- [ ] Assign schedule to teacher
- [ ] Change admin password
- [ ] Set security question
- [ ] Logout

### Test Teacher Functions
- [ ] Login as teacher
- [ ] View assigned classes
- [ ] Open scanner
- [ ] Manual attendance entry (test LRN)
- [ ] View attendance records
- [ ] Mark absences
- [ ] Export CSV
- [ ] Logout

### Test Security
- [ ] Forgot password recovery works
- [ ] Cannot create second admin account
- [ ] Logout redirects to login page

## ⚠️ Common Issues

### Issue: Frontend can't connect to backend
**Solution**: 
- Check `VITE_API_URL` in Vercel environment variables
- Make sure it ends with `/api`
- Verify Railway backend is running

### Issue: Database connection error
**Solution**:
- Check Railway MySQL is running
- Verify environment variables are set correctly
- Check Railway MySQL credentials in Variables tab

### Issue: Admin registration not showing
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console for errors (F12)

### Issue: Build fails on Vercel
**Solution**:
- Check build logs in Vercel dashboard
- Verify `package.json` has correct scripts
- Make sure all dependencies are listed

## 📊 Cost Summary

| Service | Free Tier | Usage |
|---------|-----------|-------|
| **GitHub** | ✅ Unlimited public repos | Code hosting |
| **Vercel** | ✅ Unlimited sites, 100GB bandwidth | Frontend hosting |
| **Railway** | ✅ $5 credit/month, 500MB DB | Backend + MySQL |
| **Total** | **$0/month** | Small-medium schools |

## 🔒 Security Checklist

- [ ] Changed default admin password (if used init_database.py)
- [ ] Set security question for password recovery
- [ ] Generated strong SECRET_KEY (32+ characters)
- [ ] `.env` files NOT committed to GitHub
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] Only ONE admin account allowed ✅
- [ ] Database credentials secured in Railway

## 🎉 Deployment Complete!

Your NNHS Attendance System is now live and ready to use!

- **Frontend URL**: `https://nnhs-attendance-system.vercel.app`
- **Backend URL**: `https://your-backend-xxx.railway.app`
- **Admin Account**: Created via web interface (secure!)

---

**Version**: 4.5  
**Last Updated**: April 27, 2026  
**Status**: ✅ Production Ready
