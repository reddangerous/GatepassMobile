import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { gatePassService } from '@/utils/gatePassService';
import { GatePass } from '@/lib/types';
import { CheckCircle, XCircle, MapPin, Clock, User } from 'lucide-react-native';

export default function ApprovalsScreen() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingPasses = async () => {
    console.log('Loading pending passes for user:', user?.email, 'role:', user?.role);
    
    if (!user || user.role !== 'HOD') {
      console.log('User is not HOD, setting empty passes');
      setPasses([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await gatePassService.getPendingApprovals(user.id);
      console.log('API Response - data:', data, 'error:', error);
      
      if (!error && data) {
        if (Array.isArray(data)) {
          console.log('Setting passes array with', data.length, 'items');
          setPasses(data);
        } else {
          console.log('Data is not array, setting empty array');
          setPasses([]);
        }
      } else {
        console.error('Error loading pending passes:', error);
        setPasses([]); // Set empty array if error or no data
      }
    } catch (err) {
      console.error('Exception loading pending passes:', err);
      setPasses([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadPendingPasses();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingPasses();
  };

  const handleApprove = async (passId: string) => {
    Alert.alert(
      'Approve Request',
      'Are you sure you want to approve this gate pass?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessingId(passId);
            const { error } = await gatePassService.approvePass(passId, user!.id);
            setProcessingId(null);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Gate pass approved');
              loadPendingPasses();
            }
          },
        },
      ]
    );
  };

  const handleReject = async (passId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this gate pass?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(passId);
            const { error } = await gatePassService.rejectPass(passId, user!.id);
            setProcessingId(null);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Gate pass rejected');
              loadPendingPasses();
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

  // Ensure passes is always an array
  const safePasses = Array.isArray(passes) ? passes : [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Pending Approvals</Text>
        <Text style={styles.subtitle}>{safePasses.length} pending requests</Text>
      </View>

      {safePasses.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle size={48} color="#34C759" />
          <Text style={styles.emptyText}>All caught up!</Text>
          <Text style={styles.emptySubtext}>
            No pending gate pass requests
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {safePasses.map((pass) => (
            <View key={pass.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  <User size={20} color="#007AFF" />
                  <Text style={styles.userName}>{pass.user?.name}</Text>
                </View>
                <Text style={styles.payrollText}>
                  {pass.user?.payroll_no}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.row}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.detailText}>{pass.destination}</Text>
                </View>

                <Text style={styles.reasonText}>{pass.reason}</Text>

                <View style={styles.row}>
                  <Clock size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Expected return: {formatDate(pass.expected_return)}
                  </Text>
                </View>

                <Text style={styles.requestTimeText}>
                  Requested: {formatDate(pass.request_time)}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.rejectButton,
                    processingId === pass.id && styles.buttonDisabled,
                  ]}
                  onPress={() => handleReject(pass.id)}
                  disabled={processingId === pass.id}
                >
                  <XCircle size={20} color="#FF3B30" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.approveButton,
                    processingId === pass.id && styles.buttonDisabled,
                  ]}
                  onPress={() => handleApprove(pass.id)}
                  disabled={processingId === pass.id}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.approveButtonText}>
                    {processingId === pass.id ? 'Processing...' : 'Approve'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  payrollText: {
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    gap: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  reasonText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
    paddingVertical: 4,
  },
  requestTimeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
