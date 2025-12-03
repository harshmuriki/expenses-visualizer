# Local Storage Guide - Privacy-First Data Storage

## 🔒 Overview

The Expenses Visualizer now supports **privacy-first local storage** using **IndexedDB**. This means:

- ✅ **All data stays on your device** - No cloud uploads
- ✅ **No Firebase required** - Works completely offline
- ✅ **Zero data transmission** - Your financial data never leaves your computer
- ✅ **Export/Import backups** - Full control over your data
- ✅ **Fast and free** - No API costs or limits

## 🚀 Quick Start

### Option 1: Use Local Storage (Recommended for Privacy)

1. **Set storage mode** in `.env`:
   ```ini
   NEXT_PUBLIC_STORAGE_MODE=local
   ```

2. **Start the app**:
   ```bash
   cd my-expenses-app
   npm run dev
   ```

3. **Done!** All data now stays on your device.

### Option 2: Toggle via UI

1. Go to Settings ⚙️ (in the sidebar)
2. Find "Storage & Privacy Settings"
3. Select "Local Storage (Privacy-First)"
4. Reload the page

## 📁 Storage Architecture

### What Gets Stored Locally

| Data Type | Storage Location | Purpose |
|-----------|------------------|---------|
| Transactions | IndexedDB `transactions` store | Your expense/income data |
| Files (CSV/PDF) | IndexedDB `uploadedFiles` store | Original uploaded files |
| User Metadata | IndexedDB `users` store | Month lists, timestamps |
| Settings | Browser localStorage | Storage mode preference |

### IndexedDB Structure

```
ExpensesVisualizerDB/
├── transactions/          # All transaction records
│   ├── id (auto-generated)
│   ├── userEmail
│   ├── month
│   ├── transaction (name)
│   ├── cost
│   ├── date, location, bank
│   └── ...
│
├── uploadedFiles/         # Original files
│   ├── id
│   ├── fileName
│   ├── fileData (ArrayBuffer)
│   ├── fileType
│   └── uploadDate
│
└── users/                 # User metadata
    ├── email
    ├── months[]
    └── monthMetadata{}
```

## 🔄 Switching Between Firebase and Local Storage

### Current Mode: Local Storage

Your data is stored in your browser's IndexedDB. To switch to Firebase:

1. Set `NEXT_PUBLIC_STORAGE_MODE=firebase` in `.env`
2. Configure Firebase credentials (see `CLAUDE.md`)
3. Reload the app

**⚠️ Important:** Data does NOT automatically migrate between storage modes. Export from one before switching!

### Current Mode: Firebase

Your data is in the cloud. To switch to Local Storage:

1. **Export your Firebase data first** (see Migration section below)
2. Set `NEXT_PUBLIC_STORAGE_MODE=local`
3. Reload the app
4. Import your data using the backup file

## 💾 Backup & Restore

### Export Your Data

1. Go to Settings ⚙️ → Storage & Privacy Settings
2. Click "Export All Data (JSON)"
3. Save the file somewhere safe (e.g., `expenses-backup-2025-12-03.json`)

**Recommended:** Export weekly or after major changes.

### Import Data

1. Go to Settings ⚙️ → Storage & Privacy Settings
2. Click "Import Data (JSON)"
3. Select your backup file
4. Wait for confirmation

### Backup File Format

```json
{
  "transactions": [...],  // All your transaction data
  "files": [...],         // Uploaded files (base64 encoded)
  "users": [...]          // User metadata
}
```

## 🔐 Privacy & Security

### What Stays Private

- ✅ All transaction details
- ✅ Uploaded CSV/PDF files
- ✅ AI categorization results
- ✅ Personal spending patterns
- ✅ Bank/card information

### Data Location

**Local Storage Mode:**
- Data: `IndexedDB` in your browser (typically: `~/.config/[browser]/IndexedDB/`)
- Only accessible by this app on this device
- Not synced across browsers or devices

**Important Notes:**

1. **Clearing browser data deletes everything** - Always keep backups!
2. **Incognito/Private mode** - Data won't persist after closing
3. **Multiple browsers** - Data is NOT shared between browsers
4. **Different devices** - Must manually export/import to share

## 📊 Storage Limits

### IndexedDB Capacity

| Browser | Typical Limit | Notes |
|---------|---------------|-------|
| Chrome/Edge | ~60% of available disk space | Very generous |
| Firefox | ~50% of available disk space | Dynamic |
| Safari | ~1 GB | More restrictive |

**In practice:** You can store **thousands of transactions** without issues.

### Checking Usage

1. Go to Settings ⚙️
2. Look at "Storage Usage" section
3. See used space and quota

Example:
```
Used: 2.45 MB
Quota: 234.67 GB
█░░░░░░░░░ 0.001% used
```

## 🛠️ Advanced Usage

### Programmatic Access

```typescript
import { getStorageMode, setStorageMode } from "@/lib/storageConfig";

// Check current mode
const mode = getStorageMode(); // "local" or "firebase"

// Change mode
setStorageMode("local");
```

