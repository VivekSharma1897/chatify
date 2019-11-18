import * as firebase from "firebase";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEc4EMyon8ExWbRM8HnUQvKYVWCUJGRDY",
  authDomain: "chatify-19f3e.firebaseapp.com",
  databaseURL: "https://chatify-19f3e.firebaseio.com",
  projectId: "chatify-19f3e",
  storageBucket: "chatify-19f3e.appspot.com",
  messagingSenderId: "922650289816",
  appId: "1:922650289816:web:11d5a941064e8a4afe92ed"
};

class Firebase {
  constructor() {
    let app = firebase.initializeApp(firebaseConfig);
    this.auth = app.auth();
    this.db = app.database();
    this.storage = app.storage();
  }

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);
  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);
  doSignOut = () => {
    console.log("SIGNEDOUT");
    return this.auth.signOut();
  };
  user = uid => this.db.ref(`users/${uid}`);
  users = () => this.db.ref(`users`);
  posts = () => this.db.ref("posts");
  post = uid => this.db.ref(`posts/${uid}`);
  chat = uid => this.db.ref(`chats/${uid}`);
  getProfileImage = image => this.storage.ref(`profileImages/${image}`);
}

export default Firebase;
