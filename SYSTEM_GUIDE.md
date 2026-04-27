# NNHS QR Code-Based Student Attendance Monitoring System

**Version**: 4.5 - Production Ready  
**Last Updated**: April 27, 2026

A comprehensive web-based attendance tracking system for Nahawan National High School, featuring QR code scanning, real-time monitoring, admin registration, and multi-subject attendance tracking.

---

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [First-Time Setup & Admin Registration](#first-time-setup--admin-registration)
4. [User Guide](#user-guide)
5. [Deployment Guide](#deployment-guide)
6. [Environment Configuration](#environment-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Version History](#version-history)

---

## Features

### Admin Features
- ✅ **Admin Registration**: Create first admin account on deployment (limited to 1 admin)
- ✅ **Student Management**: Add, edit, delete, view attendance statistics
- ✅ **Teacher Management**: Create accounts, assign schedules, manage permissions
- ✅ **Classroom Management**: 28 classrooms (16 JH + 12 SH) pre-configured
- ✅ **CSV Import**: Bulk student uploads
- ✅ **Security**: Password reset with security questions
- ✅ **Real-time Updates**: All changes reflect immediately

### Teacher Features
- ✅ **QR Code Scanner**: Camera-based QR scanning
- ✅ **Manual Entry**: 12-digit LRN input
- ✅ **Day Validation**: Automatic schedule verification (supports MWF, TTh, Mon-Fri)
- ✅ **Time-based Status**: On-Time (≤15 min), Late (>15 min)
- ✅ **Attendance Records**: View, edit, delete records
- ✅ **Mark Absences**: One-click absent marking for unscanned students
- ✅ **CSV Export**: Download attendance data
- ✅ **Multi-subject Tracking**: Track each subject independently

### System Features
- ✅ **Per-subject Attendance**: Students can have multiple records per day
- ✅ **Duplicate Prevention**: One record per student per subject per day
- ✅ **Cascade Delete**: Automatic cleanup of related records
- ✅ **Complete Student Roster**: See all students (scanned and unscanned)
- ✅ **Attendance Rate Capping**: Max 100% to prevent calculation errors
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Secure Admin Registration**: Only allows ONE admin account for production security

---

## Quick Start

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL 5.7+** or **MariaDB** (for database)
- **XAMPP** or **WAMP** (recommended for Windows users)

### Local Development Installation

#### 1. Database Setup

**Start MySQL**:
- XAMPP: Start MySQL module
- WAMP: Start MySQL service

**Initialize Database** (Development Only):
```bash
cd backend
python3 init_database.py
```

This creates:
- Database name: `nnhs_attendance`
- 28 classrooms automatically
- Default admin (admin/admin123)
- Sample teacher (teacher1/teacher123)

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start server
python3 app.py
```

Server runs on `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

#### 4. Login

Open browser: `http://localhost:5173`

**Admin** (Development): 
- Username: `admin`
- Password: `admin123`

**Teacher** (Development): 
- Username: `teacher1`
- Password: `teacher123`

⚠️ **Change default passwords immediately in Settings!**

---

## First-Time Setup & Admin Registration

### For Production Deployment (Online)

When you deploy the system online (Vercel, Railway, etc.), you **CANNOT** run `init_database.py` directly. Instead:

1. **Access the Login Page**: Go to your deployed URL (e.g., `https://your-app.vercel.app`)

2. **Admin Registration Prompt**: If no admin account exists, the system automatically shows the **Admin Registration** form

3. **Create Admin Account**:
   - Enter username (required)
   - Enter password (min 6 characters, required)
   - Enter security question (recommended for password recovery)
   - Enter security answer (recommended)
   - Click "Create Admin Account"

4. **Login**: After registration, the form switches to login mode

5. **Security**: The system allows **ONLY ONE** admin account. Once created, no one else can register as admin.

### Why Admin Registration?

- **Production Security**: No need to expose database initialization scripts
- **Deployment Ready**: Works immediately after deployment without manual database setup
- **Password Recovery**: Security question allows admin password reset without database access
- **Single Admin**: Ensures only one person has full control of the system

---

## User Guide

### Admin Dashboard

#### Student Management

**Add Student**:
1. Click "Student Management"
2. Click "Add Student" button
3. Fill in details:
   - Student ID: 12-digit LRN (e.g., 123456789012)
   - Name: Full name
   - Grade Level: Select from dropdown (Grade 7-12)
   - Classroom: Auto-populated based on grade level
   - Parent/Guardian: Contact person name
   - Contact Number: 11-digit phone number
4. Click "Add Student"

**Edit Student**:
1. Find student in list
2. Click "Edit" button
3. Modify details
4. Click "Save Changes"

**Delete Student**:
1. Find student in list
2. Click "Delete" button
3. Confirm deletion

**View Attendance**:
- Each student card shows attendance rate
- Click student name to view detailed attendance history

#### Teacher Management

**Add Teacher**:
1. Click "Teacher Management"
2. Click "Add Teacher"
3. Fill in:
   - Teacher ID (e.g., T001)
   - Username (for login)
   - Password (min 6 characters)
   - Name
   - Rank (e.g., Teacher I, Teacher II)
   - Email
   - Contact Number
   - Subjects (comma-separated)
4. Click "Create Teacher"

**Assign Schedule**:
1. Find teacher in list
2. Click "Assign Schedule"
3. Select:
   - Classroom
   - Subject
   - Days (e.g., MWF, TTh, Mon-Fri)
   - Start Time (e.g., 08:00)
   - End Time (e.g., 09:00)
4. Click "Add Schedule"

**Delete Teacher**:
1. Find teacher in list
2. Click "Delete"
3. Confirm deletion
   - All schedules are automatically removed
   - Attendance records are preserved

#### Settings

**Change Admin Password**:
1. Click "Settings"
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "Update Password"

**Set Security Question**:
1. Click "Settings"
2. Enter current password
3. Enter security question
4. Enter security answer
5. Click "Update Security Question"

### Teacher Dashboard

#### Scanner

**Using QR Code Scanner**:
1. Click "Scanner"
2. Select your classroom and subject
3. Allow camera access
4. Point camera at student's QR code
5. System validates:
   - Student is in your classroom
   - Today is a scheduled day
   - One record per student per subject per day
6. Attendance recorded automatically

**Manual Entry**:
1. Click "Scanner"
2. Select classroom and subject
3. Click "Enter LRN Manually"
4. Type 12-digit student ID
5. Press Enter or click "Submit"

**Time-based Status**:
- **On-Time**: Scanned within 15 minutes of class start
- **Late**: Scanned after 15 minutes

#### Attendance Records

**View Records**:
1. Click "Attendance Records"
2. Select classroom, subject, and date
3. View all students with their status:
   - ✅ On-Time (green)
   - ⏰ Late (yellow)
   - ❌ Absent (red)
   - ⬜ Not Scanned (gray)

**Mark Absences**:
1. Go to Attendance Records
2. Select classroom, subject, and date
3. Click "Mark Absences"
4. All unscanned students marked as Absent

**Edit Record**:
1. Find student in records
2. Click "Edit"
3. Modify status or time
4. Click "Save"

**Delete Record**:
1. Find student in records
2. Click "Delete"
3. Confirm deletion

**Export to CSV**:
1. Go to Attendance Records
2. Select filters
3. Click "Export CSV"
4. Download file opens automatically

---

## Deployment Guide

### Step 1: Prepare for Deployment

**Update Backend** (`/backend/app.py`):
```python
# Change these for production
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_DB = os.getenv('MYSQL_DB', 'nnhs_attendance')
SECRET_KEY = os.getenv('SECRET_KEY', 'change-this-secret-key')
```

**Update Frontend** (`/src/app/services/api.ts`):
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

**Add Production Environment Variables**:

Create `/backend/requirements.txt`:
```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
PyMySQL==1.1.0
python-dotenv==1.0.0
bcrypt==4.1.2
cryptography==41.0.7
gunicorn==21.2.0
```

Create `/backend/Procfile`:
```
web: gunicorn app:app
```

### Step 2: GitHub Deployment

```bash
# Initialize git
git init

# Add files
git add .
git commit -m "NNHS Attendance System v4.5 - Production Ready"

# Create GitHub repository at github.com
# Then link and push
git remote add origin https://github.com/YOUR_USERNAME/nnhs-attendance-system.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Database

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Provision MySQL"
4. Note credentials from "Variables" tab
5. Free tier: 500MB storage, $5 credit/month

**Option B: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create database: `nnhs_attendance`
3. Select region: Singapore (closest to PH)
4. Get connection details
5. Free tier: 5GB storage

**Option C: Aiven**
1. Go to [aiven.io](https://aiven.io)
2. Create MySQL service
3. Select free plan, region: Singapore
4. Get connection credentials
5. Free tier: 3GB storage

### Step 4: Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - Root Directory: `/backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
5. Add Environment Variables:
   ```
   MYSQL_HOST=${MYSQLHOST}
   MYSQL_PORT=${MYSQLPORT}
   MYSQL_USER=${MYSQLUSER}
   MYSQL_PASSWORD=${MYSQLPASSWORD}
   MYSQL_DB=nnhs_attendance
   SECRET_KEY=[generate random key]
   FLASK_ENV=production
   ```
6. Generate secret key:
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```
7. Deploy and wait for build to complete
8. Get backend URL: `https://your-backend.railway.app`

### Step 5: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - Framework: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.railway.app/api`
7. Click "Deploy"
8. Wait 2-5 minutes for build
9. Your app is live at: `https://nnhs-attendance-system.vercel.app`

### Step 6: Initialize Database

**Using Railway CLI**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run initialization
railway run python init_database.py
```

**Or use the web interface**:
1. Go to Railway → Your Backend Service
2. Click "Deploy Logs" → "Terminal"
3. Run: `python init_database.py`

### Step 7: First Login

1. Go to your deployed URL: `https://nnhs-attendance-system.vercel.app`
2. **Admin Registration** dialog appears automatically
3. Create your admin account:
   - Username: (your choice)
   - Password: (min 6 characters)
   - Security Question: (recommended)
   - Security Answer: (recommended)
4. Click "Create Admin Account"
5. Login with your new credentials
6. Start adding students and teachers!

### Deployment Costs

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Railway** | 500MB DB, $5 credit/mo | Easy setup, includes MySQL |
| **Vercel** | Unlimited sites, 100GB bandwidth | Frontend hosting |
| **PlanetScale** | 5GB storage | Serverless MySQL |
| **GitHub** | Unlimited public repos | Code hosting |

**Total**: $0/month for small schools (free tier)

---

## Environment Configuration

### Development Environment

**Backend** (`/backend/.env`):
```env
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_DB=nnhs_attendance
SECRET_KEY=dev-secret-key-change-in-production
FLASK_ENV=development
```

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Production Environment

**Backend** (Set in Railway Dashboard):
```env
MYSQL_HOST=${MYSQLHOST}
MYSQL_PORT=${MYSQLPORT}
MYSQL_USER=${MYSQLUSER}
MYSQL_PASSWORD=${MYSQLPASSWORD}
MYSQL_DB=nnhs_attendance
SECRET_KEY=[generated-secret-key]
FLASK_ENV=production
```

**Frontend** (Set in Vercel Dashboard):
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Troubleshooting

### Cannot Create Admin Account

**Error**: "Admin account already exists"
- **Cause**: An admin was already created (only 1 allowed)
- **Solution**: Use "Forgot Password" to reset admin password with security question

### Student Assignment Fails for Junior High

**Error**: Cannot add students to Grade 7-10 classrooms
- **Cause**: Old version (pre-v4.4)
- **Solution**: Update to v4.5, section extraction bug is fixed

### Scanner Shows "0 Students Enrolled"

**Check**:
1. Classroom has students assigned
2. Backend is running
3. Network connection is active

**Solution**:
- Add students to classroom first
- Restart backend: `python3 app.py`

### "Wrong Day" Error When Scanning

**Error**: "This schedule is only for [days]"
- **Cause**: Today is not a scheduled day
- **Solution**: 
  - Check teacher's schedule shows correct days
  - Use format: "MWF" or "Mon, Wed, Fri" or "Monday, Wednesday, Friday"
  - Make sure today matches the schedule

### Forgot Admin Password

**Solution**:
1. Click "Forgot Password" on login page
2. Answer security question
3. Set new password

If no security question was set:
```sql
-- Connect to MySQL
mysql -u root

USE nnhs_attendance;

-- Reset password to "newpassword123"
UPDATE admin SET password = '$2b$12$LQv3c1yqBwlVHpjNANOUdeDPKOKkbKbqTqQXWqnRy0VtJaqgA0/Aa' WHERE username = 'admin';
```

### Database Connection Errors

**Local Development**:
- Make sure MySQL is running (XAMPP/WAMP)
- Check credentials in `/backend/.env`
- Test connection: `mysql -u root`

**Production (Railway)**:
- Check environment variables are set
- Verify MySQL service is running
- Test: `railway run python -c "from app import db; print('Connected!')"`

### Build Failures

**Vercel Build Fails**:
- Check `package.json` has correct scripts
- Verify Node.js version compatibility
- Review build logs in Vercel dashboard

**Railway Build Fails**:
- Check `requirements.txt` is complete
- Verify Python version (Railway uses 3.11)
- Review deploy logs in Railway dashboard

### CSV Export Issues

**Student IDs Wrong Format**:
- Update to v4.0+ (fixed in changelog)
- Student IDs now export as text, not scientific notation

**Empty CSV**:
- Make sure students have attendance records
- Check date filter is correct

---

## Version History

### Version 4.5 (April 27, 2026) - Latest
**New Features**:
- ✅ **Admin Registration**: Secure first-time admin account creation
- ✅ **One Admin Limit**: System allows only 1 admin for security
- ✅ **Production Ready**: No need for init_database.py on deployment
- ✅ **Security Question**: Built into registration flow

**Benefits**:
- Deploy to Vercel/Railway and immediately create admin
- No database script exposure
- Password recovery without database access

### Version 4.4 (April 26, 2026)
**Fixes**:
- ✅ Junior High Student Assignment Bug Fixed
- ✅ Section extraction now works for "Section A" format
- ✅ All 28 classrooms fully functional

**Root Cause**: Section extraction used `.split('-').pop()` which failed for Junior High format "Section A" (no dash). Fixed with proper format detection.

### Version 4.3 (April 26, 2026)
- ✅ MWF schedule format support
- ✅ Enhanced day validation
- ✅ Verified all classrooms

### Version 4.2 (April 26, 2026)
- ✅ Scanner student display fix
- ✅ Security question setup fix

### Version 4.1 (April 26, 2026)
- ✅ Teacher deletion with cascade
- ✅ Complete student roster in attendance
- ✅ UI cleanup

### Version 4.0 (April 26, 2026)
- ✅ Deleted students handling
- ✅ Attendance rate capping (100% max)
- ✅ CSV export formatting fix

---

## Technology Stack

**Frontend**:
- React 18 + TypeScript
- Vite
- Tailwind CSS
- react-qr-scanner
- Sonner (toast notifications)

**Backend**:
- Flask (Python)
- SQLAlchemy ORM
- MySQL / MariaDB
- bcrypt (password hashing)

**Deployment**:
- Frontend: Vercel
- Backend: Railway
- Database: Railway MySQL / PlanetScale / Aiven

---

## Security Best Practices

### Production Checklist

- [ ] Change default admin password (if using init_database.py)
- [ ] Use strong SECRET_KEY (32+ characters)
- [ ] Set security question for admin
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up database backups
- [ ] Don't commit `.env` files to GitHub
- [ ] Use environment variables for secrets
- [ ] Regularly update dependencies
- [ ] Monitor error logs
- [ ] Review access logs periodically

### Backup Strategy

**Railway Backup**:
```bash
# Manual backup
railway run mysqldump nnhs_attendance > backup.sql

# Compressed backup
railway run mysqldump nnhs_attendance | gzip > backup-$(date +%Y%m%d).sql.gz
```

**Automated Backups**: Available in Railway Pro plan

---

## Support & Resources

### Documentation
- This file: Complete system guide
- ATTRIBUTIONS.md: Credits and licenses

### Official Resources
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Flask Docs](https://flask.palletsprojects.com)
- [React Docs](https://react.dev)

### Need Help?

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Version History](#version-history) for known issues
3. Verify you're on the latest version (4.5)

---

**Status**: ✅ Production Ready  
**Version**: 4.5  
**Last Updated**: April 27, 2026

🎓 **Developed for Nahawan National High School**

---

*Credits: See ATTRIBUTIONS.md*
