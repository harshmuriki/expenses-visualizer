# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Expenses Visualizer** application built with Next.js 15 that allows users to upload financial transaction data (CSV or PDF), process it using OpenAI's API, and visualize the categorized expenses using interactive TreeMap and chart visualizations. It features Firebase integration for data persistence, Plaid integration for bank account synchronization, and AI-powered insights for spending analysis.

## Development Commands

The main application is located in the `my-expenses-app/` directory.

### Running the Development Server

```bash
cd my-expenses-app
npm run dev
# Uses Turbopack for fast hot module replacement
# Runs on http://localhost:3000
```

### Building for Production

```bash
cd my-expenses-app
npm run build
npm start
```

### Linting

```bash
cd my-expenses-app
npm run lint
```

## Architecture Overview

### Core Data Flow

1. **Data Input Layer**: Users upload CSV/PDF files or connect bank accounts via Plaid
2. **AI Processing Layer**: OpenAI GPT-4o-mini categorizes and extracts transaction details
3. **Storage Layer**: Firebase Firestore stores processed transactions and hierarchical relationships
4. **Visualization Layer**: TreeMap and charts display spending patterns
5. **Insight Generation Layer**: AI analytics detect anomalies and generate spending insights

### Key Architectural Components

#### Transaction Processing Pipeline (`components/process.tsx`)

- **Item Class**: Represents a single transaction with fields: name, cost, index, parenttag, date, location, file_source
- **Document Class**: Manages collections of transactions and converts them to hierarchical structures
  - `convertDocToItems()`: Processes CSV/PDF rows into Item objects using OpenAI
  - `convertData()`: Builds hierarchical data structure (nodes + parent-child map) for visualization
  - `fromCategorizedTransactions()`: Converts Plaid transactions to the internal format

**OpenAI Integration**: Uses `gpt-4o-mini` model to extract:

- Transaction name (concise version)
- Cost
- Parent category (from predefined tags in `scripts/parenttags.txt`)
- Date
- Location/merchant address

#### API Routes (`pages/api/`)

**Upload API** (`pages/api/upload.ts`):

- Handles both CSV and PDF uploads via FormData
- CSV: Processes locally using the Document class
- PDF: Sends to AWS Lambda endpoint (defined in `AWS_LAMBDA_ENDPOINT` env var) for text extraction, then processes with OpenAI
- Extracts file source from filename (e.g., "amex", "chase", "capitalone")
- Stores files in Firebase Storage if `storeFile` flag is set
- Saves processed Sankey nodes to Firestore

**Plaid API Routes** (`pages/api/plaid/`):

- `create-link-token.ts`: Generates Plaid Link token for account connection
- `exchange-public-token.ts`: Exchanges public token for access token
- `sync-transactions.ts`: Syncs transactions using Plaid's `/transactions/sync` endpoint
- `webhook.ts`: Handles Plaid webhook events

**AI Routes** (`pages/api/ai/`):

- `validate-transaction`: Validates transaction categorization and provides suggestions

#### Data Storage (`lib/`)

**Firebase Integration**:

- `firebaseUpload.ts`: Uploads Sankey nodes and parent-child maps to Firestore
- `fileStorage.ts`: Stores original uploaded files in Firebase Storage
- `components/firebaseConfig.js`: Firebase initialization

**Plaid Integration**:

- `lib/plaidClient.ts`: Wrapper for Plaid API calls
- `lib/transactionSync.ts`: Syncs Plaid transactions and converts to internal format
- `lib/secureStore.ts`: Securely stores Plaid access tokens in Firestore

**AI Analytics** (`lib/aiAnalytics.ts`):

- `generateSpendingInsights()`: Detects high-spending categories, unusual transactions, small transaction patterns
- `analyzeCategorySpending()`: Calculates spending breakdown by category
- `predictSpending()`: Provides spending predictions (currently uses simple variance model)
- `detectAnomalies()`: Uses statistical analysis (mean + 2 standard deviations) to flag unusual transactions
- `generateDataSummary()`: Creates text summaries for AI assistant context

#### Visualization (`components/`)

**SnakeyChartComponent.tsx** (Main visualization controller):

- Fetches data from Firestore based on user email and month
- Manages node/link state for Sankey-style visualizations
- Handles transaction editing via InputModal
- Coordinates between TreeMap and chart views
- Integrates AI insights, anomaly detection, and assistant

**TreeMapChart.tsx**:

