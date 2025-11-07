## Expenses Visualizer

This application lets customers upload statements or connect financial institutions to build a Sankey-style visualization of their spending. The app now supports a regulated data aggregator (such as Plaid) for tokenized account connectivity and automated transaction ingestion.

## Aggregator integration

- `POST /api/plaid/create-link-token` creates a short-lived Link token for the signed-in user. The new "Connect accounts" flow loads the aggregator widget from Plaid's CDN and exchanges the resulting `public_token` through `POST /api/plaid/exchange-public-token`.
- Successful exchanges persist the access token in an encrypted, server-only credential store before kicking off an immediate sync through `POST /api/plaid/sync-transactions`. The same sync logic is invoked by the webhook listener at `POST /api/plaid/webhook` whenever the aggregator notifies the app about new transactions.
- `POST /api/upload` continues to process PDF/CSV uploads, and now also accepts JSON payloads with `{ source: "aggregator", userId, itemId }` to manually trigger sync jobs.

### Front-end flow

The `UploadComponent` renders a new "Connect accounts" card that launches the aggregator widget, handles the public token exchange, and redirects users to the updated month view once transactions are synced.

## Secure credential storage

- Access tokens, cursors, and metadata returned by the aggregator are never written to Firestore. Instead, they are stored inside `data/secure-store.json.enc`, an AES-256-GCM encrypted file that is only created on the server.
- The encryption key is provided through the `TOKEN_STORE_KEY` environment variable (a 32 byte key or base64 encoded value). Without this key the APIs will refuse to persist or retrieve aggregator tokens.
- File permissions are forced to `0600`, ensuring that only the Node.js process can read or modify the store. Every write uses authenticated encryption, preventing tampering or replay attacks.
- The secure store exposes helper functions that search by `item_id` so webhook calls can be resolved to the owning user without ever sending secrets to the client.

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `PLAID_CLIENT_ID` | Aggregator client ID |
| `PLAID_SECRET` | Aggregator secret |
| `PLAID_ENV` | Aggregator environment (`sandbox`, `development`, `production`) |
| `TOKEN_STORE_KEY` | 32 byte key used to encrypt the secure token store |
| `AWS_LAMBDA_ENDPOINT` | Existing PDF processing Lambda endpoint |

## Testing Plaid Integration

For testing in **sandbox mode**, use these test credentials:
- **Username**: `user_good`
- **Password**: `pass_good`

See [PLAID_TEST_CREDENTIALS.md](./PLAID_TEST_CREDENTIALS.md) for complete test credentials and scenarios.

## Local development

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000). Configure the environment variables above (for example by creating `.env.local`) before starting the development server.