### Direct Database Access

```typescript
import {
  getTransactions,
  exportAllData,
  clearAllData,
} from "@/lib/localStorageDB";

// Get all transactions for a month
const transactions = await getTransactions("user@example.com", "march");

// Export everything
const backup = await exportAllData();

// Clear all data (destructive!)
await clearAllData();
```

### Storage Adapter (Unified Interface)

```typescript
import { uploadSankeyData, fetchSankeyData } from "@/lib/storageAdapter";

// Works with both Firebase and Local storage
// Automatically routes to the correct backend
await uploadSankeyData({
  nodes,
  parentChildMap,
  useremail: "user@example.com",
  month: "march",
});

const data = await fetchSankeyData("user@example.com", "march");
```

## 🚨 Troubleshooting

### "QuotaExceededError"

**Cause:** IndexedDB is full (rare, but possible)

**Solution:**
1. Export your data
2. Clear old months you don't need
3. Or use Firebase mode instead

### Data Not Showing Up

**Check:**
1. Storage mode setting: `localStorage.getItem("storage_mode")`
2. Browser console for errors
3. IndexedDB contents (DevTools → Application → IndexedDB)

### Lost Data After Clearing Browser Data

**Unfortunately:** Browser data clearing removes IndexedDB

**Prevention:**
- Export backups regularly
- Store backups in cloud storage (Dropbox, Google Drive, etc.)
- Consider Firebase mode if you need automatic backups

### Import Fails

**Common causes:**
- Corrupted JSON file
- Wrong file format
- Browser compatibility

**Solution:**
- Validate JSON: `cat backup.json | jq .`
- Check file was exported from this app
- Try a different browser

## 📱 Mobile & Cross-Device Usage

### Mobile Browsers

**Local storage works on:**
- Chrome Mobile (Android)
- Safari (iOS)
- Firefox Mobile

**Limitations:**
- Storage limits are lower on mobile
- May be cleared more aggressively by OS
- No cross-device sync (by design)

### Syncing Across Devices

**Option 1: Manual Export/Import**
1. Export from Device A
2. Transfer file (email, USB, cloud)
3. Import on Device B

**Option 2: Use Firebase Mode**
- Automatic cloud sync
- Works across all devices
- Requires internet connection

## 🔄 Migration Guide

### From Firebase to Local Storage

1. **While in Firebase mode:**
   - There's no built-in export from Firebase to local format
   - You'll need to switch to local mode and re-upload your files

2. **Switch to local mode:**
   ```ini
   NEXT_PUBLIC_STORAGE_MODE=local
   ```

3. **Re-upload your CSV/PDF files**
   - Your data will now be processed and stored locally

### From Local to Firebase

1. **Export from local storage** (get backup file)
2. **Switch to Firebase mode**
3. **Configure Firebase** (credentials in `.env`)
4. **Re-upload files** (local→Firebase migration not automated)

**Note:** Automatic migration between storage modes is not currently supported. You'll need to re-upload your source files.

## 💡 Best Practices

### For Maximum Privacy

1. ✅ Use Local Storage mode
2. ✅ Use a local LLM (Ollama/LM Studio) - see `LLM_SETUP_GUIDE.md`
3. ✅ Disable analytics/tracking
4. ✅ Use a privacy-focused browser (Firefox, Brave)
5. ✅ Store backups encrypted (use tools like `gpg` or `7zip` with password)

### For Backups

1. **Weekly exports** (automate with a script if needed)
2. **Multiple locations** (local drive + cloud + external HD)
3. **Test restores** periodically to ensure backups work
4. **Version control** (keep last 3-4 backups)

### For Performance

- Local storage is **faster** than Firebase for most operations
- No network latency
- No API rate limits
- Works offline

## 📝 Environment Variables

```ini
# Storage Mode Selection
NEXT_PUBLIC_STORAGE_MODE=local    # or "firebase"

# Firebase not needed for local mode!
# You can remove all Firebase env vars when using local storage
```

## 🆘 Getting Help

### Check Storage Mode

Open browser console and run:
```javascript
localStorage.getItem("storage_mode")
```

### Check Data Exists

```javascript
// Open DevTools → Application → IndexedDB → ExpensesVisualizerDB
// Browse the stores to see your data
```

### Clear Everything and Start Fresh

```javascript
// In browser console:
await indexedDB.deleteDatabase("ExpensesVisualizerDB");
localStorage.clear();
location.reload();
```

## 🎯 Summary

| Feature | Local Storage | Firebase |
|---------|---------------|----------|
| **Privacy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Offline** | ✅ Yes | ❌ No |
| **Cross-device** | Manual | Automatic |
| **Setup** | None | Firebase config |
| **Cost** | Free | Free tier + paid |
| **Backups** | Manual | Automatic |

**Recommendation:** Use **Local Storage** for maximum privacy and speed. Export backups regularly.

---

**Questions?** Check the main `CLAUDE.md` or open an issue on GitHub.
