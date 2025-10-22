// Import the functions you need from the SDKs you need
// FIX: Use Firebase v8 compact syntax for imports.
// FIX: The project uses the Firebase v9+ SDK with v8 syntax, causing type errors.
// Using the 'compat' libraries provides a compatibility layer for the v8 API.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDCZkd9bf4k5I0BIi3jnaWtpeodA-Z1TNo",
    authDomain: "worktms-52686.firebaseapp.com",
    projectId: "worktms-52686",
    storageBucket: "worktms-52686.firebasestorage.app",
    messagingSenderId: "77521169973",
    appId: "1:77521169973:web:b9a9750d0656dcb01dcb7c",
    measurementId: "G-05VS76PKEY"
};

// Initialize Firebase
// FIX: Use Firebase v8 compact syntax for initialization.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

export { db, firebase };