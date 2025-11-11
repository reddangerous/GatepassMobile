# Backend API Setup Guide

This mobile app now connects to a backend API that uses MSSQL database instead of Supabase.

## Backend Requirements

Your backend API needs to implement the following endpoints:

### Authentication Endpoints

#### POST /api/auth/login
Login with payroll number and password.

**Request Body:**
```json
{
  "payroll_no": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "string",
    "name": "string",
    "payroll_no": "string",
    "email": "string",
    "role": "STAFF|HOD|SECURITY|ADMIN",
    "department_id": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

#### GET /api/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** User object

#### POST /api/auth/logout
Logout current user (requires authentication).

### Gate Pass Endpoints

#### POST /api/gate-passes
Create a new gate pass request.

**Request Body:**
```json
{
  "user_id": "string",
  "reason": "string",
  "destination": "string",
  "expected_return": "ISO 8601 datetime string"
}
```

#### GET /api/gate-passes/user/:userId
Get all gate passes for a specific user.

#### GET /api/gate-passes/pending/:hodId
Get pending approvals for HOD (filtered by department).

#### POST /api/gate-passes/:passId/approve
Approve a gate pass.

**Request Body:**
```json
{
  "hod_id": "string"
}
```

#### POST /api/gate-passes/:passId/reject
Reject a gate pass.

**Request Body:**
```json
{
  "hod_id": "string"
}
```

#### GET /api/gate-passes/payroll/:payrollNo
Get active gate pass by payroll number (for security).

#### POST /api/gate-passes/:passId/checkout
Mark gate pass as checked out.

#### POST /api/gate-passes/:passId/checkin
Mark gate pass as returned/checked in.

#### GET /api/gate-passes
Get all gate passes (admin only).

## Database Schema

Your MSSQL database should have the following tables:

### users
- id (VARCHAR PRIMARY KEY)
- name (VARCHAR)
- payroll_no (VARCHAR UNIQUE)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- role (VARCHAR: 'STAFF', 'HOD', 'SECURITY', 'ADMIN')
- department_id (VARCHAR)
- created_at (DATETIME)
- updated_at (DATETIME)

### departments
- id (VARCHAR PRIMARY KEY)
- name (VARCHAR)
- created_at (DATETIME)

### gate_passes
- id (VARCHAR PRIMARY KEY)
- user_id (VARCHAR FOREIGN KEY)
- hod_id (VARCHAR FOREIGN KEY nullable)
- reason (TEXT)
- destination (VARCHAR)
- expected_return (DATETIME)
- request_time (DATETIME)
- approval_time (DATETIME nullable)
- rejection_time (DATETIME nullable)
- out_time (DATETIME nullable)
- in_time (DATETIME nullable)
- total_duration_minutes (INT nullable)
- status (VARCHAR: 'PENDING', 'APPROVED', 'REJECTED', 'CHECKED_OUT', 'RETURNED')
- created_at (DATETIME)

## Setting Up the Backend

1. Create a Node.js/Express backend with MSSQL connection
2. Install required packages:
   ```bash
   npm install express mssql bcrypt jsonwebtoken cors dotenv
   ```

3. Configure MSSQL connection:
   ```javascript
   const sql = require('mssql');
   
   const config = {
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     server: process.env.DB_SERVER,
     database: process.env.DB_DATABASE,
     options: {
       encrypt: true,
       trustServerCertificate: false
     }
   };
   ```

4. Implement the API endpoints listed above
5. Use JWT for authentication
6. Add proper error handling and validation
7. Configure CORS to allow requests from your Expo app

## Mobile App Configuration

1. Copy `.env.example` to `.env`
2. Update `EXPO_PUBLIC_API_URL` with your backend API URL
3. For development: `http://YOUR_COMPUTER_IP:3000/api`
4. For production: Your hosted API URL

## Running the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Make sure your backend API is running and accessible from your device/emulator

## Notes

- The mobile app now stores the JWT token securely using `expo-secure-store`
- All API requests include the JWT token in the Authorization header
- Session management is handled automatically by the API service
- If the token expires (401 response), the user will be logged out automatically
