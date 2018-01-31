import * as firebase from 'firebase'
import { storeVuex } from '../../main'
import { sair, autenticar, adicionarPessoa, adicionarNota, adicionarNotaServico,
  carregarDominio, adicionarEmpresa } from '../../store/actions'
import { apiKey, messagingSenderId } from './apiKey'

var config = {
  apiKey: apiKey,
  authDomain: 'danfy-4d504.firebaseapp.com',
  databaseURL: 'https://danfy-4d504.firebaseio.com',
  projectId: 'danfy-4d504',
  storageBucket: 'danfy-4d504.appspot.com',
  messagingSenderId: messagingSenderId
}
firebase.initializeApp(config)

var auth = firebase.auth()
var db = firebase.database()

//  INICIO FUNÇÕES RELACIONADAS A AUTENTICAÇÃO
export function entrar (login, senha, callback) {
  auth.signInWithEmailAndPassword(login, senha).then(user => {
    db.ref('Usuarios/' + user.uid).once('value').then(value => {
      let usuario = value.val()
      db.ref('Dominios/' + usuario.dominio).once('value', snap => {
        storeVuex.commit(autenticar({ email: user.email, token: user.getIdToken(), id: user.uid, nome: usuario.nome, dominio: usuario.dominio, nivel: usuario.nivel }))
        if (snap.val()) {
          callback(null, usuario)
        } else {
          deslogar(err => {
            if (!err) {
              let erro = new Error(`Domínio ${usuario.dominio} não encontrado, favor entrar em contato com o suporte.`)
              erro.code = 'dominio/null'
              callback(erro)
            }
          })
        }
      })
    })
  }, err => {
    callback(err, null)
  })
}
export function deslogar (callback) {
  auth.signOut().then(value => {
    storeVuex.commit(sair())
    callback()
  })
}
export function criarUsuario (dados, callback) {
  firebase.auth().createUserWithEmailAndPassword(dados.login, dados.senha).then(user => {
    storeVuex.commit(autenticar({ nome: dados.nome, dominio: dados.dominio, email: dados.login, token: user.getIdToken(), id: user.uid, nivel: 1 }))
    let usuario = storeVuex.state.usuario

    db.ref('Usuarios/' + usuario.id).set({
      nome: dados.nome,
      dominio: dados.dominio,
      nivel: 1
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

        storeVuex.commit(autenticar({ email: user.email, token: user.getIdToken(), id: user.uid, nome: usuario.nome, dominio: usuario.dominio, nivel: usuario.nivel }))

        pegarDominio((err, dominio) => {
          if (err) {
            console.error(err)
          } else if (dominio) {
            callback(user, usuario, dominio.tipo)
          } else {
            callback(user, usuario, null)
          }
        })
      })
    } else {
      callback(user, null, null)
    }
  })
}
export function trocarSenha (senhaNova, senhaAntiga, login, callback) {
  auth.signInWithEmailAndPassword(login, senhaAntiga).then(user => {
    user.updatePassword(senhaNova).then(() => {
      callback(new Error(`Senha alterada com sucesso!`))
    }, err => callback(err))
  }, err => {
    callback(err)
  }, err => {
    console.error(err)
  })
}
export function alterarDadoUsuario (dado, campo, id, callback) {
  db.ref('Usuarios/' + id + '/' + campo).set(dado, err => {
    if (err) {
      callback(err)
    } else {
      let estadoVuex = {...storeVuex.state.usuario}
      estadoVuex[campo] = dado

      storeVuex.commit(autenticar(estadoVuex))

      callback(null)
    }
  })
}
// FIM DAS FUNÇÕES RELACIONADAS A AUTENTICAÇÃO

