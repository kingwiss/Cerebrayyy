// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v9+, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbbaUMZXIx7USImHDKNKWTBT4rrMXcoRA",
  authDomain: "cerebrayy.firebaseapp.com",
  projectId: "cerebrayy",
  storageBucket: "cerebrayy.firebasestorage.app",
  messagingSenderId: "1078822973412",
  appId: "1:1078822973412:web:4e45cd9e9de435908a21f1",
  measurementId: "G-BLKMBZ6C9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Analytics
const analytics = getAnalytics(app);

export { auth, analytics };