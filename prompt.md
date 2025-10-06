# Kubera App for Android Device

## About :
Kubera is not just a budget tracking app, but it is your personal finance assistant. It supports different features  like:
- Add expenses like you want to track your monthly spends on grocerries, eating outside, entertainment
- You can add new categories of expenses.
- You can add your stocks portfolio and have it live tracked and also help you provide analytics on your stocks that is gain/loss per day , total gain/ loss
- It also supports adding other assets like savings account, hsa account
- FInally the home page has widgets showing a summary of your financial for the month , and also networth and net debt

## User experience:
The app should open with an home page showing widgets/plots of the data. With tabs for different things. Like tab for Expenses, tab for stocks management, tab for savings account, tab for hsa

## Environment:
Lets use react native for development. Since we are building for quick launch, we can use expoGo instead of traditional android studio

## Overview:
Kubera is a personal finance assistant, built for quick launch on Android using React Native with ExpoGo. The core application must be contained within a single React Native file (App.js or App.tsx).


## Technical Environment & Data Persistence (MANDATORY):
- Framework: React Native (Functional components, Hooks) via ExpoGo.

- Styling: Use NativeWind (Tailwind CSS for React Native) for all styling and responsive design. The UI must be modern, clean, and highly responsive.

- Data Storage: All application data MUST be persisted locally using a mechanism suitable for React Native (e.g., AsyncStorage/local state persistence).

Persistence Strategy: Use local storage to save application state (Expenses, Categories, Assets). Data will be user-specific but stored locally on the device for this initial launch phase.

Core Features & Data Structures:
1. Navigation & UI Structure
The app must use a bottom tab navigator with the following four main screens/tabs.

Tab Name,Icon (Lucide/Vector),Purpose

Home,Home,Dashboard with summary widgets.

Expenses,DollarSign,Expense logging and list management.

Assets,Wallet,Management of all financial accounts and stocks.

Net Worth,TrendingUp,Dedicated screen for Net Worth calculation and history (simple list/text display).


2. Home Screen (Dashboard)
The home screen must display three main widgets for the current month based on the stored data:

Widget,Display,Calculation / Data Source

Net Worth,Current value,Sum of all Assets minus all Liabilities (Debt) - See Asset & Debt Management section.

Net Debt,Current value,Sum of all Liabilities/Debt accounts.

Monthly Spend,Amount & Graph,Total sum of all expenses logged this month. Display a simple bar chart showing the top 5 expense categories for the month.

3. Expense Tracking (/expenses collection)
The Expense screen allows users to log and view their spending.

Data Schema (per document): date (string), amount (number), category (string), description (string, optional).

Categories: The app must start with the following predefined categories, and allow the user to add new custom categories which are persisted in a separate collection (/categories).

Predefined: Groceries, Dining Out, Entertainment, Bills, Transport, Other.

UI: A form to add new expenses and a scrollable list of all expenses for the current month, sorted by date (descending).

4. Asset & Debt Management (/assets collection)
The Assets screen allows users to manage different financial accounts.

Asset Types (Schema):

Savings Account: name (string), type: 'Savings', balance (number).

HSA Account: name (string), type: 'HSA', balance (number).

Debt (Liability): name (string), type: 'Debt', balance (number, treated as negative when calculating Net Worth).

Stock Portfolio: name: 'Stocks', type: 'Portfolio', holdings (array of objects).

Holding Object Schema: ticker (string, e.g., 'GOOGL'), shares (number), purchasePrice (number).

Stock Portfolio Management (Critical Requirement):

The app should calculate the current value of the portfolio.

MOCK API: Since live market APIs require keys, the agent MUST implement a MOCK API function called fetchMockStockPrice(ticker) that returns a random value within a reasonable range (e.g., $100 to $1000) for any given ticker symbol.

Daily Gain/Loss: Calculate daily gain/loss by comparing the current mock value to the purchase price of the holdings.

Total Gain/Loss: Total gain/loss for the portfolio.

Analytics UI: Display the stock holdings, their current mock value, the daily gain/loss, and the total gain/loss.

Error Handling
All API calls (Local Storage operations and mock stock API) must use try...catch blocks and handle loading states gracefully. Display any errors in a non-disruptive message box (not alert()).