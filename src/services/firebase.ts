/**
 * ==============================================================================
 * FIREBASE CLIENT SERVICE
 * ==============================================================================
 * Connects your web application to Firebase Authentication, Firestore Database,
 * and Cloud Storage.
 *
 * For Beginners:
 * - Credentials are read from your `.env` file (VITE_FIREBASE_* variables).
 * - Passwords are ONLY processed by Firebase Auth and are NEVER stored in
 *   Firestore or logs.
 * ==============================================================================
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// 1. Firebase configuration read from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if actual configuration is set
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'AIzaSyDemo_ReplaceWithYourFirebaseApiKey' &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'saimoon-portfolio'
);

// 2. Initialize Firebase (Singleton pattern to prevent duplicate app initialization)
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// 3. User Profile Interface stored in Firestore: users/{uid}
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  creditBalance: number;
  emailVerified: boolean;
  driveFolderId?: string;
  driveFolderUrl?: string;
  createdAt: unknown;
  lastLoginAt: unknown;
  role: 'user' | 'admin';
}

/**
 * Validates a Bangladeshi Mobile Phone Number.
 * Accepted formats:
 * - 01712345678 (11 digits, starts with 013, 014, 015, 016, 017, 018, 019)
 * - +8801712345678
 * - 8801712345678
 */
export function validateBDPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // RegEx checks optional +88 or 88 prefix, then 01 followed by operator digit 3-9, followed by 8 digits
  const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
  return bdPhoneRegex.test(cleaned);
}

/**
 * Normalizes a Bangladeshi phone number into standard international format (+8801XXXXXXXXX).
 */
export function formatBDPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+88')) return cleaned;
  if (cleaned.startsWith('88')) return `+${cleaned}`;
  if (cleaned.startsWith('01')) return `+88${cleaned}`;
  return cleaned;
}

/**
 * Register a new user with Email, Password, Full Name, and Phone Number.
 * 1. Creates user in Firebase Auth.
 * 2. Sends email verification immediately.
 * 3. Creates profile document in Firestore: users/{uid} with 0 credits.
 *    (100 free credits are granted by Cloud Functions once email is verified!)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  phoneNumber: string
): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();
  const normalizedPhone = formatBDPhoneNumber(phoneNumber);

  if (!validateBDPhoneNumber(phoneNumber)) {
    throw new Error('Please enter a valid Bangladeshi phone number (e.g., 01712345678).');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  // 1. Create user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
  const user = userCredential.user;

  // 2. Set display name in Firebase Auth
  await updateProfile(user, {
    displayName: trimmedName,
  });

  // 3. Send verification email immediately
  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.warn('Failed to send verification email automatically:', err);
  }

  // 4. Save user profile in Firestore
  // Note: NEVER store password in Firestore!
  const userDocRef = doc(db, 'users', user.uid);
  const profileData: UserProfile = {
    uid: user.uid,
    fullName: trimmedName,
    email: trimmedEmail,
    phone: normalizedPhone,
    creditBalance: 0, // Server grants 100 free credits upon verification
    emailVerified: false,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    role: 'user',
  };

  await setDoc(userDocRef, profileData);

  return user;
}

/**
 * Sign in existing user with Email and Password.
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);

  // Update last login timestamp in Firestore
  try {
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(
      userDocRef,
      {
        lastLoginAt: serverTimestamp(),
        emailVerified: userCredential.user.emailVerified,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not update last login timestamp:', err);
  }

  return userCredential.user;
}

/**
 * Sign out the currently logged in user.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, trimmedEmail);
}

/**
 * Resend verification email to current user.
 */
export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

/**
 * Real-time listener for user profile and credit balance.
 */
export function subscribeToUserProfile(
  uid: string,
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): () => void {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('Error fetching user profile:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Fetch user profile once.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userDocRef);
  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }
  return null;
}

/**
 * Auth state change listener.
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
