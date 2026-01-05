# 📁 Supabase Storage Folder Structure

## ✅ Answer: Folders are Created Automatically!

**You do NOT need to create folders manually.** Supabase Storage automatically creates folders when you upload files with folder paths.

---

## 📂 Current Folder Structure

### Bucket: `books`

```
books/
├── pdfs/              # PDF book files (auto-created on first upload)
│   └── [timestamp]-[filename].pdf
│
├── covers/            # Cover images (auto-created on first upload)
│   └── [timestamp]-[filename].jpg
│
└── audio/             # Audio book files (if needed)
    └── [timestamp]-[filename].mp3
```

---

## 🔍 How It Works

### When you upload a file:

**Code Example:**
```javascript
// Upload PDF to 'pdfs' folder
apiClient.uploadFile(file, 'books', 'pdfs')
// Creates path: pdfs/1234567890-book.pdf
// → Supabase automatically creates 'pdfs' folder if it doesn't exist
```

**Upload API Path Construction:**
```typescript
const uniqueFileName = folder
  ? `${folder}/${timestamp}-${finalFileName}`
  : `${timestamp}-${finalFileName}`;
// Example: "pdfs/1736081234567-book.pdf"
```

---

## 📋 Folder Usage in Code

### 1. PDF Files
```javascript
// mobile/src/screens/main/BookUploadScreen.js
apiClient.uploadFile(fileToUpload, 'books', 'pdfs');
// → Uploads to: books/pdfs/[timestamp]-[filename].pdf
```

### 2. Cover Images
```javascript
// mobile/src/screens/main/BookUploadScreen.js
apiClient.uploadFile(imageFile, 'books', 'covers');
// → Uploads to: books/covers/[timestamp]-[filename].jpg
```

### 3. Audio Files (if needed)
```javascript
apiClient.uploadFile(audioFile, 'books', 'audio');
// → Uploads to: books/audio/[timestamp]-[filename].mp3
```

---

## ✅ Verification

### Check if folders exist:

1. **Via Supabase Dashboard:**
   - Go to: Storage → `books` bucket
   - Folders will appear automatically after first upload

2. **Via API:**
   - Folders are created on-demand
   - No need to pre-create them

---

## 🎯 Best Practices

### ✅ Recommended:
- Use folder structure for organization (already implemented)
- Let Supabase create folders automatically
- Use consistent folder names (`pdfs`, `covers`, `audio`)

### ❌ Not Needed:
- Manually creating folders before upload
- Pre-creating folder structure
- Special folder setup steps

---

## 📝 Summary

| Question | Answer |
|---------|--------|
| **Do folders need to be created?** | ❌ **NO** - Created automatically |
| **When are folders created?** | ✅ On first file upload to that folder |
| **Do I need to do anything?** | ❌ **NO** - Just upload files normally |
| **Current folders used?** | `pdfs/`, `covers/`, `audio/` |

---

## 🚀 Next Steps

1. ✅ **Nothing to do!** Folders will be created automatically
2. ✅ **Just upload files** - The API handles folder creation
3. ✅ **Verify after upload** - Check Supabase Dashboard to see folders

---

**Last Updated**: After confirming folder auto-creation behavior

