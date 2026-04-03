// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPopup, 
  signInWithPhoneNumber,
  signOut
} from "firebase/auth";

// ✅ FIREBASE CONFIG - Environment variables se le rahe hain
// Local: .env file se
// Production: Vercel environment variables se
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCfsLb95RQTcLi7heOvR8LXbgwedKlWNVY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "testhubwebauth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "testhubwebauth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "testhubwebauth.firebasestorage.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "681814802852",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:681814802852:web:62eafbfedb11095d484131"
};

// ✅ Log config for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', {
    apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Set custom parameters for better compatibility
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ✅ Global variable to track recaptcha
let recaptchaVerifier = null;
let recaptchaContainerId = 'recaptcha-container';

// ✅ Setup Recaptcha for Phone Auth - FIXED for production
export const setupRecaptcha = () => {
  // Check if container exists
  const container = document.getElementById(recaptchaContainerId);
  if (!container) {
    console.error('❌ Recaptcha container not found! Add <div id="recaptcha-container"></div> to your HTML');
    return null;
  }

  // Clear existing verifier
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      console.log('Error clearing verifier:', e);
    }
    recaptchaVerifier = null;
  }

  // Create new verifier
  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
      callback: (response) => {
        console.log('✅ reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('⚠️ reCAPTCHA expired');
        recaptchaVerifier = null;
      }
    });
    
    console.log('✅ reCAPTCHA verifier setup complete');
    return recaptchaVerifier;
  } catch (error) {
    console.error('❌ reCAPTCHA setup error:', error);
    return null;
  }
};

// ✅ Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google sign in successful:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('❌ Google sign in error:', error.code, error.message);
    
    // Handle specific errors
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by browser. Please allow popups for this site.');
    }
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Firebase. Add it in Firebase Console → Authentication → Settings → Authorized Domains');
    }
    throw error;
  }
};

// ✅ Send OTP for Phone Login
export const sendOTP = async (phoneNumber) => {
  try {
    // Format phone number
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = `+91${phoneNumber}`;
    }
    
    // Setup recaptcha if not exists
    if (!recaptchaVerifier) {
      setupRecaptcha();
    }
    
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized. Please refresh the page.');
    }
    
    console.log('📱 Sending OTP to:', formattedNumber);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Send OTP error:', error.code, error.message);
    
    let errorMessage = 'Failed to send OTP. Please try again.';
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format. Please enter a valid 10-digit number.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    return { success: false, message: errorMessage };
  }
};

// ✅ Verify OTP for Phone Login
export const verifyOTP = async (otpCode) => {
  try {
    if (!window.confirmationResult) {
      throw new Error('No OTP request found. Please request OTP first.');
    }
    
    console.log('🔐 Verifying OTP...');
    const result = await window.confirmationResult.confirm(otpCode);
    console.log('✅ Phone sign in successful:', result.user.phoneNumber);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('❌ Verify OTP error:', error.code, error.message);
    
    let errorMessage = 'Invalid OTP. Please try again.';
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid OTP code. Please check and try again.';
    } else if (error.code === 'auth/session-expired') {
      errorMessage = 'OTP expired. Please request a new one.';
    }
    
    return { success: false, message: errorMessage };
  }
};

// ✅ Logout from Firebase
export const logout = async () => {
  try {
    await signOut(auth);
    console.log('✅ Logged out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: false };
  }
};

// ✅ Clean up recaptcha (call when component unmounts)
export const cleanupRecaptcha = () => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      console.log('Error clearing verifier:', e);
    }
    recaptchaVerifier = null;
  }
  window.confirmationResult = null;
};