import * as firebase from 'firebase'
import { xml2js } from 'xml-js'
import store from '../../store'
import { sair, autenticar, adicionarPessoa, adicionarNota, carregarDominio, adicionarEmpresa } from '../../store/actions'

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

        pegarDominio(err => {
          if (err) console.error(err)
          callback(user, store.getState().usuario)
        })
      })
    } else {
      callback(user, store.getState().usuario)
    }
  })
}
// FIM DAS FUNÇÕES RELACIONADAS A AUTENTICAÇÃO

export function lerNotasInput (files, callback) {
  let arquivos = files
  let todosArquivos = arquivos.length
  let lidos = 0

  let pessoas = {}
  let canceladas = {}
  let notas = {}

  for (let index = 0; index < todosArquivos; index++) {
    let leitor = new window.FileReader()

    let arquivo = arquivos[index]

    leitor.readAsText(arquivo)

    leitor.onload = () => {
      let dados = leitor.result
      let obj = xml2js(dados, { compact: true })

      if (obj.envEvento) {
        if (obj.envEvento.evento.Signature) {
          canceladas[obj.envEvento.evento.infEvento.chNFe['_text']] = true
          return 0
        }
      }

      if (!obj.nfeProc) return 0
      if (!obj.nfeProc.NFe) return 0
      if (!obj.nfeProc.NFe.Signature) return 0

      let info = obj.nfeProc.NFe.infNFe

      if (!info.ide.tpAmb['_text'] === '1') return 0

      let notaId = info['_attributes'].Id.split('NFe')[1]

      let emit = info.emit
      let emitenteId = emit.CNPJ['_text']
      let emitente = {
        nome: emit.xNome['_text'],
        endereco: {
          logradouro: emit.enderEmit.xLgr['_text'],
          numero: emit.enderEmit.nro['_text'],
          complemento: emit.enderEmit.xCpl ? emit.enderEmit.xCpl['_text'] : '',
          bairro: emit.enderEmit.xBairro['_text'],
          municipio: {
            codigo: emit.enderEmit.cMun['_text'],
            nome: emit.enderEmit.xMun['_text']
          },
          estado: emit.enderEmit.UF['_text'],
          pais: {
            codigo: emit.enderEmit.cPais['_text'],
            nome: emit.enderEmit.xPais['_text']
          },
          cep: emit.enderEmit.CEP['_text']
        }
      }

      let dest = info.dest
      let destinatarioId = dest.CPF ? dest.CPF['_text'] : dest.CNPJ['_text']
      let destinatario = {
        nome: dest.xNome['_text'],
        endereco: {
          logradouro: dest.enderDest.xLgr['_text'],
          numero: dest.enderDest.nro['_text'],
          complemento: dest.enderDest.xCpl ? dest.enderDest.xCpl['_text'] : '',
          bairro: dest.enderDest.xBairro['_text'],
          municipio: {
            codigo: dest.enderDest.cMun['_text'],
            nome: dest.enderDest.xMun['_text']
          },
          estado: dest.enderDest.UF['_text'],
          pais: {
            codigo: dest.enderDest.cPais['_text'],
            nome: dest.enderDest.xPais['_text']
          },
          cep: dest.enderDest.CEP['_text']
        }
      }

      let nota = {
        emitente: emitenteId,
        destinatario: destinatarioId,
        geral: {
          dataHora: info.ide.dhSaiEnt['_text'],
          naturezaOperacao: info.ide.natOp['_text'],
          numero: info.ide.cNF['_text'],
          tipo: info.ide.tpNF['_text'],
          status: canceladas[notaId] ? 'CANCELADA' : 'NORMAL'
        },
        valor: {
          total: info.total.ICMSTot.vNF['_text']
        }
      }

      let det = info.det
      let produtos = {}

      if (!Array.isArray(det)) {
        let prod = det.prod
        let codigo = prod.cProd['_text']

        let produto = {
          descricao: prod.xProd['_text'],
          quantidade: {
            numero: prod.qCom['_text'],
            tipo: prod.uCom['_text']
          },
          valor: {
            total: prod.vProd['_text']
          }
        }

        produtos = {
          ...produtos,
          [codigo]: produto
        }
      } else {
        det.forEach(val => {
          let prod = val.prod
          let codigo = prod.cProd['_text']

          let produto = {
            descricao: prod.xProd['_text'],
            quantidade: {
              numero: prod.qCom['_text'],
              tipo: prod.uCom['_text']
            },
            valor: {
              total: prod.vProd['_text']
            }
          }

          produtos = {
            ...produtos,
            [codigo]: produto
          }
        })
      }

      nota.produtos = produtos

      nota.complementar = {
        notaReferencia: info.ide.NFref ? info.ide.NFref.refNFe['_text'] : null
      }

      notas = {
        ...notas,
        [notaId]: nota
      }

      store.dispatch(adicionarNota(notaId, nota))

      pessoas = {
        ...pessoas,
        [emitenteId]: emitente,
        [destinatarioId]: destinatario
      }

      store.dispatch(adicionarPessoa(emitenteId, emitente))
      store.dispatch(adicionarPessoa(destinatarioId, destinatario))

      //  FINAL leitor.onload
    }

    leitor.onloadend = () => {
      lidos++

      if (lidos === todosArquivos) {
        Object.keys(canceladas).forEach(id => {
          if (notas[id]) {
            notas[id].geral.status = 'CANCELADA'
            store.dispatch(adicionarNota(id, notas[id]))
          }
        })

        callback(notas, pessoas)
      }
    }
  }
}

