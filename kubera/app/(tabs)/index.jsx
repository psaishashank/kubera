import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getAppData } from '../../lib/storage';
import { Wallet, TrendingUp, TrendingDown, LayoutDashboard } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [summary, setSummary] = useState({
    monthlySpend: 0,
    income: 5200, // Mocking income for now based on your design
    netWorth: 1710,
  });

  useFocusEffect(
    useCallback(() => {
      calculateSummary();
    }, [])
  );

  const calculateSummary = async () => {
    const data = await getAppData();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const expenses = data.expenses || [];
    const spend = expenses
      .filter(e => e.timestamp?.startsWith(currentMonth))
      .reduce((sum, e) => sum + (Number(e.value) || 0), 0);

    // netWorth here acts as our 'Total Balance' from your design
    setSummary(prev => ({
      ...prev,
      monthlySpend: spend,
      netWorth: 0 + (0 - spend), // Simple mock logic for demo
    }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Area */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget Tracker</Text>
          <Text style={styles.subtitle}>February 2026</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <LayoutDashboard size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Main Balance Card (Gradient) */}
      <LinearGradient
        colors={['#10B981', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainCard}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>Total Balance</Text>
          <Wallet size={20} color="rgba(255,255,255,0.8)" />
        </View>
        <Text style={styles.balanceText}>${summary.netWorth.toLocaleString()}</Text>
        
        <View style={styles.cardStats}>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>${summary.income.toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>${summary.monthlySpend.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats Row */}
      <View style={styles.row}>
        <View style={styles.subCard}>
          <View style={styles.subCardHeader}>
            <Text style={styles.subCardLabel}>Savings Rate</Text>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <TrendingUp size={16} color="#10B981" />
            </View>
          </View>
          <Text style={[styles.subCardValue, { color: '#10B981' }]}>32.9%</Text>
        </View>

        <View style={styles.subCard}>
          <View style={styles.subCardHeader}>
            <Text style={styles.subCardLabel}>This Week</Text>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
              <TrendingDown size={16} color="#F43F5E" />
            </View>
          </View>
          <Text style={[styles.subCardValue, { color: '#F43F5E' }]}>$970</Text>
        </View>
      </View>

      {/* Placeholder for the Chart Section */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Income vs Expenses</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={{ color: '#64748b' }}>[Chart Component Coming in Beta 1.2]</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  profileBtn: { padding: 10, borderRadius: 12, backgroundColor: '#161B22' },
  
  mainCard: { padding: 25, borderRadius: 32, marginBottom: 20, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
  balanceText: { color: '#fff', fontSize: 42, fontWeight: 'bold', marginBottom: 25 },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  row: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  subCard: { flex: 1, backgroundColor: '#161B22', padding: 20, borderRadius: 24 },
  subCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  subCardLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  iconBox: { padding: 8, borderRadius: 10 },
  subCardValue: { fontSize: 22, fontWeight: 'bold' },

  chartContainer: { backgroundColor: '#161B22', padding: 20, borderRadius: 24, marginBottom: 40 },
  chartTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  chartPlaceholder: { height: 180, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155', borderRadius: 16 }
});