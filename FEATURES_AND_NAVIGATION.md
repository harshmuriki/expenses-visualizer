# Features & Navigation Guide

## Overview
Your Expenses Visualizer is an AI-powered expense tracking application that allows you to upload transaction files, automatically categorize expenses using AI, and visualize spending patterns through interactive charts and analytics.

---

## Main Pages & Routes

### 1. **Home Page** (`/`)
**Navigation:** Default landing page when you visit the app

**Features:**
- **User Authentication**
  - Sign in with Google (OAuth)
  - User profile display with profile picture
  - Sign out functionality

- **Upload Transactions**
  - Upload CSV or PDF files containing transaction data
  - Select or enter month for the transactions
  - Multiple file upload support
  - AI-powered automatic categorization during upload
  - Progress indicators during processing

- **Quick Navigation**
  - Direct link to "Spending Trends" page
  - Theme switcher (light/dark modes)

- **Feature Overview Cards**
  - Spending Trends preview
  - Smart Upload information
  - AI Analytics overview

**How to Access:**
- Visit the root URL (`/`)
- After signing in, you'll see the home dashboard
- Upload component is prominently displayed on the main page

---

### 2. **Chart/Visualization Page** (`/chart`)
**Navigation:** 
- Automatically redirects after successful file upload
- Can be accessed via URL: `/chart?month=<month-name>`
- From home page, upload files and you'll be redirected here

**Features:**

#### **View Modes** (Toggle between 4 different views):
1. **TreeMap View** (Default)
   - Interactive hierarchical visualization of expenses
   - Click categories to drill down into transactions
   - Color-coded by category
   - Shows transaction counts per category
   - Responsive layout

2. **Table View**
   - Comprehensive transaction table with sorting
   - Columns: Name, Cost, Category, Date, Location, Source
   - Advanced filtering options:
     - Search by name, location, or bank
     - Filter by category
     - Filter by source/bank
     - Date range filtering
     - Amount range filtering (min/max)
   - Sort by: name, cost, category, date, location, or source
   - Export to CSV functionality
   - Recurring transaction detection and insights

3. **Editor View**
   - Swipeable transaction cards
   - Quick edit interface
   - Swipe gestures for actions

4. **Calendar View**
   - Monthly calendar layout
   - Transactions grouped by day
   - Click any day to see transactions for that date
   - Visual indicators for days with transactions
   - Total spending per day displayed

#### **Transaction Management:**
- **Edit Transactions**
  - Click any transaction in TreeMap, Table, or Calendar view
  - Edit: name, cost, category, date, location, bank
  - Change category assignment
  - Save changes (auto-syncs to Firebase)

- **Add New Transactions**
  - "+" button to manually add transactions
  - Select category from existing or create new
  - Enter transaction details (name, cost, date, location, bank)
  - Instantly appears in visualizations

- **Delete Transactions**
  - Available in edit modal
  - Confirmation before deletion

#### **Smart Search:**
- Natural language search queries
- Examples:
  - "$50" - finds transactions around $50
  - "under $100" - finds transactions less than $100
  - "over $200" - finds transactions greater than $200
  - "Starbucks" - finds by merchant name
  - "Chase" - finds by bank name
- Advanced filters:
  - Amount range (min/max)
  - Bank/source filter
  - Date range
- Click results to highlight in chart

#### **AI Assistant Chat:**
- Floating chat button (bottom right)
- Ask questions about your spending:
  - "What did I spend the most on this month?"
  - "Show me trends in my grocery spending"
  - "What are my top 3 categories?"
  - "Give me recommendations to save money"
- Context-aware responses based on your transaction data
- Minimizable chat window

#### **Stats Cards:**
- Total spending for the month
- Number of categories
- Top spending category
- Transaction count
- Average transaction amount

#### **Insights Panel:**
- AI-generated spending insights
- Warnings for unusual spending
- Success messages for good habits
- Tips for saving money
- Predictions for future spending

