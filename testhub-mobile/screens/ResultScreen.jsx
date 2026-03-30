import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ResultScreen({ route, navigation }) {
  // Log to verify data is received
  console.log('ResultScreen params:', route.params);

  const { score, totalQuestions, totalMarks, percentage, testTitle } = route.params || {
    score: 0,
    totalQuestions: 0,
    totalMarks: 0,
    percentage: 0,
    testTitle: 'Test Completed',
  };

  const isPassed = percentage >= 40;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Simple Header with Back Button */}
      <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 15 }}>Results</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        {/* Icon */}
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: isPassed ? '#4caf50' : '#ff4444',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Icon name={isPassed ? 'checkmark' : 'close'} size={50} color="white" />
        </View>

        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
          {isPassed ? 'Congratulations!' : 'Better Luck Next Time!'}
        </Text>

        <Text style={{ color: '#aaa', marginTop: 8, marginBottom: 30, textAlign: 'center' }}>
          {testTitle}
        </Text>

        {/* Score */}
        <View style={{ backgroundColor: '#1a1a1a', borderRadius: 20, padding: 25, alignItems: 'center', width: '100%' }}>
          <Text style={{ color: '#aaa', fontSize: 14 }}>Your Score</Text>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#f97316' }}>
            {score}/{totalMarks}
          </Text>
          <Text style={{ color: '#aaa', fontSize: 14, marginTop: 10 }}>
            {percentage.toFixed(1)}% • {isPassed ? 'Passed' : 'Failed'}
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={{
            backgroundColor: '#f97316',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 30,
            width: '100%',
          }}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Tests' })}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Try Another Test</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}