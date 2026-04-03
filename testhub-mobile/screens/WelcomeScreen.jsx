import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  // Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ onGetStarted }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Background Abstract Shapes */}
      <View
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 250,
          height: 250,
          borderRadius: 125,
          backgroundColor: '#f9731620',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: '#f9731610',
        }}
      />

      {/* Main Content */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Large Icon */}
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: '#f9731620',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <Icon name="school-outline" size={70} color="#f97316" />
        </View>

        {/* Welcome Text */}
        <Animated.Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 12,
            transform: [{ translateY: slideAnim }],
          }}
        >
          Welcome to TestHub!
        </Animated.Text>

        <Animated.Text
          style={{
            fontSize: 16,
            color: '#aaa',
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 40,
            transform: [{ translateY: slideAnim }],
          }}
        >
          Your ultimate companion for competitive exam preparation
        </Animated.Text>

        {/* Feature Cards */}
        <View style={{ flexDirection: 'row', gap: 15, marginBottom: 50, flexWrap: 'wrap', justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', width: 100 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="document-text" size={24} color="#f97316" />
            </View>
            <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center' }}>1000+ Tests</Text>
          </View>
          <View style={{ alignItems: 'center', width: 100 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="analytics" size={24} color="#f97316" />
            </View>
            <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center' }}>AI Analysis</Text>
          </View>
          <View style={{ alignItems: 'center', width: 100 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="trophy" size={24} color="#f97316" />
            </View>
            <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center' }}>All India Rank</Text>
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#f97316',
            paddingHorizontal: 40,
            paddingVertical: 16,
            borderRadius: 30,
            width: '80%',
            alignItems: 'center',
            marginBottom: 20,
          }}
          onPress={onGetStarted}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Get Started</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={onGetStarted}>
          <Text style={{ color: '#f97316', fontSize: 14 }}>Already have an account? Login →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}