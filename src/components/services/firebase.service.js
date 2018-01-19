import * as firebase from 'firebase'
import { xml2js } from 'xml-js'
import store from '../../store'
import { sair, autenticar, adicionarPessoa, adicionarNota, limparNotas, carregarDominio, adicionarEmpresa } from '../../store/actions'

var config = {
  apiKey: 'apiKey',
  authDomain: 'danfy-4d504.firebaseapp.com',
  databaseURL: 'https://danfy-4d504.firebaseio.com',
  projectId: 'danfy-4d504',
  storageBucket: 'danfy-4d504.appspot.com',
  messagingSenderId: 'messagingSenderId'
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

        pegarDominio((err, dominio) => {
          if (err) console.error(err)
          callback(user, store.getState().usuario, dominio.tipo)
        })
      })
    } else {
      callback(user, null, null)
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
          cep: emit.enderEmit.CEP ? emit.enderEmit.CEP['_text'] : null
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
        chave: notaId,
        emitente: emitenteId,
        destinatario: destinatarioId,
        informacoesEstaduais: {
          estadoGerador: emitente.endereco.estado,
          estadoDestino: destinatario.endereco.estado,
          destinatarioContribuinte: dest.indIEDest['_text']
        },
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

        nota.geral.cfop = prod.CFOP['_text']

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

          nota.geral.cfop = prod.CFOP['_text']

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
        notaReferencia: info.ide.NFref ? info.ide.NFref.refNFe['_text'] : null,
        textoComplementar: info.infAdic ? info.infAdic.infCpl ? info.infAdic.infCpl['_text'] : info.infAdic.infAdFisco ? info.infAdic.infAdFisco['_text'] : null : null
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
  Object.keys(pessoas).forEach((key, index, arr) => {
    if (pessoas[key]) {
      db.ref('Pessoas/' + key).set(pessoas[key], err => {
        if (arr.length - 1 === index) {
          callback(err)
        }
      })
    }
  })
}

export function pegarPessoaId (id, callback) {
  let pessoa
  let storePessoas = store.getState().pessoas
  if (storePessoas[id]) {
    callback(null, storePessoas[id])
  } else {
    db.ref('Pessoas/' + id).once('value').then(value => {
      pessoa = value.val()
      store.dispatch(adicionarPessoa(id, pessoa))
      callback(null, pessoa)
    }, err => {
      callback(err, null)
    })
  }
}

export function procurarNotaPar (notaParametro, callback) {
  if (!notaParametro || !notaParametro.geral) {
    callback(new Error('O primeiro paramêtro não é uma nota Válida!'), null)
  } else {
    let produtosParametro = notaParametro.produtos
    let tipoParametro = notaParametro.geral.tipo

    let notaCb = null

    Object.keys(produtosParametro).forEach(key => {
      pegarNotaProduto(key, produtosParametro[key], (err, notas) => {
        if (err) {
          callback(err, null, null)
        } else if (notas) {
          for (let notaKey in notas) {
            if (notas[notaKey].geral.numero !== notaParametro.geral.numero) {
              if (!notaCb) {
                notaCb = notas[notaKey]
              } else {
                if (tipoParametro === '0' && (notas[notaKey].geral.numero < notaCb.geral.numero) && (notaCb.geral.numero > notaParametro.geral.numero) && (notas[notaKey].geral.cfop !== '1202' || notas[notaKey].geral.cfop !== '2202')) {
                  notaCb = notas[notaKey]
                } else if ((tipoParametro === '1' || (notas[notaKey].geral.cfop === '1202' || notas[notaKey].geral.cfop === '2202')) && (notas[notaKey].geral.numero > notaCb.geral.numero) && (notaCb.geral.numero < notaParametro.geral.numero)) {
                  notaCb = notas[notaKey]
                }
              }
            }
          }
          callback(null, notaCb)
        }
      })
    })
  }
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
    callback(null, notas)
  }, err => {
    callback(err, null)
  })
}

export function gravarNotas (callback) {
  let notas = store.getState().notas
  Object.keys(notas).forEach((key, index, arr) => {
    if (notas[key]) {
      db.ref('Notas/' + key).set(notas[key], err => {
        if (arr.length - 1 === index) {
          callback(err)
        }
      })
    }
  })
}

export function limparNotasStore () {
  store.dispatch(limparNotas())
}

export function pegarNotaChave (chave, callback) {
  let nota
  let storeNotas = store.getState().notas
  if (storeNotas[chave]) {
    callback(null, storeNotas[chave])
  } else {
    db.ref('Notas/' + chave).once('value').then(value => {
      nota = value.val()
      store.dispatch(adicionarNota(chave, nota))
      callback(null, nota)
    }, err => {
      callback(err, null)
    })
  }
}

export function pegarNotaNumeroEmitente (numero, emitente, callback) {
  let storeNotas = store.getState().notas
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
        store.dispatch(adicionarNota(snap.key, val))
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
      callback(null, notas)
    }, err => {
      callback(err, null)
    })
  }, err => {
    callback(err, null)
  })
}

