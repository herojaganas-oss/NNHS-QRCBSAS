# NNHS QR Code-Based Student Attendance Monitoring System

**Version**: 4.5 - Production Ready  
**Last Updated**: April 27, 2026

A comprehensive web-based attendance tracking system for Nahawan National High School, featuring QR code scanning, real-time monitoring, admin registration, and multi-subject attendance tracking.

---

## 📖 Complete Documentation

See **[SYSTEM_GUIDE.md](SYSTEM_GUIDE.md)** for:
- Full feature list
- Installation & setup guide
- **First-time admin registration** (for production deployments)
- User guide (Admin & Teacher)
- Deployment instructions (GitHub, Vercel, Railway)
- Environment configuration
- Troubleshooting
- Version history

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Setup database
cd backend
python3 init_database.py

# 2. Start backend
pip install -r requirements.txt
python3 app.py

# 3. Start frontend (new terminal)
npm install
npm run dev

# 4. Open http://localhost:5173
```

Default credentials (development):
- Admin: `admin` / `admin123`
- Teacher: `teacher1` / `teacher123`

### Production Deployment

See [SYSTEM_GUIDE.md - Deployment Guide](SYSTEM_GUIDE.md#deployment-guide)

**First-time setup**: When you deploy online, the system automatically prompts you to create an admin account (no database initialization needed!)

---

## ✨ New in Version 4.5

- ✅ **Admin Registration**: Secure first-time admin account creation for production
- ✅ **One Admin Limit**: System allows only 1 admin for security
- ✅ **No Database Scripts Needed**: Deploy and register admin directly from web interface
- ✅ **Security Question**: Built into registration for password recovery

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **Backend**: Flask (Python), SQLAlchemy, MySQL
- **Deployment**: Vercel (frontend), Railway (backend + database)

---

## 📞 Support

**Read the complete guide**: [SYSTEM_GUIDE.md](SYSTEM_GUIDE.md)

**Quick Links**:
- [Features](SYSTEM_GUIDE.md#features)
- [Admin Registration](SYSTEM_GUIDE.md#first-time-setup--admin-registration)
- [User Guide](SYSTEM_GUIDE.md#user-guide)
- [Deployment](SYSTEM_GUIDE.md#deployment-guide)
- [Troubleshooting](SYSTEM_GUIDE.md#troubleshooting)

---

**Status**: ✅ Production Ready  
🎓 Developed for Nahawan National High School
