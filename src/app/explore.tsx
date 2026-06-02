import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSettings } from '../context/settings-context';
import { supabase } from '../lib/supabase';

export default function ActivityScreen() {
  const { darkMode } = useSettings();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkMode ? '#0F0F1E' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: darkMode ? '#2D2D4A' : '#E0E0E0' }]}>
        <Text style={[styles.title, { color: darkMode ? '#FFFFFF' : '#000000' }]}>📊 Vault Activity</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={styles.statIcon}>📁</Text>
          <Text style={[styles.statLabel, { color: darkMode ? '#8892B0' : '#999999' }]}>Total Files</Text>
          <Text style={[styles.statValue, { color: darkMode ? '#FFFFFF' : '#000000' }]}>{activities.length}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={styles.statIcon}>💾</Text>
          <Text style={[styles.statLabel, { color: darkMode ? '#8892B0' : '#999999' }]}>Total Size</Text>
          <Text style={[styles.statValue, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
            {(activities.reduce((acc, item) => acc + item.file_size, 0) / (1024 * 1024)).toFixed(1)} MB
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>📅 Recent Activity</Text>

        {loading ? (
          <View style={{ paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : activities.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: darkMode ? '#8892B0' : '#999999' }]}>No activity yet</Text>
          </View>
        ) : (
          activities.map((activity) => (
            <View key={activity.id} style={[styles.activityItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
              <View style={[styles.activityIcon, { backgroundColor: darkMode ? '#2D2D4A' : '#EEEEEE' }]}>
                <Text style={styles.icon}>⬆️</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: darkMode ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                  {activity.file_name}
                </Text>
                <Text style={[styles.activityDate, { color: darkMode ? '#8892B0' : '#999999' }]}>
                  {new Date(activity.created_at).toLocaleDateString()} •{' '}
                  {(activity.file_size / 1024).toFixed(1)} KB
                </Text>
              </View>
              <Text style={[styles.badge, { backgroundColor: darkMode ? '#2D2D4A' : '#E0E0E0', color: darkMode ? '#6366F1' : '#666666' }]}>Uploaded</Text>
            </View>
          ))
        )}
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
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D4A',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8892B0',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2D2D4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#8892B0',
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#8892B0',
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
});