export function compararCFOP (notaInicial, notaFinal) {
  let cfopInicial = notaInicial.geral.cfop
  let cfopFinal = notaFinal.geral.cfop

  let cfopCompra = ['1102']
  let cfopVenda = ['5102', '6102', '6108']
  let cfopConsignacao = ['1917']
  let cfopCompraConsignacao = ['1113']
  let cfopVendaConsignacao = ['5115', '6115', '5114']
  let cfopDevolucaoConsignacao = ['5918']

  if (cfopCompra.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) {
    return true
  } else if (cfopCompraConsignacao.includes(cfopInicial) && cfopVendaConsignacao.includes(cfopFinal)) {
    return true
  } else if (cfopConsignacao.includes(cfopInicial) && cfopCompraConsignacao.includes(cfopFinal)) {
    return true
  } else if (cfopConsignacao.includes(cfopInicial) && cfopDevolucaoConsignacao.includes(cfopFinal)) {
    return true
  } else if ((cfopVenda.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) && (notaFinal.emitente !== notaInicial.emitente)) {
    return true
  } else {
    return false
  }
}

export function compararProduto (notaInicial, notaFinal) {
  let retorno = false

  Object.keys(notaInicial.produtos).forEach(nomeProdutoInicial => {
    Object.keys(notaFinal.produtos).forEach(nomeProdutoFinal => {
      if (nomeProdutoFinal === nomeProdutoInicial) {
        retorno = true
      } else if (notaInicial.produtos[nomeProdutoInicial].descricao === notaFinal.produtos[nomeProdutoFinal].descricao) {
        retorno = true
      }
    })
  })

  return retorno
}

export function compararData (notaInicial, notaFinal) {
  let dataInicial = new Date(notaInicial.geral.dataHora).getTime()
  let dataFinal = new Date(notaFinal.geral.dataHora).getTime()

  if (dataInicial <= dataFinal) {
    return true
  } else {
    return false
  }
}

