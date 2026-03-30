import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ alignItems: 'center', padding: 30 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ fontSize: 36, color: 'white', fontWeight: 'bold' }}>
            {user?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{user?.name}</Text>
        <Text style={{ color: '#aaa', marginTop: 5 }}>{user?.email}</Text>
      </View>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, marginBottom: 10 }}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings-outline" size={24} color="#f97316" />
          <Text style={{ color: 'white', fontSize: 16, marginLeft: 15 }}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, marginBottom: 10 }}
          onPress={() => navigation.navigate('Exams')}
        >
          <Icon name="book-outline" size={24} color="#f97316" />
          <Text style={{ color: 'white', fontSize: 16, marginLeft: 15 }}>My Exams</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 12, marginTop: 20 }}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={24} color="#ff4444" />
          <Text style={{ color: '#ff4444', fontSize: 16, marginLeft: 15 }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}