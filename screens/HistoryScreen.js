import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { gatePassService } from '@/utils/gatePassService';
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, Filter, ChevronDown, Users } from 'lucide-react-native';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // HOD filtering states
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const isHOD = user?.role === 'HOD';

  const loadPasses = async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let data, error;
      
      if (isHOD) {
        // Load department passes for HOD
        const filters = {};
        if (selectedStatus !== 'ALL') filters.status = selectedStatus;
        if (selectedEmployee !== 'ALL') filters.employee_id = selectedEmployee;
        
        ({ data, error } = await gatePassService.getDepartmentPasses(user.id, filters));
      } else {
        // Load personal passes for staff
        ({ data, error } = await gatePassService.getMyPasses(user.id));
      }
      
      if (!error && data) {
        // Filter out any invalid passes and ensure required fields exist
        const validPasses = Array.isArray(data) ? data.filter(pass => 
          pass && 
          typeof pass === 'object' && 
          pass.id != null
        ) : [];
        setPasses(validPasses);
      } else {
        console.error('Error loading passes:', error);
        setPasses([]);
      }
    } catch (error) {
      console.error('Exception loading passes:', error);
      setPasses([]);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  const loadEmployees = async () => {
    if (!isHOD || !user) return;
    
    try {
      const { data, error } = await gatePassService.getDepartmentEmployees(user.id);
      if (!error && data) {
        setEmployees(Array.isArray(data) ? data : []);
      } else {
        console.error('Error loading employees:', error);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Exception loading employees:', error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadPasses();
    if (isHOD) {
      loadEmployees();
    }
  }, [user, selectedEmployee, selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPasses();
  };

  const getStatusColor = (status) => {
    if (!status) return '#999';
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return '#34C759';
      case 'PENDING':
        return '#FF9500';
      case 'REJECTED':
        return '#FF3B30';
      case 'CHECKED_OUT':
        return '#007AFF';
      case 'RETURNED':
        return '#5856D6';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle size={20} color="#34C759" />;
      case 'PENDING':
        return <Clock size={20} color="#FF9500" />;
      case 'REJECTED':
        return <XCircle size={20} color="#FF3B30" />;
      case 'CHECKED_OUT':
        return <AlertCircle size={20} color="#007AFF" />;
      case 'RETURNED':
        return <CheckCircle size={20} color="#5856D6" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Ensure passes is always an array
  const safePasses = Array.isArray(passes) ? passes : [];

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
            <Text style={styles.title}>
              {isHOD ? 'Department History' : 'Gate Pass History'}
            </Text>
            <Text style={styles.subtitle}>
              {passes.length} total passes
              {isHOD && selectedEmployee !== 'ALL' && (
                <Text style={styles.filterIndicator}> • Filtered</Text>
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Section for HODs */}
      {isHOD && (
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowEmployeeModal(true)}
            >
              <Users size={16} color="#007AFF" />
              <Text style={styles.filterButtonText}>
                {selectedEmployee === 'ALL' ? 'All Employees' : 
                 employees.find(emp => emp.id === selectedEmployee)?.name || 'Select Employee'}
              </Text>
              <ChevronDown size={16} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowStatusModal(true)}
            >
              <Filter size={16} color="#007AFF" />
              <Text style={styles.filterButtonText}>
                {selectedStatus === 'ALL' ? 'All Status' : selectedStatus}
              </Text>
              <ChevronDown size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {safePasses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No gate passes yet</Text>
          <Text style={styles.emptySubtext}>
            Submit a request from the Home tab
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {safePasses.map((pass) => {
            // Additional safety check for each pass
            if (!pass || typeof pass !== 'object' || !pass.id) {
              return null;
            }
            
            return (
              <View key={pass.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.statusBadge}>
                    {getStatusIcon(pass.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(pass.status) },
                      ]}
                    >
                      {pass.status ? pass.status.replace('_', ' ') : 'Unknown'}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {formatDate(pass.request_time)}
                  </Text>
                </View>

                {/* Show employee info for HODs */}
                {isHOD && pass.user && (
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeText}>
                      {pass.user.name} ({pass.user.payroll_no})
                    </Text>
                    <Text style={styles.employeeRole}>
                      {pass.user.role}
                    </Text>
                  </View>
                )}

                <View style={styles.cardContent}>
                  <View style={styles.row}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {pass.destination || 'No destination specified'}
                    </Text>
                  </View>

                  <Text style={styles.reasonText}>
                    {pass.reason || 'No reason provided'}
                  </Text>

                  {pass.total_duration_minutes != null && pass.total_duration_minutes > 0 && (
                    <View style={styles.durationBadge}>
                      <Clock size={14} color="#007AFF" />
                      <Text style={styles.durationText}>
                        {`Duration: ${Math.floor(pass.total_duration_minutes / 60)}h ${pass.total_duration_minutes % 60}m`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
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

      {/* Employee Filter Modal */}
      <Modal
        visible={showEmployeeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmployeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Employee</Text>
            <FlatList
              data={[{ id: 'ALL', name: 'All Employees' }, ...employees]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedEmployee === item.id && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedEmployee(item.id);
                    setShowEmployeeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedEmployee === item.id && styles.modalItemTextSelected
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEmployeeModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status Filter Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <FlatList
              data={[
                { id: 'ALL', name: 'All Status' },
                { id: 'PENDING', name: 'Pending' },
                { id: 'APPROVED', name: 'Approved' },
                { id: 'REJECTED', name: 'Rejected' },
                { id: 'CHECKED_OUT', name: 'Checked Out' },
                { id: 'RETURNED', name: 'Returned' }
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedStatus === item.id && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedStatus(item.id);
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedStatus === item.id && styles.modalItemTextSelected
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
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
  employeeInfo: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  employeeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  employeeRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  reasonText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
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
  filterSection: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  filterIndicator: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});
