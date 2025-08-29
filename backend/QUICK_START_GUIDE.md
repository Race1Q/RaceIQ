# 🚀 RaceIQ Public API - Quick Start Guide

## ✅ Current Status

**The Driver Standings API is now PUBLIC and ready to use!** 

### What's Working:
- ✅ All driver standings endpoints are publicly accessible
- ✅ No authentication required
- ✅ Enhanced error handling and validation
- ✅ Pagination support
- ✅ Comprehensive logging
- ✅ Input validation

### What's Temporarily Disabled:
- ⚠️ Swagger documentation (due to TypeScript compilation issues)
- ⚠️ Interactive API docs at `/api/docs`

## 🎯 Available Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/driver-standings` | GET | Get all driver standings with pagination |
| `/api/driver-standings/current` | GET | Get current season standings |
| `/api/driver-standings/season/{season}` | GET | Get standings by season |
| `/api/driver-standings/race/{raceId}` | GET | Get standings by race |
| `/api/driver-standings/driver/{driverId}` | GET | Get standings by driver |
| `/api/driver-standings/search` | GET | Search standings |
| `/api/driver-standings/test-connection` | GET | Test database connection |

## 🚀 How to Start the Server

### Option 1: Using npm (if PowerShell execution policy allows)
```bash
cd backend
npm run start:dev
```

### Option 2: Direct Node.js (if npm is blocked)
```bash
cd backend
node dist/src/main.js
```

### Option 3: Build and Run
```bash
cd backend
npm run build
node dist/src/main.js
```

## 🧪 Testing the API

### Option 1: Use the simple test script
```bash
cd backend
node test-api-simple.js
```

### Option 2: Manual testing with curl
```bash
# Test connection
curl "http://localhost:3000/api/driver-standings/test-connection"

# Get all standings
curl "http://localhost:3000/api/driver-standings"

# Get current season
curl "http://localhost:3000/api/driver-standings/current"

# Get by season
curl "http://localhost:3000/api/driver-standings/season/2023"

# Get with pagination
curl "http://localhost:3000/api/driver-standings?limit=5&offset=0"
```

### Option 3: Browser testing
Open these URLs in your browser:
- `http://localhost:3000/api/driver-standings/test-connection`
- `http://localhost:3000/api/driver-standings`
- `http://localhost:3000/api/driver-standings/current`

## 📚 Documentation

- **API Documentation**: `API_DOCUMENTATION.md` - Complete API reference
- **Setup Summary**: `PUBLIC_API_SETUP.md` - What was implemented
- **Configuration**: `src/config/api-access.config.ts` - Public vs protected endpoints

## 🔧 Troubleshooting

### PowerShell Execution Policy Issues
If you get execution policy errors, try:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
If port 3000 is busy, change it in your `.env.back` file:
```
PORT=3001
```

### Database Connection Issues
Make sure your Supabase configuration is correct in `.env.back`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎉 Success Indicators

When everything is working, you should see:
```
🚀 Application is running on: http://localhost:3000
📚 API Documentation available at: http://localhost:3000/api/docs (Swagger temporarily disabled)
```

And the test script should show:
```
✅ Server is running! Starting tests...
📡 Testing: Get All Driver Standings
   ✅ Status: 200
   ⏱️  Response Time: 150ms
   📊 Data Length: 100
```

## 🔄 Next Steps (Optional)

1. **Re-enable Swagger**: Fix the TypeScript compilation issues with DTOs
2. **Add Rate Limiting**: Implement rate limiting for public endpoints
3. **Add Analytics**: Track API usage
4. **Make More Endpoints Public**: Follow the same pattern for other endpoints

## 📞 Support

The API is now ready for external consumption! Users can:
- Access driver standings data without authentication
- Use the comprehensive documentation in `API_DOCUMENTATION.md`
- Test endpoints using the provided test scripts

---

**🎯 Goal Achieved: Driver Standings API is now publicly accessible!**
