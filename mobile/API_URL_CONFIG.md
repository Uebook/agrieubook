# 📱 Mobile App API URL Configuration

## ✅ Current Configuration

The API URL is already configured in `mobile/src/services/api.js`:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' // Development
  : 'https://admin-orcin-omega.vercel.app'; // Production
```

## 🌐 Production URL

**Production API URL**: `https://admin-orcin-omega.vercel.app`

All API endpoints are available at:
- `https://admin-orcin-omega.vercel.app/api/books`
- `https://admin-orcin-omega.vercel.app/api/auth/login`
- `https://admin-orcin-omega.vercel.app/api/auth/register`
- etc.

## 📱 Testing on Physical Device

If you're testing on a physical device (not emulator), you need to:

1. **Find your computer's IP address**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **Update API URL** in `mobile/src/services/api.js`:
   ```javascript
   const API_BASE_URL = __DEV__ 
     ? 'http://192.168.1.100:3000' // Replace with your IP
     : 'https://admin-orcin-omega.vercel.app';
   ```

3. **Make sure your computer and phone are on the same WiFi network**

4. **Start the admin panel locally**:
   ```bash
   cd admin
   npm run dev
   ```

## 🚀 Production Build

For production builds (APK/IPA), the app will automatically use:
```
https://admin-orcin-omega.vercel.app
```

No changes needed!

## ✅ Status

- ✅ API URL configured for production
- ✅ API URL configured for development
- ✅ All API endpoints accessible
- ✅ Mobile app ready to connect to Vercel deployment

---

**Last Updated**: API URL is set and ready to use! 🎉

