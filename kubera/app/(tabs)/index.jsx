import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getAppData } from '../../lib/storage';
import { Wallet, TrendingUp, IndianRupee } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [summary, setSummary] = useState({
    monthlySpend: 0,
    netWorth: 0,
    netDebt: 0
  });

  // useFocusEffect is like a "trigger" that runs every time you open this tab
  useFocusEffect(
    useCallback(() => {
      calculateSummary();
    }, [])
  );

const calculateSummary = async () => {
    try {
      const data = await getAppData();
      
      // 1. Current Month (e.g., "2026-01")
      const currentMonth = new Date().toISOString().slice(0, 7);

      // 2. Monthly Spend (Safe check with || [])
      const expenses = data.expenses || [];
      const spend = expenses
        .filter(e => e.timestamp && e.timestamp.startsWith(currentMonth))
        .reduce((sum, e) => sum + (Number(e.value) || 0), 0);

      // 3. Totals (Safe check with || [])
      const assets = data.assets_ledger || [];
      const debts = data.debts_ledger || [];

      const assetsTotal = assets.reduce((sum, a) => sum + (Number(a.value_change) || 0), 0);
      const debtsTotal = debts.reduce((sum, d) => sum + (Number(d.value_change) || 0), 0);

      setSummary({
        monthlySpend: spend,
        netWorth: assetsTotal - debtsTotal,
        netDebt: debtsTotal
      });
    } catch (error) {
      console.error("Calculation Error:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Financial Overview</Text>
      
      {/* Monthly Spend Widget */}
      <View style={[styles.card, styles.mainCard]}>
        <View style={styles.cardHeader}>
          <IndianRupee size={20} color="#fff" opacity={0.8} />
          <Text style={styles.cardLabel}>Monthly Spend</Text>
        </View>
        <Text style={styles.mainAmount}>₹{summary.monthlySpend.toLocaleString()}</Text>
        <Text style={styles.cardPeriod}>January 2026</Text>
      </View>

      <View style={styles.row}>
        {/* Net Worth Widget */}
        <View style={[styles.card, styles.halfCard]}>
          <TrendingUp size={20} color="#10b981" />
          <Text style={styles.subLabel}>Net Worth</Text>
          <Text style={styles.subAmount}>₹{summary.netWorth.toLocaleString()}</Text>
        </View>

        {/* Net Debt Widget */}
        <View style={[styles.card, styles.halfCard]}>
          <Wallet size={20} color="#ef4444" />
          <Text style={styles.subLabel}>Net Debt</Text>
          <Text style={styles.subAmount}>₹{summary.netDebt.toLocaleString()}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 20, marginTop: 10 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  mainCard: { backgroundColor: '#2563eb', marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardLabel: { color: '#fff', fontSize: 14, opacity: 0.9, fontWeight: '600' },
  mainAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  cardPeriod: { color: '#fff', fontSize: 12, opacity: 0.7, marginTop: 10 },
  row: { flexDirection: 'row', gap: 15 },
  halfCard: { flex: 1, gap: 8 },
  subLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  subAmount: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' }
});