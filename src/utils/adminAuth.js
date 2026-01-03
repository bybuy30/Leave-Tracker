import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Sign up a new admin
 * @param {string} email - Admin's email
 * @param {string} password - Admin's password
 * @param {string} fullName - Admin's full name
 * @returns {Promise<{user: Object, adminProfile: Object}>}
 */
export const signUpAdmin = async (email, password, fullName) => {
  try {
    // Step 1: Create account in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Update the user's display name in Auth
    await updateProfile(user, {
      displayName: fullName,
    });

    // Step 3: Store admin profile in Firestore
    const adminProfile = {
      fullName: fullName,
      email: user.email,
      role: 'admin',
      createdAt: serverTimestamp(),
    };

    // Create admin document in Firestore
    const adminDocRef = doc(db, 'admins', user.uid);
    await setDoc(adminDocRef, adminProfile);

    return { user, adminProfile };
  } catch (error) {
    console.error('Error signing up admin:', error);
    throw handleAuthError(error);
  }
};

/**
 * Sign in an existing admin
 * @param {string} email - Admin's email
 * @param {string} password - Admin's password
 * @returns {Promise<Object>}
 */
export const signInAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in admin:', error);
    throw handleAuthError(error);
  }
};

/**
 * Sign out the current admin
 * @returns {Promise<void>}
 */
export const logOutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out admin:', error);
    throw handleAuthError(error);
  }
};

/**
 * Get the current authenticated admin
 * @returns {Object|null}
 */
export const getCurrentAdmin = () => {
  return auth.currentUser;
};

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Callback function that receives the user object
 * @returns {Function} Unsubscribe function
 */
export const onAdminAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get admin profile from Firestore
 * @param {string} uid - Admin's UID
 * @returns {Promise<Object|null>}
 */
export const getAdminProfile = async (uid) => {
  try {
    const adminDocRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      return { id: adminDoc.id, ...adminDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin profile:', error);
    throw error;
  }
};

/**
 * Handle authentication errors and return user-friendly messages
 * @param {Error} error - Firebase error object
 * @returns {Error}
 */
const handleAuthError = (error) => {
  let message = 'An error occurred. Please try again.';

  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'This email is already registered. Please use a different email or sign in.';
      break;
    case 'auth/invalid-email':
      message = 'Invalid email address. Please check and try again.';
      break;
    case 'auth/operation-not-allowed':
      message = 'Email/password accounts are not enabled. Please contact support.';
      break;
    case 'auth/weak-password':
      message = 'Password is too weak. Please use a stronger password.';
      break;
    case 'auth/user-disabled':
      message = 'This account has been disabled. Please contact support.';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email. Please sign up first.';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password. Please try again.';
      break;
    case 'auth/invalid-credential':
      message = 'Invalid email or password. Please check and try again.';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your connection and try again.';
      break;
    case 'auth/configuration-not-found':
      message = 'Authentication is not properly configured. Please enable Email/Password authentication in Firebase Console.';
      break;
    default:
      message = error.message || message;
  }

  const customError = new Error(message);
  customError.code = error.code;
  return customError;
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 16) {
    errors.push('Password must be no more than 16 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};




