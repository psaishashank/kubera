import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getAppData, saveAppData, getCategories } from '../../lib/storage';
import { calculateMonthlyExpenses } from '../../lib/financial_calculator';
import { Plus, X, ShoppingCart, Car, Tv, Zap, LayoutGrid } from 'lucide-react-native';

export default function ExpensesScreen() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [category, setCategory] = useState(''); 
  const [availableCategories, setAvailableCategories] = useState([]); 
  const [expenses, setExpenses] = useState([]);

  // Load data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadExpenseData();
    }, [])
  );

  const loadExpenseData = async () => {
    // 1. Fetch dynamic categories from storage.js
    const cats = await getCategories();
    setAvailableCategories(cats);
    
    // Set default category to the first one in your dynamic list if empty
    if (!category && cats.length > 0) setCategory(cats[0]);

    const data = await getAppData();
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7); 

    // 2. Calculate month total using your financial_calculator.js
    const total = await calculateMonthlyExpenses(
      now.getMonth() + 1, 
      now.getFullYear()
    );

    // 3. Filter list to show only the current month's entries
    const monthlyList = (data.expenses || []).filter(item => 
      item.timestamp && item.timestamp.startsWith(currentMonthStr)
    );

    setMonthlyTotal(total);
    setExpenses(monthlyList);
  };

  const handleSave = async () => {
    if (!name || !amount) return;
    
    const data = await getAppData();
    const newExpense = {
      id: `exp_${Date.now()}`,
      name,
      value: parseFloat(amount),
      category,
      timestamp: new Date().toISOString(),
    };

    const updated = { ...data, expenses: [newExpense, ...data.expenses] };
    await saveAppData(updated);
    
    // Reset form to initial states
    setName('');
    setAmount('');
    setCategory(availableCategories[0] || ''); 
    setShowForm(false);
    loadExpenseData(); 
  };

  const handleDelete = (id, itemName) => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const data = await getAppData();
            const updatedExpenses = data.expenses.filter(e => e.id !== id);
            await saveAppData({ ...data, expenses: updatedExpenses });
            loadExpenseData(); 
          } 
        }
      ]
    );
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Dining Out':
      case 'Groceries': return <ShoppingCart size={18} color="#94a3b8" />;
      case 'Travel': return <Car size={18} color="#94a3b8" />;
      case 'Entertainment': return <Tv size={18} color="#94a3b8" />;
      default: return <LayoutGrid size={18} color="#94a3b8" />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Expenses</Text>
            <Text style={styles.subtitle}>Track your spending</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => setShowForm(!showForm)}
          >
            {showForm ? <X color="#fff" /> : <Plus color="#fff" />}
          </TouchableOpacity>
        </View>

        {/* Hero Summary Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Expenses This Month</Text>
          <Text style={styles.heroAmount}>${monthlyTotal.toFixed(2)}</Text>
        </View>

        {/* Add Expense Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Expense</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Description" 
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
            />
            <TextInput 
              style={styles.input} 
              placeholder="0.00" 
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.labelText}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoryRow}
            >
              {availableCategories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[
                    styles.categoryChip, 
                    category === cat && styles.activeChip 
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.chipText, 
                    category === cat && styles.activeChipText
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction History List */}
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        {expenses.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onLongPress={() => handleDelete(item.id, item.name)}
            activeOpacity={0.7}
          >
            <View style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemMeta}>
                  {getCategoryIcon(item.category)}
                  <Text style={styles.metaText}>{item.category}</Text>
                  <Text style={styles.metaText}>
                    • {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemAmount}>-${item.value.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  subtitle: { fontSize: 14, color: '#64748b' },
  addBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 12 },
  
  heroCard: { backgroundColor: '#B91C1C', padding: 30, borderRadius: 24, marginBottom: 30 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 10 },
  heroAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },

  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  
  formCard: { backgroundColor: '#161B22', padding: 20, borderRadius: 24, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  formTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#0B0E14', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 },
  
  labelText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 20, paddingVertical: 5 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0B0E14', borderWidth: 1, borderColor: '#1E293B' },
  activeChip: { backgroundColor: '#10B981', borderColor: '#10B981' },
  chipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  activeChipText: { color: '#fff' },
  
  saveBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },

  itemCard: { backgroundColor: '#161B22', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemLeft: { flex: 1 },
  itemName: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#64748b', fontSize: 12 },
  itemAmount: { color: '#F43F5E', fontSize: 18, fontWeight: 'bold' }
});