#### **Recurring Transaction Detection:**
- Automatically identifies recurring expenses
- Shows frequency (weekly, monthly, etc.)
- Calculates annual cost
- Highlights in transaction table
- Helps identify subscriptions and regular bills

#### **Additional Features:**
- **Theme Switcher** - Toggle between light/dark themes
- **LLM Settings** - Configure AI provider (OpenAI, Ollama, Claude, etc.)
- **Uploaded Files Panel** - View and manage uploaded files
- **Month Selector** - Switch between different months of data
- **Back to Home** button in header

**How to Access:**
- Upload files from home page → auto-redirects here
- Direct URL: `/chart?month=january` (or any month name)
- Navigate from trends page

---

### 3. **Spending Trends Page** (`/trends`)
**Navigation:**
- Click "Spending Trends" button on home page
- Direct URL: `/trends`
- "Back to Home" button in header

**Features:**

#### **Multi-Month Analysis:**
- Compare spending across multiple months
- Month selector to choose which months to analyze
- Side-by-side comparison of spending patterns

#### **Visualizations:**
1. **Line Charts**
   - Spending trends over time
   - Category-wise trends
   - Month-over-month comparisons

2. **Bar Charts**
   - Monthly spending by category
   - Comparative analysis

3. **Pie Charts**
   - Category distribution
   - Percentage breakdowns

4. **Trend Indicators**
   - Up/down arrows for spending changes
   - Percentage change calculations
   - Visual trend indicators

#### **Analytics:**
- **Category Trends**
  - Track how each category changes over months
  - Identify increasing/decreasing spending patterns
  - Trend direction indicators (up/down/stable)

- **Monthly Comparisons**
  - Total spending per month
  - Category breakdowns per month
  - Transaction counts

- **Insights**
  - Spending anomalies detection
  - Budget recommendations
  - Savings opportunities
  - Spending pattern analysis

#### **Stats Dashboard:**
- Total spending across selected months
- Average monthly spending
- Highest spending month
- Lowest spending month
- Category-wise totals

**How to Access:**
- Click "Spending Trends" button on home page (top navigation)
- Direct URL: `/trends`

---

## Core Features Available Across Pages

### **1. AI-Powered Categorization**
- **Location:** Automatic during file upload
- **How it works:**
  - Upload CSV/PDF files
  - AI analyzes each transaction
  - Automatically assigns categories
  - Extracts: transaction name, amount, date, location, merchant info
- **Supported LLM Providers:**
  - OpenAI (GPT-4, GPT-4o-mini)
  - Ollama (local models)
  - LM Studio (local models)
  - Anthropic Claude
  - Custom OpenAI-compatible APIs
- **Configuration:** LLM Settings button on chart page

### **2. Theme System**
- **Location:** Available on all pages (header/navigation)
- **Themes Available:**
  - Dark themes (default)
  - Light themes (Nordic, Cherry Blossom)
- **How to Access:**
  - Theme switcher icon in navigation bar
  - Available on home, chart, and trends pages

### **3. Data Persistence**
- **Storage:** Firebase Firestore
- **Features:**
  - Automatic saving of all transactions
  - Month-based organization
  - Real-time sync
  - Secure credential storage (for Plaid integration)

### **4. File Management**
- **Uploaded Files Panel:**
  - View all uploaded files
  - See processing status
  - Access file metadata
- **Location:** Chart page (UploadedFilesPanel component)

---

## Feature Matrix

| Feature | Home Page | Chart Page | Trends Page |
|---------|-----------|------------|-------------|
| Upload Files | ✅ | ❌ | ❌ |
| TreeMap View | ❌ | ✅ | ❌ |
| Table View | ❌ | ✅ | ❌ |
| Calendar View | ❌ | ✅ | ❌ |
| Editor View | ❌ | ✅ | ❌ |
| Edit Transactions | ❌ | ✅ | ❌ |
| Add Transactions | ❌ | ✅ | ❌ |
| Smart Search | ❌ | ✅ | ❌ |
| AI Assistant | ❌ | ✅ | ❌ |
| Multi-Month Trends | ❌ | ❌ | ✅ |
| Spending Analytics | ❌ | ✅ | ✅ |
| Theme Switcher | ✅ | ✅ | ✅ |
| Stats Cards | ❌ | ✅ | ✅ |
| Recurring Detection | ❌ | ✅ | ❌ |