export function validarMovimento (notaInicial, notaFinal, callback) {
  let err = null

  if (!compararCFOP(notaInicial, notaFinal)) {
    err = new Error(`O CFOP da Nota Inicial ${notaInicial.geral.cfop} não é valido para o CFOP da Nota Final ${notaFinal.geral.cfop}`)
  } else if (!compararProduto(notaInicial, notaFinal)) {
    err = new Error(`O produto da Nota Final não foi localizado na Nota Inicial!`)
  } else if (!compararData(notaInicial, notaFinal)) {
    err = new Error(`A data da Nota Final é anterior a data da Nota Inicial!`)
  }

  callback(err)
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

export function estaNoDominio (cnpj) {
  let empresas = store.getState().dominio.empresas
  let retorno = false

  Object.keys(empresas).forEach(key => {
    if (empresas[key] === cnpj) {
      retorno = true
    }
  })

  return retorno
}

export function adicionarEmpresaDominio (empresa, callback) {
  let dominioId = store.getState().usuario.dominio

  db.ref('Dominios/' + dominioId + '/empresas/' + empresa.num).set(empresa.cnpj, err => {
    store.dispatch(adicionarEmpresa(empresa.num, empresa.cnpj))
    callback(err, store.getState().dominio)
  })
}

export function adicionarEmpresaImpostos (empresa, callback) {
  db.ref('Impostos/' + empresa.cnpj).set(empresa.aliquotas, err => {
    callback(err, empresa.aliquotas)
  })
}

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

export function pegarEmpresaImpostos (empresaCnpj, callback) {
  db.ref('Impostos/' + empresaCnpj).once('value', snap => {
    let aliquotas = snap.val()
    callback(null, aliquotas)
  }, err => {
    callback(err, null)
  })
}

export function gravarMovimentos (movimentos, callback) {
  Object.keys(movimentos).forEach((cnpj, index, arr) => {
    if (movimentos[cnpj]) {
      movimentos[cnpj].forEach(movimento => {
        db.ref('Movimentos/' + cnpj).orderByChild('notaFinal').equalTo(movimento.notaFinal).once('value', snap => {
          if (snap.val()) {
            let erro = new Error('Nota já registrada em outro movimento! ID: ' + Object.keys(snap.val())[0])
            erro.idMovimento = Object.keys(snap.val())[0]
            callback(erro)
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

    if (mes === competencia.mes && ano === competencia.ano) {
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

export function calcularImpostosMovimento (notaInicial, notaFinal) {
  let valorSaida = parseFloat(notaFinal.valor.total)
  let lucro = parseFloat(notaFinal.valor.total) - parseFloat(notaInicial.valor.total)
  let estadoGerador = notaFinal.informacoesEstaduais.estadoGerador
  let estadoDestino = notaFinal.informacoesEstaduais.estadoDestino
  let destinatarioContribuinte = notaFinal.informacoesEstaduais.destinatarioContribuinte

  if (estadoGerador !== 'MG') {
    return 0
  }

  let aliquotas = {
    icms: {
      aliquota: 0.18,
      reducao: 0.2778
    },
    pis: 0.0065,
    cofins: 0.03,
    csll: 0.0288,
    irpj: 0.012
  }

  if (lucro < 0) {
    return {
      lucro: lucro,
      valorSaida: valorSaida,
      impostos: {
        pis: 0,
        cofins: 0,
        csll: 0,
        irpj: 0,
        icms: {
          baseDeCalculo: 0,
          proprio: 0
        },
        total: 0
      }
    }
  }

  let valores = {
    lucro: lucro,
    valorSaida: valorSaida,
    impostos: {
      pis: (lucro * aliquotas.pis).toFixed(2),
      cofins: (lucro * aliquotas.cofins).toFixed(2),
      csll: (lucro * aliquotas.csll).toFixed(2),
      irpj: (lucro * aliquotas.irpj).toFixed(2),
      total: ((lucro * aliquotas.irpj) + (lucro * aliquotas.pis) + (lucro * aliquotas.cofins) + (lucro * aliquotas.csll)).toFixed(2)
    }
  }

  let icmsEstados = {
    SC: {
      externo: 0.12,
      interno: 0.12
    },
    DF: {
      externo: 0.07,
      interno: 0.12
    },
    MS: {
      externo: 0.07,
      interno: 0.17
    },
    MT: {
      externo: 0.07,
      interno: 0.17
    },
    SP: {
      externo: 0.12,
      interno: 0.18
    },
    RJ: {
      externo: 0.12,
      interno: 0.18
    },
    GO: {
      externo: 0.07,
      interno: 0.17
    },
    RO: {
      externo: 0.07,
      interno: 0.175
    },
    ES: {
      externo: 0.07,
      interno: 0.12
    },
    AC: {
      externo: 0.07,
      interno: 0.17
    },
    CE: {
      externo: 0.07,
      interno: 0.17
    },
    PR: {
      externo: 0.12,
      interno: 0.18
    },
    PI: {
      externo: 0.07,
      interno: 0.17
    },
    PE: {
      externo: 0.12,
      interno: 0.18
    },
    MA: {
      externo: 0.07,
      interno: 0.18
    },
    PA: {
      externo: 0.07,
      interno: 0.17
    },
    RN: {
      externo: 0.07,
      interno: 0.18
    },
    BA: {
      externo: 0.07,
      interno: 0.18
    },
    RS: {
      externo: 0.12,
      interno: 0.18
    },
    TO: {
      externo: 0.07,
      interno: 0.18
    }
  }

  let estadosSemReducao = ['RN', 'BA', 'RS', 'TO']

  if (estadoGerador === estadoDestino) {
    valores.impostos.icms = {
      baseDeCalculo: (lucro * aliquotas.icms.reducao).toFixed(2),
      proprio: (lucro * aliquotas.icms.reducao * aliquotas.icms.aliquota).toFixed(2)
    }
    valores.impostos.total = (parseFloat(valores.impostos.total) + (lucro * aliquotas.icms.reducao * aliquotas.icms.aliquota)).toFixed(2)
  } else {
    if (destinatarioContribuinte === '2' || destinatarioContribuinte === '9') {
      let composicaoDaBase = valorSaida / (1 - icmsEstados[estadoDestino].interno)
      let baseDeCalculo = 0.05 * composicaoDaBase
      let baseDifal = estadosSemReducao.includes(estadoDestino) ? composicaoDaBase : baseDeCalculo
      let proprio = baseDifal * icmsEstados[estadoDestino].externo
      let difal = (baseDifal * icmsEstados[estadoDestino].interno) - proprio

      valores.impostos.icms = {
        composicaoDaBase: composicaoDaBase.toFixed(2),
        baseDeCalculo: baseDeCalculo.toFixed(2),
        proprio: proprio.toFixed(2),
        difal: {
          origem: (difal * 0.8).toFixed(2),
          destino: (difal * 0.2).toFixed(2)
        }
      }

      valores.impostos.total = (parseFloat(valores.impostos.total) + (difal * 0.8) + (difal * 0.2) + proprio).toFixed(2)
    } else if (destinatarioContribuinte === '1') {
      let baseDeCalculo = 0.05 * valorSaida
      let valor = baseDeCalculo * icmsEstados[estadoDestino].externo

      valores.impostos.icms = {
        composicaoDaBase: null,
        difal: null,
        baseDeCalculo: baseDeCalculo.toFixed(2),
        proprio: valor.toFixed(2)
      }
      valores.impostos.toatal = parseFloat(valores.impostos.toatal) + valor
    }
  }

  return valores
}

export function excluirMovimento (cnpj, id, callback) {
  db.ref('Movimentos/' + cnpj + '/' + id).set({}, err => {
    callback(err)
  })
}
