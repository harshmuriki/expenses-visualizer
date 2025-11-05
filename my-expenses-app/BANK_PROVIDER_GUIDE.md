# Bank Connection Provider Guide

This guide explains how to choose and configure bank connection providers for the Expenses Visualizer app.

## Overview

The app supports three bank connection methods:

1. **Local Upload (CSV/PDF)** - Default, free, no setup required
2. **Teller** - 100 free connections, developer-friendly
3. **Plaid** - Enterprise-grade, 12,000+ banks

## Quick Comparison

| Feature | Local Upload | Teller | Plaid |
|---------|--------------|---------|-------|
| **Cost** | Free | Free (100 connections) | Paid (free development) |
| **Setup Time** | None | 5 minutes | 10 minutes |
| **Bank Coverage** | All (manual) | Major US banks | 12,000+ worldwide |
| **Real-time Sync** | No | Yes | Yes |
| **Privacy** | Maximum | High | High |
| **Technical Complexity** | None | Low | Medium |

---

## Method 1: Local Upload (Default)

**Best for:** Privacy-conscious users, any bank, minimal setup

### Setup

No setup required! This is the default method.

### Usage

1. Go to your bank's website
2. Download your transaction history as CSV or PDF
3. Click "Upload" in the app
4. Select your file
5. Transactions will be processed and categorized

### Pros
- ✅ Works with any bank
- ✅ Complete data privacy
- ✅ No API keys needed
- ✅ Free forever

### Cons
- ❌ Manual download required
- ❌ No automatic sync

---

## Method 2: Teller (Recommended for Small Apps)

**Best for:** Developers, small apps, US banks, free tier users

### Why Teller?

- 🎁 **100 free connections forever**
- 🚀 Simple integration
- 🏦 Reliable connections to major US banks
- 💰 Transparent pricing
- 🔒 Secure OAuth flow

### Setup Instructions

#### Step 1: Sign up for Teller

