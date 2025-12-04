# Expenses Project

A Next.js application that allows you to upload CSV files of financial transactions, process them using OpenAI’s API (in streaming mode), and generate hierarchical data (with parent-child relationships) for building charts or visualizations of your expenses.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Customization](#customization)
- [Storage Architecture](#storage-architecture)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project provides a simple interface to:

1. **Upload a CSV file** of transactions.
2. **Parse and categorize** each transaction record using an OpenAI streaming call.
3. **Generate hierarchical data** suitable for visualizing expenses under different parent categories (e.g., “Groceries”, “Bills”, etc.).
4. **Display or navigate** to a chart page (e.g., `/chart`) to show your processed expenses graphically.

---

## Features

1. **CSV Upload** – Users can select and upload a `.csv` file for processing.
2. **Month Selector** – Users can input a month string (e.g., "2023-01" or "January") associated with the CSV data.
3. **Streaming OpenAI** – Uses OpenAI's Node library (`openai`) in streaming mode to categorize each transaction.
4. **Hierarchical Data** – Transforms the CSV rows into a structure suitable for charting or further analysis.
5. **Realtime Feedback** – A loading spinner indicates when an upload is in progress.
6. **Flexible Storage Backend** – Choose between local storage (privacy-first) or Firebase cloud storage.
7. **Multi-View Visualizations** – TreeMap, Calendar, Table, and Editor views for exploring your expenses.
8. **AI-Powered Insights** – Get intelligent spending analysis and recommendations.

---

## Tech Stack

- **Next.js 13** (App Router or Pages Router)
- **TypeScript**
- **Tailwind CSS** for styling
- **OpenAI Node.js Library** for GPT streaming
- **csv-parser** for reading CSV files in Node
- **dotenv** for environment variable management
- **IndexedDB** for local browser storage
- **Firebase Firestore** (optional) for cloud storage

---

## Prerequisites

1. **Node.js** (version 16 or above recommended)
2. **npm** or **yarn** (for installing dependencies)
3. **OpenAI API Key** – You must have a valid API key to call OpenAI’s API.

---

## Installation

1. **Clone this repository**:

   ```bash
   git clone https://github.com/harshmuriki/expenses-visualizer.git
   cd expenses-project
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables)).
4. **Run the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser** at `http://localhost:3000` (unless otherwise configured).

---

## Environment Variables

Create a `.env` file in your project root (or wherever your Next.js config references environment variables), and add:

```ini
OPENAI_KEY=your_openai_api_key
NEXT_PUBLIC_STORAGE_MODE=local
```

- Replace `your_openai_api_key` with your actual OpenAI API key.
- `NEXT_PUBLIC_STORAGE_MODE` can be set to:
  - `local` - Stores data locally in IndexedDB (browser) or file system (server). Privacy-first, no cloud required.
  - `firebase` - Stores data in Firebase Firestore. Requires Firebase configuration.

**Note**: If you're deploying to a production environment, be sure to configure these variables appropriately on your hosting platform (e.g., Vercel, Heroku, etc.).

### Storage Modes

The application supports two storage backends that can be switched via the `NEXT_PUBLIC_STORAGE_MODE` environment variable:

#### Local Storage (Privacy-First)
- **Browser**: Data stored in IndexedDB (`ExpensesVisualizerDB`)
- **Server**: Data stored in `.local-data/` directory as JSON files
- **Benefits**: 
  - Complete privacy - data never leaves your device
  - No cloud costs or API limits
  - Works offline
  - Fast local access
- **Considerations**: 
  - Data is device-specific (use export/import for backups)
  - Clearing browser data will remove IndexedDB data

#### Firebase Storage (Cloud)
- **Storage**: Firebase Firestore
- **Benefits**:
  - Access from any device
  - Automatic backups
  - Real-time sync
- **Requirements**: Firebase project configuration

The storage adapter automatically routes all data operations (read, write, months list) to the correct backend based on your configuration.

---

## Project Structure

Below is a simplified structure to highlight key files:

```
expenses-project
├─ my-expenses-app/
│  ├─ app
│  │  ├─ api
│  │  │  ├─ upload.ts              // API Route: processes the CSV upload
│  │  │  └─ local-data.ts          // API endpoint for local file data sync
│  │  ├─ chart
│  │  │  └─ page.tsx                // Chart page (reads processed data)
│  │  ├─ page.tsx                   // Homepage or main entry
│  │  └─ types
│  │     └─ types.ts                // Shared TypeScript types
│  ├─ components
│  │  ├─ UploadComponent.tsx        // React component for file upload
│  │  ├─ SnakeyChartComponent.tsx   // Main chart visualization component
│  │  ├─ CalendarView.tsx           // Calendar view of transactions
│  │  ├─ TransactionTable.tsx      // Table view of transactions
│  │  └─ StorageModeToggle.tsx     // UI for switching storage modes
│  ├─ lib
│  │  ├─ storageAdapter.ts          // Unified storage interface (local/Firebase)
│  │  ├─ storageConfig.ts           // Storage mode configuration
│  │  ├─ localStorageDB.ts          // IndexedDB operations
│  │  ├─ localDataReader.ts         // Local storage data reader
│  │  ├─ serverLocalStorage.ts      // Server-side file storage
│  │  ├─ firebaseUpload.ts          // Firebase upload operations
│  │  └─ process.tsx                // Document & Item classes for AI processing
│  ├─ .local-data/                  // Server-side local storage directory
│  ├─ .env
│  └─ package.json
└─ README.md
```

- **UploadComponent** – Provides the UI for users to select a CSV file and input a month, then calls `/api/upload`.
- **storageAdapter.ts** – Unified interface that routes data operations to the correct storage backend (local or Firebase) based on configuration.
- **localStorageDB.ts** – IndexedDB wrapper for browser-side local storage operations.
- **serverLocalStorage.ts** – File system storage for server-side operations.
- **upload.ts** – The Next.js API route that reads the CSV file (using `csv-parser`), constructs a `Document` object, and invokes OpenAI.
- **process.tsx** – Classes used to parse each CSV row, call OpenAI in streaming mode, and build hierarchical data.

---

## Usage

1. **Configure storage mode** (in `.env`):
   ```ini
   NEXT_PUBLIC_STORAGE_MODE=local  # or "firebase"
   ```

2. **Start the app**: Run `npm run dev` (or `yarn dev`) locally.

3. **Navigate** to the main page (e.g. `http://localhost:3000/`).

4. **Upload your CSV file**:
   - Click "Select a CSV File".
   - Choose your `.csv`.
   - Enter your month or date range.
   - Click "Upload".

5. **Observe** the loading spinner in the upload button while your file is being processed.

6. **View the result**: The app will push you to `/chart?month=...`, where you can see your newly processed data.

7. **Explore your data**:
   - **TreeMap View**: Visual hierarchy of your spending
   - **Calendar View**: Transactions organized by date
   - **Table View**: Excel-style transaction list
   - **Editor View**: Swipe through and edit transactions

---

## How It Works

1. **User Interface**: The `UploadComponent` provides a file picker and a text field for the month.
2. **API Route**: Upon clicking “Upload”, a `POST` request is sent to `/api/upload` with FormData containing the file and the month.
3. **CSV Parsing**:
   - Uses `csv-parser` to read each row.
   - Stores rows in a temporary array (`results`).
4. **Document Construction**:
   - A new `Document` is created with the CSV rows and any available tags (e.g., `parentTags`).
   - `convertDocToItems()` calls `setDetails()` for each row, which uses OpenAI in streaming mode to categorize the transaction (name, cost, parent tag).
5. **Hierarchy Building**:
   - `convertData()` turns the processed items into a nested structure.
   - Optionally writes results to JSON files (`output.json`, `parent_child_map.json`).
6. **Charting**:
   - You can then display these results in a chart or table, such as on `/chart`.

---

## Customization

- **Model Selection**: In `process.tsx` (or `Document.ts`), you can change the OpenAI model from `"gpt-4o-mini"` to `"gpt-3.5-turbo"`, `"gpt-4"`, etc.
- **Prompt Engineering**: Modify the prompt text to extract transaction details or add extra classification logic.
- **Parent Tags**: Define your parent categories in an external file or a database (e.g., `["Groceries", "Bills", "Travel"]`).
- **Styling**: Adjust the Tailwind classes in components to change the UI's appearance.
- **Storage Backend**: Switch between local and Firebase storage by setting `NEXT_PUBLIC_STORAGE_MODE` in your `.env` file.

## Storage Architecture

The application uses a **storage adapter pattern** that provides a unified interface for data operations while supporting multiple storage backends:

### How It Works

1. **Storage Adapter** (`lib/storageAdapter.ts`) - Central routing layer that:
   - Detects the configured storage mode from `NEXT_PUBLIC_STORAGE_MODE`
   - Routes read/write operations to the appropriate backend
   - Handles server-side vs browser-side differences automatically

2. **Local Storage Flow**:
   - **Server-side** (API routes): Data saved to `.local-data/{userEmail}_{month}.json`
   - **Browser-side**: Data stored in IndexedDB (`ExpensesVisualizerDB`)
   - **Auto-sync**: If browser IndexedDB is empty, automatically syncs from server files

3. **Firebase Storage Flow**:
   - All operations go through Firebase Firestore
   - Data structure: `users/{userEmail}/{month}/` collection

### Data Operations

All data operations go through the storage adapter:
- `fetchSankeyData()` - Fetch transaction data
- `uploadSankeyData()` - Save transaction data
- `uploadTransactionsBatch()` - Batch upload transactions
- `getUserMonths()` - Get list of available months
- `getUserFiles()` - Get uploaded files

This ensures consistent behavior regardless of the storage backend in use.

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to open a pull request or an issue to discuss changes.

1. Fork the repo.
2. Create a feature branch.
3. Commit your changes and push the branch.
4. Open a pull request on GitHub.

---

## License

## This project is licensed under the [MIT License](./LICENSE)

**Happy Coding!**
