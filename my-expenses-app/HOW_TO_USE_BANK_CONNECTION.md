# How to Use Bank Connection (Teller/Plaid)

This guide shows you how to connect your bank account and automatically sync transactions instead of manually uploading CSV files.

---

## Quick Start

### For Teller (100 Free Connections)

1. **Sign up at [teller.io](https://teller.io)**
2. **Get your App ID** from the Teller dashboard
3. **Add to `.env`**:
```bash
BANK_PROVIDER=teller
TELLER_APP_ID=your_app_id_here
TELLER_ENV=sandbox  # Use 'production' for live data
```
4. **Restart your dev server**: `npm run dev`
5. **Open your app** - you'll now see "Connect with Teller" button!

### For Plaid (Enterprise)

1. **Sign up at [plaid.com](https://plaid.com)**
2. **Get your credentials** from the Plaid dashboard
3. **Add to `.env`**:
```bash
BANK_PROVIDER=plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # or 'development' or 'production'
```
4. **Restart your dev server**: `npm run dev`
5. **Open your app** - you'll now see "Connect with Plaid" button!

---

## Step-by-Step Usage

### Step 1: Navigate to Upload Page

Go to your app's home page (where you normally upload CSV files).

### Step 2: See the Bank Connection UI

If you configured Teller or Plaid, you'll now see:

```
┌─────────────────────────────────────┐
│  Connect with Teller / Plaid        │
│                                     │
│  Link your bank account securely    │
│  to automatically import            │
│  transactions.                      │
│                                     │
│  [Connect Bank Account]            │
└─────────────────────────────────────┘

           OR

┌─────────────────────────────────────┐
│  Manual Upload (CSV Files)          │
│  Or manually upload CSV files...    │
└─────────────────────────────────────┘
```

### Step 3: Connect Your Bank

Click the **"Connect Bank Account"** button.

#### If using Teller:
- A Teller Connect modal will open
- **Sandbox mode credentials**:
  - Username: `username`
  - Password: `password`
- Select "Chase" or another test bank
- Choose which accounts to connect
- Click "Continue"

#### If using Plaid:
- A Plaid Link modal will open
- **Sandbox mode credentials**:
  - Username: `user_good`
  - Password: `pass_good`
- Select a bank from the list
- Choose which accounts to connect
- Click "Continue"

### Step 4: See Your Connected Account

After connecting, you'll see:

```
┌─────────────────────────────────────┐
│  Connected Accounts                 │
│                                     │
│  Chase Bank                         │
│  Teller / Plaid                     │
│                       [Sync Now] ───►│
└─────────────────────────────────────┘
```

### Step 5: Sync Transactions

Click the **"Sync Now"** button next to your connected account.

The app will:
1. ✅ Fetch all transactions from your bank
2. ✅ Process them with AI categorization
3. ✅ Store them in Firebase
4. ✅ Automatically redirect you to the chart page

### Step 6: View Your Expenses

You'll be redirected to `/chart?month=YYYY-MM` where you can:
- 📊 See your spending visualized in a TreeMap
- 📈 View charts and insights
- ✏️ Edit transactions if needed

---

## What's Happening Behind the Scenes?

### Connection Flow

```
User clicks "Connect Bank"
        ↓
Teller Connect / Plaid Link modal opens
        ↓
User authenticates with their bank
        ↓
User selects accounts to connect
        ↓
Access token is created
        ↓
Token is exchanged for long-term access token
        ↓
Access token is encrypted and stored in Firebase
        ↓
Account appears in "Connected Accounts"
```

### Sync Flow

```
User clicks "Sync Now"
        ↓
API fetches transactions from Teller/Plaid
        ↓
Transactions are mapped to standard format
        ↓
AI processes and categorizes transactions
        ↓
Transactions stored in Firebase
        ↓
User redirected to chart page
```

---

## Security & Privacy

### How Your Data is Protected

✅ **OAuth Authentication**: You never share your bank credentials with the app
✅ **Encrypted Storage**: Access tokens are encrypted before storage
✅ **User-Scoped**: Each user's tokens are isolated
✅ **Bank-Grade Security**: Teller and Plaid use bank-level encryption
✅ **Minimal Permissions**: Only read-only access to transactions
✅ **Revocable Access**: You can revoke access anytime from your bank

### What Data is Accessed?

- ✅ Transaction history (amounts, dates, merchants)
- ✅ Account names and types
- ❌ **NOT** your login credentials
- ❌ **NOT** your account numbers
- ❌ **NOT** your personal information

---

## Troubleshooting

### "Connect Bank Account" button doesn't appear

**Problem**: You only see the CSV upload section

**Solution**:
1. Check your `.env` file has `BANK_PROVIDER=teller` or `BANK_PROVIDER=plaid`
2. Check you have the required API keys (TELLER_APP_ID or PLAID_CLIENT_ID)
3. Restart your dev server: `npm run dev`
4. Hard refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Teller Connect modal doesn't open

**Problem**: Clicking "Connect Bank" does nothing

**Solution**:
1. Open browser console (F12)
2. Look for errors related to "TellerConnect"
3. Verify `TELLER_APP_ID` is correct in `.env`
4. Check internet connection (CDN needs to load)
5. Try in a different browser

### Plaid Link modal doesn't open

**Problem**: Clicking "Connect Bank" does nothing

**Solution**:
1. Open browser console (F12)
2. Look for errors related to "Plaid"
3. Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` are correct
4. Check Plaid environment matches (`sandbox`, `development`, or `production`)
5. Ensure Plaid SDK script loaded (check Network tab)

### "Failed to sync transactions" error

**Problem**: Connection succeeded but sync failed

**Solution**:
1. Check browser console for detailed error
2. Verify access token was stored (check Firebase console)
3. Try disconnecting and reconnecting the account
4. Check API route logs for errors
5. Ensure month parameter is valid

### Sandbox mode transactions don't appear

**Problem**: Synced but no transactions show up

**Solution**:
- **Teller Sandbox**: Has limited test transactions (usually 5-10)
- **Plaid Sandbox**: Has limited test transactions (usually 10-20)
- Transactions may be from previous months
- Check different months in the app
- Try production mode for real data (requires real bank login)

### Switching from Sandbox to Production

**For Teller**:
1. Update `.env`: `TELLER_ENV=production`
2. Restart server
3. Reconnect your bank account (use real credentials this time)

**For Plaid**:
1. Update `.env`: `PLAID_ENV=production`
2. Get production API keys from Plaid dashboard
3. Update `PLAID_CLIENT_ID` and `PLAID_SECRET`
4. Restart server
5. Reconnect your bank account (use real credentials)

---

## Comparison: Manual Upload vs Bank Connection

| Feature | Manual CSV Upload | Bank Connection (Teller/Plaid) |
|---------|-------------------|--------------------------------|
| **Setup** | None | 5-10 minutes |
| **Cost** | Free | Free (Teller 100) / Paid (Plaid) |
| **Privacy** | Maximum | High (OAuth) |
| **Ease of Use** | Manual | Automatic |
| **Real-time Sync** | No | Yes |
| **Historical Data** | Limited | Full history |
| **Multiple Accounts** | Manual merge | Automatic |
| **Updates** | Manual | Automatic |

---

## FAQ

### Q: Can I use both manual upload AND bank connection?

**A:** Yes! Even when Teller/Plaid is configured, you can still manually upload CSV files using the "Manual Upload" section.

### Q: How often should I sync transactions?

**A:**
- **Daily**: For the most up-to-date view
- **Weekly**: For regular expense tracking
- **Monthly**: For end-of-month reviews

### Q: Does syncing overwrite my data?

**A:** No! Each sync adds new transactions. Existing transactions are not modified unless they're updates from the bank.

### Q: Can I connect multiple banks?

**A:** Yes! Click "Connect Bank Account" multiple times to add more accounts. All will appear in "Connected Accounts".

### Q: How do I disconnect a bank account?

**A:** Currently, you can revoke access from your bank's website. A "Disconnect" button in the UI is coming in a future update!

### Q: What if I reach Teller's 100 connection limit?

**A:** 100 connections is quite generous! If you need more:
- Switch to Plaid (paid, unlimited)
- Or manage connections (disconnect unused accounts)

### Q: Is my bank supported?

**Teller**: Major US banks (Chase, Bank of America, Wells Fargo, Citi, etc.)
**Plaid**: 12,000+ banks worldwide

Check [teller.io](https://teller.io) or [plaid.com](https://plaid.com) for full lists.

---

## Advanced: Multiple Provider Support

Want to use both Teller AND Plaid? Not yet supported, but you can:

1. Use one for primary account (e.g., Teller for checking)
2. Manually upload CSV for others
3. Or switch `BANK_PROVIDER` as needed (requires server restart)

---

## Next Steps

✅ Connected your bank? Great!
✅ Synced transactions? Awesome!
✅ Viewing your expenses? Perfect!

**Try these features next:**
- 🎨 Change the theme (click theme switcher icon)
- 🏦 Check bank provider settings (click bank icon)
- ⚙️ Configure LLM provider (click settings icon)
- 📊 View trends page (click "View Trends")

---

## Support

**Need help?**
- Check `BANK_PROVIDER_GUIDE.md` for setup details
- Check `INTEGRATION_SUMMARY.md` for technical details
- Open an issue on GitHub

**Found a bug?**
- Check browser console for errors
- Check server logs
- Report with steps to reproduce

---

Enjoy automatic transaction syncing! 🎉
