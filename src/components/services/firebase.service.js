import * as firebase from 'firebase'
import store from '../../store'
import { sair, autenticar } from '../../store/actions'

var config = {
  apiKey: 'AIzaSyDj9qOI4GtZwLhX7T9Cm0GZgYp_8E7Qsps',
  authDomain: 'danfy-4d504.firebaseapp.com',
  databaseURL: 'https://danfy-4d504.firebaseio.com',
  projectId: 'danfy-4d504',
  storageBucket: 'danfy-4d504.appspot.com',
  messagingSenderId: '979812955533'
}
firebase.initializeApp(config)

var auth = firebase.auth()
var db = firebase.database()

//  INICIO FUNÇÕES RELACIONADAS A AUTENTICAÇÃO
export function entrar (login, senha, callback) {
  auth.signInWithEmailAndPassword(login, senha).then(user => {
    db.ref('Usuarios/' + user.uid).once('value').then(value => {
      let usuario = value.val()

      store.dispatch(autenticar({ email: user.email, token: user.getIdToken(), id: user.uid, nome: usuario.nome, dominio: usuario.dominio }))

      callback(null, store.getState().usuario)
    })
  }, err => {
    callback(err, null)
  })
}

export function deslogar (callback) {
  auth.signOut().then(value => {
    store.dispatch(sair())
    callback()
  })
}

export function criarUsuario (dados, callback) {
  firebase.auth().createUserWithEmailAndPassword(dados.login, dados.senha).then(user => {
    store.dispatch(autenticar({ nome: dados.nome, dominio: dados.dominio, email: dados.login, token: user.getIdToken(), id: user.uid }))

    let usuario = store.getState().usuario

    db.ref('Usuarios/' + usuario.id).set({
      nome: dados.nome,
      dominio: dados.dominio
    }, err => {
      callback(err, usuario)
    })
  }, err => {
    callback(err, null)
  })
}

export function usuarioAtivo (callback) {
  auth.onAuthStateChanged(user => {
    if (user) {
      db.ref('Usuarios/' + user.uid).once('value').then(value => {
        let usuario = value.val()

        store.dispatch(autenticar({ email: user.email, token: user.getIdToken(), id: user.uid, nome: usuario.nome, dominio: usuario.dominio }))

        callback(user, store.getState().usuario)
      })
    } else {
      callback(user, store.getState().usuario)
    }
  })
}
// FIM DAS FUNÇÕES RELACIONADAS A AUTENTICAÇÃO
