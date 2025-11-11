# 🚀 Quick Start Guide - GatePass System

Complete setup guide to get your GatePass Mobile App + Backend running.

## Prerequisites Checklist

- ✅ Node.js 16+ installed
- ✅ MSSQL Server running and accessible
- ✅ Database created (e.g., `StaffGP`)
- ✅ Network connectivity (mobile device and server on same network for testing)

## Step-by-Step Setup

### 1️⃣ Database Setup (5 minutes)

1. **Connect to your MSSQL Server** using SQL Server Management Studio or Azure Data Studio

2. **Create the database:**
   ```sql
   CREATE DATABASE StaffGP;
   GO
   ```

3. **Run the schema script:**
   - Open `database/mssql-schema.sql`
   - Execute it against the `StaffGP` database
   - This creates all tables, indexes, triggers, and sample data

4. **Verify tables were created:**
   ```sql
   USE StaffGP;
   SELECT * FROM users;
   SELECT * FROM departments;
   SELECT * FROM gate_passes;
   ```

### 2️⃣ Backend Setup (5 minutes)

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your actual database connection:
   ```env
   DATABASE_URL="sqlserver://YOUR_SERVER\INSTANCE;database=StaffGP;user=YOUR_USER;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true;integratedSecurity=false;connectionTimeout=30;commandTimeout=30"
   JWT_SECRET="change-this-to-random-string-in-production"
   PORT=3000
   ```

5. **Seed the database (optional, if schema didn't include sample data):**
   ```bash
   npm run seed
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ╔═══════════════════════════════════════╗
   ║   GatePass API Server                 ║
   ║   Environment: development            ║
   ║   Port: 3000                          ║
   ║   Status: Running ✓                   ║
   ╚═══════════════════════════════════════╝
   ```

7. **Test the backend:**
   ```bash
   curl http://localhost:3000/health
   ```

   Should return:
   ```json
   {"status":"ok","timestamp":"...","service":"GatePass API"}
   ```

### 3️⃣ Mobile App Setup (5 minutes)

1. **Navigate back to project root:**
   ```bash
   cd ..
   ```

2. **Install mobile app dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your backend URL:
   
   **⚠️ CRITICAL: Use your computer's IP address, NOT localhost!**
   
   Localhost only works in simulator - for physical devices or network access, you MUST use your computer's actual IP address.
   
   **Correct:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.2.53:3000/api
   ```
   
   **Wrong (won't work on physical devices):**
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```
   
   **How to find your IP address:**
   - Windows: `ipconfig` in CMD (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   - Example: `192.168.2.53`, `192.168.1.100`, etc.

5. **Start the mobile app:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

### 4️⃣ Test the Complete System

1. **Login with test accounts:**
   - Payroll: `4232` / Password: `password123` (Staff)
   - Payroll: `5643` / Password: `password123` (HOD)
   - Payroll: `1001` / Password: `password123` (Security)
   - Payroll: `9999` / Password: `password123` (Admin)

2. **Test the flow:**
   - Login as Staff (4232) → Create a gate pass request
   - Login as HOD (5643) → Approve the request
   - Login as Security (1001) → Scan payroll number → Check out/in

## 📁 Project Structure

```
GatepassMobile/
├── backend/                    # Backend API Server
│   ├── config/                # Database connection
│   ├── middleware/            # Auth & error handling
│   ├── routes/                # API endpoints
│   ├── scripts/               # Seed & utility scripts
│   ├── .env                   # Backend configuration
│   ├── server.js              # Server entry point
│   └── package.json           # Backend dependencies
├── app/                       # Mobile app screens
├── lib/                       # API client & types
├── utils/                     # Service functions
├── database/                  # SQL schema
├── .env                       # Mobile app configuration
└── package.json               # Mobile app dependencies
```

## 🔧 Common Issues & Solutions

### Backend won't start

**Issue:** `Cannot connect to database`
- ✅ Verify MSSQL Server is running
- ✅ Check DATABASE_URL format
- ✅ Ensure database exists
- ✅ Test connection with SQL Server Management Studio

**Issue:** `Port 3000 already in use`
- ✅ Change PORT in backend/.env to another port (e.g., 3001)
- ✅ Update EXPO_PUBLIC_API_URL in mobile .env

### Mobile app can't connect to backend

**Issue:** `Network request failed`
- ✅ Ensure backend server is running
- ✅ **CRITICAL:** Use computer's IP address (e.g., `192.168.2.53`), NOT localhost
- ✅ localhost ONLY works in simulator, never on physical devices
- ✅ Check firewall isn't blocking port 3000
- ✅ Ensure phone and computer are on same WiFi network
- ✅ Test backend URL in browser: `http://192.168.2.53:3000/health`

**Issue:** `401 Unauthorized`
- ✅ Clear app cache: `npx expo start -c`
- ✅ Check if JWT_SECRET is set in backend/.env

### Database errors

**Issue:** `Invalid object name 'users'`
- ✅ Run database schema script again
- ✅ Verify you're connected to correct database

## 🎯 Next Steps

1. **Customize the database:** Add your own departments and users
2. **Change passwords:** Use the seed script or update directly in DB
3. **Configure for production:** Update JWT_SECRET, use HTTPS
4. **Add features:** Customize the app to your needs

## 📚 Documentation

- **Backend API:** See `backend/README.md`
- **Mobile App:** See `README.md`
- **Database:** See `database/mssql-schema.sql`
- **Migration Notes:** See `MIGRATION_SUMMARY.md`

## 💡 Development Tips

- **Backend logs:** Watch terminal where `npm run dev` is running
- **Mobile logs:** Check Expo DevTools or Metro bundler
- **Database queries:** Use SQL Server Management Studio to inspect data
- **API testing:** Use Postman or Thunder Client to test endpoints

## 🆘 Need Help?

Common commands:

```bash
# Restart backend with clean slate
cd backend
rm -rf node_modules
npm install
npm run dev

# Restart mobile app with clean cache
cd ..
npx expo start -c

# Reseed database
cd backend
npm run seed

# Check backend is accessible
curl http://localhost:3000/health
```

## ✅ System Requirements

### Development
- Node.js 16+
- MSSQL Server (any version supporting the schema)
- 4GB RAM minimum
- Windows, macOS, or Linux

### Production
- Server with Node.js runtime
- MSSQL Server instance
- SSL certificate (for HTTPS)
- Stable network connection

---

**🎉 You're all set! Your GatePass system is now ready to use.**
