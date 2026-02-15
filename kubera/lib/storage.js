import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'KUBERA_DATA';

// Default data if the app is opened for the first time
const INITIAL_DATA = {
  last_updated: new Date().toISOString(),
  categories: ['Groceries', 'Dining Out', 'Travel', 'Shopping', 'House','Health','Anthariksham Labs','Learning'],
  asset_categories:["Savings A/C","Checkings A/C","Stocks","Bonds","Property","Vehicle"],
  currency_supported: ["INR","USD"],
  debt_categories: ["Credit Card","Loan","Owing"],
  expenses: [],
  assets_ledger: [],
  debts_ledger: []
};


// 1. Initialize or Get Data
export const getAppData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    } else {
      // First time opening the app!
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
  } catch (e) {
    console.error("Failed to load data", e);
    return INITIAL_DATA;
  }
};

// 2. Save the whole Master Object
export const saveAppData = async (newData) => {
  try {
    const dataToSave = {
      ...newData,
      last_updated: new Date().toISOString()
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return dataToSave;
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

// Helper function to save an expense
export const saveExpense = async (newExpense) => {
  try {
    // 1. Get existing data
    const currentData = await loadAppData();
    
    // 2. Add the new expense to the array
    const updatedData = {
      ...currentData,
      expenses: [newExpense, ...currentData.expenses],
    };

    // 3. Save it back to the phone's storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (e) {
    console.error("Error saving expense", e);
  }
};

export const getCategories = async () => {
  try {
    const data = await getAppData();
    return data.categories || [];
  } catch (e) {
    console.error("Failed to load categories", e);
    return ['Groceries', 'Dining Out', 'Travel', 'Shopping', 'House','Health','Anthariksham Labs','Learning'];
  }
};

export const getAssetCategories = async () => {
  try {
    const data = await getAppData();
    return data.asset_categories || [];
  } catch (e) {
    console.error("Failed to load asset categories", e);
    return ["Savings A/C","Checkings A/C","Stocks","Bonds","Property","Vehicle"];
  }
};

export const getDebtCategories = async () => {
  try {
    const data = await getAppData();
    return data.debt_categories || [];
  } catch (e) {
    console.error("Failed to load debt categories", e);
    return ["Credit Card","Loan","Owing"];
  }
};

