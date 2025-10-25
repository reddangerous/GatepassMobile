import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, Mail, Hash, LogOut } from 'lucide-react-native';
import ProfileAvatar from '@/components/ProfileAvatar';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          // Navigation will be handled by AuthContext
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.topHeader}>
        <Image 
          source={require('@/assets/images/chandaria.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.screenTitle}>Profile</Text>
      </View>
      
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <ProfileAvatar size={80} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Hash size={20} color="#007AFF" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Payroll Number</Text>
              <Text style={styles.infoValue}>{user?.payroll_no}</Text>
            </View>
          </View>

          {user?.email && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Mail size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <User size={20} color="#007AFF" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{user?.role}</Text>
            </View>
          </View>

          {user?.department_id && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Building2 size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>Department ID: {user.department_id}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 8,
  },
  signOutText: {
    color: '#FF3B30',
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
