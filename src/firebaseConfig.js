import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAerG6SgbMROpGotBFnZ7a5C04N0NOjlZU",
  authDomain: "gpt-matching.firebaseapp.com",
  projectId: "gpt-matching",
  storageBucket: "gpt-matching.appspot.com",
  messagingSenderId: "831976048932",
  appId: "1:831976048932:web:5b9467eff090cccd3bcbb1",
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