- Renders hierarchical treemap using D3
- Interactive: click categories to expand and see transactions
- Each transaction is editable with AI validation

**EnhancedCharts.tsx**:

- Alternative view with bar charts, pie charts, and other visualizations
- Uses category analysis data

**AIAssistant.tsx**:

- Chat interface for natural language queries about spending
- Uses generated data summary as context

**processLinks.tsx**:

- `calculateLinks()`: Converts parent-child map to Sankey links with proper values

### Firestore Data Structure

```
users/
  {email}/
    {month}/                    # e.g., "feb", "march"
      {nodeIndex}/
        transaction: string
        cost: number
        index: number
        isleaf: boolean
        visible: boolean
        date?: string
        location?: string
        file_source?: string
      parentChildMap/           # Special document
        {parentIndex}: [child indices]
```

### File Source Detection

The system automatically detects the source institution from filenames (e.g., "Chase_January.csv" → "chase"). Supported sources include major banks (Chase, Bank of America, Wells Fargo, etc.), credit cards (Amex, Discover, Capital One, etc.), and payment platforms (PayPal, Venmo, Zelle, etc.). This metadata is preserved for filtering and analysis.

## Environment Variables

Required environment variables (create `.env` in `my-expenses-app/`):

```ini

# OpenAI API (required for transaction categorization)
OPENAI_KEY=your_openai_api_key  # Alternative name

# AWS Lambda (required for PDF processing)
AWS_LAMBDA_ENDPOINT=your_lambda_endpoint_url

# Plaid (required for bank account integration)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # or "development" or "production"

# Firebase (required for data storage)
# See Firebase config in components/firebaseConfig.js
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase config vars

# NextAuth (for authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Python Scripts

The `scripts/` directory contains Python scripts for processing transactions outside the main app:

- `process_optimized.py`: Standalone transaction processor
- `readPdf_optimized.py`: PDF parsing utilities
- `lambda_function_optimized.py`: AWS Lambda function for PDF processing
- `parenttags.txt`: Predefined list of expense categories used by AI for classification

These scripts are primarily for the Lambda function deployment and local experimentation.

## Important Type Definitions (`app/types/types.ts`)

**SankeyNode**: Represents a node in the visualization

- `name`: Transaction or category name
- `index`: Unique identifier
- `cost?`: Transaction amount
- `isleaf?`: Whether it's a leaf transaction (vs category)
- `visible`: Display state
- `date?`, `location?`, `file_source?`: Optional metadata

**SankeyLink**: Represents relationship between nodes

- `source`: Parent node index
- `target`: Child node index
- `value`: Amount flowing through link
- `strokeWidth?`: Visual width (calculated dynamically)

**Map**: `Record<number, number[]>` - Parent index to child indices mapping

## Authentication

Uses NextAuth with Firebase authentication. User sessions are required to access the `/chart` page and to upload/view transactions.

## Working with the Codebase

### Adding a New Expense Category

1. Edit `scripts/parenttags.txt` and add the category
2. Restart the app (categories are loaded at runtime during processing)

### Modifying AI Prompts

- Transaction categorization prompt: `components/process.tsx` → `Item.setDetails()`
- PDF conversion prompt: `components/process.tsx` → `Document.convertPdfToCSVRow()`

### Adding a New File Source Pattern

Edit the `extractFileSource()` function in `pages/api/upload.ts`

### Adjusting Anomaly Detection Sensitivity

Modify the threshold multiplier in `lib/aiAnalytics.ts` → `detectAnomalies()` (currently 2 standard deviations)

## Key Design Patterns

1. **Hierarchical Data Representation**: Root "Expenses" node → Category nodes → Leaf transaction nodes
2. **Dual Processing Modes**: CSV (local) vs PDF (Lambda)
3. **Parent-Child Map**: Central to all visualizations, stored separately in Firestore
4. **Streaming AI**: OpenAI responses are processed in streaming mode (legacy code, but prepared for it)
5. **Color Consistency**: Parent categories use a fixed color palette defined in `SnakeyChartComponent` and `lib/colors.ts`

## Common Gotchas

- The app uses **Next.js 15** with both App Router (`app/`) and Pages Router (`pages/`) - API routes must be in `pages/api/`
- Month parameter in URLs should be lowercase (e.g., `?month=feb`)
- The `parentChildMap` document in Firestore is special - it's not a regular node
- Links are recalculated dynamically when nodes are edited, not stored in Firestore
- File source detection is case-insensitive and pattern-based
