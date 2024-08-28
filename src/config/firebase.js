import { initializeApp } from "firebase/app";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAmO5xTgHo8bBtX91O3ocvscA4b0okppj4",
  authDomain: "interviewai-50ad0.firebaseapp.com",
  projectId: "interviewai-50ad0",
  storageBucket: "interviewai-50ad0.appspot.com",
  messagingSenderId: "33327277709",
  appId: "1:33327277709:web:c8fc299bb75c89b624a4c4",
  measurementId: "G-7QGWNQRZGM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, collection, doc, setDoc, getDoc, storage, ref, getDownloadURL };