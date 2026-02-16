// Firebase configuration — replace with your project's values from Firebase Console
// (Project Settings > General > Your apps > Web app config)
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (compat SDK)
firebase.initializeApp(firebaseConfig);

// Expose references for use in other scripts
var auth = firebase.auth();
var db = firebase.firestore();
