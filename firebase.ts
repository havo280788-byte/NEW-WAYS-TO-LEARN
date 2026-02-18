import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBRvcMvef9xx78Z0flL4wW1mvwodO1JrwA",
    authDomain: "learningquest-50743.firebaseapp.com",
    projectId: "learningquest-50743",
    storageBucket: "learningquest-50743.firebasestorage.app",
    messagingSenderId: "256079977788",
    appId: "1:256079977788:web:5e146bc4804d179d895239"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
