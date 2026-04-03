// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPopup, 
  signInWithPhoneNumber 
} from "firebase/auth";

const firebaseConfig = {
  // YAHAN APNI FIREBASE CONSOLE WALI DETAILS DAALEIN
  apiKey: "AIzaSyCfsLb95RQTcLi7heOvR8LXbgwedKlWNVY",
  authDomain: "testhubwebauth.firebaseapp.com",
  projectId: "testhubwebauth",
  storageBucket: "testhubwebauth.firebasestorage.com",
  messagingSenderId: "681814802852",
  appId: "1:681814802852:web:62eafbfedb11095d484131"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Setup Recaptcha for Phone Auth
export const setupRecaptcha = (phoneNumber) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA solved
      }
    });
  }
};