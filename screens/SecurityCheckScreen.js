import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { gatePassService } from '@/utils/gatePassService';
import { Search, LogOut, LogIn, Clock, MapPin, User as UserIcon } from 'lucide-react-native';

export default function SecurityCheckScreen() {
  const { user } = useAuth();
  const [payrollNo, setPayrollNo] = useState('');
  const [gatePass, setGatePass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSearch = async () => {
    if (!payrollNo.trim()) {
      Alert.alert('Error', 'Please enter a payroll number');
      return;
    }

    setLoading(true);
    const { data, error } = await gatePassService.getPassByPayroll(payrollNo);
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to fetch gate pass');
      setGatePass(null);
    } else if (!data) {
      Alert.alert('No Active Pass', 'No active gate pass found for this payroll number');
      setGatePass(null);
    } else {
      setGatePass(data);
    }
  };

  const handleCheckOut = async () => {
    if (!gatePass) return;

    Alert.alert(
      'Check Out',
      `Check out ${gatePass.user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async () => {
            setProcessing(true);
            const { error } = await gatePassService.checkOut(gatePass.id);
            setProcessing(false);

            if (error) {
              Alert.alert('Error', 'Failed to check out');
            } else {
              Alert.alert('Success', 'User checked out successfully');
              setGatePass(null);
              setPayrollNo('');
            }
          },
        },
      ]
    );
  };

  const handleCheckIn = async () => {
    if (!gatePass) return;

    Alert.alert(
      'Check In',
      `Check in ${gatePass.user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: async () => {
            setProcessing(true);
            const { error } = await gatePassService.checkIn(gatePass.id);
            setProcessing(false);

            if (error) {
              Alert.alert('Error', 'Failed to check in');
            } else {
              Alert.alert('Success', 'User checked in successfully');
              setGatePass(null);
              setPayrollNo('');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#34C759';
      case 'CHECKED_OUT':
        return '#FF9500';
      case 'RETURNED':
        return '#5856D6';
      default:
        return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Gate Check</Text>
        <Text style={styles.subtitle}>Scan or enter payroll number</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Payroll Number (e.g., 4232)"
            value={payrollNo}
            onChangeText={setPayrollNo}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Search size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {gatePass && (
        <View style={styles.resultSection}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(gatePass.status) },
                  ]}
                />
                <Text style={styles.statusText}>{gatePass.status.replace('_', ' ')}</Text>
              </View>
            </View>

            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                <UserIcon size={48} color="#007AFF" />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{gatePass.user?.name}</Text>
                  <Text style={styles.payrollText}>Payroll: {payrollNo}</Text>
                  <Text style={styles.departmentText}>
                    Dept: {gatePass.user?.department_name || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <MapPin size={18} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Destination</Text>
                  <Text style={styles.detailValue}>{gatePass.destination}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reason:</Text>
                <Text style={styles.detailValue}>{gatePass.reason}</Text>
              </View>

              <View style={styles.detailRow}>
                <Clock size={18} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Expected Return</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(gatePass.expected_return)}
                  </Text>
                </View>
              </View>

              {gatePass.out_time && (
                <View style={styles.detailRow}>
                  <LogOut size={18} color="#FF9500" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Checked Out</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(gatePass.out_time)}
                    </Text>
                  </View>
                </View>
              )}

              {gatePass.in_time && (
                <View style={styles.detailRow}>
                  <LogIn size={18} color="#34C759" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Checked In</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(gatePass.in_time)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              {gatePass.status === 'APPROVED' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.checkOutButton]}
                  onPress={handleCheckOut}
                  disabled={processing}
                >
                  <LogOut size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {processing ? 'Processing...' : 'Check Out'}
                  </Text>
                </TouchableOpacity>
              )}

              {gatePass.status === 'CHECKED_OUT' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.checkInButton]}
                  onPress={handleCheckIn}
                  disabled={processing}
                >
                  <LogIn size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {processing ? 'Processing...' : 'Check In'}
                  </Text>
                </TouchableOpacity>
              )}

              {gatePass.status === 'RETURNED' && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓ Trip Completed</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {!gatePass && !loading && (
        <View style={styles.emptyState}>
          <Search size={64} color="#ccc" />
          <Text style={styles.emptyText}>Enter a payroll number to search</Text>
          <Text style={styles.emptySubtext}>
            You can check users in or out based on their gate pass status
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
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    padding: 20,
  },
  searchBox: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  resultSection: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textTransform: 'capitalize',
  },
  userSection: {
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  payrollText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  departmentText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  detailsSection: {
    gap: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  actions: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkOutButton: {
    backgroundColor: '#FF9500',
  },
  checkInButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
