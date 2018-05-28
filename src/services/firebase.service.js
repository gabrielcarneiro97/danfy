import firebase from 'firebase';

import { firebaseConfig } from './private';

export const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.database();

export function loginGoogle(/* options */) {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider);
}

export function pegarDominioId() {
  return new Promise((resolve, reject) => {
    if (!auth.currentUser) {
      reject(new Error('Nenum usuário logado!'));
    }

    const { uid } = auth.currentUser;

    db.ref(`Usuarios/${uid}`)
      .once('value')
      .then((snap) => {
        const { dominio } = snap.val();
        resolve(dominio);
      });
  });
}

export function pegarDominio() {
  return new Promise((resolve, reject) => {
    pegarDominioId().then((dominio) => {
      db.ref(`Dominios/${dominio}`)
        .once('value')
        .then((snap) => {
          resolve(snap.val());
        });
    }).catch(err => reject(err));
  });
}

export function adicionarEmpresaDominio(cnpj, num) {
  return new Promise((resolve, reject) => {
    pegarDominioId().then((dominio) => {
      db.ref(`Dominios/${dominio}/empresas/${num}`)
        .set(cnpj)
        .then(snap => resolve(snap))
        .catch(err => reject(err));
    });
  });
}

export function adicionarEmpresaImpostos(cnpj, aliquotas) {
  return new Promise((resolve, reject) => {
    db.ref(`Impostos/${cnpj}`)
      .set(aliquotas)
      .then(snap => resolve(snap))
      .catch(err => reject(err));
  });
}
