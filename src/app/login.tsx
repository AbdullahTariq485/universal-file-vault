import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setLoading(false);
        if (Platform.OS === 'web') {
          window.alert(`Login Error: ${error.message}`);
        } else {
          Alert.alert('Login Failed ❌', error.message);
        }
        return;
      }

      setLoading(false);

      if (Platform.OS === 'web') {
        window.alert('Success 🎉: Logged in successfully!');
        router.replace('/');
      } else {
        Alert.alert('Success 🎉', 'Logged in successfully!', [
          { text: 'Continue', onPress: () => router.replace('/') }
        ]);
      }

    } catch (catchErr: any) {
      setLoading(false);
      const msg = catchErr?.message || 'Network connectivity error instance context.';
      if (Platform.OS === 'web') {
        window.alert(`Connection Error: ${msg}`);
      } else {
        Alert.alert('Network Error ❌', msg);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.logo}>🗂️</Text>
          <Text style={styles.title}>Universal File Vault</Text>
          <Text style={styles.subtitle}>Secure Cloud Storage</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSubtitle}>Welcome back! Please login to your account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="you@example.com"
              placeholderTextColor="#8892B0"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="••••••••"
              placeholderTextColor="#8892B0"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              editable={!loading}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Don't have an account?</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/signup')}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>

          <View style={styles.featuresSection}>
            <FeatureItem icon="🔒" text="End-to-end encrypted storage" />
            <FeatureItem icon="☁️" text="Access files from anywhere" />
            <FeatureItem icon="📊" text="Real-time file synchronization" />
            <FeatureItem icon="🌙" text="Beautiful dark mode included" />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40, justifyContent: 'space-between' },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8892B0' },
  formSection: { marginBottom: 40 },
  formTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  formSubtitle: { fontSize: 14, color: '#8892B0', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#A0AEC0', marginBottom: 8 },
  input: { backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2D2D4A', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#FFFFFF', fontSize: 16 },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  forgotPassword: { color: '#6366F1', fontSize: 14, fontWeight: '600', marginBottom: 24, textAlign: 'right' },
  loginButton: { backgroundColor: '#6366F1', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#2D2D4A' },
  dividerText: { color: '#8892B0', paddingHorizontal: 12, fontSize: 12 },
  signupButton: { borderWidth: 1, borderColor: '#6366F1', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  signupButtonText: { color: '#6366F1', fontSize: 16, fontWeight: '700' },
  featuresSection: { marginTop: 32 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureIcon: { fontSize: 18, marginRight: 12 },
  featureText: { fontSize: 14, color: '#A0AEC0' },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#8892B0', textAlign: 'center', lineHeight: 18 },
  link: { color: '#6366F1', fontWeight: '600' },
});
