import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function OtpLoginScreen({ navigation, onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const formatPhoneNumber = (number) => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    return `+91${cleaned}`;
  };

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // ✅ Direct login with phone number (no OTP for now)
      const res = await api.post('/auth/phone-login', {
        phone: formatPhoneNumber(phoneNumber),
        firebaseUid: 'test_' + phoneNumber,
        name: `User_${phoneNumber.slice(-4)}`
      });
      
      await AsyncStorage.setItem('token', res.data.token);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800' }}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.3 }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Animated.View style={{
            marginHorizontal: 20,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 32,
            padding: 28,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}>
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Icon name="call-outline" size={40} color="white" />
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937' }}>Login with Mobile</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Enter your mobile number</Text>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Mobile Number</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <Icon name="call-outline" size={20} color="#9ca3af" />
                <TextInput
                  style={{ flex: 1, paddingVertical: 14, marginLeft: 12, fontSize: 16, color: '#1f2937' }}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Test: 9876543210</Text>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: '#f97316', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20 }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Login</Text>}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
              <Text style={{ marginHorizontal: 12, color: '#9ca3af', fontSize: 12 }}>OR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ textAlign: 'center', color: '#f97316', fontSize: 14 }}>Login with Email →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}