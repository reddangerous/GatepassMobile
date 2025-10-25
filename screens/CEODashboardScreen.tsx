import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../lib/api';

const { width } = Dimensions.get('window');

interface DashboardData {
  overview: {
    total_passes: number;
    pending_passes: number;
    approved_passes: number;
    rejected_passes: number;
    currently_out: number;
    overdue_passes: number;
    avg_duration_hours: string;
    approval_rate: string;
    overdue_rate: string;
  };
  overdueEmployees: Array<{
    name: string;
    payroll_no: string;
    department_name: string;
    reason: string;
    destination: string;
    hours_overdue: number;
    days_overdue: number;
  }>;
  frequentUsers: Array<{
    name: string;
    payroll_no: string;
    department_name: string;
    total_passes: number;
    overdue_count: number;
    avg_duration_hours: string;
    overdue_percentage: string;
  }>;
  departmentStats: Array<{
    department_name: string;
    total_passes: number;
    pending_passes: number;
    overdue_passes: number;
    avg_duration_hours: string;
    unique_users: number;
    overdue_rate: string;
    passes_per_user: string;
  }>;
  hodPendingStats: Array<{
    hod_name: string;
    hod_payroll_no: string;
    department_name: string;
    pending_count: number;
    days_pending: number;
  }>;
  period: string;
}

const CEODashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const periods = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
  ];

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.get<DashboardData>(`/gate-passes/ceo/dashboard?period=${selectedPeriod}`);
      
      // Handle empty data case
      if (response && response.overview) {
        setDashboardData({
          overview: {
            total_passes: response.overview.total_passes || 0,
            pending_passes: response.overview.pending_passes || 0,
            approved_passes: response.overview.approved_passes || 0,
            rejected_passes: response.overview.rejected_passes || 0,
            currently_out: response.overview.currently_out || 0,
            overdue_passes: response.overview.overdue_passes || 0,
            avg_duration_hours: response.overview.avg_duration_hours || '0',
            approval_rate: response.overview.approval_rate || '0',
            overdue_rate: response.overview.overdue_rate || '0',
          },
          overdueEmployees: response.overdueEmployees || [],
          frequentUsers: response.frequentUsers || [],
          departmentStats: response.departmentStats || [],
          hodPendingStats: response.hodPendingStats || [],
          period: response.period || selectedPeriod
        });
      } else {
        // Set default empty data
        setDashboardData({
          overview: {
            total_passes: 0,
            pending_passes: 0,
            approved_passes: 0,
            rejected_passes: 0,
            currently_out: 0,
            overdue_passes: 0,
            avg_duration_hours: '0',
            approval_rate: '0',
            overdue_rate: '0',
          },
          overdueEmployees: [],
          frequentUsers: [],
          departmentStats: [],
          hodPendingStats: [],
          period: selectedPeriod
        });
      }
    } catch (error) {
      console.error('Error fetching CEO dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
      
      // Set default empty data on error
      setDashboardData({
        overview: {
          total_passes: 0,
          pending_passes: 0,
          approved_passes: 0,
          rejected_passes: 0,
          currently_out: 0,
          overdue_passes: 0,
          avg_duration_hours: '0',
          approval_rate: '0',
          overdue_rate: '0',
        },
        overdueEmployees: [],
        frequentUsers: [],
        departmentStats: [],
        hodPendingStats: [],
        period: selectedPeriod
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const exportAllData = async () => {
    try {
      Alert.alert('Export Started', 'Generating Excel report...');
      // Note: In a real app, you'd handle file download differently
      // This would typically open a web view or trigger a download
      await apiService.get('/gate-passes/export/all');
      Alert.alert('Export Complete', 'Excel file has been generated successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Failed to generate Excel report');
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = '#2196F3',
    backgroundColor = '#E3F2FD' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
    backgroundColor?: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor }]}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/chandaria.png')} 
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>CEO Dashboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/chandaria.png')} 
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>CEO Dashboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/chandaria.png')} 
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>CEO Dashboard</Text>
        <TouchableOpacity 
          onPress={exportAllData}
          style={styles.exportButton}
        >
          <MaterialCommunityIcons name="file-excel" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.value && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <Text style={styles.sectionTitle}>Overview ({dashboardData.period})</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Passes"
            value={dashboardData.overview.total_passes}
            icon="clipboard-text"
            color="#2196F3"
            backgroundColor="#E3F2FD"
          />
          <StatCard
            title="Currently Out"
            value={dashboardData.overview.currently_out}
            icon="exit-run"
            color="#FF9800"
            backgroundColor="#FFF3E0"
          />
          <StatCard
            title="Overdue"
            value={dashboardData.overview.overdue_passes}
            subtitle={`${dashboardData.overview.overdue_rate}% rate`}
            icon="clock-alert"
            color="#F44336"
            backgroundColor="#FFEBEE"
          />
          <StatCard
            title="Approval Rate"
            value={`${dashboardData.overview.approval_rate}%`}
            icon="check-circle"
            color="#4CAF50"
            backgroundColor="#E8F5E8"
          />
          <StatCard
            title="Avg Duration"
            value={`${dashboardData.overview.avg_duration_hours}h`}
            icon="timer"
            color="#9C27B0"
            backgroundColor="#F3E5F5"
          />
          <StatCard
            title="Pending"
            value={dashboardData.overview.pending_passes}
            icon="clock"
            color="#FF5722"
            backgroundColor="#FBE9E7"
          />
        </View>

        {/* Most Overdue Employees */}
        {dashboardData.overdueEmployees && dashboardData.overdueEmployees.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🚨 Most Overdue Employees</Text>
            <View style={styles.listContainer}>
              {dashboardData.overdueEmployees && dashboardData.overdueEmployees.slice(0, 5).map((employee, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeDetail}>
                      {employee.payroll_no} • {employee.department_name}
                    </Text>
                    <Text style={styles.employeeReason}>
                      {employee.reason} → {employee.destination}
                    </Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.overdueText}>
                      {employee.days_overdue}d {employee.hours_overdue % 24}h
                    </Text>
                    <Text style={styles.overdueLabel}>overdue</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Frequent Users */}
        <Text style={styles.sectionTitle}>📊 Most Frequent Users</Text>
        <View style={styles.listContainer}>
          {dashboardData.frequentUsers && dashboardData.frequentUsers.slice(0, 5).map((user, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.employeeName}>{user.name}</Text>
                <Text style={styles.employeeDetail}>
                  {user.payroll_no} • {user.department_name}
                </Text>
                <Text style={styles.frequentDetail}>
                  Avg: {user.avg_duration_hours}h • {user.overdue_percentage}% overdue
                </Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={styles.frequentCount}>{user.total_passes}</Text>
                <Text style={styles.frequentLabel}>passes</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Department Performance */}
        <Text style={styles.sectionTitle}>🏢 Department Performance</Text>
        <View style={styles.listContainer}>
          {dashboardData.departmentStats.slice(0, 10).map((dept, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.employeeName}>{dept.department_name}</Text>
                <Text style={styles.employeeDetail}>
                  {dept.unique_users} users • {dept.passes_per_user} passes/user
                </Text>
                <Text style={styles.frequentDetail}>
                  Avg: {dept.avg_duration_hours}h • {dept.overdue_rate}% overdue
                </Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={styles.frequentCount}>{dept.total_passes}</Text>
                <Text style={styles.frequentLabel}>total</Text>
                {dept.pending_passes > 0 && (
                  <Text style={styles.pendingCount}>{dept.pending_passes} pending</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* HOD Pending Backlog */}
        {dashboardData.hodPendingStats.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>⏳ HOD Approval Backlog</Text>
            <View style={styles.listContainer}>
              {dashboardData.hodPendingStats.map((hod, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={styles.employeeName}>{hod.hod_name}</Text>
                    <Text style={styles.employeeDetail}>
                      {hod.hod_payroll_no} • {hod.department_name}
                    </Text>
                    <Text style={styles.frequentDetail}>
                      Oldest pending: {hod.days_pending} days
                    </Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.pendingCount}>{hod.pending_count}</Text>
                    <Text style={styles.frequentLabel}>pending</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 45) / 2,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#888',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemLeft: {
    flex: 1,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  employeeReason: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  frequentDetail: {
    fontSize: 11,
    color: '#888',
  },
  overdueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  overdueLabel: {
    fontSize: 10,
    color: '#F44336',
    textAlign: 'center',
  },
  frequentCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  frequentLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  pendingCount: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});

export default CEODashboardScreen;