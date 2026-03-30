import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

export default function TestScreen({ route, navigation }) {
  const { testId } = route.params;
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  useEffect(() => {
    if (test && test.duration) {
      setTimeLeft(test.duration * 60);
    }
  }, [test]);

  // Timer Effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && test) {
      handleAutoSubmit();
    }
  }, [timeLeft]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tests/${testId}`);
      setTest(res.data);
      setQuestions(res.data.questions || []);
    } catch (error) {
      console.error('Error fetching test:', error);
      Alert.alert('Error', 'Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    Alert.alert("Time's Up!", 'Your test has been auto-submitted.', [
      { text: 'OK', onPress: handleSubmit },
    ]);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const toggleMarkForReview = (questionId) => {
    if (markedForReview.includes(questionId)) {
      setMarkedForReview(markedForReview.filter(id => id !== questionId));
    } else {
      setMarkedForReview([...markedForReview, questionId]);
    }
  };

  // 🌟 FIX: Updated handleSubmit
  const handleSubmit = async () => {
    console.log('Submit clicked, navigating to Result...');
    setShowSubmitModal(false); // 🌟 Pehle modal band karo
    
    // Calculate simple score for UI before sending to backend (if needed)
    let score = 0;
    questions.forEach((q) => {
        if(answers[q.id] === q.correct_option) {
            score++;
        }
    });

    // 🌟 Make sure the name matches what's in App.js EXACTLY
    navigation.replace('ResultScreen', { // Note: replace use kiya taaki back press par wapas test mein na aaye
      score: score,
      totalQuestions: questions.length,
      totalMarks: questions.length * 4,
      percentage: (score / questions.length) * 100,
      testTitle: test?.title,
      testId: testId,
      answers: answers // Agar result screen pe analysis dikhana ho
    });
  };

  const getQuestionStatus = (questionId) => {
    if (answers[questionId]) return 'answered';
    if (markedForReview.includes(questionId)) return 'review';
    return 'unanswered';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 300) return '#ff4444';
    if (timeLeft < 600) return '#ffaa44';
    return '#4caf50';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: '#aaa', marginTop: 10 }}>Loading test...</Text>
      </View>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>No questions found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, padding: 10, backgroundColor: '#f97316', borderRadius: 8 }}
        >
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#1a1a1a', paddingHorizontal: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#333' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close-outline" size={28} color="#aaa" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' }} numberOfLines={1}>
            {test.title}
          </Text>
          <TouchableOpacity onPress={() => setShowPalette(true)}>
            <Icon name="grid-outline" size={24} color="#f97316" />
          </TouchableOpacity>
        </View>

        {/* Timer & Progress */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="time-outline" size={20} color={getTimerColor()} />
            <Text style={{ color: getTimerColor(), fontSize: 24, fontWeight: 'bold', marginLeft: 8 }}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <Text style={{ color: '#aaa' }}>
            Q{currentIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 10 }}>
          <View
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              height: 4,
              backgroundColor: '#f97316',
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      {/* Question Area */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Question Text */}
        <View style={{ marginBottom: 25 }}>
          <Text style={{ color: 'white', fontSize: 18, lineHeight: 26 }}>
            {currentQuestion.question_text}
          </Text>
          {currentQuestion.question_text_hindi && (
            <Text style={{ color: '#888', fontSize: 14, marginTop: 8, fontStyle: 'italic' }}>
              {currentQuestion.question_text_hindi}
            </Text>
          )}
        </View>

        {/* Options */}
        <View style={{ gap: 12 }}>
          {['A', 'B', 'C', 'D'].map((option) => {
            const optionText = currentQuestion[`option_${option.toLowerCase()}`];
            if(!optionText) return null; // Safe check if option doesn't exist

            const isSelected = answers[currentQuestion.id] === option;
            
            return (
              <TouchableOpacity
                key={option}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.15)' : '#1a1a1a',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? '#f97316' : '#333',
                  marginBottom: 10 // Added margin for spacing without gap
                }}
                onPress={() => handleAnswer(currentQuestion.id, option)}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isSelected ? '#f97316' : '#333',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{option}</Text>
                </View>
                <Text style={{ color: 'white', flex: 1 }}>{optionText}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      {/* 🌟 FIX: Isko ScrollView ke bahar rakha hai aur absolute bottom pe set kiya hai */}
      <View style={{ 
        padding: 15, 
        borderTopWidth: 1, 
        borderTopColor: '#333', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        backgroundColor: '#0a0a0a',
        position: 'absolute',
        bottom: 0,
        width: '100%'
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: '#2a2a2a',
            borderRadius: 10,
            alignItems: 'center',
            opacity: currentIndex === 0 ? 0.5 : 1,
            marginRight: 10
          }}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(currentIndex - 1)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 12,
            backgroundColor: markedForReview.includes(currentQuestion.id) ? '#ffaa44' : '#2a2a2a',
            borderRadius: 10,
            alignItems: 'center',
            width: 50,
            marginRight: 10
          }}
          onPress={() => toggleMarkForReview(currentQuestion.id)}
        >
          <Icon name="flag-outline" size={20} color="white" />
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: '#4caf50',
              borderRadius: 10,
              alignItems: 'center',
            }}
            onPress={() => setShowSubmitModal(true)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: '#f97316',
              borderRadius: 10,
              alignItems: 'center',
            }}
            onPress={() => setCurrentIndex(currentIndex + 1)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question Palette Modal */}
      <Modal visible={showPalette} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Question Palette</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}>
                <Icon name="close" size={24} color="#aaa" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#4caf50', marginRight: 5 }} />
                <Text style={{ color: '#aaa', fontSize: 12 }}>Answered</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ffaa44', marginRight: 5 }} />
                <Text style={{ color: '#aaa', fontSize: 12 }}>Review</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#666', marginRight: 5 }} />
                <Text style={{ color: '#aaa', fontSize: 12 }}>Unanswered</Text>
              </View>
            </View>

            <FlatList
              data={questions}
              numColumns={5}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => {
                const status = getQuestionStatus(item.id);
                let bgColor = '#333';
                if (status === 'answered') bgColor = '#4caf50';
                else if (status === 'review') bgColor = '#ffaa44';
                if (currentIndex === index) bgColor = '#f97316';

                return (
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentIndex(index);
                      setShowPalette(false);
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: bgColor,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: 6,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{index + 1}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal visible={showSubmitModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#1a1a1a', borderRadius: 20, padding: 25, width: '85%' }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
              Submit Test?
            </Text>
            <Text style={{ color: '#aaa', textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
              {markedForReview.length > 0 && `\n${markedForReview.length} questions marked for review.`}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, backgroundColor: '#333', borderRadius: 10, marginRight: 10 }}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, backgroundColor: '#f97316', borderRadius: 10 }}
                onPress={handleSubmit}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}