// ACESSO DB PESSOAS
export function gravarPessoas (callback) {
  let pessoas = storeVuex.state.pessoas
  let keys = Object.keys(pessoas)
  if (keys.length !== 0) {
    keys.forEach((key, index, arr) => {
      if (pessoas[key]) {
        db.ref('Pessoas/' + key).set(pessoas[key], err => {
          if (arr.length - 1 === index) {
            callback(err)
          }
        })
      }
    })
  } else {
    callback(null)
  }
}
export function gravarPessoa (id, pessoa, callback) {
  db.ref('Pessoas/' + id).set(pessoa, err => {
    callback(err)
  })
}
export function pegarPessoaId (id, callback) {
  let pessoa
  let storeVuexPessoas = storeVuex.state.pessoas
  if (storeVuexPessoas[id]) {
    callback(null, storeVuexPessoas[id])
  } else {
    db.ref('Pessoas/' + id).once('value').then(value => {
      pessoa = value.val()
      storeVuex.commit(adicionarPessoa(id, pessoa))
      callback(null, pessoa)
    }, err => {
      callback(err, null)
    })
  }
}
// FIM ACESSO DB PESSOAS

// ACESSO DB NOTAS
export function gravarNotas (callback) {
  let notas = storeVuex.state.notas
  let keys = Object.keys(notas)
  if (keys.length !== 0) {
    keys.forEach((key, index, arr) => {
      if (notas[key]) {
        db.ref('Notas/' + key).set(notas[key], err => {
          if (arr.length - 1 === index) {
            callback(err)
          }
        })
      }
    })
  } else {
    callback(null)
  }
}
export function gravarNota (chave, nota, callback) {
  db.ref('Notas/' + chave).set(nota, err => {
    callback(err)
  })
}
export function gravarNotaSlim (nota, callback) {
  let mockChave = '999999999'
  nota.chave = mockChave

  db.ref('Notas/').push(nota, err => {
    if (err) {
      console.error(err)
    } else {
      db.ref('Notas/').orderByChild('chave').equalTo(mockChave).once('child_added', snap => {
        let chave = snap.key
        nota.chave = chave
        db.ref('Notas/' + chave).set(nota, err => {
          storeVuex.commit(adicionarNota(chave, nota))
          callback(err, nota)
        })
      })
    }
  })
}
export function pegarNotaProduto (produtoId, produto, callback) {
  let notas = {}

  let query = db.ref('Notas/').orderByChild('emitente')
  query.on('child_added', snap => {
    let nota = snap.val()
    let chave = snap.key
    let listaProdutos = Object.keys(nota.produtos)

    if (listaProdutos.includes(produtoId)) {
      notas = {
        ...notas,
        [chave]: nota
      }
    } else {
      listaProdutos.forEach(key => {
        if (nota.produtos[key].descricao === produto.descricao) {
          notas = {
            ...notas,
            [chave]: nota
          }
        }
      })
    }
  })
  query.once('value', snap => {
    Object.keys(notas).forEach(key => {
      pegarPessoaId(notas[key].emitente, (err) => {
        if (err) {
          console.error(err)
        }
      })
      pegarPessoaId(notas[key].destinatario, (err) => {
        if (err) {
          console.error(err)
        }
      })
      storeVuex.commit(adicionarNota(notas[key].chave, notas[key]))
    })
    callback(null, notas)
  }, err => {
    callback(err, null)
  })
}
export function pegarNotaChave (chave, callback) {
  let nota
  let storeNotas = storeVuex.state.notas
  if (storeNotas[chave]) {
    callback(null, storeNotas[chave])
  } else {
    db.ref('Notas/' + chave).once('value').then(value => {
      nota = value.val()
      storeVuex.commit(adicionarNota(chave, nota))
      callback(null, nota)
    }, err => {
      callback(err, null)
    })
  }
}
export function pegarNotaNumeroEmitente (numero, emitente, callback) {
  let storeNotas = storeVuex.state.notas
  let nota = null

  Object.keys(storeNotas).forEach(key => {
    if (parseInt(storeNotas[key].geral.numero) === parseInt(numero) && storeNotas[key].emitente === emitente) {
      nota = storeNotas[key]
      callback(null, nota)
    }
  })
  if (!nota) {
    let query = db.ref('Notas/').orderByChild('emitente').equalTo(emitente)
    query.on('child_added', snap => {
      let val = snap.val()
      if (parseInt(val.geral.numero) === parseInt(numero)) {
        storeVuex.commit(adicionarNota(snap.key, val))
        nota = val
      }
    }, err => {
      callback(err, null)
    })
    query.once('value', () => {
      callback(null, nota)
    }, err => {
      callback(err, null)
    })
  }
}
export function pegarTodasNotasPessoa (id, callback) {
  let notas = {}
  db.ref('Notas/').orderByChild('emitente').equalTo(id).once('value').then(value => {
    notas = value.val()

    db.ref('Notas/').orderByChild('destinatario').equalTo(id).once('value').then(value2 => {
      let v2 = value2.val()
      notas = {
        ...notas,
        ...v2
      }
      Object.keys(notas).forEach(key => {
        pegarPessoaId(notas[key].emitente, (err) => {
          if (err) {
            console.error(err)
          }
        })
        pegarPessoaId(notas[key].destinatario, (err) => {
          if (err) {
            console.error(err)
          }
        })
        storeVuex.commit(adicionarNota(notas[key].chave, notas[key]))
      })
      callback(null, notas)
    }, err => {
      callback(err, null)
    })
  }, err => {
    callback(err, null)
  })
}
// FIM ACESSO DB NOTAS

