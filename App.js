import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Home, ClipboardCheck, History as HistoryIcon, ShieldCheck, BarChart3, Users } from 'lucide-react-native';
import ProfileAvatar from './components/ProfileAvatar';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { notificationService } from './services/notificationService';

// Import screens
import LoginScreen from './screens/LoginScreen';
import PasswordChangeScreen from './screens/PasswordChangeScreen';
import HomeScreen from './screens/HomeScreen';
import ApprovalsScreen from './screens/ApprovalsScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import SecurityCheckScreen from './screens/SecurityCheckScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminUserManagementScreen from './screens/AdminUserManagementScreen';
import CEODashboardScreen from './screens/CEODashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Admin Stack Navigator (removed - no longer needed)
// function AdminStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
//       <Stack.Screen name="AdminUserManagement" component={AdminUserManagementScreen} />
//     </Stack.Navigator>
//   );
// }

function AppTabs() {
  const { user, requiresPasswordChange } = useAuth();

  if (!user && !requiresPasswordChange) {
    return <LoginScreen />;
  }

  if (requiresPasswordChange) {
    return <PasswordChangeScreen />;
  }

  const isStaff = user.role === 'STAFF';
  const isHOD = user.role === 'HOD';
  const isCEO = user.role === 'CEO';
  const isDirector = user.role === 'DIRECTOR';
  const isSecurity = user.role === 'SECURITY';
  const isAdmin = user.role === 'ADMIN';

  // Approvers are HOD, CEO, Director, and Admin
  const isApprover = isHOD || isCEO || isDirector || isAdmin;

  console.log('=== APP TABS DEBUG ===');
  console.log('User Role:', user.role);
  console.log('isCEO:', isCEO);
  console.log('isDirector:', isDirector);
  console.log('isApprover:', isApprover);
  console.log('isSecurity:', isSecurity);
  console.log('=====================');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      {(isStaff || isHOD || isDirector) && !isAdmin && !isCEO && (
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />
      )}

      {isCEO && (
        <Tab.Screen
          name="CEODashboard"
          component={CEODashboardScreen}
          options={{
            title: 'CEO Dashboard',
            tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
          }}
        />
      )}

      {isAdmin && (
        <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
          }}
        />
      )}

      {isApprover && (
        <Tab.Screen
          name="Approvals"
          component={ApprovalsScreen}
          options={{
            tabBarIcon: ({ size, color }) => <ClipboardCheck size={size} color={color} />,
          }}
        />
      )}

      {isSecurity && (
        <Tab.Screen
          name="SecurityCheck"
          component={SecurityCheckScreen}
          options={{
            title: 'Security Check',
            tabBarIcon: ({ size, color }) => <ShieldCheck size={size} color={color} />,
          }}
        />
      )}

      {isAdmin && (
        <Tab.Screen
          name="UserManagement"
          component={AdminUserManagementScreen}
          options={{
            title: 'Users',
            tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
          }}
        />
      )}

      {(isStaff || isHOD || isDirector || isCEO || isAdmin) && (
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ size, color }) => <HistoryIcon size={size} color={color} />,
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ size, color }) => <ProfileAvatar size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  React.useEffect(() => {
    // Initialize notifications
    notificationService.registerForPushNotifications();

    const notificationListener = notificationService.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseListener = notificationService.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppTabs />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
