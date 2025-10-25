import { Tabs, Redirect } from 'expo-router';
import { Home, ClipboardCheck, History, Settings, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const isStaff = user.role === 'STAFF';
  const isHOD = user.role === 'HOD';
  const isCEO = user.role === 'CEO';
  const isSecurity = user.role === 'SECURITY';
  const isAdmin = user.role === 'ADMIN';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      {(isStaff || isHOD || isCEO || isAdmin) && (
        <Tabs.Screen
          name="index"
          options={{
            title: isAdmin ? 'Dashboard' : 'Home',
            tabBarIcon: ({ size, color }: any) => <Home size={size} color={color} />,
          }}
        />
      )}

      {(isHOD || isCEO) && (
        <Tabs.Screen
          name="approvals"
          options={{
            title: 'Approvals',
            tabBarIcon: ({ size, color }: any) => <ClipboardCheck size={size} color={color} />,
          }}
        />
      )}

      {isSecurity && (
        <Tabs.Screen
          name="security"
          options={{
            title: 'Security Check',
            tabBarIcon: ({ size, color }: any) => <ShieldCheck size={size} color={color} />,
          }}
        />
      )}

      {(isStaff || isHOD || isCEO || isAdmin) && (
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ size, color }: any) => <History size={size} color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }: any) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
