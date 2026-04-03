import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

// Import Screens
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoadingScreen from './screens/LoadingScreen';
import HomeScreen from './screens/HomeScreen';
import ExamsScreen from './screens/ExamsScreen';
import TestsScreen from './screens/TestsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TestScreen from './screens/TestScreen';
import ResultScreen from './screens/ResultScreen';
import ExamDetailScreen from './screens/ExamDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
 
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ Main Tabs Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Exams: focused ? 'book' : 'book-outline',
            Tests: focused ? 'document-text' : 'document-text-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTitleStyle: { color: 'white' },
        tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#222' }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Exams" component={ExamsScreen} />
      <Tab.Screen name="Tests" component={TestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ✅ Main Stack Navigator
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ✅ Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [appState, setAppState] = useState('splash'); // splash, welcome, loading, main, auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Initial flow: Splash → Welcome → Check Auth → Load Data → Main/Auth
    const timer = setTimeout(() => {
      setAppState('welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = async () => {
    setAppState('loading');
    
    // Check if user is already logged in
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      setIsLoggedIn(true);
      setLoadingData(false);
      setAppState('main');
    } else {
      setLoadingData(false);
      setAppState('auth');
    }
  };

  const handleLoginSuccess = () => {
    setAppState('loading');
    setTimeout(() => {
      setIsLoggedIn(true);
      setAppState('main');
    }, 1500);
  };

  // Splash Screen
  if (appState === 'splash') {
    return <SplashScreen onFinish={() => setAppState('welcome')} />;
  }

  // Welcome Screen
  if (appState === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  // Loading Screen (while fetching data)
  if (appState === 'loading') {
    return <LoadingScreen />;
  }

  // Main App or Auth
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {isLoggedIn ? <MainStack /> : <AuthStack onLoginSuccess={handleLoginSuccess} />}
    </NavigationContainer>
  );
}