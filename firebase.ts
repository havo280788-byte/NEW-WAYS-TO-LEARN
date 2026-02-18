import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAUmcuxm_Z6pk3TZ3QIWW1J-wGWJDv2T7Y",
    authDomain: "game10-22e63.firebaseapp.com",
    projectId: "game10-22e63",
    storageBucket: "game10-22e63.firebasestorage.app",
    messagingSenderId: "546602582151",
    appId: "1:546602582151:web:08c031d16303fea86bf822"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
