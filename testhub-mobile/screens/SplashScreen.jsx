import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);

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
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Background Gradient Effect */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0a0a0a',
        }}
      />
      
      {/* Animated Content */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Logo Circle */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#f9731620',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#f97316',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="book" size={50} color="white" />
          </View>
        </View>

        {/* App Name */}
        <Animated.Text
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: '#f97316',
            marginBottom: 8,
            transform: [{ translateY: slideAnim }],
          }}
        >
          TestHub
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={{
            fontSize: 16,
            color: '#aaa',
            textAlign: 'center',
            transform: [{ translateY: slideAnim }],
          }}
        >
          Your Gateway to Exam Success
        </Animated.Text>

        {/* Loading Dots */}
        <View style={{ flexDirection: 'row', marginTop: 60, gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#f97316',
                opacity: 0.6,
              }}
            />
          ))}
        </View>

        {/* Version */}
        <Text style={{ position: 'absolute', bottom: 30, color: '#444', fontSize: 12 }}>
          Version 1.0.0
        </Text>
      </Animated.View>
    </View>
  );
}