// ACESSO DB NOTAS SERVICO
export function gravarNotasServico (callback) {
  let notasServico = storeVuex.state.notasServico
  let keys = Object.keys(notasServico)
  if (keys.length !== 0) {
    keys.forEach((key, index, arr) => {
      if (notasServico[key]) {
        db.ref('NotasServico/' + key).set(notasServico[key], err => {
          if (arr.length - 1 === index) {
            callback(err)
          }
        })
      }
    })
  } else {
    callback(null)
  }
}
export function gravarNotaServico (chave, nota, callback) {
  db.ref('NotasServico/' + chave).set(nota, err => {
    callback(err)
  })
}
export function pegarNotaServicoChave (chave, callback) {
  let notaServico
  let storeNotasServico = storeVuex.state.notasServico
  if (storeNotasServico[chave]) {
    callback(null, storeNotasServico[chave])
  } else {
    db.ref('NotasServico/' + chave).once('value').then(value => {
      notaServico = value.val()
      storeVuex.commit(adicionarNotaServico(chave, notaServico))
      callback(null, notaServico)
    }, err => {
      callback(err, null)
    })
  }
}
// FIM ACESSO DB NOTAS SERVICO

// ACESSO DB MOVIMENTO
export function gravarMovimentos (movimentos, callback) {
  Object.keys(movimentos).forEach((cnpj, index, arr) => {
    let erro

    if (movimentos[cnpj]) {
      movimentos[cnpj].forEach(movimento => {
        db.ref('Movimentos/' + cnpj).orderByChild('notaFinal').equalTo(movimento.notaFinal).once('value', snap => {
          let movimentosRelacionados = snap.val()
          if (movimentosRelacionados) {
            Object.keys(movimentosRelacionados).forEach(key => {
              let movimentoRel = movimentosRelacionados[key]
              if (movimentoRel.metaDados) {
                if (movimentoRel.metaDados.status !== 'CANCELADO') {
                  erro = new Error('Nota já registrada em outro movimento! ID: ' + Object.keys(snap.val())[0])
                  erro.idMovimento = key
                } else {
                  movimento.metaDados.movimentoRef = key
                  movimento.metaDados.tipo = 'SUB'
                }
              } else {
                erro = new Error('Nota já registrada em outro movimento! ID: ' + Object.keys(snap.val())[0])
                erro.idMovimento = key
              }
            })
            if (erro) {
              callback(erro)
            } else {
              db.ref('Movimentos/' + cnpj).push(movimento, err => {
                if (arr.length - 1 === index) {
                  callback(err)
                }
              })
            }
          } else {
            db.ref('Movimentos/' + cnpj).push(movimento, err => {
              if (arr.length - 1 === index) {
                callback(err)
              }
            })
          }
        })
      })
    }
  })
}
export function pegarMovimentosMes (cnpj, competencia, callback) {
  let movimentos = {}
  let query = db.ref('Movimentos/' + cnpj)
  query.orderByChild('data').on('child_added', snap => {
    let movimento = snap.val()
    let movimentoId = snap.key
    let data = new Date(movimento.data)
    let mes = (data.getUTCMonth() + 1).toString()
    let ano = data.getUTCFullYear().toString()

    if (movimento.metaDados) {
      if (movimento.metaDados.status !== 'CANCELADO' && mes === competencia.mes && ano === competencia.ano) {
        movimentos = {
          ...movimentos,
          [movimentoId]: movimento
        }
      }
    } else if (mes === competencia.mes && ano === competencia.ano) {
      movimentos = {
        ...movimentos,
        [movimentoId]: movimento
      }
    }
  })
  query.once('value', snap => {
    callback(null, movimentos)
  }, err => {
    callback(err, null)
  })
}
export function pegarMovimentosPorGeracao (cnpj, competencia, callback) {
  let movimentos = {}
  let query = db.ref('Movimentos/' + cnpj)
  query.orderByChild('data').on('child_added', snap => {
    let movimento = snap.val()

    if (movimento.metaDados) {
      let movimentoId = snap.key
      let data = new Date(movimento.metaDados.dataCriacao)
      let mes = (data.getUTCMonth() + 1).toString()
      let ano = data.getUTCFullYear().toString()

      if (movimento.metaDados.status === 'ATIVO' && mes === competencia.mes && ano === competencia.ano) {
        movimentos = {
          ...movimentos,
          [movimentoId]: movimento
        }
      }
    }
  })
  query.once('value', snap => {
    callback(null, movimentos)
  }, err => {
    callback(err, null)
  })
}
export function pegarMovimentoNotaFinal (cnpj, chaveNota, callback) {
  let query = db.ref('Movimentos/' + cnpj).orderByChild('notaFinal').equalTo(chaveNota)

  let jaFoi = false

  query.on('child_added', snap => {
    let movimento = snap.val()
    if (movimento.metaDados.status === 'ATIVO') {
      callback(null, movimento)
      jaFoi = true
    }
  })
  query.once('value', snap => {
    if (!jaFoi) {
      callback(null, null)
    }
  })
}
export function cancelarMovimento (cnpj, id, callback) {
  db.ref('Movimentos/' + cnpj + '/' + id).once('value', snap => {
    let movimento = snap.val()
    if (movimento.metaDados) {
      movimento.metaDados.status = 'CANCELADO'
    } else {
      movimento.metaDados = {
        criadoPor: 'DESCONHECIDO',
        dataCriacao: new Date('07/19/1997').toISOString(),
        status: 'CANCELADO',
        canceladoPor: storeVuex.state.usuario.email,
        tipo: 'PRIM'
      }
    }
    db.ref('Movimentos/' + cnpj + '/' + id).set(movimento, err => {
      callback(err)
    })
  })
}
// FIM ACESSO DB MOVIMENTO

