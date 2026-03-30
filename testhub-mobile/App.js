import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

// 🌟 FIX 2: Context wapas import kiya taaki Login kaam kare
import { AuthContext } from './context/AuthContext';

// Screens
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
import Navbar from './components/Navbar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      // 🌟 YAHAN APNA CUSTOM NAVBAR LAGAYA HAI
      tabBar={props => <Navbar {...props} />}
      screenOptions={{ 
        headerShown: false,
        // Keyboard aane par navbar chhip jayega
        tabBarHideOnKeyboard: true 
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Exams" component={ExamsScreen} />
      <Tab.Screen name="Tests" component={TestScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen name="TestScreen" component={TestScreen} />
      <Stack.Screen name="TestsScreen" component={TestsScreen} />

      <Stack.Screen name="ResultScreen" component={ResultScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  };

  // 🌟 FIX 2: Ye function add karna zaroori hai taaki login/logout kaam kare
  const authContextValue = {
    signIn: async (token) => {
      await AsyncStorage.setItem('token', token);
      setIsLoggedIn(true);
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    // 🌟 FIX 2: Provider se wrap kiya
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <StatusBar style="light" />
        {isLoggedIn ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}