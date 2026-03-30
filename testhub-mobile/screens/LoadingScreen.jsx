import React, { useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function LoadingScreen() {
  const rotateAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Rotation Animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#f9731620',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: pulseAnim }],
        }}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="sync" size={40} color="#f97316" />
        </Animated.View>
      </Animated.View>
      
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 30 }}>
        Loading TestHub
      </Text>
      <Text style={{ color: '#aaa', fontSize: 14, marginTop: 8 }}>
        Preparing your personalized experience...
      </Text>
      
      {/* Progress Dots */}
      <View style={{ flexDirection: 'row', marginTop: 30, gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#f97316',
              opacity: 0.3 + (i * 0.2),
            }}
          />
        ))}
      </View>
    </View>
  );
}