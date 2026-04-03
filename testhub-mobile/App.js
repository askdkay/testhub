import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🌟 Apni Purani File ke Context aur Components
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';

// Screens Import
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
import PhoneLoginScreen from './screens/PhoneLoginScreen';

// import OtpLoginScreen from './screens/OtpLoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 🌟 Purani file wala Navbar + Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <Navbar {...props} />}
      screenOptions={{ 
        headerShown: false,
        tabBarHideOnKeyboard: true 
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Exams" component={ExamsScreen} />
      {/* Yahan TestsScreen hi aayega */}
      <Tab.Screen name="Tests" component={TestsScreen} /> 
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// 🌟 Purani file wala Stack (Jisme TestScreen aur ResultScreen ekdum theek the)
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen name="TestScreen" component={TestScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="OtpLogin" component={OtpLoginScreen} /> */}
      <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />


    </Stack.Navigator>
  );
}

export default function App() {
  // 🌟 Nayi file wala state flow
  const [appState, setAppState] = useState('splash'); // splash, welcome, loading, ready
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Initial flow: Splash screen 2.5 seconds ke liye dikhegi, fir Welcome par jayegi
    const timer = setTimeout(() => {
      setAppState('welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Jab user Welcome screen par 'Get Started' dabayega
  const handleGetStarted = async () => {
    setAppState('loading'); // Pehle loading screen dikhao
    
    // Check karo ki user logged in hai ya nahi
    const token = await AsyncStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    
    // Data check hone ke baad app ko 'ready' kardo (jisse navigation chalega)
    setAppState('ready'); 
  };

  // 🌟 Purani file wala Context (Login/Logout functionality ke liye)
  const authContextValue = {
    signIn: async (token) => {
      await AsyncStorage.setItem('token', token);
      setAppState('loading'); // Login hote hi halka sa loading aayega
      setTimeout(() => {
        setIsLoggedIn(true);
        setAppState('ready'); // Loading ke baad sidha Home par
      }, 1000);
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  };

  // 1. Splash Screen
  if (appState === 'splash') {
    return <SplashScreen onFinish={() => setAppState('welcome')} />;
  }

  // 2. Welcome Screen
  if (appState === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  // 3. Loading Screen (Background tasks check karne ke liye)
  if (appState === 'loading') {
    return <LoadingScreen />;
  }

  // 4. Main App (Navigation start hoga yahan se)
  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <StatusBar style="light" />
        {isLoggedIn ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}