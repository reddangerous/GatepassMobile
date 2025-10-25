# 📋 Implementation Checklist

Use this checklist to set up your GatePass system step by step.

## ☑️ Pre-Setup

- [ ] MSSQL Server installed and running
- [ ] Node.js 16+ installed
- [ ] Database name decided (e.g., `StaffGP`)
- [ ] Database credentials ready

## ☑️ Database Setup

- [ ] Create database in MSSQL Server
- [ ] Run `database/mssql-schema.sql` script
- [ ] Verify tables created (users, departments, gate_passes)
- [ ] Test sample user login works in database

## ☑️ Backend Setup

- [ ] Navigate to `backend/` folder
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Edit `.env` with your DATABASE_URL
- [ ] Change JWT_SECRET to a random string
- [ ] Run `npm run seed` (optional, if no sample data)
- [ ] Start server with `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:3000/health`
- [ ] Test login endpoint with Postman/cURL

## ☑️ Mobile App Setup

- [ ] Navigate back to project root
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Edit `.env` with your computer's IP address
- [ ] Start app with `npm run dev`
- [ ] Open app in simulator or scan QR code

## ☑️ Testing

- [ ] Login as Staff (4232/password123)
- [ ] Create a gate pass request
- [ ] Login as HOD (5643/password123)
- [ ] Approve the gate pass
- [ ] Login as Security (1001/password123)
- [ ] Search by payroll number
- [ ] Check out the gate pass
- [ ] Check in the gate pass
- [ ] Login as Admin (9999/password123)
- [ ] View all gate passes

## ☑️ Customization

- [ ] Add your company's departments
- [ ] Add real user accounts
- [ ] Change default passwords
- [ ] Update app branding (name, icon)
- [ ] Configure company-specific settings

## ☑️ Production Preparation

- [ ] Change JWT_SECRET to strong random string
- [ ] Update all default passwords
- [ ] Configure production DATABASE_URL
- [ ] Set up HTTPS/SSL for backend
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Test on real devices
- [ ] Prepare deployment environment

## ☑️ Documentation Review

- [ ] Read QUICKSTART.md
- [ ] Read backend/README.md
- [ ] Review API endpoints
- [ ] Understand authentication flow
- [ ] Review database schema

---

## 🎯 Success Criteria

✅ Backend server starts without errors
✅ Mobile app connects to backend
✅ Can login with test accounts
✅ Can create gate pass requests
✅ Can approve/reject requests
✅ Can check-in/check-out
✅ Data persists in database

---

## 📞 If Something Goes Wrong

### Backend won't start
1. Check DATABASE_URL format
2. Verify MSSQL Server is running
3. Test database connection with SSMS
4. Check node_modules installed

### Mobile app can't connect
1. Verify backend is running
2. Use IP address, not localhost
3. Check same WiFi network
4. Test API with curl/Postman first

### Database errors
1. Verify schema was created
2. Check table names are correct
3. Verify user permissions
4. Check connection string

---

## ✨ You're Done When...

- ✅ You can login from mobile app
- ✅ You can create a gate pass
- ✅ You can approve a gate pass
- ✅ You can check someone in/out
- ✅ All data appears in database

**Next:** Start customizing for your needs!
