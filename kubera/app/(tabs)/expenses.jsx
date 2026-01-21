import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { getAppData, saveAppData } from '../../lib/storage';
import { IndianRupee, Calendar } from 'lucide-react-native';

export default function ExpensesScreen() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [currency, setCurrency] = useState('USD');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const data = await getAppData();
    setAvailableCategories(data.categories || []);
    // We only want the most recent 5 for the list
    setRecentExpenses(data.expenses ? data.expenses.slice(0, 5) : []);
  };

  const handleSave = async () => {
    if (!name || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const masterData = await getAppData();
      const newExpense = {
        id: `exp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        name: name.trim(),
        category: category,
        value: parseFloat(amount),
        currency: "USD" //₹ later we support multiple currencies
      };

      const updatedData = {
        ...masterData,
        expenses: [newExpense, ...masterData.expenses]
      };

      await saveAppData(updatedData);
      
      // Reset form and REFRESH the list below
      setName('');
      setAmount('');
      refreshData();
      Alert.alert("Success", "Added to Ledger");
    } catch (error) {
      Alert.alert("Error", "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* FORM SECTION */}
      <View style={styles.formCard}>
        <Text style={styles.header}>Add New Expense</Text>
        
        <TextInput 
          style={styles.input} 
          value={name}
          onChangeText={setName}
          placeholder="What did you buy?" 
        />

        <TextInput 
          style={styles.input} 
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric" 
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {availableCategories.map((cat) => (
            <TouchableOpacity 
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Saving..." : "Add Expense"}</Text>
        </TouchableOpacity>
      </View>

      {/* RECENT LIST SECTION */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent History</Text>
        {recentExpenses.length === 0 ? (
          <Text style={styles.emptyText}>No entries yet.</Text>
        ) : (
          recentExpenses.map((item) => (
            <View key={item.id} style={styles.expenseItem}>
              <View>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.category}</Text>
              </View>
              <Text style={styles.itemAmount}>${item.value}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000ff', padding: 20 },
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 2, marginBottom: 25 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
  label: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' },
  input: { borderBottomWidth: 1, borderColor: '#f1f5f9', marginBottom: 20, paddingVertical: 10, fontSize: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#f1f5f9' },
  categoryChipActive: { backgroundColor: '#0ef116ff' },
  categoryText: { fontSize: 12, color: '#64748b' },
  categoryTextActive: { color: '#fff' },
  button: { backgroundColor: '#0ef116ff', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  
  historySection: { marginBottom: 40 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  expenseItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#334155' },
  itemMeta: { fontSize: 12, color: '#94a3b8' },
  itemAmount: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 10 }
});