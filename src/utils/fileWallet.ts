import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';

export interface UploadedDocument {
  id: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  download_url: string;
}

/**
 * Handles document picking and uploading to Supabase storage
 */
export async function pickAndUploadDocument(): Promise<UploadedDocument[]> {
  try {
    // 1. Fetch current active session to fulfill RLS user_id constraints
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      throw new Error('Authentication required before uploading documents.');
    }

    const userId = session.user.id;

    // 2. Open document picker interface
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
    });

    if (result.canceled) {
      return [];
    }

    const file = result.assets[0];
    const fileName = file.name;
    const fileSize = file.size || 0;
    const mimeType = file.mimeType || 'application/octet-stream';

    // 3. Convert the file URI address into a streamable binary blob
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // 4. Update the path storage structure to match your schema RLS rules:
    // Pattern must be: {bucket_id}/{auth.uid()}/{timestamp}-{filename}
    const storagePath = `${userId}/${Date.now()}-${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vault-files') // ⚠️ Corrected target bucket name
      .upload(storagePath, blob, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 5. Retrieve access path referencing the explicit bucket layout
    const { data: urlData } = supabase.storage
      .from('vault-files') // ⚠️ Corrected target bucket name
      .getPublicUrl(storagePath);

    const downloadUrl = urlData?.publicUrl || '';

    // 6. Save metadata matching your precise table schema parameters
    const { data: dbData, error: dbError } = await supabase
      .from('user_documents')
      .insert({
        user_id: userId, // ⚠️ Required field from your SQL schema setup
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        download_url: downloadUrl,
        storage_path: storagePath,
      })
      .select();

    if (dbError) throw dbError;

    return (dbData as UploadedDocument[]) || [];
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}
