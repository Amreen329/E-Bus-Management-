/**
 * Ebus Management - Firebase Configuration
 * Replace with your Firebase project config from Firebase Console.
 */

const firebaseConfig = {
  apiKey: "AIzaSyAM-n7gXchDl9Tu-zmQ1scDOW_Ka-1Mig0",
  authDomain: "ebus-management-7562a.firebaseapp.com",
  projectId: "ebus-management-7562a",
  storageBucket: "ebus-management-7562a.firebasestorage.app",
  messagingSenderId: "235401880788",
  appId: "1:235401880788:web:50d0ac4e50552198940741",
  measurementId: "G-Y9Z905SZZT"
};

if (typeof window !== 'undefined') {
  window.EbusFirebaseConfig = firebaseConfig;
}