export function gravarPessoas (callback) {
  let pessoas = store.getState().pessoas
  Object.keys(pessoas).forEach(key => {
    db.ref('Pessoas/' + key).set(pessoas[key], err => {
      callback(err)
    })
  })
}

export function pegarPessoaId (id, callback) {
  let pessoa
  db.ref('Pessoas/' + id).once('value').then(value => {
    pessoa = value.val()
    callback(null, pessoa)
  }, err => {
    callback(err, null)
  })
}

export function gravarNotas (callback) {
  let notas = store.getState().notas
  Object.keys(notas).forEach(key => {
    db.ref('Notas/' + key).set(notas[key], err => {
      callback(err)
    })
  })
}

export function pegarNotaChave (chave, callback) {
  let nota
  db.ref('Notas/' + chave).once('value').then(value => {
    nota = value.val()
    callback(null, nota)
  }, err => {
    callback(err, null)
  })
}

export function pegarTodasNotasPessoa (id, callback) {
  let notas = {}
  db.ref('Notas/').orderByChild('emitente').equalTo(id).once('value').then(value => {
    notas = value.val()

    db.ref('Notas/').orderByChild('destinatario').equalTo(id).once('value').then(value2 => {
      let v2 = value2.val()
      notas = {
        ...notas,
        v2
      }

      Object.keys(notas).forEach(id => {
        store.dispatch(adicionarNota(id, notas[id]))
      })
      callback(null, notas)
    }, err => {
      callback(err, null)
    })
  }, err => {
    callback(err, null)
  })
}

export function pegarDominio (callback) {
  let dominioId = store.getState().usuario.dominio
  let dominio
  db.ref('Dominios/' + dominioId).once('value').then(value => {
    dominio = value.val()
    store.dispatch(carregarDominio(dominio))
    callback(null, dominio)
  }, err => {
    callback(err, null)
  })
}

export function adicionarEmpresaDominio (empresa, callback) {
  let dominioId = store.getState().usuario.dominio

  db.ref('Dominios/' + dominioId + '/empresas/' + empresa.num).set(empresa.cnpj, err => {
    store.dispatch(adicionarEmpresa(empresa.num, empresa.cnpj))
    callback(err, store.getState().dominio)
  })
}
