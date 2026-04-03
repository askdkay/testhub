import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';

// Your Firebase config (from environment variables)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate config
const isValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

if (!isValidConfig) {
    console.error('❌ Firebase config is missing! Check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Custom parameters for better UX
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// ✅ Google Sign In function
const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Google Sign In Error:', error);
        throw error;
    }
};

// ✅ Setup Recaptcha for Phone Auth
const setupRecaptcha = () => {
    const container = document.getElementById('recaptcha-container');
    if (!container) {
        console.error('Recaptcha container not found');
        return null;
    }
    
    if (window.recaptchaVerifier) {
        return window.recaptchaVerifier;
    }
    
    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
                console.log('Recaptcha resolved');
            },
            'expired-callback': () => {
                console.log('Recaptcha expired');
                window.recaptchaVerifier = null;
            }
        });
        return window.recaptchaVerifier;
    } catch (error) {
        console.error('Recaptcha setup error:', error);
        return null;
    }
};

// ✅ Send OTP for Phone Login
const sendOTP = async (phoneNumber, appVerifier) => {
    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        return confirmationResult;
    } catch (error) {
        console.error('Send OTP Error:', error);
        throw error;
    }
};

export { 
    auth, 
    googleProvider, 
    signInWithGoogle,
    setupRecaptcha,
    sendOTP
};