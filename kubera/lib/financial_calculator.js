// lib/financial_calculator.js
import { getAppData } from './storage';

// ... (Keep your getAppData and saveAppData from before)

export const getFinancialSummary = async () => {
  const data = await getAppData();
  
  // 1. Calculate Monthly Spending
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2026-01"
  const monthlySpend = await calculateMonthlyExpenses(
    parseInt(currentMonth.split('-')[1]), // month
    parseInt(currentMonth.split('-')[0])  // year
  );

  // 2. Calculate Total Assets (Sum of value_change)
  const totalAssets = data.assets_ledger
    .reduce((sum, a) => sum + Number(a.value_change), 0);

  // 3. Calculate Total Debts
  const totalDebts = data.debts_ledger
    .reduce((sum, d) => sum + Number(d.value_change), 0);

  return {
    monthlySpend,
    netWorth: totalAssets - totalDebts,
    netDebt: totalDebts
    };
};

// Function to calculate total expenses for the given month (1-12) and year (e.g., 26)
export const calculateMonthlyExpenses = async (month, year) => {
  const data = await getAppData();
  const monthStr = month.toString().padStart(2, '0'); // Ensure month is 2 digits
  const yearStr = year.toString();
  const targetMonth = `${yearStr}-${monthStr}`;

  return data.expenses
    .filter(e => e.timestamp.startsWith(targetMonth))
    .reduce((sum,e) => sum + Number(e.value), 0);
};  