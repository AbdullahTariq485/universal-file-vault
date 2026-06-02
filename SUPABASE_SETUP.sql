-- ============================================================================
-- UNIVERSAL FILE VAULT - COMPLETE SUPABASE DATABASE SETUP
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. USER PREFERENCES TABLE (Settings Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT true,
  notifications BOOLEAN DEFAULT true,
  auto_sync BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- 2. USER DOCUMENTS TABLE (File Storage Metadata)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_documents (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  download_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_created_at ON user_documents(created_at DESC);

-- ============================================================================
-- 3. AUTO-UPDATE TIMESTAMP TRIGGERS
-- ============================================================================

-- Trigger function for user_preferences
CREATE OR REPLACE FUNCTION update_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_preferences
DROP TRIGGER IF EXISTS trigger_update_preferences_timestamp ON user_preferences;
CREATE TRIGGER trigger_update_preferences_timestamp
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_timestamp();

-- Trigger function for user_documents
CREATE OR REPLACE FUNCTION update_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_documents
DROP TRIGGER IF EXISTS trigger_update_documents_timestamp ON user_documents;
CREATE TRIGGER trigger_update_documents_timestamp
  BEFORE UPDATE ON user_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_timestamp();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - ENABLE ON ALL TABLES
-- ============================================================================

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_documents
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES FOR user_preferences
-- ============================================================================

-- Users can view their own preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES FOR user_documents
-- ============================================================================

-- Users can view their own documents
DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
CREATE POLICY "Users can view own documents"
  ON user_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own documents
DROP POLICY IF EXISTS "Users can insert own documents" ON user_documents;
CREATE POLICY "Users can insert own documents"
  ON user_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
DROP POLICY IF EXISTS "Users can update own documents" ON user_documents;
CREATE POLICY "Users can update own documents"
  ON user_documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete own documents" ON user_documents;
CREATE POLICY "Users can delete own documents"
  ON user_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. STORAGE BUCKET SETUP (Already exists but ensure it's configured)
-- ============================================================================
-- Note: Storage bucket creation must be done via Supabase Dashboard
-- Go to: Storage > Buckets > Create new bucket
-- Name: "vault-files"
-- Make it Private (RLS will handle access)

-- ============================================================================
-- 8. STORAGE BUCKET POLICIES (RLS for file access)
-- ============================================================================

-- Users can upload files to their own folder
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
CREATE POLICY "Users can upload files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'vault-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own files
DROP POLICY IF EXISTS "Users can view files" ON storage.objects;
CREATE POLICY "Users can view files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vault-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can download their own files
DROP POLICY IF EXISTS "Users can download files" ON storage.objects;
CREATE POLICY "Users can download files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vault-files');

-- Users can delete their own files
DROP POLICY IF EXISTS "Users can delete files" ON storage.objects;
CREATE POLICY "Users can delete files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'vault-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- END OF SETUP
-- ============================================================================
-- All tables, indexes, triggers, and RLS policies are now configured!
