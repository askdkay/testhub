import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone: '',
        exam_preparation: 'General',
      });
      await AsyncStorage.setItem('token', res.data.token);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a', padding: 20 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#f97316', textAlign: 'center', marginTop: 40, marginBottom: 10 }}>
        TestHub
      </Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 30 }}>
        Create Account
      </Text>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ color: '#aaa', marginBottom: 5 }}>Full Name</Text>
        <TextInput
          style={{ backgroundColor: '#1a1a1a', borderRadius: 12, padding: 15, color: 'white', borderWidth: 1, borderColor: '#333' }}
          placeholder="Enter your name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ color: '#aaa', marginBottom: 5 }}>Email</Text>
        <TextInput
          style={{ backgroundColor: '#1a1a1a', borderRadius: 12, padding: 15, color: 'white', borderWidth: 1, borderColor: '#333' }}
          placeholder="Enter your email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ color: '#aaa', marginBottom: 5 }}>Password</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
          <TextInput
            style={{ flex: 1, padding: 15, color: 'white' }}
            placeholder="Create a password"
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

      <View style={{ marginBottom: 25 }}>
        <Text style={{ color: '#aaa', marginBottom: 5 }}>Confirm Password</Text>
        <TextInput
          style={{ backgroundColor: '#1a1a1a', borderRadius: 12, padding: 15, color: 'white', borderWidth: 1, borderColor: '#333' }}
          placeholder="Confirm your password"
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={{ backgroundColor: '#f97316', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 }}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={{ color: '#f97316', textAlign: 'center' }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}