import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { supabase, User, Department, GatePass } from '@/lib/supabase';
import { Users, Building2, FileText, Plus } from 'lucide-react-native';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'reports'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);

    if (activeTab === 'users') {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    } else if (activeTab === 'departments') {
      const { data } = await supabase.from('departments').select('*').order('name');
      if (data) setDepartments(data);
    } else if (activeTab === 'reports') {
      const { data } = await supabase
        .from('gate_passes')
        .select('*, user:users!gate_passes_user_id_fkey(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setGatePasses(data);
    }

    setLoading(false);
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      Alert.alert('Error', 'Please enter a department name');
      return;
    }

    const { error } = await supabase.from('departments').insert({ name: newDeptName });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Department added');
      setNewDeptName('');
      setShowAddDept(false);
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#34C759';
      case 'PENDING': return '#FF9500';
      case 'REJECTED': return '#FF3B30';
      case 'CHECKED_OUT': return '#007AFF';
      case 'RETURNED': return '#5856D6';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Users size={20} color={activeTab === 'users' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'departments' && styles.activeTab]}
          onPress={() => setActiveTab('departments')}
        >
          <Building2 size={20} color={activeTab === 'departments' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'departments' && styles.activeTabText]}>
            Departments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <FileText size={20} color={activeTab === 'reports' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {activeTab === 'users' && (
            <View style={styles.list}>
              <Text style={styles.sectionTitle}>{users.length} Total Users</Text>
              {users.map((user) => (
                <View key={user.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{user.name}</Text>
                  <Text style={styles.cardSubtitle}>Payroll: {user.payroll_no}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{user.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'departments' && (
            <View style={styles.list}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{departments.length} Departments</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddDept(true)}
                >
                  <Plus size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {showAddDept && (
                <View style={styles.addForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Department Name"
                    value={newDeptName}
                    onChangeText={setNewDeptName}
                  />
                  <View style={styles.addFormButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowAddDept(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleAddDepartment}
                    >
                      <Text style={styles.saveButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {departments.map((dept) => (
                <View key={dept.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{dept.name}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reports' && (
            <View style={styles.list}>
              <Text style={styles.sectionTitle}>Recent Gate Passes</Text>
              {gatePasses.map((pass) => (
                <View key={pass.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{pass.user?.name}</Text>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(pass.status) }]} />
                  </View>
                  <Text style={styles.cardSubtitle}>{pass.destination}</Text>
                  <Text style={styles.cardText}>{pass.reason}</Text>
                  <Text style={styles.statusLabel}>{pass.status}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  list: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addForm: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
});
