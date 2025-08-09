import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

let app: any;
let auth: any;

if (!isBrowser) {
  // Server-side: create dummy objects to prevent errors during SSR
  app = {} as any;
  auth = {} as any;
} else {
  // Client-side: initialize Firebase normally
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Check if we have the required environment variables
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error('Missing Firebase environment variables:', firebaseConfig);
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Auth only (Supabase handles storage and database)
  auth = getAuth(app);

  // Connect to emulators in development (optional)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('Connected to Firebase Auth emulator');
    } catch (error) {
      console.warn('Failed to connect to Firebase Auth emulator:', error);
    }
  }
}

export { auth };
export default app;
