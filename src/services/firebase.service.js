import firebase from 'firebase';

import { firebaseConfig } from './private';

export const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();

export function loginGoogle(options) {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider);
}
