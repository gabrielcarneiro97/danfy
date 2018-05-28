import firebase from 'firebase';

import { firebaseConfig } from './private';

export const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.database();

export function loginGoogle(/* options */) {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider);
}

export function pegarDominio() {
  return new Promise((resolve, reject) => {
    if (!auth.currentUser) {
      reject(new Error('Nenum usuário logado!'));
    }

    const { uid } = auth.currentUser;

    db.ref(`Usuarios/${uid}`)
      .once('value')
      .then((snap) => {
        const { dominio } = snap.val();

        db.ref(`Dominios/${dominio}`)
          .once('value')
          .then((snap2) => {
            resolve(snap2.val());
          });
      });
  });
}
