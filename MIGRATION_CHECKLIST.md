# GatePass Migration Checklist

Use this checklist to ensure you've completed all necessary steps for the Supabase to MSSQL migration.

## ✅ Mobile App (Completed)

- [x] Remove Supabase dependencies from package.json
- [x] Add axios and expo-secure-store
- [x] Create API service layer (lib/api.ts)
- [x] Update gatePassService to use REST API
- [x] Update AuthContext for JWT authentication
- [x] Remove Supabase folder
- [x] Update app.json configuration
- [x] Create environment configuration files
- [x] Create documentation (README, BACKEND_SETUP, etc.)

## 📋 Database Setup (To Do)

- [ ] Install MSSQL Server
- [ ] Create a new database (e.g., "GatePassDB")
- [ ] Run the schema script from `database/mssql-schema.sql`
- [ ] Verify tables were created successfully
- [ ] Check that sample data was inserted
- [ ] Note down connection details:
  - Server: _______________
  - Database: _______________
  - User: _______________
  - Password: _______________

## 🔧 Backend API Setup (To Do)

### 1. Initialize Project
- [ ] Create a new folder for backend (e.g., "GatePassAPI")
- [ ] Initialize Node.js project: `npm init -y`
- [ ] Install dependencies:
  ```bash
  npm install express mssql bcrypt jsonwebtoken cors dotenv
  npm install -D nodemon typescript @types/node @types/express
  ```

### 2. Create Backend Structure
- [ ] Create folder structure:
  ```
  backend/
  ├── src/
  │   ├── config/
  │   │   └── database.js
  │   ├── middleware/
  │   │   └── auth.js
  │   ├── routes/
  │   │   ├── auth.js
  │   │   └── gatePasses.js
  │   ├── controllers/
  │   │   ├── authController.js
  │   │   └── gatePassController.js
  │   └── server.js
  ├── .env
  └── package.json
  ```

### 3. Configure Environment
- [ ] Create `.env` file with:
  ```
  PORT=3000
  DB_SERVER=localhost
  DB_DATABASE=GatePassDB
  DB_USER=your_user
  DB_PASSWORD=your_password
  JWT_SECRET=your_secret_key_here
  ```

### 4. Implement API Endpoints
Refer to BACKEND_SETUP.md for detailed endpoint specifications.

Authentication routes (routes/auth.js):
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me
- [ ] POST /api/auth/logout

Gate Pass routes (routes/gatePasses.js):
- [ ] POST /api/gate-passes
- [ ] GET /api/gate-passes/user/:userId
- [ ] GET /api/gate-passes/pending/:hodId
- [ ] POST /api/gate-passes/:passId/approve
- [ ] POST /api/gate-passes/:passId/reject
- [ ] GET /api/gate-passes/payroll/:payrollNo
- [ ] POST /api/gate-passes/:passId/checkout
- [ ] POST /api/gate-passes/:passId/checkin
- [ ] GET /api/gate-passes

### 5. Add Middleware
- [ ] JWT authentication middleware
- [ ] Role-based authorization middleware
- [ ] Error handling middleware
- [ ] CORS configuration

### 6. Test Backend
- [ ] Test database connection
- [ ] Test login endpoint with sample users
- [ ] Test creating a gate pass
- [ ] Test approval workflow
- [ ] Test security check-in/out
- [ ] Test error handling

## 📱 Mobile App Configuration (To Do)

### 1. Environment Setup
- [ ] Navigate to GatepassMobile folder
- [ ] Copy `.env.example` to `.env`
- [ ] Update API URL in `.env`:
  - For development: `http://YOUR_COMPUTER_IP:3000/api`
  - Replace YOUR_COMPUTER_IP with actual IP

### 2. Install Dependencies
- [ ] Run `npm install` in GatepassMobile folder
- [ ] Verify all packages installed successfully

### 3. Test Mobile App
- [ ] Start the backend API server
- [ ] Start Expo: `npm run dev`
- [ ] Test on iOS simulator (Press 'i')
- [ ] Test on Android emulator (Press 'a')
- [ ] Test on physical device (Scan QR code)

## 🧪 Testing (To Do)

### Authentication Testing
- [ ] Login as STAFF (EMP001)
- [ ] Login as HOD (EMP002)
- [ ] Login as SECURITY (SEC001)
- [ ] Login as ADMIN (ADM001)
- [ ] Test invalid credentials
- [ ] Test logout

### Staff Workflow
- [ ] Create a new gate pass request
- [ ] View gate pass history
- [ ] Check gate pass status updates

### HOD Workflow
- [ ] View pending approvals
- [ ] Approve a gate pass
- [ ] Reject a gate pass
- [ ] View approval history

### Security Workflow
- [ ] Scan/enter payroll number
- [ ] Check out approved gate pass
- [ ] Check in returned employee
- [ ] View check-in/out history

### Admin Workflow
- [ ] View all gate passes
- [ ] View statistics
- [ ] Filter by status/date

## 🚀 Deployment (Future)

### Backend Deployment
- [ ] Choose hosting provider (Azure, AWS, etc.)
- [ ] Set up production database
- [ ] Deploy backend API
- [ ] Configure environment variables
- [ ] Set up SSL/HTTPS
- [ ] Test production API

### Mobile App Deployment
- [ ] Update API URL in app.json for production
- [ ] Build for iOS (EAS build or Xcode)
- [ ] Build for Android (EAS build or Android Studio)
- [ ] Test production builds
- [ ] Submit to App Store (iOS)
- [ ] Submit to Play Store (Android)

## 📚 Documentation
- [x] README.md - App overview and setup
- [x] BACKEND_SETUP.md - API documentation
- [x] MIGRATION_SUMMARY.md - Migration details
- [x] database/mssql-schema.sql - Database schema
- [ ] API documentation (Swagger/Postman)
- [ ] User manual
- [ ] Admin guide

## 🔐 Security Checklist
- [ ] Change default passwords in production
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Implement rate limiting on API
- [ ] Add input validation
- [ ] Sanitize user inputs
- [ ] Add logging and monitoring
- [ ] Regular security audits

## 🎯 Next Immediate Steps

1. **Set up MSSQL Database** (Highest Priority)
2. **Create Backend API** 
3. **Test locally**
4. **Deploy to production**

## Notes

- Keep a backup of the old Supabase version until migration is fully tested
- Document any issues encountered during migration
- Update this checklist as you complete each task

---

**Migration Started:** [Date]  
**Target Completion:** [Date]  
**Status:** In Progress
