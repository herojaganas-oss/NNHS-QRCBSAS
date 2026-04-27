# Quick Deploy Reference Card

## 🎯 Your Code is Ready!

✅ Git repository initialized  
✅ First commit created  
✅ All files ready to push

---

## 🚀 3-Step Deployment

### 1️⃣ PUSH TO GITHUB (1 minute)

```bash
# Create repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/nnhs-attendance-system.git
git push -u origin main
```

### 2️⃣ DEPLOY BACKEND (8 minutes)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add MySQL database
4. Set environment variables (see full guide)
5. Generate domain

### 3️⃣ DEPLOY FRONTEND (5 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Add environment variable:
   - `VITE_API_URL` = `https://your-railway-url.railway.app/api`
4. Deploy!

---

## 📋 Environment Variables

### Railway (Backend)
```
MYSQL_HOST → Reference MySQL MYSQLHOST
MYSQL_PORT → Reference MySQL MYSQLPORT  
MYSQL_USER → Reference MySQL MYSQLUSER
MYSQL_PASSWORD → Reference MySQL MYSQLPASSWORD
MYSQL_DB → nnhs_attendance
SECRET_KEY → Generate: python3 -c "import secrets; print(secrets.token_hex(32))"
FLASK_ENV → production
```

### Vercel (Frontend)
```
VITE_API_URL → https://your-backend.railway.app/api
```

---

## 🎯 After Deployment

1. Visit your Vercel URL
2. Click "Create Admin Account"
3. Fill in details
4. Login and start using!

---

## ❓ Supabase vs Railway

**Supabase**: ❌ Not recommended
- Uses PostgreSQL (you need MySQL)
- Would require complete rewrite

**Railway**: ✅ Perfect fit
- Python + MySQL in one place
- Free tier ($5 credit/month)
- Easy to use

---

## 📖 Full Guide

See: **COMPLETE_DEPLOYMENT_GUIDE.md**

---

**Time**: 15 minutes  
**Cost**: FREE  
**Difficulty**: Easy