1. Visit [https://teller.io](https://teller.io)
2. Click "Get Started" or "Sign Up"
3. Create your account
4. Verify your email

#### Step 2: Get Your App ID

1. Log in to the Teller dashboard
2. Navigate to your application settings
3. Copy your **Application ID** (looks like `app_xxxxxxxxx`)

#### Step 3: Configure Environment Variables

Add these to your `.env` file:

```bash
# Bank Provider Selection
BANK_PROVIDER=teller

# Teller Configuration
TELLER_APP_ID=your_app_id_here
TELLER_ENV=sandbox  # Use 'production' when ready for live data
```

#### Step 4: (Optional) Production Setup

For production use, you'll need mTLS certificates:

1. Download certificates from Teller dashboard
2. Place them in a secure location
3. Add to `.env`:

```bash
TELLER_CERTIFICATE=/path/to/certificate.pem
TELLER_PRIVATE_KEY=/path/to/private_key.pem
```

#### Step 5: Restart Your Server

```bash
cd my-expenses-app
npm run dev
```

### Testing in Sandbox

Use these credentials to test Teller Connect:

- **Username:** `username`
- **Password:** `password`

### Usage

1. Click the bank icon (🏦) in the app header
2. You'll see Teller is active
3. Connect a bank account using Teller Connect
4. Transactions will sync automatically

---

## Method 3: Plaid (Enterprise Option)

**Best for:** Production apps, global banks, enterprise needs

### Why Plaid?

- 🌍 12,000+ financial institutions
- 🏦 Worldwide coverage
- 🔐 Bank-grade security
- 📊 Rich transaction data
- 🤝 Trusted by major fintech companies

### Setup Instructions

#### Step 1: Sign up for Plaid

1. Visit [https://plaid.com](https://plaid.com)
2. Click "Get API Keys"
3. Create your account
4. Complete the onboarding

#### Step 2: Get Your Credentials

1. Log in to the Plaid dashboard
2. Navigate to "Keys" or "API"
3. Copy your:
   - **Client ID**
   - **Secret** (sandbox or development)

#### Step 3: Configure Environment Variables

Add these to your `.env` file:

```bash
# Bank Provider Selection
BANK_PROVIDER=plaid

# Plaid Configuration
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_secret_here
PLAID_ENV=sandbox  # or 'development' or 'production'
```

#### Step 4: Restart Your Server

```bash
cd my-expenses-app
npm run dev
```

### Testing in Sandbox

Use these credentials to test Plaid Link:

- **Username:** `user_good`
- **Password:** `pass_good`

### Pricing

- **Free:** Development mode (sandbox)
- **Paid:** Production usage (contact Plaid for pricing)

---

## Switching Between Providers

### Method 1: Environment Variables (Recommended)

Edit your `.env` file:

```bash
# For local upload
BANK_PROVIDER=local

# For Teller
BANK_PROVIDER=teller

# For Plaid
BANK_PROVIDER=plaid
```

Then restart your server.

### Method 2: In-App Settings

1. Click the bank icon (🏦) in the app header
2. View available providers
3. Follow the setup instructions for your desired provider
4. Update `.env` as shown
5. Restart the server

---

## Security Best Practices

### All Providers

- ✅ Never commit `.env` files to git
- ✅ Use environment-specific credentials
- ✅ Rotate secrets regularly
- ✅ Use HTTPS in production

### Token Storage

All access tokens are:
- Encrypted before storage
- Stored in Firebase Firestore
- Never exposed to the frontend
- Protected by user authentication

### OAuth Flow

Both Teller and Plaid use secure OAuth flows:
- User authenticates directly with their bank
- No credentials are stored by the app
- Tokens are scoped to specific permissions
- Users can revoke access anytime

---

## Troubleshooting

### Provider Not Available

**Problem:** Provider shows as "Not Configured" in settings

**Solution:**
1. Check your `.env` file has the correct variables
2. Ensure no typos in variable names
3. Restart your development server
4. Clear your browser cache

### Teller Connect Not Loading

**Problem:** "Failed to load Teller Connect SDK"

**Solution:**
1. Check internet connection
2. Verify `TELLER_APP_ID` is correct
3. Try using sandbox mode first
4. Check browser console for errors

### Plaid Link Not Opening

**Problem:** Link button does nothing

**Solution:**
1. Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` are set
2. Check you're using the correct environment
3. Ensure Plaid Link script is loading
4. Check browser console for errors

### Transactions Not Syncing

**Problem:** Connected account but no transactions appear

**Solution:**
1. Check user is authenticated
2. Verify access token was stored
3. Check API route logs for errors
4. Try manual sync button
5. Ensure month parameter is correct

---

## FAQ

### Q: Can I use multiple providers at once?

A: No, only one provider can be active at a time. However, you can switch between them by changing the `BANK_PROVIDER` environment variable.

### Q: Will my data be lost when I switch providers?

A: No. Data uploaded via CSV/PDF or synced from banks is stored in Firebase. Switching providers only affects how you connect new accounts.

### Q: How many banks can I connect with Teller's free tier?

A: 100 live bank connections, forever free.

### Q: Is local upload less secure than API providers?

A: Actually, local upload provides maximum privacy since data never goes through third-party APIs. All methods are secure, but local upload gives you the most control.

### Q: Can I export my data?

A: Yes, use the Table view to see all transactions, and you can export them as needed.

---

## Support

- **Teller Docs:** https://teller.io/docs
- **Plaid Docs:** https://plaid.com/docs
- **App Issues:** Check the GitHub repository for issues and support

---

## Recommended Setup

### For Personal Use
→ **Local Upload** (free, private)

### For Small Projects (< 100 users)
→ **Teller** (free, automatic sync)

### For Production Apps
→ **Plaid** (enterprise-grade, worldwide coverage)

---

Happy expense tracking! 🎉