// ACESSO DB SERVICOS
export function gravarServicos (servicos, callback) {
  Object.keys(servicos).forEach((cnpj, index, arr) => {
    if (servicos[cnpj]) {
      servicos[cnpj].forEach(servico => {
        db.ref('Servicos/' + cnpj).orderByChild('nota').equalTo(servico.nota).once('value', snap => {
          if (snap.val()) {
            let erro = new Error('Nota já registrada em outro serviço! ID: ' + Object.keys(snap.val())[0])
            erro.idMovimento = Object.keys(snap.val())[0]
            callback(erro)
          } else {
            db.ref('Servicos/' + cnpj).push(servico, err => {
              if (arr.length - 1 === index) {
                callback(err)
              }
            })
          }
        })
      })
    }
  })
}
export function pegarServicosMes (cnpj, competencia, callback) {
  let servicos = {}
  let query = db.ref('Servicos/' + cnpj)
  query.orderByChild('data').on('child_added', snap => {
    let servico = snap.val()
    let servicoId = snap.key
    let data = new Date(servico.data)
    let mes = (data.getUTCMonth() + 1).toString()
    let ano = data.getUTCFullYear().toString()

    if (mes === competencia.mes && ano === competencia.ano) {
      servicos = {
        ...servicos,
        [servicoId]: servico
      }
    }
  })
  query.once('value', snap => {
    callback(null, servicos)
  }, err => {
    callback(err, null)
  })
}
export function excluirServico (cnpj, id, callback) {
  db.ref('Servicos/' + cnpj + '/' + id).set({}, err => {
    callback(err)
  })
}
// FIM ACESSO DB SERVICOS

