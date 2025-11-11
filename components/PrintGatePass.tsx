import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { GatePass } from '@/lib/types';
import { Printer, X } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface PrintGatePassProps {
  gatePass: GatePass;
  visible: boolean;
  onClose: () => void;
}

export default function PrintGatePass({ gatePass, visible, onClose }: PrintGatePassProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return '#999';
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return '#34C759';
      case 'CHECKED_OUT':
        return '#007AFF';
      case 'RETURNED':
        return '#5856D6';
      default:
        return '#999';
    }
  };

  const generateHTML = () => {
    const logoBase64 = ''; // You'll need to convert your logo to base64 or use a URL
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Gate Pass - ${gatePass.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              background: #fff;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #000;
              padding: 30px;
            }
            
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #000;
              margin-bottom: 5px;
            }
            
            .document-title {
              font-size: 28px;
              font-weight: bold;
              color: #000;
              margin: 15px 0;
              text-decoration: underline;
            }
            
            .gp-number {
              font-size: 16px;
              color: #666;
              margin-top: 10px;
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            
            .info-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            
            .info-label {
              font-weight: bold;
              width: 180px;
              color: #333;
            }
            
            .info-value {
              flex: 1;
              color: #000;
            }
            
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              color: white;
              font-weight: bold;
              font-size: 14px;
              background-color: ${getStatusBadgeColor(gatePass.status)};
            }
            
            .approval-section {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            
            .signature-box {
              width: 45%;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            
            .signature-label {
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .container {
                border: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-name">CHANDARIA INDUSTRIES LIMITED</div>
              <div class="document-title">GATE PASS</div>
              <div class="gp-number">GP No: ${gatePass.id}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Employee Information</div>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${gatePass.user?.name || 'N/A'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Payroll Number:</div>
                <div class="info-value">${gatePass.user?.payroll_no || 'N/A'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Department:</div>
                <div class="info-value">${gatePass.user?.department_id || 'N/A'}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Gate Pass Details</div>
              <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value">
                  <span class="status-badge">${(gatePass.status || 'UNKNOWN').toUpperCase()}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">Reason:</div>
                <div class="info-value">${gatePass.reason || 'No reason provided'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Destination:</div>
                <div class="info-value">${gatePass.destination || 'No destination specified'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Request Time:</div>
                <div class="info-value">${formatDate(gatePass.request_time)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Expected Return:</div>
                <div class="info-value">${formatDate(gatePass.expected_return)}</div>
              </div>
              ${gatePass.out_time ? `
              <div class="info-row">
                <div class="info-label">Checked Out:</div>
                <div class="info-value">${formatDate(gatePass.out_time)}</div>
              </div>
              ` : ''}
              ${gatePass.in_time ? `
              <div class="info-row">
                <div class="info-label">Returned:</div>
                <div class="info-value">${formatDate(gatePass.in_time)}</div>
              </div>
              ` : ''}
              ${gatePass.total_duration_minutes ? `
              <div class="info-row">
                <div class="info-label">Total Duration:</div>
                <div class="info-value">${Math.floor(gatePass.total_duration_minutes / 60)}h ${gatePass.total_duration_minutes % 60}m</div>
              </div>
              ` : ''}
            </div>
            
            ${gatePass.approval_time ? `
            <div class="approval-section">
              <div class="section-title">Approval Information</div>
              <div class="info-row" style="border: none;">
                <div class="info-label">Approved By:</div>
                <div class="info-value">${gatePass.hod?.name || 'N/A'}</div>
              </div>
              <div class="info-row" style="border: none;">
                <div class="info-label">Approval Time:</div>
                <div class="info-value">${formatDate(gatePass.approval_time)}</div>
              </div>
            </div>
            ` : ''}
            
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-label">Security (Out)</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">Security (In)</div>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Chandaria Industries Limited</strong></p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>This is an official document. Please present to security when leaving and returning.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      const html = generateHTML();

      if (Platform.OS === 'web') {
        // For web, open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        // For mobile, create PDF and share
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
        });

        // Check if sharing is available
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Gate Pass ${gatePass.id}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Success',
            'PDF generated successfully. File saved to: ' + uri
          );
        }
      }

      onClose();
    } catch (error) {
      console.error('Error printing gate pass:', error);
      Alert.alert('Error', 'Failed to generate printable gate pass. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Print Gate Pass</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            <Image
              source={require('../assets/images/chandaria.png')}
              style={styles.previewLogo}
              resizeMode="contain"
            />
            
            <Text style={styles.previewTitle}>GATE PASS</Text>
            <Text style={styles.previewGPNumber}>GP No: {gatePass.id}</Text>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Employee:</Text>
              <Text style={styles.previewValue}>{gatePass.user?.name}</Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Destination:</Text>
              <Text style={styles.previewValue}>{gatePass.destination}</Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Status:</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBadgeColor(gatePass.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {(gatePass.status || 'UNKNOWN').toUpperCase()}
                </Text>
              </View>
            </View>

            {gatePass.approval_time && (
              <View style={styles.approvalInfo}>
                <Text style={styles.approvalTitle}>✓ Approved</Text>
                <Text style={styles.approvalText}>
                  By: {gatePass.hod?.name || 'N/A'}
                </Text>
                <Text style={styles.approvalText}>
                  On: {formatDate(gatePass.approval_time)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
            <Printer size={20} color="#fff" />
            <Text style={styles.printButtonText}>
              {Platform.OS === 'web' ? 'Print' : 'Generate PDF & Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  previewContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  previewLogo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 5,
  },
  previewGPNumber: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  previewSection: {
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    color: '#000',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  approvalInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  approvalText: {
    fontSize: 14,
    color: '#1b5e20',
    marginBottom: 4,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
