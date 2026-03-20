// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLEiAf3N3DBL0BXVWwy-eDl5z0j3rRMUA",
    authDomain: "gps-traking-pro.firebaseapp.com",
    // Database URL must match the exact regional URL shown in Firebase Console
    databaseURL: "https://gps-traking-pro-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gps-traking-pro",
    storageBucket: "gps-traking-pro.firebasestorage.app",
    messagingSenderId: "509496495878",
    appId: "1:509496495878:web:e398ec16016e5c99c05887"
};

// Initialize Firebase
let app, auth, db;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    alert("Error initializing Firebase. Please check the API keys in assets/js/firebase-config.js.");
}
