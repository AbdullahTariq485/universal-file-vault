import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../context/settings-context';
import { supabase } from '../lib/supabase';
import { pickAndUploadDocument } from '../utils/fileWallet';

// Explicit type layout for database structure rows
interface DocumentItem {
  id: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  download_url: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { darkMode, notifications } = useSettings();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVaultDocuments();
  }, []);

  // Pulls active file entries down from your Supabase table rows
  async function fetchVaultDocuments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as DocumentItem[]) || []);
    } catch (error: any) {
      Alert.alert("Error Fetching Data", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Triggers native document picking and state animations
  async function handleUpload() {
    try {
      setUploading(true);
      const newDoc = await pickAndUploadDocument();
      if (newDoc && newDoc[0]) {
        setDocuments((prev) => [newDoc[0], ...prev]);
        
        // Show notification if enabled
        if (notifications) {
          Alert.alert("Success", "File safely vaulted in the cloud! 🚀");
        }
      }
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  }

  // Navigate to file details
  const handleFilePress = (item: DocumentItem) => {
    // Using Link with state or router.push with params
    router.push({
      pathname: '/file-details',
      params: {
        id: item.id,
        fileName: item.file_name,
        fileSize: item.file_size,
        mimeType: item.mime_type,
        downloadUrl: item.download_url,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#0F0F1E' : '#FFFFFF' }]}>
      {/* Modern Header */}
      <View style={[styles.header, { borderBottomColor: darkMode ? '#2D2D4A' : '#E0E0E0' }]}>
        <Text style={[styles.title, { color: darkMode ? '#FFFFFF' : '#000000' }]}>🗂️ Universal File Vault</Text>
      </View>

      {/* Upload Action Button */}
      <TouchableOpacity 
        style={[styles.uploadButton, uploading && styles.disabledButton]} 
        onPress={handleUpload}
        disabled={uploading}
        activeOpacity={0.8}
      >
        {uploading ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
        ) : (
          <Text style={styles.buttonText}>+ Add Document</Text>
        )}
      </TouchableOpacity>

      {/* Section Label */}
      <Text style={[styles.sectionHeader, { color: darkMode ? '#A0AEC0' : '#666666' }]}>Recent Files ({documents.length})</Text>

      {/* Files List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: darkMode ? '#1A1A2E' : '#F5F5F5' }]} 
              onPress={() => handleFilePress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: darkMode ? '#2D2D4A' : '#EEEEEE' }]}>
                <Text style={styles.fileIcon}>📎</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.fileName, { color: darkMode ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>{item.file_name}</Text>
                <Text style={[styles.fileMeta, { color: darkMode ? '#8892B0' : '#999999' }]}>
                  {(item.file_size / 1024).toFixed(1)} KB • {item.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No files uploaded yet.{'\n'}Add your first document to get started!</Text>
            </View>
          }
          style={styles.list}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

// Custom StyleSheet Configuration
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F0F1E', 
    paddingTop: 48, 
    paddingHorizontal: 16 
  },
  header: { 
    marginBottom: 40, 
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    letterSpacing: -0.5,
    textAlign: 'center'
  },
  uploadButton: { 
    backgroundColor: '#6366F1',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  disabledButton: { 
    backgroundColor: '#4F46E5',
    opacity: 0.6,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionHeader: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#A0AEC0', 
    marginTop: 8,
    marginBottom: 16, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
  },
  list: { 
    flex: 1,
    marginBottom: 16,
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#1A1A2E',
    marginBottom: 12, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D4A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: '#2D2D4A',
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fileIcon: { 
    fontSize: 24 
  },
  cardContent: { 
    flex: 1 
  },
  fileName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fileMeta: { 
    fontSize: 13, 
    color: '#8892B0', 
    marginTop: 2,
    fontWeight: '500',
  },
  arrowIcon: { 
    fontSize: 20, 
    color: '#6366F1', 
    marginLeft: 12,
    fontWeight: 'bold',
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: { 
    fontSize: 56, 
    marginBottom: 16,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#8892B0', 
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  }
});
