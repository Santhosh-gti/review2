import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAqx37uWkdecbqEGfC8JjkOJrWRphr2Yyw",
    authDomain: "aa-module.firebaseapp.com",
    projectId: "aa-module",
    storageBucket: "aa-module.firebasestorage.app",
    messagingSenderId: "296543514466",
    appId: "1:296543514466:web:a330598f1efac78e07863b",
    measurementId: "G-K1GDL6V3Y9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
