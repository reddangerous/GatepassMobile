import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { gatePassService } from '@/utils/gatePassService';
import { notificationService } from '@/services/notificationService';
import { getKenyaTime, addMinutesToKenyaTime, formatKenyaTime } from '@/utils/timezone';
import apiService from '@/lib/api';
import AnalogClock from '@/components/AnalogClock';
import PrintGatePass from '@/components/PrintGatePass';
import { PlusCircle, MapPin, Clock, ChevronDown, History, User, Shield, FileText, Printer, CheckCircle } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30); // Duration in minutes (default 30 min)
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedGatePassForPrint, setSelectedGatePassForPrint] = useState(null);
  const [activeGatePass, setActiveGatePass] = useState(null);
  const [loadingActivePass, setLoadingActivePass] = useState(false);

  // Load active gate pass on mount
  useEffect(() => {
    if (user?.id && (user?.role === 'STAFF' || user?.role === 'HOD')) {
      loadActiveGatePass();
    }
  }, [user]);

  const loadActiveGatePass = async () => {
    if (!user?.id) return;
    
    setLoadingActivePass(true);
    try {
      const { data, error } = await gatePassService.getCurrentActivePass(user.id);
      if (!error && data) {
        setActiveGatePass(data);
      } else {
        setActiveGatePass(null);
      }
    } catch (error) {
      console.error('Error loading active gate pass:', error);
      setActiveGatePass(null);
    } finally {
      setLoadingActivePass(false);
    }
  };

  const handlePrintActivePass = () => {
    if (activeGatePass) {
      // Only allow printing approved or checked out passes
      if (activeGatePass.status === 'APPROVED' || activeGatePass.status === 'CHECKED_OUT' || activeGatePass.status === 'RETURNED') {
        setSelectedGatePassForPrint(activeGatePass);
        setShowPrintModal(true);
      } else {
        Alert.alert(
          'Cannot Print',
          'Only approved gate passes can be printed. Please wait for approval.'
        );
      }
    }
  };

  // Generate duration options in 5-minute intervals up to 1 hour (60 minutes)
  // For durations longer than 1 hour, employees should apply for time leave
  const durationOptions = [];
  for (let i = 5; i <= 60; i += 5) {
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

  const getSelectedDurationLabel = () => {
    const option = durationOptions.find(opt => opt.value === selectedDuration);
    return option ? option.label : '1h';
  };

  const calculateReturnTime = () => {
    // Simple: current time + duration in minutes
    const now = new Date();
    const returnTime = new Date(now.getTime() + (selectedDuration * 60 * 1000));
    return returnTime;
  };

  const handleSubmit = async () => {
    if (!reason.trim() || !destination.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate that reason is not "Personal" or similar variations
    const reasonLower = reason.trim().toLowerCase();
    if (reasonLower === 'personal' || reasonLower === 'personal reason' || reasonLower === 'personal reasons') {
      Alert.alert(
        'Invalid Reason',
        'Please provide a specific reason for your gate pass request. "Personal" is not acceptable as per company policy.'
      );
      return;
    }

    setLoading(true);
    
    try {
      const now = new Date();
      const estimatedReturn = calculateReturnTime();
      
      const gatePassData = {
        user_id: user.id,
        reason: reason.trim(),
        destination: destination.trim(),
        expected_return: estimatedReturn.toISOString(),
      };

      console.log('Submitting gate pass:', gatePassData);

      // Use the simple post method directly instead of createRequest
      const response = await apiService.post('/gate-passes', gatePassData);
      
      console.log('Gate pass created successfully:', response);
      
      // Schedule notifications if successful - use the response data which contains the gate pass details
      try {
        await notificationService.scheduleGatePassTimeAlerts(
          response.id, 
          response.expected_return, 
          response.destination
        );
        
        // Send immediate confirmation notification
        await notificationService.sendLocalNotification(
          '✅ Gate Pass Submitted',
          `Your gate pass request to ${destination.trim()} has been submitted for approval.`
        );
      } catch (notifError) {
        console.log('Notification scheduling failed:', notifError);
      }
      
      Alert.alert(
        'Success', 
        'Gate pass request submitted successfully and is pending approval!',
        [
          {
            text: 'OK',
            onPress: () => {
              setReason('');
              setDestination('');
              setSelectedDuration(30);
              setShowForm(false);
              // Reload active pass in case this is an update
              loadActiveGatePass();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating gate pass:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to create gate pass. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('@/assets/images/chandaria.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.welcomeText} numberOfLines={1}>
              Welcome, {user?.name || 'User'}
            </Text>
            <Text style={styles.roleText}>
              {user?.role} • Payroll: {user?.payroll_no}
            </Text>
          </View>
        </View>
      </View>

      {/* Clock and Quick Access Cards for non-admin users */}
      {user?.role !== 'ADMIN' && (
        <>
          {/* Analog Clock */}
          <View style={styles.clockSection}>
            <AnalogClock size={150} showDigital={true} />
          </View>

          {/* Quick Access Cards */}
          <View style={styles.quickAccessSection}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.quickAccessGrid}>
              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate('History')}
              >
                <History size={24} color="#007AFF" />
                <Text style={styles.quickAccessText}>My History</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate('Profile')}
              >
                <User size={24} color="#34C759" />
                <Text style={styles.quickAccessText}>Profile</Text>
              </TouchableOpacity>
              
              {user?.role === 'SECURITY' && (
                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => navigation.navigate('SecurityCheck')}
                >
                  <Shield size={24} color="#FF9500" />
                  <Text style={styles.quickAccessText}>Security</Text>
                </TouchableOpacity>
              )}
              
              {(user?.role === 'HOD' || user?.role === 'CTO') && (
                <TouchableOpacity 
                  style={styles.quickAccessCard}
                  onPress={() => navigation.navigate('Approvals')}
                >
                  <FileText size={24} color="#5856D6" />
                  <Text style={styles.quickAccessText}>Approvals</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      {(user?.role === 'STAFF' || user?.role === 'HOD') && (
        <>
          {/* Active Gate Pass Card */}
          {activeGatePass && !showForm && (
            <View style={styles.activePassCard}>
              <View style={styles.activePassHeader}>
                <View style={styles.activePassTitleRow}>
                  <CheckCircle size={20} color="#34C759" />
                  <Text style={styles.activePassTitle}>Active Gate Pass</Text>
                </View>
                <TouchableOpacity
                  style={styles.printIconButton}
                  onPress={handlePrintActivePass}
                >
                  <Printer size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.activePassContent}>
                <Text style={styles.activePassLabel}>Destination</Text>
                <Text style={styles.activePassValue}>{activeGatePass.destination}</Text>
                <Text style={[styles.activePassLabel, { marginTop: 8 }]}>Status</Text>
                <View style={styles.activePassStatusBadge}>
                  <Text style={styles.activePassStatusText}>
                    {activeGatePass.status}
                  </Text>
                </View>
              </View>
            </View>
          )}

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
                  placeholder="e.g., Bank appointment, Doctor visit, Client meeting"
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
                <Text style={styles.label}>Duration</Text>
                <TouchableOpacity
                  style={styles.inputWithIcon}
                  onPress={() => setShowDurationPicker(true)}
                >
                  <Clock size={20} color="#666" style={styles.icon} />
                  <Text style={styles.pickerText}>{getSelectedDurationLabel()}</Text>
                  <ChevronDown size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Expected return: {calculateReturnTime().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
                <Text style={styles.policyText}>
                  ⓘ Maximum duration: 1 hour. For longer absences, please apply for time leave.
                </Text>
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

          {/* Duration Picker Modal */}
          <Modal
            visible={showDurationPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDurationPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Duration</Text>
                  <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                    <Text style={styles.modalCloseButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={durationOptions}
                  keyExtractor={(item) => item.value.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.durationOption,
                        selectedDuration === item.value && styles.selectedDurationOption
                      ]}
                      onPress={() => {
                        setSelectedDuration(item.value);
                        setShowDurationPicker(false);
                      }}
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
                />
              </View>
            </View>
          </Modal>


        </>
      )}

      {(user?.role === 'SECURITY' || user?.role === 'ADMIN') && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Welcome!</Text>
          <Text style={styles.infoText}>
            You are logged in as {user?.role}
          </Text>
          <Text style={[styles.infoText, { marginTop: 12 }]}>
            {user?.role === 'SECURITY' && 'Use the History tab to check users in and out.'}
            {user?.role === 'ADMIN' && 'You have full access to all features.'}
          </Text>
        </View>
      )}

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

      {/* Print Modal for active gate pass */}
      {selectedGatePassForPrint && (
        <PrintGatePass
          gatePass={selectedGatePassForPrint}
          visible={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedGatePassForPrint(null);
          }}
        />
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
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
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
  // Clock and Quick Access Styles
  clockSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAccessSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  // Footer Styles
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
  pickerText: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
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
    maxHeight: '60%',
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
    color: '#007AFF',
    fontWeight: '600',
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
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  policyText: {
    fontSize: 11,
    color: '#FF9500',
    marginTop: 6,
    fontWeight: '500',
    backgroundColor: '#fff8e6',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  activePassCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  activePassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activePassTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activePassTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  printIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  activePassContent: {
    gap: 4,
  },
  activePassLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activePassValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 8,
  },
  activePassStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePassStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});
