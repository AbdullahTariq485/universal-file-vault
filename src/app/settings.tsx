import { useSettings } from '@/context/settings-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const { notifications, setNotifications, darkMode, setDarkMode, autoSync, setAutoSync } = useSettings();
  const [loading, setLoading] = React.useState(false);

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            setLoading(true);
            try {
              // Clear all AsyncStorage data
              await AsyncStorage.clear();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkMode ? '#0F0F1E' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: darkMode ? '#FFFFFF' : '#000000' }]}>⚙️ Settings</Text>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>Preferences</Text>

        <View style={[styles.settingItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <View style={styles.settingLabel}>
            <Text style={[styles.settingName, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Notifications</Text>
            <Text style={[styles.settingDesc, { color: darkMode ? '#8892B0' : '#999999' }]}>Enable file upload alerts</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#2D2D4A', true: '#6366F1' }}
            thumbColor={notifications ? '#FFFFFF' : '#A0AEC0'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <View style={styles.settingLabel}>
            <Text style={[styles.settingName, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Dark Mode</Text>
            <Text style={[styles.settingDesc, { color: darkMode ? '#8892B0' : '#999999' }]}>Use dark theme</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#2D2D4A', true: '#6366F1' }}
            thumbColor={darkMode ? '#FFFFFF' : '#A0AEC0'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <View style={styles.settingLabel}>
            <Text style={[styles.settingName, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Auto Sync</Text>
            <Text style={[styles.settingDesc, { color: darkMode ? '#8892B0' : '#999999' }]}>Automatically sync files</Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: '#2D2D4A', true: '#6366F1' }}
            thumbColor={autoSync ? '#FFFFFF' : '#A0AEC0'}
          />
        </View>
      </View>

      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>Storage</Text>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]} onPress={handleClearCache}>
          {loading ? (
            <ActivityIndicator color="#6366F1" />
          ) : (
            <>
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionButtonText, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Clear Cache</Text>
                <Text style={[styles.actionButtonDesc, { color: darkMode ? '#8892B0' : '#999999' }]}>Remove cached data</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>Account</Text>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]} onPress={handleLogout}>
          <Text style={styles.actionButtonIcon}>🚪</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
              Logout
            </Text>
            <Text style={[styles.actionButtonDesc, { color: darkMode ? '#8892B0' : '#999999' }]}>Sign out of your account</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: darkMode ? '#A0AEC0' : '#666666' }]}>About</Text>

        <View style={[styles.infoItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={[styles.infoLabel, { color: darkMode ? '#FFFFFF' : '#000000' }]}>App Version</Text>
          <Text style={[styles.infoValue, { color: darkMode ? '#8892B0' : '#999999' }]}>1.0.0</Text>
        </View>

        <View style={[styles.infoItem, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]}>
          <Text style={[styles.infoLabel, { color: darkMode ? '#FFFFFF' : '#000000' }]}>Build</Text>
          <Text style={[styles.infoValue, { color: darkMode ? '#8892B0' : '#999999' }]}>2026.06.01</Text>
        </View>
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
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  settingLabel: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#8892B0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionButtonDesc: {
    fontSize: 13,
    color: '#8892B0',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D4A',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoValue: {
    fontSize: 15,
    color: '#8892B0',
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
});
