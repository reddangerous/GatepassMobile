import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { gatePassService } from '@/utils/gatePassService';
import { GatePass } from '@/lib/supabase';
import { Search, LogOut, LogIn, User, MapPin } from 'lucide-react-native';

export default function SecurityScreen() {
  const [payrollNo, setPayrollNo] = useState('');
  const [gatePass, setGatePass] = useState<(GatePass & { user?: any }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSearch = async () => {
    if (!payrollNo.trim()) {
      Alert.alert('Error', 'Please enter a payroll number');
      return;
    }

    setLoading(true);
    const { data, error } = await gatePassService.getPassByPayroll(payrollNo.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      setGatePass(null);
    } else if (!data) {
      Alert.alert('Not Found', 'No approved gate pass found for this payroll number');
      setGatePass(null);
    } else {
      setGatePass(data);
    }
  };

  const handleCheckOut = async () => {
    if (!gatePass) return;

    Alert.alert(
      'Check Out',
      `Confirm check out for ${gatePass.user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async () => {
            setProcessing(true);
            const { error } = await gatePassService.checkOut(gatePass.id);
            setProcessing(false);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Staff checked out successfully');
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
      `Confirm check in for ${gatePass.user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: async () => {
            setProcessing(true);
            const { error } = await gatePassService.checkIn(gatePass.id);
            setProcessing(false);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Staff checked in successfully');
              setGatePass(null);
              setPayrollNo('');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Gate Check</Text>
        <Text style={styles.subtitle}>Enter payroll number to search</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Payroll Number"
            value={payrollNo}
            onChangeText={setPayrollNo}
            autoCapitalize="none"
            keyboardType="default"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            <Search size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {gatePass && (
        <View style={styles.resultSection}>
          <View style={styles.passCard}>
            <View style={styles.passHeader}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{gatePass.status}</Text>
              </View>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.userRow}>
                <User size={20} color="#007AFF" />
                <Text style={styles.userName}>{gatePass.user?.name}</Text>
              </View>
              <Text style={styles.payrollText}>
                Payroll: {gatePass.user?.payroll_no}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.passDetails}>
              <View style={styles.detailRow}>
                <MapPin size={18} color="#666" />
                <Text style={styles.detailText}>
                  Destination: {gatePass.destination}
                </Text>
              </View>

              <Text style={styles.reasonText}>Reason: {gatePass.reason}</Text>

              <Text style={styles.timeText}>
                Expected Return: {formatDate(gatePass.expected_return)}
              </Text>

              {gatePass.out_time && (
                <Text style={styles.timeText}>
                  Checked Out: {formatDate(gatePass.out_time)}
                </Text>
              )}
            </View>

            <View style={styles.actions}>
              {gatePass.status === 'APPROVED' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.checkOutButton]}
                  onPress={handleCheckOut}
                  disabled={processing}
                >
                  <LogOut size={24} color="#fff" />
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
                  <LogIn size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {processing ? 'Processing...' : 'Check In'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {!gatePass && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Search for a payroll number to view gate pass
          </Text>
        </View>
      )}
    </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    padding: 24,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchButton: {
    width: 56,
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultSection: {
    padding: 24,
    paddingTop: 0,
  },
  passCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  passHeader: {
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userInfo: {
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  payrollText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  passDetails: {
    gap: 8,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#1a1a1a',
    flex: 1,
  },
  reasonText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
  },
  checkOutButton: {
    backgroundColor: '#007AFF',
  },
  checkInButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
