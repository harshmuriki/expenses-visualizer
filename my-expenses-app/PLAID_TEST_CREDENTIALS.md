# Plaid Sandbox Test Credentials

When testing the Plaid integration in **sandbox mode**, you don't need real bank credentials. Plaid provides test institutions with predefined credentials.

## Standard Test Credentials

### Most Common (Works for most test institutions):
- **Username**: `user_good`
- **Password**: `pass_good`

This combination works for most test institutions in Plaid's sandbox and will successfully connect and return test transaction data.

## Other Test Scenarios

Plaid also provides credentials for testing different scenarios:

| Username | Password | Purpose |
|----------|----------|---------|
| `user_good` | `pass_good` | Standard successful connection |
| `user_custom` | `pass_good` | Custom institution flow |
| `user_locked` | `pass_good` | Account locked scenario |
| `user_bad_credentials` | `pass_bad` | Invalid credentials error |
| `user_2fa` | `pass_good` | Two-factor authentication flow |
| `user_2fa_select_device` | `pass_good` | 2FA with device selection |
| `user_2fa_select_questions` | `pass_good` | 2FA with security questions |
| `user_2fa_select_questions_2` | `pass_good` | 2FA with security questions (variant) |

## Test Institutions

In Plaid's sandbox, you can search for and connect to these test institutions:

- **First Platypus Bank** - Standard bank
- **First Gingham Credit Union** - Credit union
- **Tartan Bank** - Another test bank
- **Houndstooth Bank** - Test bank
- **Institution for Error Testing** - For testing error scenarios

## How to Use

1. Set your environment variables:
   ```bash
   PLAID_ENV=sandbox
   PLAID_CLIENT_ID=your_sandbox_client_id
   PLAID_SECRET=your_sandbox_secret
   ```

2. In your app, click "Connect Bank Account"

3. When Plaid Link opens, search for any test institution (e.g., "First Platypus Bank")

4. Enter the test credentials:
   - Username: `user_good`
   - Password: `pass_good`

5. Complete the connection flow

6. The app will automatically sync test transactions

## Getting Sandbox Credentials

1. Sign up for a free Plaid account at [https://dashboard.plaid.com/signup](https://dashboard.plaid.com/signup)

2. Navigate to your [Dashboard](https://dashboard.plaid.com/team/keys)

3. Copy your **Sandbox** credentials:
   - `PLAID_CLIENT_ID` (starts with your team ID)
   - `PLAID_SECRET` (sandbox secret key)

4. Add them to your `.env.local` file:
   ```bash
   PLAID_CLIENT_ID=your_sandbox_client_id
   PLAID_SECRET=your_sandbox_secret
   PLAID_ENV=sandbox
   ```

## Testing Different Scenarios

### Test Successful Connection
- Institution: Any test bank
- Username: `user_good`
- Password: `pass_good`

### Test Error Handling
- Institution: Institution for Error Testing
- Username: `user_bad_credentials`
- Password: `pass_bad`

### Test 2FA Flow
- Institution: Any test bank
- Username: `user_2fa`
- Password: `pass_good`
- Follow the 2FA prompts in the Plaid Link flow

## Important Notes

- **Sandbox credentials only work in sandbox mode** (`PLAID_ENV=sandbox`)
- Test transactions are synthetic and don't represent real financial data
- You can test the full integration flow without connecting real bank accounts
- For production, you'll need to switch to `PLAID_ENV=production` and use real credentials

## Resources

- [Plaid Sandbox Documentation](https://plaid.com/docs/sandbox/)
- [Plaid Dashboard](https://dashboard.plaid.com/)
- [Plaid Link Documentation](https://plaid.com/docs/link/)
