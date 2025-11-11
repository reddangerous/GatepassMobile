import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import HomeScreen from './HomeScreen';
import ApprovalsScreen from './ApprovalsScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainScreen() {
  const { user } = useAuth();

  const isStaff = user?.role === 'STAFF';
  const isHOD = user?.role === 'HOD';
  const isSecurity = user?.role === 'SECURITY';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      {(isStaff || isHOD || isAdmin) && (
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
      )}

      {isHOD && (
        <Tab.Screen
          name="Approvals"
          component={ApprovalsScreen}
          options={{
            tabBarLabel: 'Approvals',
          }}
        />
      )}

      {(isStaff || isHOD || isAdmin) && (
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarLabel: 'History',
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
