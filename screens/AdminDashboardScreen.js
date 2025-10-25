import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { gatePassService } from '../utils/gatePassService';
import { Users, UserPlus, FileText, BarChart3, Eye } from 'lucide-react-native';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    checkedOut: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data } = await gatePassService.getTodaysPasses();
      if (data) {
        const total = data.length;
        const pending = data.filter(p => p.status === 'PENDING').length;
        const approved = data.filter(p => p.status === 'APPROVED').length;
        const checkedOut = data.filter(p => p.status === 'CHECKED_OUT').length;
        
        setStats({ total, pending, approved, checkedOut });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleViewAllPasses = () => {
    if (navigation) {
      navigation.navigate('History');
    } else {
      Alert.alert('Navigation', 'Redirecting to History...');
    }
  };

  const handleAddUser = () => {
    if (navigation) {
      navigation.navigate('UserManagement');
    } else {
      Alert.alert('Navigation', 'Redirecting to User Management...');
    }
  };

  const handleReports = () => {
    Alert.alert('Reports', 'Reports feature coming soon!');
  };

  const handleAnalytics = () => {
    Alert.alert('Analytics', 'Analytics feature coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.name}</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#007AFF' }]}>
            <Users size={24} color="#fff" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Passes</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FF9500' }]}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#34C759' }]}>
            <Text style={styles.statValue}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#5856D6' }]}>
            <Text style={styles.statValue}>{stats.checkedOut}</Text>
            <Text style={styles.statLabel}>Out Now</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handleViewAllPasses}>
            <Eye size={24} color="#007AFF" />
            <Text style={styles.actionText}>View All Passes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleAddUser}>
            <UserPlus size={24} color="#34C759" />
            <Text style={styles.actionText}>Add User</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleReports}>
            <FileText size={24} color="#FF9500" />
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleAnalytics}>
            <BarChart3 size={24} color="#5856D6" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Info */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎯 Admin Control Panel</Text>
          <Text style={styles.infoText}>
            Manage users, monitor gate passes, and oversee organizational access control.
          </Text>
          <Text style={styles.infoText}>• View all department activities</Text>
          <Text style={styles.infoText}>• Create and manage user accounts</Text>
          <Text style={styles.infoText}>• Generate reports and analytics</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});
