# GatePass Mobile App

A React Native mobile application for managing employee gate passes, built with Expo and connected to a MSSQL backend.

## 🚀 Quick Start

**New to this project?** Start here:
1. 📖 **[QUICKSTART.md](QUICKSTART.md)** - Complete setup guide (15 minutes)
2. 📋 **[COMPLETE_SETUP.md](COMPLETE_SETUP.md)** - Full system overview

**Backend Documentation:**
- 🔧 **[backend/README.md](backend/README.md)** - Backend API documentation

**Other Resources:**
- 📝 **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** - Migration from Supabase notes
- 🗄️ **[database/mssql-schema.sql](database/mssql-schema.sql)** - Database schema

---

## Features

- **Staff Portal**: Create and track gate pass requests
- **HOD Portal**: Approve or reject gate pass requests from department members
- **Security Portal**: Scan payroll numbers and manage check-in/check-out
- **Admin Portal**: View all gate passes and system statistics
- **Secure Authentication**: JWT-based authentication with secure token storage
- **Real-time Updates**: Track gate pass status in real-time

## Technology Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **HTTP Client**: Axios
- **Authentication**: JWT with Expo Secure Store
- **Backend**: Node.js/Express with MSSQL

## Project Structure

```
GatepassMobile/
├── app/                    # Application screens
│   ├── (tabs)/            # Tab-based screens (staff view)
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry point
│   ├── login.tsx          # Login screen
│   ├── admin.tsx          # Admin portal
│   └── security.tsx       # Security portal
├── assets/                 # Images and static assets
├── components/            # Reusable UI components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── database/              # Database schema
│   └── mssql-schema.sql   # MSSQL database schema
├── lib/                   # Core libraries
│   ├── api.ts            # API service layer
│   └── types.ts          # TypeScript type definitions
├── utils/                 # Utility functions
│   └── gatePassService.ts # Gate pass API calls
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Prerequisites

1. Node.js 18+ and npm
2. Expo CLI (`npm install -g expo-cli`)
3. A running backend API connected to MSSQL (see BACKEND_SETUP.md)
4. For iOS: Xcode and iOS Simulator
5. For Android: Android Studio and Android Emulator
6. Expo Go app on your physical device (optional)

## Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies:**
   ```bash
   cd GatepassMobile
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the API URL:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000/api
   ```

   Replace `YOUR_COMPUTER_IP` with your actual IP address (not localhost if testing on a physical device).

4. **Set up the backend:**
   - Follow the instructions in `BACKEND_SETUP.md`
   - Ensure your MSSQL database is running
   - Run the schema from `database/mssql-schema.sql`
   - Start your backend API server

## Running the App

### Development Mode

```bash
npm run dev
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your phone

### Building for Production

For iOS:
```bash
eas build --platform ios
```

For Android:
```bash
eas build --platform android
```

For Web:
```bash
npm run build:web
```

## User Roles

The system supports four user roles:

1. **STAFF**: Can create gate pass requests and view their history
2. **HOD** (Head of Department): Can approve/reject requests from their department
3. **SECURITY**: Can scan payroll numbers and manage check-in/check-out
4. **ADMIN**: Can view all gate passes and system data

## Default Test Users

After running the database schema, you can log in with these test accounts:

- **Staff**: `4232` / `password123`
- **HOD**: `5643` / `password123`
- **Security**: `1001` / `password123`
- **Admin**: `9999` / `password123`

## API Integration

The app communicates with a backend API. All endpoints are documented in `BACKEND_SETUP.md`.

Key features:
- Automatic JWT token management
- Secure token storage using Expo Secure Store
- Automatic token refresh on 401 responses
- Error handling and user-friendly error messages

## Database

The app uses MSSQL as the database. The complete schema is available in `database/mssql-schema.sql`.

Key tables:
- `users`: Employee information and credentials
- `departments`: Department/division information
- `gate_passes`: Gate pass requests and their status

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Secure token storage on device
- Automatic logout on token expiration
- Role-based access control

## Troubleshooting

### Cannot connect to API
- Make sure your backend server is running
- Check that the API URL in `.env` is correct
- If using a physical device, ensure it's on the same network as your development machine
- Use your computer's IP address, not `localhost`

### Build errors after migration
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear watchman: `watchman watch-del-all`

### Authentication issues
- Check that the backend is returning proper JWT tokens
- Verify the token is being stored (check Expo Secure Store)
- Check network requests in the console

## Development Workflow

1. Make changes to the code
2. The app will automatically reload (Fast Refresh)
3. Test on simulator/device
4. Check the backend logs for API requests
5. Debug using React Native Debugger or Expo DevTools

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly on both iOS and Android
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
