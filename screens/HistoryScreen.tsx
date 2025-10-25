import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { gatePassService } from '@/utils/gatePassService';
import { GatePass } from '@/lib/types';
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, Filter, ChevronDown, Users } from 'lucide-react-native';
import PaginationControls from '../components/PaginationControls';
import ExportButton from '../components/ExportButton';

interface Employee {
  id: string;
  name: string;
  payroll_no?: string;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // HOD filtering states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const isHOD = user?.role === 'HOD';
  const isCEO = user?.role === 'CEO';

  const loadPasses = async (page = currentPage, limit = pageSize) => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let response, error;
      
      if (isHOD || isCEO) {
        // Load department passes for HOD/CEO with pagination
        const filters = {
          page,
          limit,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          employee_id: selectedEmployee !== 'ALL' ? selectedEmployee : undefined,
        };
        
        ({ data: response, error } = await gatePassService.getDepartmentPassesPaginated(user.id, filters));
      } else {
        // Load personal passes for staff with pagination
        const filters = {
          page,
          limit,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        };
        
        ({ data: response, error } = await gatePassService.getMyPassesPaginated(user.id, filters));
      }
      
      if (!error && response) {
        // Handle paginated response
        const validPasses = Array.isArray(response.data) ? response.data.filter(pass => 
          pass && 
          typeof pass === 'object' && 
          pass.id != null
        ) : [];
        
        setPasses(validPasses);
        
        if (response.pagination) {
          setCurrentPage(response.pagination.currentPage);
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.totalRecords);
        }
      } else {
        console.error('Error loading passes:', error);
        setPasses([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Exception loading passes:', error);
      setPasses([]);
      setTotalPages(1);
      setTotalRecords(0);
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
    loadPasses(1, pageSize); // Reset to page 1 when filters change
    if (isHOD) {
      loadEmployees();
    }
  }, [user, selectedEmployee, selectedStatus, pageSize]);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadPasses(1, pageSize);
  };

  const handlePageChange = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
    loadPasses(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLoading(true);
    setPageSize(newSize);
    setCurrentPage(1);
    loadPasses(1, newSize);
  };

  const getStatusColor = (status: string | undefined) => {
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
      case 'OVERDUE':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
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
      case 'OVERDUE':
        return <AlertCircle size={20} color="#FF3B30" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const renderPassItem = ({ item: pass }: { item: GatePass }) => (
    <View style={styles.passCard}>
      <View style={styles.passHeader}>
        <View style={styles.passInfo}>
          {(isHOD || isCEO) && pass.user && (
            <Text style={styles.employeeName}>
              {pass.user.name} ({pass.user.payroll_no})
            </Text>
          )}
          <Text style={styles.passReason}>{pass.reason || 'No reason provided'}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(pass.status)}
          <Text style={[styles.statusText, { color: getStatusColor(pass.status) }]}>
            {(pass.status || 'Unknown').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.passDetails}>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#666" />
          <Text style={styles.detailText}>
            {pass.destination || 'No destination specified'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color="#666" />
          <Text style={styles.detailText}>
            Requested: {formatDate(pass.request_time)}
          </Text>
        </View>

        {pass.expected_return && (
          <View style={styles.detailRow}>
            <Clock size={16} color="#666" />
            <Text style={styles.detailText}>
              Expected Return: {formatDate(pass.expected_return)}
            </Text>
          </View>
        )}

        {pass.approval_time && (
          <View style={styles.detailRow}>
            <CheckCircle size={16} color="#34C759" />
            <Text style={styles.detailText}>
              Approved: {formatDate(pass.approval_time)}
            </Text>
          </View>
        )}

        {pass.rejection_time && (
          <View style={styles.detailRow}>
            <XCircle size={16} color="#FF3B30" />
            <Text style={styles.detailText}>
              Rejected: {formatDate(pass.rejection_time)}
            </Text>
          </View>
        )}

        {pass.out_time && (
          <View style={styles.detailRow}>
            <AlertCircle size={16} color="#007AFF" />
            <Text style={styles.detailText}>
              Checked Out: {formatDate(pass.out_time)}
            </Text>
          </View>
        )}

        {pass.in_time && (
          <View style={styles.detailRow}>
            <CheckCircle size={16} color="#5856D6" />
            <Text style={styles.detailText}>
              Returned: {formatDate(pass.in_time)}
            </Text>
          </View>
        )}

        {pass.total_duration_minutes && (
          <View style={styles.detailRow}>
            <Clock size={16} color="#666" />
            <Text style={styles.detailText}>
              Duration: {Math.floor(pass.total_duration_minutes / 60)}h {pass.total_duration_minutes % 60}m
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const statusOptions = [
    { label: 'All Status', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Checked Out', value: 'CHECKED_OUT' },
    { label: 'Returned', value: 'RETURNED' },
    { label: 'Overdue', value: 'OVERDUE' },
  ];

  if (loading && currentPage === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/chandaria.png')} 
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>
            {isHOD || isCEO ? 'Department History' : 'My Gate Passes'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading passes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/chandaria.png')} 
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>
          {isHOD || isCEO ? 'Department History' : 'My Gate Passes'}
        </Text>
        <ExportButton
          type={isHOD || isCEO ? 'department' : 'user'}
          userId={!isHOD && !isCEO ? user?.id : undefined}
          departmentId={isHOD || isCEO ? user?.department_id || undefined : undefined}
          filters={{
            status: selectedStatus,
            employeeId: selectedEmployee,
          }}
          disabled={loading}
        />
      </View>

      {(isHOD || isCEO) && (
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowEmployeeModal(true)}
          >
            <Users size={16} color="#007AFF" />
            <Text style={styles.filterButtonText}>
              {selectedEmployee === 'ALL' ? 'All Employees' : 
               employees.find(emp => emp.id === selectedEmployee)?.name || 'Unknown'}
            </Text>
            <ChevronDown size={16} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowStatusModal(true)}
          >
            <Filter size={16} color="#007AFF" />
            <Text style={styles.filterButtonText}>
              {statusOptions.find(opt => opt.value === selectedStatus)?.label || 'All Status'}
            </Text>
            <ChevronDown size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={passes}
        renderItem={renderPassItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No gate passes found'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
      />

      {/* Employee Selection Modal */}
      <Modal
        visible={showEmployeeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmployeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Employee</Text>
            <FlatList
              data={[{ id: 'ALL', name: 'All Employees' }, ...employees]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedEmployee === item.id && styles.selectedModalItem
                  ]}
                  onPress={() => {
                    setSelectedEmployee(item.id);
                    setShowEmployeeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedEmployee === item.id && styles.selectedModalItemText
                  ]}>
                    {item.name} {item.payroll_no ? `(${item.payroll_no})` : ''}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEmployeeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <FlatList
              data={statusOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedStatus === item.value && styles.selectedModalItem
                  ]}
                  onPress={() => {
                    setSelectedStatus(item.value);
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedStatus === item.value && styles.selectedModalItemText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonText: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  passCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  passInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  passReason: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  passDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedModalItem: {
    backgroundColor: '#007AFF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});