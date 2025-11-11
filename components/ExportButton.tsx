import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { FileSpreadsheet } from 'lucide-react-native';
import { apiService } from '../lib/api';

interface ExportButtonProps {
  type: 'user' | 'department' | 'all';
  userId?: string;
  departmentId?: string;
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  };
  style?: any;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  type, 
  userId, 
  departmentId, 
  filters = {}, 
  style,
  disabled = false 
}) => {
  const handleExport = async () => {
    try {
      Alert.alert('Export Started', 'Generating Excel report...');
      
      let url = '';
      let params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      
      switch (type) {
        case 'user':
          if (!userId) {
            Alert.alert('Error', 'User ID is required for user export');
            return;
          }
          url = `/gate-passes/export/user/${userId}${queryString ? `?${queryString}` : ''}`;
          break;
          
        case 'department':
          if (!departmentId) {
            Alert.alert('Error', 'Department ID is required for department export');
            return;
          }
          url = `/gate-passes/export/department/${departmentId}${queryString ? `?${queryString}` : ''}`;
          break;
          
        case 'all':
          url = `/gate-passes/export/all${queryString ? `?${queryString}` : ''}`;
          break;
          
        default:
          Alert.alert('Error', 'Invalid export type');
          return;
      }
      
      // Note: In a real mobile app, you'd handle file download differently
      // This would typically open a web view, share sheet, or save to device storage
      await apiService.get(url);
      
      Alert.alert(
        'Export Complete', 
        'Excel file has been generated successfully. In a production app, this would download or share the file.',
        [
          {
            text: 'OK',
            style: 'default',
          }
        ]
      );
      
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Failed to generate Excel report. Please try again.');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.exportButton, disabled && styles.disabledButton, style]}
      onPress={handleExport}
      disabled={disabled}
    >
      <FileSpreadsheet size={16} color={disabled ? '#ccc' : '#fff'} />
      <Text style={[styles.exportButtonText, disabled && styles.disabledButtonText]}>
        Export
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  disabledButtonText: {
    color: '#ccc',
  },
});

export default ExportButton;