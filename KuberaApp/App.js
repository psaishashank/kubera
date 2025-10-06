import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Home, 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Plus, 
  X,
  Edit,
  Trash2 
} from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions, StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Tab = createBottomTabNavigator();

// Mock Stock API
const fetchMockStockPrice = (ticker) => {
  const mockPrices = {
    'AAPL': 150 + Math.random() * 50,
    'GOOGL': 2500 + Math.random() * 200,
    'TSLA': 200 + Math.random() * 100,
    'MSFT': 300 + Math.random() * 50,
    'AMZN': 3200 + Math.random() * 300,
  };
  return mockPrices[ticker] || (100 + Math.random() * 900);
};

// Storage Keys
const STORAGE_KEYS = {
  EXPENSES: 'kubera_expenses',
  CATEGORIES: 'kubera_categories',
  ASSETS: 'kubera_assets',
  NET_WORTH_HISTORY: 'kubera_net_worth_history',
};

// Default Categories
const DEFAULT_CATEGORIES = ['Groceries', 'Dining Out', 'Entertainment', 'Bills', 'Transport', 'Other'];

// Data Context
const DataContext = React.createContext();

const DataProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [assets, setAssets] = useState([]);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [stockPrices, setStockPrices] = useState({});

  // Load data on app start
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [expensesData, categoriesData, assetsData, historyData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.ASSETS),
        AsyncStorage.getItem(STORAGE_KEYS.NET_WORTH_HISTORY),
      ]);

      if (expensesData) setExpenses(JSON.parse(expensesData));
      if (categoriesData) setCategories(JSON.parse(categoriesData));
      if (assetsData) setAssets(JSON.parse(assetsData));
      if (historyData) setNetWorthHistory(JSON.parse(historyData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveExpenses = async (newExpenses) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const saveCategories = async (newCategories) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const saveAssets = async (newAssets) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(newAssets));
      setAssets(newAssets);
    } catch (error) {
      console.error('Error saving assets:', error);
    }
  };

  const updateStockPrices = () => {
    const stockAssets = assets.filter(asset => asset.type === 'Portfolio');
    const newPrices = {};
    
    stockAssets.forEach(asset => {
      if (asset.holdings) {
        asset.holdings.forEach(holding => {
          newPrices[holding.ticker] = fetchMockStockPrice(holding.ticker);
        });
      }
    });
    
    setStockPrices(newPrices);
  };

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    saveExpenses([...expenses, newExpense]);
  };

  const addCategory = (category) => {
    if (!categories.includes(category)) {
      saveCategories([...categories, category]);
    }
  };

  const addAsset = (asset) => {
    const newAsset = {
      ...asset,
      id: Date.now().toString(),
    };
    saveAssets([...assets, newAsset]);
  };

  const updateAsset = (id, updatedAsset) => {
    const newAssets = assets.map(asset => 
      asset.id === id ? { ...asset, ...updatedAsset } : asset
    );
    saveAssets(newAssets);
  };

  const deleteAsset = (id) => {
    const newAssets = assets.filter(asset => asset.id !== id);
    saveAssets(newAssets);
  };

  const calculateNetWorth = () => {
    let total = 0;
    
    assets.forEach(asset => {
      if (asset.type === 'Portfolio') {
        // Calculate stock portfolio value
        if (asset.holdings) {
          asset.holdings.forEach(holding => {
            const currentPrice = stockPrices[holding.ticker] || holding.purchasePrice;
            total += holding.shares * currentPrice;
          });
        }
      } else if (asset.type === 'Debt') {
        total -= asset.balance;
      } else {
        total += asset.balance;
      }
    });
    
    return total;
  };

  const calculateNetDebt = () => {
    return assets
      .filter(asset => asset.type === 'Debt')
      .reduce((total, asset) => total + asset.balance, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
  };

  const getExpensesByCategory = () => {
    const monthlyExpenses = getMonthlyExpenses();
    const categoryTotals = {};
    
    monthlyExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  return (
    <DataContext.Provider value={{
      expenses,
      categories,
      assets,
      stockPrices,
      addExpense,
      addCategory,
      addAsset,
      updateAsset,
      deleteAsset,
      updateStockPrices,
      calculateNetWorth,
      calculateNetDebt,
      getMonthlyExpenses,
      getExpensesByCategory,
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Home Screen
const HomeScreen = () => {
  const {
    calculateNetWorth,
    calculateNetDebt,
    getMonthlyExpenses,
    getExpensesByCategory,
    updateStockPrices,
  } = React.useContext(DataContext);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    updateStockPrices();
    const interval = setInterval(updateStockPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const netWorth = calculateNetWorth();
  const netDebt = calculateNetDebt();
  const monthlyExpenses = getMonthlyExpenses();
  const totalMonthlySpend = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = getExpensesByCategory();

  const chartData = {
    labels: expensesByCategory.map(([category]) => category.substring(0, 8)),
    datasets: [{
      data: expensesByCategory.map(([, amount]) => amount),
    }],
  };

  const onRefresh = () => {
    setRefreshing(true);
    updateStockPrices();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <StatusBar barStyle="dark-content" backgroundColor="#eff6ff" />
      <ScrollView className="flex-1 px-4 pt-2">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-800 text-sm font-medium">Live</Text>
          </View>
        </View>
      
        {/* Net Worth Widget */}
        <View className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 mb-4 shadow-lg">
          <Text className="text-white text-lg font-medium mb-1 opacity-90">Net Worth</Text>
          <Text className="text-white text-3xl font-bold">
            ${netWorth.toFixed(2)}
          </Text>
          <View className="absolute top-4 right-4">
            <TrendingUp size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        {/* Net Debt Widget */}
        <View className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-5 mb-4 shadow-lg">
          <Text className="text-white text-lg font-medium mb-1 opacity-90">Net Debt</Text>
          <Text className="text-white text-3xl font-bold">
            ${netDebt.toFixed(2)}
          </Text>
          <View className="absolute top-4 right-4">
            <Wallet size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        {/* Monthly Spend Widget */}
        <View className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-5 mb-4 shadow-lg">
          <Text className="text-white text-lg font-medium mb-1 opacity-90">Monthly Spend</Text>
          <Text className="text-white text-3xl font-bold mb-4">
            ${totalMonthlySpend.toFixed(2)}
          </Text>
          <View className="absolute top-4 right-4">
            <DollarSign size={24} color="rgba(255,255,255,0.8)" />
          </View>
        
          {expensesByCategory.length > 0 && (
            <View className="mt-4">
              <Text className="text-white text-md font-medium mb-3 opacity-90">Top 5 Categories</Text>
              <View className="bg-white/20 rounded-lg p-3">
                <BarChart
                  data={chartData}
                  width={screenWidth - 100}
                  height={180}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 8,
                    },
                  }}
                  style={{
                    borderRadius: 8,
                  }}
                />
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          className="bg-white rounded-xl p-4 items-center mb-6 shadow-lg border border-blue-100"
        >
          <Text className="text-blue-600 font-semibold text-lg">Refresh Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Expenses Screen
const ExpensesScreen = () => {
  const { expenses, categories, addExpense, addCategory, getMonthlyExpenses } = React.useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const monthlyExpenses = getMonthlyExpenses();

  const handleAddExpense = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addExpense({
      amount: parseFloat(amount),
      category: selectedCategory,
      description: description.trim(),
    });

    setAmount('');
    setDescription('');
    setModalVisible(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    addCategory(newCategory.trim());
    setNewCategory('');
    setCategoryModalVisible(false);
  };

  const renderExpenseItem = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-lg border-l-4 border-blue-500">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">${item.amount.toFixed(2)}</Text>
          <View className="bg-blue-100 px-2 py-1 rounded-full mt-1 self-start">
            <Text className="text-blue-800 text-xs font-medium">{item.category}</Text>
          </View>
          {item.description && (
            <Text className="text-sm text-gray-600 mt-2">{item.description}</Text>
          )}
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <StatusBar barStyle="dark-content" backgroundColor="#eff6ff" />
      
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-600 to-indigo-600 mx-4 mt-2 rounded-xl p-5 shadow-lg">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-white">Expenses</Text>
            <Text className="text-blue-100 text-sm mt-1">
              This month: ${monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setCategoryModalVisible(true)}
              className="bg-white/20 rounded-full p-3 mr-2"
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="bg-white rounded-full p-3"
            >
              <Plus size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Expenses List */}
      <FlatList
        data={monthlyExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="bg-white rounded-xl p-8 items-center shadow-lg mt-4">
            <DollarSign size={48} color="#9ca3af" />
            <Text className="text-gray-500 text-center mt-4 text-lg">No expenses yet</Text>
            <Text className="text-gray-400 text-center mt-2">Tap the + button to add your first expense</Text>
          </View>
        }
      />

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Add Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`mr-2 px-3 py-2 rounded-full ${
                    selectedCategory === category ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <Text className={selectedCategory === category ? 'text-white' : 'text-gray-700'}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />

            <TouchableOpacity
              onPress={handleAddExpense}
              className="bg-blue-500 rounded-lg p-3 items-center"
            >
              <Text className="text-white font-semibold">Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Add Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Category Name"
              value={newCategory}
              onChangeText={setNewCategory}
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />

            <TouchableOpacity
              onPress={handleAddCategory}
              className="bg-gray-500 rounded-lg p-3 items-center"
            >
              <Text className="text-white font-semibold">Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Assets Screen
const AssetsScreen = () => {
  const { assets, addAsset, updateAsset, deleteAsset, stockPrices, updateStockPrices } = React.useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetType, setAssetType] = useState('Savings');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const assetTypes = ['Savings', 'HSA', 'Debt', 'Portfolio'];

  useEffect(() => {
    updateStockPrices();
  }, [assets]);

  const handleAddAsset = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an asset name');
      return;
    }

    if (assetType !== 'Portfolio' && (!balance || isNaN(parseFloat(balance)))) {
      Alert.alert('Error', 'Please enter a valid balance');
      return;
    }

    const newAsset = {
      name: name.trim(),
      type: assetType,
      balance: assetType === 'Portfolio' ? 0 : parseFloat(balance),
      holdings: assetType === 'Portfolio' ? [] : undefined,
    };

    if (editingAsset) {
      updateAsset(editingAsset.id, newAsset);
    } else {
      addAsset(newAsset);
    }

    resetForm();
  };

  const handleAddStock = () => {
    if (!ticker.trim() || !shares || !purchasePrice) {
      Alert.alert('Error', 'Please fill all stock fields');
      return;
    }

    const portfolioAssets = assets.filter(asset => asset.type === 'Portfolio');
    let portfolioAsset = portfolioAssets[0];

    if (!portfolioAsset) {
      portfolioAsset = {
        name: 'Stocks',
        type: 'Portfolio',
        balance: 0,
        holdings: [],
      };
      addAsset(portfolioAsset);
    }

    const newHolding = {
      ticker: ticker.trim().toUpperCase(),
      shares: parseFloat(shares),
      purchasePrice: parseFloat(purchasePrice),
    };

    const updatedHoldings = [...(portfolioAsset.holdings || []), newHolding];
    updateAsset(portfolioAsset.id, { holdings: updatedHoldings });

    setTicker('');
    setShares('');
    setPurchasePrice('');
    setStockModalVisible(false);
  };

  const resetForm = () => {
    setName('');
    setBalance('');
    setAssetType('Savings');
    setEditingAsset(null);
    setModalVisible(false);
  };

  const calculateStockValue = (holding) => {
    const currentPrice = stockPrices[holding.ticker] || holding.purchasePrice;
    return holding.shares * currentPrice;
  };

  const calculateStockGainLoss = (holding) => {
    const currentPrice = stockPrices[holding.ticker] || holding.purchasePrice;
    return (currentPrice - holding.purchasePrice) * holding.shares;
  };

  const renderAssetItem = ({ item }) => {
    if (item.type === 'Portfolio') {
      const totalValue = item.holdings?.reduce((sum, holding) => sum + calculateStockValue(holding), 0) || 0;
      const totalGainLoss = item.holdings?.reduce((sum, holding) => sum + calculateStockGainLoss(holding), 0) || 0;

      return (
        <View className="bg-white rounded-xl p-4 mb-3 shadow-lg border-l-4 border-green-500">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{item.name}</Text>
              <View className="bg-green-100 px-2 py-1 rounded-full mt-1 self-start">
                <Text className="text-green-800 text-xs font-medium">Portfolio</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteAsset(item.id)} className="bg-red-100 rounded-full p-2">
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
          
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <Text className="text-sm text-gray-600 mb-1">Portfolio Value</Text>
            <Text className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</Text>
            <Text className={`text-sm font-medium ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)} ({totalGainLoss >= 0 ? 'Gain' : 'Loss'})
            </Text>
          </View>

          {item.holdings?.map((holding, index) => {
            const currentValue = calculateStockValue(holding);
            const gainLoss = calculateStockGainLoss(holding);
            const currentPrice = stockPrices[holding.ticker] || holding.purchasePrice;

            return (
              <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-bold text-blue-900">{holding.ticker}</Text>
                    <Text className="text-sm text-gray-600">
                      {holding.shares} shares @ ${currentPrice.toFixed(2)}
                    </Text>
                    <Text className="text-sm font-medium text-gray-900">
                      Value: ${currentValue.toFixed(2)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    const getAssetColor = (type) => {
      switch (type) {
        case 'Debt': return 'border-red-500';
        case 'Savings': return 'border-blue-500';
        case 'HSA': return 'border-purple-500';
        default: return 'border-gray-500';
      }
    };

    const getAssetBgColor = (type) => {
      switch (type) {
        case 'Debt': return 'bg-red-100';
        case 'Savings': return 'bg-blue-100';
        case 'HSA': return 'bg-purple-100';
        default: return 'bg-gray-100';
      }
    };

    const getAssetTextColor = (type) => {
      switch (type) {
        case 'Debt': return 'text-red-800';
        case 'Savings': return 'text-blue-800';
        case 'HSA': return 'text-purple-800';
        default: return 'text-gray-800';
      }
    };

    return (
      <View className={`bg-white rounded-xl p-4 mb-3 shadow-lg border-l-4 ${getAssetColor(item.type)}`}>
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">{item.name}</Text>
            <View className={`${getAssetBgColor(item.type)} px-2 py-1 rounded-full mt-1 self-start`}>
              <Text className={`text-xs font-medium ${getAssetTextColor(item.type)}`}>{item.type}</Text>
            </View>
            <Text className={`text-2xl font-bold mt-2 ${item.type === 'Debt' ? 'text-red-600' : 'text-green-600'}`}>
              ${item.balance.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => {
                setEditingAsset(item);
                setName(item.name);
                setBalance(item.balance.toString());
                setAssetType(item.type);
                setModalVisible(true);
              }}
              className="bg-blue-100 rounded-full p-2 mr-2"
            >
              <Edit size={18} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteAsset(item.id)} className="bg-red-100 rounded-full p-2">
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-50 to-white">
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      
      {/* Header */}
      <View className="bg-gradient-to-r from-green-600 to-emerald-600 mx-4 mt-2 rounded-xl p-5 shadow-lg">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-white">Assets</Text>
            <Text className="text-green-100 text-sm mt-1">Manage your wealth</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setStockModalVisible(true)}
              className="bg-white/20 rounded-full p-3 mr-2"
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="bg-white rounded-full p-3"
            >
              <Plus size={20} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Assets List */}
      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="bg-white rounded-xl p-8 items-center shadow-lg mt-4">
            <Wallet size={48} color="#9ca3af" />
            <Text className="text-gray-500 text-center mt-4 text-lg">No assets yet</Text>
            <Text className="text-gray-400 text-center mt-2">Add your first asset to start tracking your wealth</Text>
          </View>
        }
      />

      {/* Add Asset Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">
                {editingAsset ? 'Edit Asset' : 'Add Asset'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Asset Name"
              value={name}
              onChangeText={setName}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {assetTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setAssetType(type)}
                  className={`mr-2 px-3 py-2 rounded-full ${
                    assetType === type ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <Text className={assetType === type ? 'text-white' : 'text-gray-700'}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {assetType !== 'Portfolio' && (
              <TextInput
                placeholder="Balance"
                value={balance}
                onChangeText={setBalance}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 mb-4"
              />
            )}

            <TouchableOpacity
              onPress={handleAddAsset}
              className="bg-blue-500 rounded-lg p-3 items-center"
            >
              <Text className="text-white font-semibold">
                {editingAsset ? 'Update Asset' : 'Add Asset'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Stock Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={stockModalVisible}
        onRequestClose={() => setStockModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Add Stock</Text>
              <TouchableOpacity onPress={() => setStockModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Ticker Symbol (e.g., AAPL)"
              value={ticker}
              onChangeText={setTicker}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <TextInput
              placeholder="Number of Shares"
              value={shares}
              onChangeText={setShares}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            <TextInput
              placeholder="Purchase Price"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />

            <TouchableOpacity
              onPress={handleAddStock}
              className="bg-green-500 rounded-lg p-3 items-center"
            >
              <Text className="text-white font-semibold">Add Stock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Net Worth Screen
const NetWorthScreen = () => {
  const { calculateNetWorth, assets } = React.useContext(DataContext);
  const [netWorthHistory, setNetWorthHistory] = useState([]);

  useEffect(() => {
    loadNetWorthHistory();
  }, []);

  const loadNetWorthHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NET_WORTH_HISTORY);
      if (data) {
        setNetWorthHistory(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading net worth history:', error);
    }
  };

  const saveNetWorthSnapshot = async () => {
    const currentNetWorth = calculateNetWorth();
    const snapshot = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      value: currentNetWorth,
    };

    const newHistory = [...netWorthHistory, snapshot];
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NET_WORTH_HISTORY, JSON.stringify(newHistory));
      setNetWorthHistory(newHistory);
    } catch (error) {
      console.error('Error saving net worth snapshot:', error);
    }
  };

  const currentNetWorth = calculateNetWorth();

  const renderHistoryItem = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-lg border-l-4 border-purple-500">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            ${item.value.toFixed(2)}
          </Text>
          <View className="bg-purple-100 px-2 py-1 rounded-full mt-1 self-start">
            <Text className="text-purple-800 text-xs font-medium">Snapshot</Text>
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            {new Date(item.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {new Date(item.date).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-purple-50 to-white">
      <StatusBar barStyle="dark-content" backgroundColor="#faf5ff" />
      
      {/* Header */}
      <View className="bg-gradient-to-r from-purple-600 to-indigo-600 mx-4 mt-2 rounded-xl p-5 shadow-lg">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-white">Net Worth</Text>
            <Text className="text-purple-100 text-sm mt-1">Track your wealth over time</Text>
          </View>
          <TouchableOpacity
            onPress={saveNetWorthSnapshot}
            className="bg-white rounded-full px-4 py-3"
          >
            <Text className="text-purple-600 font-semibold">Save Snapshot</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Net Worth */}
      <View className="bg-gradient-to-r from-emerald-500 to-green-500 mx-4 mt-4 rounded-xl p-5 shadow-lg">
        <Text className="text-white text-lg font-medium mb-1 opacity-90">Current Net Worth</Text>
        <Text className="text-white text-4xl font-bold">
          ${currentNetWorth.toFixed(2)}
        </Text>
        <View className="absolute top-4 right-4">
          <TrendingUp size={28} color="rgba(255,255,255,0.8)" />
        </View>
      </View>

      {/* History List */}
      <View className="flex-1 px-4 mt-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">Historical Snapshots</Text>
        <FlatList
          data={netWorthHistory.sort((a, b) => new Date(b.date) - new Date(a.date))}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="bg-white rounded-xl p-8 items-center shadow-lg">
              <TrendingUp size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-center mt-4 text-lg">No snapshots yet</Text>
              <Text className="text-gray-400 text-center mt-2">Save your first snapshot to start tracking your net worth over time</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let IconComponent;

                if (route.name === 'Home') {
                  IconComponent = Home;
                } else if (route.name === 'Expenses') {
                  IconComponent = DollarSign;
                } else if (route.name === 'Assets') {
                  IconComponent = Wallet;
                } else if (route.name === 'Net Worth') {
                  IconComponent = TrendingUp;
                }

                return <IconComponent size={size} color={color} />;
              },
              tabBarActiveTintColor: '#3b82f6',
              tabBarInactiveTintColor: '#6b7280',
              tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb',
                paddingTop: Platform.OS === 'android' ? 12 : 8,
                paddingBottom: Platform.OS === 'android' ? 16 : 8,
                height: Platform.OS === 'android' ? 80 : 60,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: -2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
                marginBottom: Platform.OS === 'android' ? 4 : 0,
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Expenses" component={ExpensesScreen} />
            <Tab.Screen name="Assets" component={AssetsScreen} />
            <Tab.Screen name="Net Worth" component={NetWorthScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  );
}