// ACESSO DB DOMINIO
export function gravarDominio (dados, callback) {
  db.ref('Dominios/' + dados.nome).once('value').then(snap => {
    let dominio = snap.val()
    if (dominio) {
      callback(new Error(`Dominio ${dados.nome} já existe!`))
    } else {
      if (dados.tipo === 'unico') {
        if (!dados.cnpj) {
          callback(new Error(`Para registrar um domínio único é necessário informar um CNPJ!`))
        } else {
          pegarDominioPorNome(dados.dominioPai, (err, dominio) => {
            if (err) {
              console.error(err)
            } else {
              let empresas = dominio.empresas

              if (Object.values(empresas).includes(dados.cnpj)) {
                db.ref('Dominios/' + dados.nome).set({
                  tipo: 'unico',
                  empresa: dados.cnpj,
                  dominioPai: dados.dominioPai
                }, err => { callback(err) })
              } else {
                callback(new Error('Esse CNPJ não consta no seu domínio!'))
              }
            }
          })
        }
      } else {
        db.ref('Dominios/' + dados.nome).set({
          tipo: 'mult'
        }, err => { callback(err) })
      }
    }
  })
}
export function pegarDominio (callback) {
  let dominioId = storeVuex.state.usuario.dominio
  let dominio
  db.ref('Dominios/' + dominioId).once('value').then(value => {
    dominio = value.val()
    storeVuex.commit(carregarDominio(dominio))
    callback(null, dominio)
  }, err => {
    callback(err, null)
  })
}
export function pegarDominioPorNome (nome, callback) {
  db.ref('Dominios/' + nome).once('value', snap => {
    let dominio = snap.val()
    callback(null, dominio)
  }, err => { callback(err, null) })
}
export function pegarTodosDominios (callback) {
  db.ref('Dominios').once('value', snap => {
    callback(null, snap.val())
  }, err => callback(err, null))
}
export function deletarDominio (nome, callback) {
  db.ref('Dominios/' + nome).set({}, err => { callback(err) })
}
export function adicionarEmpresaDominio (empresa, callback) {
  let dominioId = storeVuex.state.usuario.dominio

  db.ref('Dominios/' + dominioId + '/empresas/' + empresa.num).set(empresa.cnpj, err => {
    storeVuex.commit(adicionarEmpresa(empresa.num, empresa.cnpj))
    callback(err, storeVuex.state.dominio)
  })
}
export function deletarEmpresaDominio (dominio, numero, callback) {
  db.ref('Dominios/' + dominio + '/empresas/' + numero).set({}, err => {
    callback(err)
  })
}
// FIM ACESSO DB DOMINIO

// ACESSO DB IMPOSTOS
export function adicionarEmpresaImpostos (empresa, callback) {
  db.ref('Impostos/' + empresa.cnpj).set(empresa.aliquotas, err => {
    callback(err, empresa.aliquotas)
  })
}

export function pegarEmpresaImpostos (empresaCnpj, callback) {
  db.ref('Impostos/' + empresaCnpj).once('value', snap => {
    let aliquotas = snap.val()
    callback(null, aliquotas)
  }, err => {
    callback(err, null)
  })
}
// FIM ACESSO DB IMPOSTOS

// CONCATENAÇÃO
export function adicionarDominioEImpostos (empresa, callback) {
  adicionarEmpresaDominio(empresa, err => {
    if (err) {
      console.error(err)
    } else {
      adicionarEmpresaImpostos(empresa, err => {
        if (err) {
          console.error(err)
        } else {
          callback(null)
        }
      })
    }
  })
}
// FIM CONCATENAÇÃO
