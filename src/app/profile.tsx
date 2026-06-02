import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSettings } from '../context/settings-context';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const { darkMode } = useSettings();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      // Get file stats
      const { data: files, error } = await supabase
        .from('user_documents')
        .select('file_size');

      if (!error && files) {
        const totalSize = files.reduce((acc, file) => acc + file.file_size, 0);
        setStats({
          totalFiles: files.length,
          totalSize: totalSize,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkMode ? '#0F0F1E' : '#FFFFFF' }]}>
      {/* Profile Header */}
      <View style={[styles.header, { borderBottomColor: darkMode ? '#2D2D4A' : '#E0E0E0' }]}>
        <View style={[styles.profileImageContainer, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={styles.profileImageText}>👤</Text>
        </View>
        <Text style={[styles.userName, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
          {user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: darkMode ? '#8892B0' : '#999999' }]}>{user?.email}</Text>
      </View>

      {/* Storage Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>📊 Storage Stats</Text>

        <View style={[styles.statsCard, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📁</Text>
              <Text style={[styles.statLabel, { color: darkMode ? '#8892B0' : '#999999' }]}>Files Stored</Text>
              <Text style={[styles.statBigNumber, { color: darkMode ? '#FFFFFF' : '#000000' }]}>{stats.totalFiles}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: darkMode ? '#2D2D4A' : '#E0E0E0' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💾</Text>
              <Text style={[styles.statLabel, { color: darkMode ? '#8892B0' : '#999999' }]}>Total Size</Text>
              <Text style={[styles.statBigNumber, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
                {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.storageBar, { backgroundColor: darkMode ? '#2D2D4A' : '#E0E0E0' }]}>
          <View 
            style={[
              styles.storageBarFill, 
              { width: `${Math.min((stats.totalSize / (1024 * 1024 * 10)) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={[styles.storageText, { color: darkMode ? '#8892B0' : '#999999' }]}>
          {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB used of 10 GB
        </Text>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>👤 Account Info</Text>

        <View style={[styles.infoItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={[styles.infoLabel, { color: darkMode ? '#8892B0' : '#999999' }]}>Email</Text>
          <Text style={[styles.infoValue, { color: darkMode ? '#FFFFFF' : '#000000' }]}>{user?.email}</Text>
        </View>

        <View style={[styles.infoItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={[styles.infoLabel, { color: darkMode ? '#8892B0' : '#999999' }]}>User ID</Text>
          <Text style={[styles.infoValue, { color: darkMode ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
            {user?.id?.substring(0, 20)}...
          </Text>
        </View>

        <View style={[styles.infoItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={[styles.infoLabel, { color: darkMode ? '#8892B0' : '#999999' }]}>Joined</Text>
          <Text style={[styles.infoValue, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>⚡ Quick Actions</Text>

        <TouchableOpacity style={[styles.actionCard, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]} onPress={() => fetchUserData()}>
          <Text style={styles.actionIcon}>🔄</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Refresh Data</Text>
            <Text style={[styles.actionDesc, { color: darkMode ? '#8892B0' : '#999999' }]}>Update storage stats</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={styles.actionIcon}>🔐</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Change Password</Text>
            <Text style={[styles.actionDesc, { color: darkMode ? '#8892B0' : '#999999' }]}>Update account security</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📱</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Connected Devices</Text>
            <Text style={styles.actionDesc}>Manage your sessions</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D4A',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  profileImageText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 14,
    color: '#8892B0',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#2D2D4A',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8892B0',
    marginBottom: 4,
  },
  statBigNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#2D2D4A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  storageText: {
    fontSize: 12,
    color: '#8892B0',
    textAlign: 'center',
  },
  infoItem: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    maxWidth: '60%',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: '#8892B0',
  },
  arrow: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  footer: {
    height: 40,
  },
});
