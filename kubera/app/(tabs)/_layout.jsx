import { Tabs } from 'expo-router';
import { Home, IndianRupee } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#0ef116ff', // Blue for the active tab
      headerStyle: { backgroundColor: '#000000' },
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color }) => <IndianRupee size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}