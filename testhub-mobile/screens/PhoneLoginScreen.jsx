import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { auth } from '../config/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PhoneLoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const sendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    setLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
      setVerificationId(confirmation.verificationId);
      setCodeSent(true);
      Alert.alert('Success', 'OTP sent to your phone!');
    } catch (error) {
      console.error('OTP Error:', error);
      Alert.alert('Error', 'Failed to send OTP. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);
      await auth.signInWithCredential(credential);
      // Navigation handled by auth state listener
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0a0a0a', padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Icon name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>

        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#f97316', textAlign: 'center', marginBottom: 10 }}>
          Phone Login
        </Text>
        <Text style={{ color: '#aaa', textAlign: 'center', marginBottom: 30 }}>
          We'll send you a verification code
        </Text>

        {!codeSent ? (
          <>
            <TextInput
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 15,
                color: 'white',
                fontSize: 18,
                textAlign: 'center',
                borderWidth: 1,
                borderColor: '#333',
                marginBottom: 20,
              }}
              placeholder="+91 98765 43210"
              placeholderTextColor="#666"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={{ backgroundColor: '#f97316', padding: 15, borderRadius: 30, alignItems: 'center' }}
              onPress={sendOTP}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 15,
                color: 'white',
                fontSize: 18,
                textAlign: 'center',
                borderWidth: 1,
                borderColor: '#333',
                marginBottom: 20,
              }}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#666"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#f97316', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 10 }}
              onPress={verifyOTP}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Verify OTP</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={sendOTP}>
              <Text style={{ color: '#f97316', textAlign: 'center' }}>Resend Code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}