import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/adminService';
import { User, Department, UserRole } from '@/lib/types';
import { 
  Users, 
  Plus, 
  Edit, 
  Key, 
  Building, 
  UserCheck,
  X
} from 'lucide-react-native';

interface FormData {
  name: string;
  payroll_no: string;
  email: string;
  role: string;
  department_id: string;
  reports_to_user_id: string;
  temporary_password: string;
}

export default function AdminUserManagementScreen() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    payroll_no: '',
    email: '',
    role: 'STAFF',
    department_id: '',
    reports_to_user_id: '',
    temporary_password: ''
  });

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, []); // Remove user dependency to prevent constant reloads

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadUsers(),
      loadDepartments(),
      loadSupervisors()
    ]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data, error } = await adminService.getAllUsers();
    if (!error && data) {
      setUsers(data);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    const { data, error } = await adminService.getAllDepartments();
    if (!error && data) {
      setDepartments(data);
    }
  }, []);

  const loadSupervisors = useCallback(async () => {
    const { data, error } = await adminService.getPotentialSupervisors();
    if (!error && data) {
      setSupervisors(data);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreateUser = useCallback(() => {
    setFormData({
      name: '',
      payroll_no: '',
      email: '',
      role: 'STAFF',
      department_id: '',
      reports_to_user_id: '',
      temporary_password: ''
    });
    setEditingUser(null);
    setShowCreateModal(true);
  }, []);

  const handleEditUser = useCallback((userToEdit: User) => {
    setFormData({
      name: userToEdit.name,
      payroll_no: userToEdit.payroll_no,
      email: userToEdit.email || '',
      role: userToEdit.role,
      department_id: userToEdit.department_id || '',
      reports_to_user_id: userToEdit.reports_to_user_id || '',
      temporary_password: ''
    });
    setEditingUser(userToEdit);
    setShowCreateModal(true);
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!formData.name || !formData.payroll_no || !formData.role || !formData.department_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      let result;
      if (editingUser) {
        // Update existing user
        result = await adminService.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role as UserRole,
          department_id: formData.department_id,
          reports_to_user_id: formData.reports_to_user_id || undefined
        });
      } else {
        // Create new user
        result = await adminService.createUser({
          name: formData.name,
          payroll_no: formData.payroll_no,
          email: formData.email,
          role: formData.role as UserRole,
          department_id: formData.department_id,
          reports_to_user_id: formData.reports_to_user_id || undefined,
          temporary_password: formData.temporary_password || formData.payroll_no
        });
      }

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        const action = editingUser ? 'updated' : 'created';
        const tempPassword = 'temporary_password' in (result.data || {}) ? (result.data as any).temporary_password : null;
        
        let message = `User ${action} successfully!`;
        if (tempPassword) {
          message += `\n\nTemporary password: ${tempPassword}`;
        }
        
        Alert.alert('Success', message);
        setShowCreateModal(false);
        loadUsers();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save user');
    }
  }, [formData, editingUser, loadUsers]);

  const handleResetPassword = useCallback(async (userId: string, userName: string) => {
    Alert.alert(
      'Reset Password',
      `Reset password for ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            const { data, error } = await adminService.resetUserPassword(userId);
            if (error) {
              Alert.alert('Error', error.message);
            } else if (data) {
              Alert.alert(
                'Password Reset',
                `New temporary password: ${data.temporary_password}\n\nUser must change this password on next login.`
              );
            }
          }
        }
      ]
    );
  }, []);

  const getRoleBadgeColor = useCallback((role: string) => {
    switch (role) {
      case 'ADMIN': return '#FF3B30';
      case 'CTO': return '#5856D6';
      case 'HOD': return '#FF9500';
      case 'STAFF': return '#007AFF';
      case 'SECURITY': return '#34C759';
      default: return '#666';
    }
  }, []);

  // Optimized form handlers to prevent re-renders
  const updateFormField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  const selectRole = useCallback((role: string) => {
    updateFormField('role', role);
  }, [updateFormField]);

  const selectDepartment = useCallback((departmentId: string) => {
    updateFormField('department_id', departmentId);
  }, [updateFormField]);

  const selectSupervisor = useCallback((supervisorId: string) => {
    updateFormField('reports_to_user_id', supervisorId);
  }, [updateFormField]);

  const closeModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const UserModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingUser ? 'Edit User' : 'Create New User'}
          </Text>
          <TouchableOpacity onPress={closeModal}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => updateFormField('name', text)}
              placeholder="Full name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payroll Number *</Text>
            <TextInput
              style={[styles.input, editingUser && styles.inputDisabled]}
              value={formData.payroll_no}
              onChangeText={(text) => updateFormField('payroll_no', text)}
              placeholder="Payroll number"
              editable={!editingUser}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => updateFormField('email', text)}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Role *</Text>
            <View style={styles.roleSelector}>
              {['STAFF', 'HOD', 'CTO', 'SECURITY', 'ADMIN'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    formData.role === role && styles.roleOptionSelected,
                    { borderColor: getRoleBadgeColor(role) }
                  ]}
                  onPress={() => selectRole(role)}
                >
                  <Text style={[
                    styles.roleOptionText,
                    formData.role === role && { color: getRoleBadgeColor(role) }
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Department *</Text>
            <View style={styles.selectorContainer}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  style={[
                    styles.selectorOption,
                    formData.department_id === dept.id && styles.selectorOptionSelected
                  ]}
                  onPress={() => selectDepartment(dept.id)}
                >
                  <Building size={16} color={formData.department_id === dept.id ? "#007AFF" : "#666"} />
                  <Text style={[
                    styles.selectorOptionText,
                    formData.department_id === dept.id && styles.selectorOptionTextSelected
                  ]}>
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reports To</Text>
            <View style={styles.selectorContainer}>
              <TouchableOpacity
                style={[
                  styles.selectorOption,
                  !formData.reports_to_user_id && styles.selectorOptionSelected
                ]}
                onPress={() => selectSupervisor('')}
              >
                <Text style={[
                  styles.selectorOptionText,
                  !formData.reports_to_user_id && styles.selectorOptionTextSelected
                ]}>
                  None
                </Text>
              </TouchableOpacity>
              {supervisors.map((supervisor) => (
                <TouchableOpacity
                  key={supervisor.id}
                  style={[
                    styles.selectorOption,
                    formData.reports_to_user_id === supervisor.id && styles.selectorOptionSelected
                  ]}
                  onPress={() => selectSupervisor(supervisor.id)}
                >
                  <UserCheck size={16} color={formData.reports_to_user_id === supervisor.id ? "#007AFF" : "#666"} />
                  <Text style={[
                    styles.selectorOptionText,
                    formData.reports_to_user_id === supervisor.id && styles.selectorOptionTextSelected
                  ]}>
                    {supervisor.name} ({supervisor.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {!editingUser && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Temporary Password</Text>
              <TextInput
                style={styles.input}
                value={formData.temporary_password}
                onChangeText={(text) => updateFormField('temporary_password', text)}
                placeholder={`Leave empty to use payroll number: ${formData.payroll_no}`}
                secureTextEntry
              />
              <Text style={styles.helpText}>
                💡 User will be required to change this password on first login
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={closeModal}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveUser}
          >
            <Text style={styles.saveButtonText}>
              {editingUser ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!isAdmin()) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noAccessText}>
          Admin access required
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>User Management</Text>
              <Text style={styles.subtitle}>{users.length} users total</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleCreateUser}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.usersList}>
          {users.map((userItem) => (
            <View key={userItem.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userItem.name}</Text>
                  <Text style={styles.userPayroll}>{userItem.payroll_no}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(userItem.role) }]}>
                  <Text style={styles.roleText}>{userItem.role}</Text>
                </View>
              </View>

              <View style={styles.userDetails}>
                {userItem.email && (
                  <Text style={styles.userEmail}>{userItem.email}</Text>
                )}
                {userItem.department_name && (
                  <View style={styles.userMeta}>
                    <Building size={14} color="#666" />
                    <Text style={styles.userMetaText}>{userItem.department_name}</Text>
                  </View>
                )}
                {userItem.reports_to_name && (
                  <View style={styles.userMeta}>
                    <UserCheck size={14} color="#666" />
                    <Text style={styles.userMetaText}>Reports to: {userItem.reports_to_name}</Text>
                  </View>
                )}
                {userItem.is_temp_password && (
                  <View style={styles.tempPasswordBadge}>
                    <Text style={styles.tempPasswordText}>🔒 Temporary Password</Text>
                  </View>
                )}
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditUser(userItem)}
                >
                  <Edit size={16} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleResetPassword(userItem.id, userItem.name)}
                >
                  <Key size={16} color="#FF9500" />
                  <Text style={styles.actionButtonText}>Reset Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <UserModal />
    </View>
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
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  usersList: {
    padding: 24,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userPayroll: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userDetails: {
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userMetaText: {
    fontSize: 12,
    color: '#666',
  },
  tempPasswordBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  tempPasswordText: {
    fontSize: 12,
    color: '#856404',
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectorContainer: {
    gap: 8,
  },
  selectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  selectorOptionSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  selectorOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectorOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});