import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, Shield, Bell, DollarSign, ListPlus, Info } from 'lucide-react-native';

export default function ProfileScreen() {
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete everything. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm Delete", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert("Reset Complete", "Please restart the app.");
          } 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SS</Text>
        </View>
        <Text style={styles.userName}>User Name</Text>
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.menuGroup}>
        <SettingRow 
          icon={<DollarSign size={20} color="#10B981" />} 
          title="Default Currency" 
          value= "USD ($)"
        />
        <SettingRow 
          icon={<ListPlus size={20} color="#10B981" />} 
          title="Manage Categories" 
        />
      </View>

      {/* Security & Alerts Section */}
      <Text style={styles.sectionTitle}>Security & Alerts</Text>
      <View style={styles.menuGroup}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.iconCircle}><Shield size={20} color="#3B82F6" /></View>
            <Text style={styles.settingText}>Biometric Lock</Text>
          </View>
          <Switch 
            value={isBiometricsEnabled} 
            onValueChange={setIsBiometricsEnabled}
            trackColor={{ false: '#1E293B', true: '#10B981' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.iconCircle}><Bell size={20} color="#8B5CF6" /></View>
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch 
            value={isNotificationsEnabled} 
            onValueChange={setIsNotificationsEnabled}
            trackColor={{ false: '#1E293B', true: '#10B981' }}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <TouchableOpacity style={styles.clearBtn} onPress={handleClearData}>
        <Trash2 size={20} color="#F43F5E" />
        <Text style={styles.clearBtnText}>Clear All Data</Text>
      </TouchableOpacity>

      {/* Footer / Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Kubera v1.0.0</Text>
        <Text style={styles.footerMotto}>Personalized Financial Intelligence</Text>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SettingRow({ icon, title, value }) {
  return (
    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconCircle}>{icon}</View>
        <Text style={styles.settingText}>{title}</Text>
      </View>
      {value && <Text style={styles.settingValue}>{value}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14', paddingHorizontal: 20 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  userName: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold' },
  
  sectionTitle: { color: '#64748B', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  menuGroup: { backgroundColor: '#161B22', borderRadius: 24, paddingVertical: 5, marginBottom: 25 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0B0E14', justifyContent: 'center', alignItems: 'center' },
  settingText: { color: '#F8FAFC', fontSize: 16, fontWeight: '500' },
  settingValue: { color: '#64748B', fontSize: 14 },

  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, marginTop: 10 },
  clearBtnText: { color: '#F43F5E', fontWeight: '600', fontSize: 16 },

  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 20 },
  versionText: { color: '#475569', fontSize: 12, fontWeight: 'bold' },
  footerMotto: { color: '#334155', fontSize: 10, marginTop: 4 }
});