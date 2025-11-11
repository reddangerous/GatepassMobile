# ⚠️ IMPORTANT: localhost vs IP Address

## The Problem with localhost

**localhost DOES NOT work for mobile apps on physical devices!**

### Why?

When you use `localhost` or `127.0.0.1`:
- ❌ It refers to the device itself, not your computer
- ❌ Your phone can't reach your computer's backend
- ❌ You'll get "Network request failed" errors
- ❌ API calls will timeout or fail

### The Solution

**Always use your computer's actual IP address:**

✅ **Correct:** `http://192.168.2.53:3000/api`  
❌ **Wrong:** `http://localhost:3000/api`

## Your Configuration

Your system is configured to use:
```
IP Address: 192.168.2.53
Port: 3000
Full URL: http://192.168.2.53:3000/api
```

## When to Use What

### Use IP Address (192.168.2.53)
✅ Testing on physical device (phone/tablet)
✅ Testing over WiFi network
✅ When someone else needs to access your backend
✅ **Most common scenario - use this!**

### Use localhost
✅ Only when testing in iOS Simulator
✅ Only when testing in Android Emulator
✅ When running backend and frontend on same machine (web browser)

## How to Find Your IP Address

### Windows
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter

### Mac/Linux
```bash
ifconfig
# or
ip addr
```

### Common IP Address Formats
- `192.168.x.x` (Most common home/office networks)
- `10.0.x.x` (Some networks)
- `172.16.x.x` to `172.31.x.x` (Some networks)

## Configuration Files Updated

All these files now use `192.168.2.53`:

1. ✅ `.env` → `EXPO_PUBLIC_API_URL=http://192.168.2.53:3000/api`
2. ✅ `app.json` → `extra.apiUrl`
3. ✅ `lib/api.ts` → Default fallback URL
4. ✅ `.env.example` → Documentation

## Testing Backend Accessibility

Before running the mobile app, verify your backend is accessible:

### From your computer (should work)
```bash
curl http://localhost:3000/health
# or
curl http://192.168.2.53:3000/health
```

### From your phone's browser
Open browser and go to:
```
http://192.168.2.53:3000/health
```

Should show:
```json
{"status":"ok","timestamp":"...","service":"GatePass API"}
```

## Troubleshooting

### Error: "Network request failed"
1. ✅ Check backend is running: `cd backend && npm run dev`
2. ✅ Verify IP address in `.env` matches your computer's IP
3. ✅ Test backend in phone's browser first
4. ✅ Ensure phone and computer on same WiFi
5. ✅ Check Windows Firewall allows port 3000

### Error: "Connection timeout"
1. ✅ Check firewall settings
2. ✅ Ensure no VPN is blocking local network
3. ✅ Verify port 3000 is not blocked
4. ✅ Try accessing backend from phone's browser

### Windows Firewall Configuration

If you can't connect, allow port 3000:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules"
4. Click "New Rule"
5. Select "Port" → Next
6. Select "TCP" and enter port "3000" → Next
7. Select "Allow the connection" → Next
8. Select all profiles → Next
9. Name it "GatePass Backend" → Finish

## Network Requirements

For the mobile app to work:
- ✅ Backend server running on your computer
- ✅ Computer IP address: `192.168.2.53`
- ✅ Backend listening on port `3000`
- ✅ Phone and computer on **same WiFi network**
- ✅ Firewall allows incoming connections on port 3000

## Quick Check Command

Run this from your phone's terminal app (or use a REST client):
```bash
curl http://192.168.2.53:3000/health
```

If it returns JSON with `"status":"ok"`, you're good to go! 🎉

## Remember

🔴 **localhost = Your device**  
🟢 **192.168.2.53 = Your computer**

Always use your computer's IP address (192.168.2.53) for mobile development!

---

**Current Setup:**
- Backend running at: `http://192.168.2.53:3000`
- API endpoint: `http://192.168.2.53:3000/api`
- Mobile app configured correctly ✅
