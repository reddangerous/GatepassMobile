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
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { gatePassService } from '@/utils/gatePassService';
import { formatKenyaTime, getTimeDifferenceInMinutes, addMinutesToKenyaTime } from '@/utils/timezone';
import { notificationService } from '@/services/notificationService';
import { CheckCircle, XCircle, MapPin, Clock, User, Building, Edit3 } from 'lucide-react-native';

export default function ApprovalsScreen() {
  const { user, isApprover } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);

  // Generate duration options in 5-minute intervals up to 2 hours (120 minutes)
  const durationOptions = [];
  for (let i = 5; i <= 120; i += 5) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    let label = '';
    if (hours > 0) {
      label += `${hours}h`;
      if (minutes > 0) {
        label += ` ${minutes}m`;
      }
    } else {
      label = `${minutes}m`;
    }
    durationOptions.push({ value: i, label });
  }

  const loadPendingPasses = async () => {
    if (!user || !isApprover()) {
      setPasses([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await gatePassService.getPendingApprovalsPaginated(user.id, { limit: 100 });
      if (!error && data && data.data && Array.isArray(data.data)) {
        setPasses(data.data);
      } else {
        console.error('Error loading pending passes:', error);
        setPasses([]);
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
// IN('MACCOFFEE', 'KENTASTE', 'HENKEL LAUNDRY', 'HENKEL BEAUTY')

  const getApprovalTitle = () => {
    switch (user?.role) {
      case 'HOD':
        return 'Department Approvals';
      case 'CTO':
        return 'CTO Approvals';
      case 'ADMIN':
        return 'Admin Approvals';
      default:
        return 'Pending Approvals';
    }
  };

  const getApprovalSubtitle = () => {
    switch (user?.role) {
      case 'HOD':
        return 'Staff gate pass requests from your department';
      case 'CTO':
        return 'HOD and Security gate pass requests';
      case 'ADMIN':
        return 'All pending gate pass requests';
      default:
        return 'Gate pass requests requiring approval';
    }
  };

  const handleApprove = async (passId, adjustedDuration = null) => {
    const titleMessage = adjustedDuration 
      ? 'Approve with Adjusted Duration'
      : 'Approve Request';
    const confirmMessage = adjustedDuration 
      ? `Approve this gate pass with duration adjusted to ${getDurationLabel(adjustedDuration)}?`
      : 'Are you sure you want to approve this gate pass?';

    Alert.alert(
      titleMessage,
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            if (!user || !user.id) return;
            
            setProcessingId(passId);
            
            // Call the service with optional adjusted duration
            const approvalData = { hod_id: user.id };
            if (adjustedDuration) {
              approvalData.adjusted_duration_minutes = adjustedDuration;
            }

            const { error } = await gatePassService.approvePass(passId, user.id, approvalData);
            setProcessingId(null);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              const successMessage = adjustedDuration 
                ? `Gate pass approved with adjusted duration: ${getDurationLabel(adjustedDuration)}`
                : 'Gate pass approved';
              
              // Send approval notification
              try {
                const notificationTitle = adjustedDuration 
                  ? '✅ Gate Pass Approved (Adjusted)'
                  : '✅ Gate Pass Approved';
                const notificationBody = adjustedDuration
                  ? `Your gate pass has been approved with adjusted duration: ${getDurationLabel(adjustedDuration)}`
                  : 'Your gate pass has been approved. You can now proceed to security for checkout.';
                
                await notificationService.sendLocalNotification(
                  notificationTitle,
                  notificationBody,
                  { type: 'approval', gatePassId: passId }
                );
              } catch (notifError) {
                console.log('Approval notification failed:', notifError);
              }
              
              Alert.alert('Success', successMessage);
              loadPendingPasses();
            }
          },
        },
      ]
    );
  };

  const handleApproveWithAdjustment = (pass) => {
    setSelectedPass(pass);
    // Calculate original requested duration
    const originalDuration = getTimeDifferenceInMinutes(pass.request_time, pass.expected_return);
    setSelectedDuration(Math.max(5, Math.min(120, originalDuration))); // Clamp between 5 and 120 minutes
    setShowDurationModal(true);
  };

  const getDurationLabel = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const confirmAdjustedApproval = () => {
    setShowDurationModal(false);
    if (selectedPass) {
      handleApprove(selectedPass.id, selectedDuration);
      setSelectedPass(null);
    }
  };

  const handleReject = async (passId) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this gate pass?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            if (!user || !user.id) return;
            
            setProcessingId(passId);
            const { error } = await gatePassService.rejectPass(passId, user.id);
            setProcessingId(null);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              // Send rejection notification
              try {
                await notificationService.sendLocalNotification(
                  '❌ Gate Pass Rejected',
                  'Your gate pass request has been rejected. Please contact your supervisor for more information.',
                  { type: 'rejection', gatePassId: passId }
                );
              } catch (notifError) {
                console.log('Rejection notification failed:', notifError);
              }
              
              Alert.alert('Success', 'Gate pass rejected');
              loadPendingPasses();
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    return formatKenyaTime(dateString, { format: 'short' });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'HOD':
        return '#FF9500';
      case 'STAFF':
        return '#007AFF';
      case 'SECURITY':
        return '#5856D6';
      default:
        return '#666';
    }
  };

  if (!isApprover()) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noAccessText}>
          You don't have permission to view approvals
        </Text>
      </View>
    );
  }

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
        <View style={styles.headerContent}>
          <Image 
            source={require('@/assets/images/chandaria.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>{getApprovalTitle()}</Text>
            <Text style={styles.subtitle}>{getApprovalSubtitle()}</Text>
            <Text style={styles.countText}>{safePasses.length} pending requests</Text>
          </View>
        </View>
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
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{pass.user?.name}</Text>
                    <View style={styles.userMeta}>
                      <Text style={styles.payrollText}>
                        {pass.user?.payroll_no}
                      </Text>
                      {pass.user?.role && (
                        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(pass.user.role) }]}>
                          <Text style={styles.roleText}>{pass.user.role}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {pass.user?.department_name && (
                  <View style={styles.departmentInfo}>
                    <Building size={14} color="#666" />
                    <Text style={styles.departmentText}>
                      {pass.user.department_name}
                    </Text>
                  </View>
                )}
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

                {/* HOD can adjust duration */}
                {user?.role === 'HOD' && (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.adjustButton,
                      processingId === pass.id && styles.buttonDisabled,
                    ]}
                    onPress={() => handleApproveWithAdjustment(pass)}
                    disabled={processingId === pass.id}
                  >
                    <Edit3 size={20} color="#FF9500" />
                    <Text style={styles.adjustButtonText}>Adjust</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.approveButton,
                    processingId === pass.id && styles.buttonDisabled,
                    user?.role === 'HOD' && { flex: 0.6 }, // Make approve button smaller when adjust button is present
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

      {/* Duration Adjustment Modal */}
      <Modal
        visible={showDurationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Duration</Text>
              <TouchableOpacity onPress={() => setShowDurationModal(false)}>
                <Text style={styles.modalCloseButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            {selectedPass && (
              <View style={styles.passInfo}>
                <Text style={styles.passInfoText}>
                  <Text style={styles.passInfoLabel}>Staff: </Text>
                  {selectedPass.user?.name}
                </Text>
                <Text style={styles.passInfoText}>
                  <Text style={styles.passInfoLabel}>Original Duration: </Text>
                  {getDurationLabel(getTimeDifferenceInMinutes(selectedPass.request_time, selectedPass.expected_return))}
                </Text>
                <Text style={styles.passInfoText}>
                  <Text style={styles.passInfoLabel}>Destination: </Text>
                  {selectedPass.destination}
                </Text>
              </View>
            )}

            <FlatList
              data={durationOptions}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.durationOption,
                    selectedDuration === item.value && styles.selectedDurationOption
                  ]}
                  onPress={() => setSelectedDuration(item.value)}
                >
                  <Text style={[
                    styles.durationOptionText,
                    selectedDuration === item.value && styles.selectedDurationOptionText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.durationList}
            />

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmAdjustedApproval}
            >
              <Text style={styles.confirmButtonText}>
                Approve with {getDurationLabel(selectedDuration)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Copyright Footer */}
      <View style={styles.footerSection}>
        <View style={styles.copyrightContainer}>
          <Image 
            source={require('../assets/images/chandaria.png')} 
            style={styles.footerLogo}
          />
          <Text style={styles.copyrightText}>
            © 2025 Chandaria Industries Limited
          </Text>
          <Text style={styles.copyrightSubText}>
            Developed by MIS Development Team
          </Text>
          <Text style={styles.versionText}>
            Gate Pass System v1.0
          </Text>
        </View>
      </View>
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
  noAccessText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
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
    marginBottom: 4,
  },
  countText: {
    fontSize: 12,
    color: '#999',
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
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payrollText: {
    fontSize: 12,
    color: '#999',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  departmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  departmentText: {
    fontSize: 12,
    color: '#666',
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
  adjustButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF9500',
    flex: 0.8,
  },
  adjustButtonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  passInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  passInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  passInfoLabel: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  durationList: {
    maxHeight: 250,
  },
  durationOption: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDurationOption: {
    backgroundColor: '#f0f8ff',
  },
  durationOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectedDurationOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    backgroundColor: '#f8f9fa',
    marginTop: 40,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  copyrightContainer: {
    alignItems: 'center',
  },
  footerLogo: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  copyrightSubText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});