---

## Navigation Flow

```
┌─────────────────┐
│   Home Page (/) │
│  - Sign In      │
│  - Upload Files │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│ Chart Page      │  │ Trends Page     │
│ (/chart)        │  │ (/trends)       │
│                 │  │                 │
│ - TreeMap       │  │ - Multi-Month   │
│ - Table         │  │ - Line Charts   │
│ - Calendar      │  │ - Bar Charts   │
│ - Editor        │  │ - Pie Charts   │
│ - Search        │  │ - Analytics     │
│ - AI Chat       │  │                 │
│ - Edit/Add      │  │                 │
└─────────────────┘  └─────────────────┘
```

---

## Quick Access Guide

### To Upload New Transactions:
1. Go to Home Page (`/`)
2. Sign in with Google (if not already)
3. Select CSV/PDF files
4. Enter/select month
5. Click "Upload"
6. Automatically redirected to Chart Page

### To View Monthly Expenses:
1. Upload files (see above) OR
2. Go to `/chart?month=<month-name>`
3. View in TreeMap, Table, Calendar, or Editor mode

### To Analyze Trends:
1. Click "Spending Trends" button on home page OR
2. Go to `/trends`
3. Select months to compare
4. View charts and analytics

### To Edit a Transaction:
1. Navigate to Chart Page
2. Click on any transaction (in TreeMap, Table, or Calendar)
3. Edit details in modal
4. Save changes

### To Search Transactions:
1. On Chart Page, use Smart Search bar
2. Type natural language queries or use filters
3. Click results to highlight in chart

### To Chat with AI:
1. On Chart Page, click chat icon (bottom right)
2. Ask questions about your spending
3. Get AI-powered insights

### To Change Theme:
1. Look for theme switcher icon in navigation
2. Click to toggle between themes
3. Available on all pages

---

## Advanced Features

### **LLM Settings**
- **Location:** Chart page (Settings icon)
- **Features:**
  - Switch between AI providers
  - Configure API endpoints
  - Set model parameters
  - Test connections

### **Recurring Transaction Detection**
- **Location:** Chart page → Table view
- **Features:**
  - Automatically detects recurring expenses
  - Shows frequency (weekly, monthly, etc.)
  - Calculates annual cost
  - Highlights in table with icon

### **Export Functionality**
- **Location:** Chart page → Table view
- **Features:**
  - Export filtered/sorted table to CSV
  - Download button in table header

### **Calendar Integration**
- **Location:** Chart page → Calendar view
- **Features:**
  - Monthly calendar layout
  - Click days to see transactions
  - Visual spending indicators
  - Daily totals

---

## Tips for Best Experience

1. **Organize by Month:** Upload transactions organized by month for better trend analysis
2. **Use Categories:** Let AI categorize, then review and adjust as needed
3. **Check Recurring:** Review recurring transaction insights to identify subscriptions
4. **Multi-Month Analysis:** Use Trends page to see spending patterns over time
5. **AI Assistant:** Ask specific questions for personalized insights
6. **Smart Search:** Use natural language for quick transaction lookup
7. **Theme Preference:** Choose a theme that's comfortable for extended use

---

## Admin Features (if applicable)

- **Theme Testing:** Available for admin users (email: harshsuhith@gmail.com)
- **Development Tools:** Theme test component on home page (admin only)

---

## Technical Notes

- **Data Storage:** Firebase Firestore
- **Authentication:** NextAuth.js with Google OAuth
- **AI Processing:** Configurable LLM providers
- **File Processing:** Server-side Python scripts for PDF/CSV parsing
- **Real-time Updates:** Automatic sync after edits
- **Responsive Design:** Works on desktop and mobile devices

