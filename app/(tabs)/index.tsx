import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { gatePassService } from '@/utils/gatePassService';
import { notificationService } from '@/services/notificationService';
import { PlusCircle, MapPin, Clock, Users, UserPlus, FileText, BarChart3, Eye } from 'lucide-react-native';

// Admin Dashboard Component
function AdminDashboard({ user }: { user: any }) {
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
        const pending = data.filter((p: any) => p.status === 'PENDING').length;
        const approved = data.filter((p: any) => p.status === 'APPROVED').length;
        const checkedOut = data.filter((p: any) => p.status === 'CHECKED_OUT').length;
        
        setStats({ total, pending, approved, checkedOut });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
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
    <ScrollView style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      {/* Big Admin Banner */}
      <View style={styles.adminBanner}>
        <Text style={styles.adminBannerTitle}>🎯 ADMINISTRATOR CONTROL PANEL</Text>
        <Text style={styles.adminBannerSubtitle}>Full System Access & Management</Text>
      </View>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#007AFF', paddingTop: 20 }]}>
        <Text style={[styles.welcomeText, { color: '#fff' }]}>🎯 ADMIN DASHBOARD</Text>
        <Text style={[styles.roleText, { color: '#E6F3FF' }]}>Welcome back, {user.name}</Text>
        <Text style={[styles.roleText, { color: '#E6F3FF', fontSize: 12 }]}>Role: {user.role} | Payroll: {user.payroll_no}</Text>
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
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/history')}>
            <Eye size={24} color="#007AFF" />
            <Text style={styles.actionText}>View All Passes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/admin')}>
            <UserPlus size={24} color="#34C759" />
            <Text style={styles.actionText}>Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Reports', 'Reports feature coming soon!')}>
            <FileText size={24} color="#FF9500" />
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Analytics', 'Analytics feature coming soon!')}>
            <BarChart3 size={24} color="#5856D6" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🎯 Admin Control Panel</Text>
        <Text style={styles.infoText}>
          Manage users, monitor gate passes, and oversee organizational access control.
        </Text>
        <Text style={styles.infoText}>• View all department activities</Text>
        <Text style={styles.infoText}>• Create and manage user accounts</Text>
        <Text style={styles.infoText}>• Generate reports and analytics</Text>
      </View>
    </ScrollView>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();

  console.log('=== HOME SCREEN DEBUG ===');
  console.log('User object:', JSON.stringify(user, null, 2));
  console.log('User role:', user?.role);
  console.log('Role type:', typeof user?.role);
  console.log('Is admin check:', user?.role === 'ADMIN');
  console.log('========================');

  // If user is admin, show the admin dashboard instead of home
  if (user?.role === 'ADMIN') {
    console.log('ADMIN DETECTED - Rendering AdminDashboard');
    return <AdminDashboard user={user} />;
  }

  console.log('NOT ADMIN - Rendering regular home screen');

  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [estimatedReturn, setEstimatedReturn] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !destination || !estimatedReturn) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const returnDate = new Date(estimatedReturn);
    if (isNaN(returnDate.getTime())) {
      Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD HH:MM');
      return;
    }

    setLoading(true);
    const { error } = await gatePassService.createRequest({
      userId: user!.id,
      reason,
      destination,
      expectedReturn: returnDate,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Gate pass request submitted');
      setReason('');
      setDestination('');
      setEstimatedReturn('');
      setShowForm(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.welcomeText} numberOfLines={1}>
          Welcome, {user?.name || 'User'}
        </Text>
        <Text style={styles.roleText}>
          {user?.role} • Payroll: {user?.payroll_no}
        </Text>
      </View>

      {user?.role === 'STAFF' && (
        <>
          {!showForm ? (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => setShowForm(true)}
            >
              <PlusCircle size={24} color="#fff" />
              <Text style={styles.requestButtonText}>Request Gate Pass</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.form}>
              <Text style={styles.formTitle}>New Gate Pass Request</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reason</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Bank visit, Personal emergency"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Destination</Text>
                <View style={styles.inputWithIcon}>
                  <MapPin size={20} color="#666" style={styles.icon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Where are you going?"
                    value={destination}
                    onChangeText={setDestination}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expected Return Time</Text>
                <View style={styles.inputWithIcon}>
                  <Clock size={20} color="#666" style={styles.icon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="YYYY-MM-DD HH:MM"
                    value={estimatedReturn}
                    onChangeText={setEstimatedReturn}
                  />
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>��� How it works</Text>
            <Text style={styles.infoText}>1. Submit gate pass request</Text>
            <Text style={styles.infoText}>2. Wait for HOD approval</Text>
            <Text style={styles.infoText}>3. Check out at security gate</Text>
            <Text style={styles.infoText}>4. Check in when you return</Text>
          </View>
        </>
      )}

      {user?.role !== 'STAFF' && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>��� Welcome!</Text>
          <Text style={styles.infoText}>
            You are logged in as {user?.role}
          </Text>
          <Text style={[styles.infoText, { marginTop: 12 }]}>
            {user?.role === 'HOD' && 'Go to Approvals tab to review pending gate pass requests.'}
            {user?.role === 'CTO' && 'Go to Approvals tab to review pending gate pass requests.'}
            {user?.role === 'SECURITY' && 'Check the History tab to manage gate pass check-ins and check-outs.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  // Admin Dashboard Styles
  adminBanner: {
    backgroundColor: '#dc3545',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#c82333',
  },
  adminBannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  adminBannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 20,
    marginTop: 24,
    padding: 18,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  form: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 8,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  // Admin Dashboard Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
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
});
