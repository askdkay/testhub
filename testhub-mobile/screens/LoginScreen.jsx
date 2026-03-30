import React, { useState, useContext } from 'react'; // useContext add kiya
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext'; // 🌟 App.js se Context import kiya

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🌟 Context se signIn function liya
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // 🌟 Yahan direct signIn function call hoga
      // (ye automatically token save karke aapko Home par le jayega)
      await signIn(res.data.token);
      
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
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

        <View style={{ marginBottom: 25 }}>
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

        <TouchableOpacity
          style={{ backgroundColor: '#f97316', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: '#f97316', textAlign: 'center' }}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}