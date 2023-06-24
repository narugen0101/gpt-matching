import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();
const storage = app.storage();

const count = async (collection, field, operator, value) => {
  const collectionSnapshot = await db
    .collection(collection)
    .where(field, operator, value)
    .get();
  return collectionSnapshot.docs.length;
};

// ここに GoogleAuthProvider をエクスポートするように追加
const GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();

export { app, auth, db, firebase, storage, GoogleAuthProvider, count };
