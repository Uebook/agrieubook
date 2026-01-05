# 🔍 Upload File Debugging Guide

## Current Issue
File uploads from mobile app are still failing.

## Enhanced Debugging Added

### 1. Server-Side Logging
The upload API now logs:
- File object type and constructor
- File reading method used
- File buffer size
- Detailed error information

### 2. Check Vercel Logs

To see what's happening:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: admin-orcin-omega
3. **Go to**: Functions → `/api/upload` → Logs
4. **Look for**:
   - "Upload request received" - Shows what file object was received
   - "Processing file" - Shows file type detection
   - "File read successfully" - Confirms file was read
   - Error messages with details

### 3. Common Issues & Solutions

#### Issue 1: "Unsupported file type"
**Cause**: React Native FormData sends files differently than web FormData

**Solution**: The code now tries multiple methods:
1. File object (web)
2. Blob with arrayBuffer()
3. ReadableStream
4. Blob conversion
5. String fallback

#### Issue 2: "Failed to read file"
**Cause**: File object format not recognized

**Check logs for**:
- `fileTypeOf`: Should show the type
- `fileConstructor`: Should show the constructor name
- `hasArrayBuffer`: Whether arrayBuffer method exists

#### Issue 3: "Network request failed"
**Cause**: Connection issue or API not accessible

**Check**:
- API URL is correct: `https://admin-orcin-omega.vercel.app`
- Internet connection
- Vercel deployment is live

### 4. Testing Steps

1. **Try uploading from mobile app**
2. **Check Vercel function logs** immediately after
3. **Look for error messages** in the logs
4. **Share the log output** to identify the exact issue

### 5. What to Look For in Logs

```
Upload request received: {
  hasFile: true/false,
  fileTypeOf: "object" or "string",
  fileConstructor: "File" or "Blob" or other,
  bucket: "books",
  folder: "pdfs",
  fileName: "...",
  mimeType: "application/pdf"
}
```

If you see:
- `hasFile: false` → File not being sent correctly
- `fileTypeOf: "string"` → File sent as string (needs conversion)
- `fileConstructor: undefined` → File object not recognized

### 6. Next Steps

After checking logs:
1. Share the log output
2. Identify the exact error
3. Apply specific fix based on file type received

---

**Last Updated**: After adding enhanced debugging

