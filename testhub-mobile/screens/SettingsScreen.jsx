import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>Settings</Text>
      
      <TouchableOpacity style={{ padding: 15, backgroundColor: '#1a1a1a', borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ color: 'white' }}>Change Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{ padding: 15, backgroundColor: '#1a1a1a', borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ color: 'white' }}>Notification Preferences</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{ padding: 15, backgroundColor: '#1a1a1a', borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ color: 'white' }}>Language</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{ padding: 15, backgroundColor: '#ff4444', borderRadius: 10, marginTop: 20 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Clear Cache</Text>
      </TouchableOpacity>
    </View>
  );
}