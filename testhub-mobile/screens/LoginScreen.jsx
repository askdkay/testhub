import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Login successful - navigation handled by auth state listener
    } catch (error) {
      let message = 'Login failed';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#0a0a0a', padding: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#f97316', textAlign: 'center', marginBottom: 10 }}>
          TestHub
        </Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 30 }}>
          Welcome Back!
        </Text>

        {/* Email Input */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#aaa', marginBottom: 5 }}>Email</Text>
          <TextInput
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 12,
              padding: 15,
              color: 'white',
              borderWidth: 1,
              borderColor: '#333',
            }}
            placeholder="Enter your email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#aaa', marginBottom: 5 }}>Password</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
            <TextInput
              style={{ flex: 1, padding: 15, color: 'white' }}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 15 }}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => setShowResetModal(true)} style={{ marginBottom: 20, alignSelf: 'flex-end' }}>
          <Text style={{ color: '#f97316' }}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={{ backgroundColor: '#f97316', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Login</Text>}
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: '#f97316', textAlign: 'center' }}>Don't have an account? Register</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
          <Text style={{ color: '#666', marginHorizontal: 10 }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
        </View>

        {/* Phone Login Option */}
        <TouchableOpacity
          style={{ backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#f97316', padding: 15, borderRadius: 30, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
          onPress={() => navigation.navigate('PhoneLogin')}
        >
          <Icon name="call-outline" size={20} color="#f97316" />
          <Text style={{ color: '#f97316', fontWeight: 'bold', marginLeft: 10 }}>Login with Phone Number</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Password Reset Modal */}
      {showResetModal && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Reset Password</Text>
            <TextInput
              style={{ backgroundColor: '#2a2a2a', borderRadius: 12, padding: 15, color: 'white', marginBottom: 15 }}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={handlePasswordReset} style={{ backgroundColor: '#f97316', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Send Reset Email</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowResetModal(false)} style={{ padding: 12, alignItems: 'center' }}>
              <Text style={{ color: '#aaa' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}