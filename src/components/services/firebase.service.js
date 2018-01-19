import * as firebase from 'firebase'
import { xml2js } from 'xml-js'
import store from '../../store'
import { sair, autenticar, adicionarPessoa, adicionarNota, adicionarNotaServico, limparNotas, limparNotasServico, carregarDominio, adicionarEmpresa } from '../../store/actions'

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
  let notasServico = {}

  for (let index = 0; index < todosArquivos; index++) {
    let leitor = new window.FileReader()

    let arquivo = arquivos[index]

    leitor.readAsText(arquivo)

    leitor.onload = () => {
      let dados = leitor.result
      let obj = xml2js(dados, { compact: true })

      if (obj.CompNfse) {
        lerNfse(obj, (notaServico, emitente, destinatario) => {
          notasServico = {
            ...notasServico,
            [notaServico.chave]: notaServico
          }
          pessoas = {
            ...pessoas,
            [notaServico.emitente]: emitente,
            [notaServico.destinatario]: destinatario
          }
        })
      } else if (obj.envEvento) {
        if (obj.envEvento.evento.Signature) {
          canceladas[obj.envEvento.evento.infEvento.chNFe['_text']] = true
          return 0
        }
      } else {
        lerNfe(obj, (nota, emitente, destinatario) => {
          notas = {
            ...notas,
            [nota.chave]: nota
          }
          pessoas = {
            ...pessoas,
            [nota.emitente]: emitente,
            [nota.destinatario]: destinatario
          }
        })
      }
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

        callback(notas, notasServico, pessoas)
      }
    }
  }
}

export function lerNfse (obj, callback) {
  if (!obj.CompNfse.Nfse.Signature) {
    return 0
  }

  let info = obj.CompNfse.Nfse.InfNfse
  let valorBruto = info.Servico.Valores

  let notaServico = {}

  let valor = {
    servico: valorBruto.ValorServicos['_text'],
    baseDeCalculo: valorBruto.BaseCalculo['_text'],
    iss: {
      valor: valorBruto.ValorIss ? valorBruto.ValorIss['_text'] : null,
      aliquota: valorBruto.Aliquota ? valorBruto.Aliquota['_text'] : null
    },
    retencoes: {
      iss: valorBruto.ValorIssRetido ? valorBruto.ValorIssRetido['_text'] : '0.0',
      irpj: valorBruto.ValorIr ? valorBruto.ValorIr['_text'] : '0.0',
      csll: valorBruto.ValorCsll ? valorBruto.ValorCsll['_text'] : '0.0',
      cofins: valorBruto.ValorCofins ? valorBruto.ValorCofins['_text'] : '0.0',
      pis: valorBruto.ValorPis ? valorBruto.ValorPis['_text'] : '0.0',
      inss: valorBruto.ValorInss ? valorBruto.ValorInss['_text'] : '0.0'
    }
  }

  notaServico.valor = valor

  let emitenteBruto = info.PrestadorServico

  notaServico.emitente = emitenteBruto.IdentificacaoPrestador.Cnpj['_text']

  let emitente = {
    nome: emitenteBruto.RazaoSocial['_text'],
    endereco: {
      logradouro: emitenteBruto.Endereco.Endereco['_text'],
      numero: emitenteBruto.Endereco.Numero['_text'],
      complemento: emitenteBruto.Endereco.Complemento ? emitenteBruto.Endereco.Complemento['_text'] : null,
      bairro: emitenteBruto.Endereco.Bairro,
      municipio: {
        codigo: emitenteBruto.Endereco.CodigoMunicipio['_text']
      },
      estado: emitenteBruto.Endereco.Uf['_text'],
      pais: {
        nome: 'Brasil',
        codigo: '1058'
      },
      cep: emitenteBruto.Endereco.Cep['_text']
    }
  }

  let destinatarioBruto = info.TomadorServico

  notaServico.destinatario = destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cpf ? destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cpf['_text'] : destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cnpj['_text']

  let destinatario = {
    nome: destinatarioBruto.RazaoSocial['_text'],
    endereco: {
      logradouro: destinatarioBruto.Endereco.Endereco['_text'],
      numero: destinatarioBruto.Endereco.Numero['_text'],
      complemento: destinatarioBruto.Endereco.Complemento ? destinatarioBruto.Endereco.Complemento['_text'] : null,
      bairro: destinatarioBruto.Endereco.Bairro,
      municipio: {
        codigo: destinatarioBruto.Endereco.CodigoMunicipio['_text']
      },
      estado: destinatarioBruto.Endereco.Uf['_text'],
      pais: {
        nome: 'Brasil',
        codigo: '1058'
      },
      cep: destinatarioBruto.Endereco.Cep['_text']
    }
  }

  notaServico.geral = {
    numero: info.Numero['_text'],
    dataHora: info.Competencia['_text'],
    status: obj.CompNfse.NfseCancelamento ? 'CANCELADA' : 'NORMAL'
  }

  notaServico.chave = notaServico.emitente + notaServico.geral.numero
  notaServico.servico = true

  store.dispatch(adicionarNotaServico(notaServico.chave, notaServico))
  store.dispatch(adicionarPessoa(notaServico.emitente, emitente))
  store.dispatch(adicionarPessoa(notaServico.destinatario, destinatario))

  callback(notaServico, emitente, destinatario)
}

export function lerNfe (obj, callback) {
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
      status: 'NORMAL'
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

  store.dispatch(adicionarNota(notaId, nota))
  store.dispatch(adicionarPessoa(emitenteId, emitente))
  store.dispatch(adicionarPessoa(destinatarioId, destinatario))

  callback(nota, emitente, destinatario)
}

export function gravarPessoas (callback) {
  let pessoas = store.getState().pessoas
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

export function gravarNotasServico (callback) {
  let notasServico = store.getState().notasServico
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

export function limparNotasStore () {
  store.dispatch(limparNotas())
}

export function limparNotasServicoStore () {
  store.dispatch(limparNotasServico())
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

export function pegarNotaServicoChave (chave, callback) {
  let notaServico
  let storeNotasServico = store.getState().notasServico
  if (storeNotasServico[chave]) {
    callback(null, storeNotasServico[chave])
  } else {
    db.ref('NotasServico/' + chave).once('value').then(value => {
      notaServico = value.val()
      store.dispatch(adicionarNotaServico(chave, notaServico))
      callback(null, notaServico)
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

export function excluirServico (cnpj, id, callback) {
  db.ref('Servicos/' + cnpj + '/' + id).set({}, err => {
    callback(err)
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

export function calcularImpostosServico (notaServico, callback) {
  pegarEmpresaImpostos(notaServico.emitente, (err, aliquotas) => {
    if (err) {
      console.error(err)
    } else {
      let valores = {}

      valores.servico = notaServico.valor.servico

      let baseDeCalculo = notaServico.valor.baseDeCalculo

      let retencoes = notaServico.valor.retencoes
      let iss = notaServico.valor.iss ? notaServico.valor.iss.valor : (baseDeCalculo * aliquotas.iss).toFixed(2)

      valores.impostos = {
        baseDeCalculo: notaServico.valor.baseDeCalculo,
        retencoes: {
          iss: retencoes.iss,
          pis: retencoes.pis,
          cofins: retencoes.cofins,
          csll: retencoes.csll,
          irpj: retencoes.irpj,
          total: (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)).toFixed(2)
        },
        iss: iss,
        pis: (baseDeCalculo * aliquotas.pis).toFixed(2),
        cofins: (baseDeCalculo * aliquotas.cofins).toFixed(2),
        csll: (baseDeCalculo * aliquotas.csll).toFixed(2),
        irpj: (baseDeCalculo * aliquotas.irpj).toFixed(2),
        total: (parseFloat(iss) + (baseDeCalculo * aliquotas.irpj) + (baseDeCalculo * aliquotas.pis) + (baseDeCalculo * aliquotas.cofins) + (baseDeCalculo * aliquotas.csll)).toFixed(2)
      }

      callback(null, valores)
    }
  })
}

export function calcularImpostosMovimento (notaInicial, notaFinal, callback) {
  let valorSaida = parseFloat(notaFinal.valor.total)
  let lucro = parseFloat(notaFinal.valor.total) - parseFloat(notaInicial.valor.total)
  let estadoGerador = notaFinal.informacoesEstaduais.estadoGerador
  let estadoDestino = notaFinal.informacoesEstaduais.estadoDestino
  let destinatarioContribuinte = notaFinal.informacoesEstaduais.destinatarioContribuinte

  if (estadoGerador !== 'MG') {
    callback(new Error('Estado informado não suportado! Estado: ' + estadoGerador), null)
  }

  pegarEmpresaImpostos(notaFinal.emitente, (err, aliquotas) => {
    if (err) {
      console.error(err)
    } else {
      if (!notaFinal.servico) {
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
            valores.impostos.total = parseFloat(valores.impostos.total) + valor
          }
        }

        callback(null, valores)
      }
    }
  })
}

export function excluirMovimento (cnpj, id, callback) {
  db.ref('Movimentos/' + cnpj + '/' + id).set({}, err => {
    callback(err)
  })
}

export function totaisTrimestrais (cnpj, competencia, callback) {
  let trimestres = {}
  trimestres['1'] = ['1']
  trimestres['2'] = ['1', '2']
  trimestres['3'] = ['1', '2', '3']
  trimestres['4'] = ['4']
  trimestres['5'] = ['4', '5']
  trimestres['6'] = ['4', '5', '6']
  trimestres['7'] = ['7']
  trimestres['8'] = ['7', '8']
  trimestres['9'] = ['7', '8', '9']
  trimestres['10'] = ['10']
  trimestres['11'] = ['10', '11']
  trimestres['12'] = ['10', '11', '12']

  let trimestre = {}

  trimestre.totais = {
    lucro: 0,
    servicos: 0,
    impostos: {
      pis: 0,
      cofins: 0,
      csll: 0,
      irpj: 0,
      iss: 0,
      gnre: 0,
      icms: {
        proprio: 0,
        difal: {
          origem: 0,
          destino: 0
        }
      },
      total: 0,
      retencoes: {
        iss: 0,
        irpj: 0,
        csll: 0,
        pis: 0,
        cofins: 0,
        total: 0
      }
    }}

  trimestres[competencia.mes].forEach((mes, id, arr) => {
    let ultimoMes = arr[arr.length - 1]

    trimestre[mes] = {
      servicos: {
        total: 0,
        impostos: {
          retencoes: {
            iss: 0,
            irpj: 0,
            csll: 0,
            pis: 0,
            cofins: 0,
            total: 0
          },
          iss: 0,
          irpj: 0,
          csll: 0,
          pis: 0,
          cofins: 0,
          total: 0
        }
      },
      movimentos: {
        lucro: 0,
        impostos: {
          cofins: 0,
          pis: 0,
          irpj: 0,
          csll: 0,
          icms: {
            proprio: 0,
            difal: {
              origem: 0,
              destino: 0
            }
          },
          total: 0
        }
      },
      totais: {
        lucro: 0,
        servicos: 0,
        impostos: {
          pis: 0,
          cofins: 0,
          csll: 0,
          irpj: 0,
          iss: 0,
          gnre: 0,
          icms: {
            proprio: 0,
            difal: {
              origem: 0,
              destino: 0
            }
          },
          total: 0,
          retencoes: {
            iss: 0,
            irpj: 0,
            csll: 0,
            pis: 0,
            cofins: 0,
            total: 0
          }
        }
      }
    }

    pegarServicosMes(cnpj, {mes: mes, ano: competencia.ano}, (err, servicos) => {
      if (err) {
        console.error(err)
      }
      Object.keys(servicos).forEach(key => {
        let servico = servicos[key]
        trimestre[mes].servicos.total += parseFloat(servico.valores.servico)

        trimestre[mes].servicos.impostos.total += parseFloat(servico.valores.impostos.total)
        trimestre[mes].servicos.impostos.iss += parseFloat(servico.valores.impostos.iss)
        trimestre[mes].servicos.impostos.pis += parseFloat(servico.valores.impostos.pis)
        trimestre[mes].servicos.impostos.cofins += parseFloat(servico.valores.impostos.cofins)
        trimestre[mes].servicos.impostos.csll += parseFloat(servico.valores.impostos.csll)
        trimestre[mes].servicos.impostos.irpj += parseFloat(servico.valores.impostos.irpj)

        trimestre[mes].servicos.impostos.retencoes.total += parseFloat(servico.valores.impostos.retencoes.total)
        trimestre[mes].servicos.impostos.retencoes.iss += parseFloat(servico.valores.impostos.retencoes.iss)
        trimestre[mes].servicos.impostos.retencoes.pis += parseFloat(servico.valores.impostos.retencoes.pis)
        trimestre[mes].servicos.impostos.retencoes.cofins += parseFloat(servico.valores.impostos.retencoes.cofins)
        trimestre[mes].servicos.impostos.retencoes.csll += parseFloat(servico.valores.impostos.retencoes.csll)
        trimestre[mes].servicos.impostos.retencoes.irpj += parseFloat(servico.valores.impostos.retencoes.irpj)
      })
      pegarMovimentosMes(cnpj, {mes: mes, ano: competencia.ano}, (err, movimentos) => {
        if (err) {
          console.error(err)
        }

        Object.keys(movimentos).forEach(key => {
          let movimento = movimentos[key]

          trimestre[mes].movimentos.lucro += parseFloat(movimento.valores.lucro)

          trimestre[mes].movimentos.impostos.total += parseFloat(movimento.valores.impostos.total)
          trimestre[mes].movimentos.impostos.pis += parseFloat(movimento.valores.impostos.pis)
          trimestre[mes].movimentos.impostos.cofins += parseFloat(movimento.valores.impostos.cofins)
          trimestre[mes].movimentos.impostos.csll += parseFloat(movimento.valores.impostos.csll)
          trimestre[mes].movimentos.impostos.irpj += parseFloat(movimento.valores.impostos.irpj)
          trimestre[mes].movimentos.impostos.icms.proprio += parseFloat(movimento.valores.impostos.icms.proprio)
          if (movimento.valores.impostos.icms.difal) {
            trimestre[mes].movimentos.impostos.icms.difal.origem += parseFloat(movimento.valores.impostos.icms.difal.origem)
            trimestre[mes].movimentos.impostos.icms.difal.destino += parseFloat(movimento.valores.impostos.icms.difal.destino)
          }
        })

        trimestre[mes].totais = {
          servicos: trimestre[mes].servicos.total,
          lucro: trimestre[mes].movimentos.lucro,
          impostos: {
            retencoes: trimestre[mes].servicos.impostos.retencoes,
            iss: trimestre[mes].servicos.impostos.iss,
            icms: trimestre[mes].movimentos.impostos.icms,
            irpj: trimestre[mes].movimentos.impostos.irpj + trimestre[mes].servicos.impostos.irpj,
            csll: trimestre[mes].movimentos.impostos.csll + trimestre[mes].servicos.impostos.csll,
            pis: trimestre[mes].movimentos.impostos.pis + trimestre[mes].servicos.impostos.pis,
            cofins: trimestre[mes].movimentos.impostos.cofins + trimestre[mes].servicos.impostos.cofins,
            total: trimestre[mes].movimentos.impostos.total + trimestre[mes].servicos.impostos.total
          }
        }

        trimestre.totais.servicos += trimestre[mes].totais.servicos
        trimestre.totais.lucro += trimestre[mes].totais.lucro

        trimestre.totais.impostos.irpj += trimestre[mes].totais.impostos.irpj
        trimestre.totais.impostos.csll += trimestre[mes].totais.impostos.csll
        trimestre.totais.impostos.iss += trimestre[mes].totais.impostos.iss
        trimestre.totais.impostos.pis += trimestre[mes].totais.impostos.pis
        trimestre.totais.impostos.cofins += trimestre[mes].totais.impostos.cofins
        trimestre.totais.impostos.total += trimestre[mes].totais.impostos.total

        trimestre.totais.impostos.icms.proprio += trimestre[mes].totais.impostos.icms.proprio
        trimestre.totais.impostos.icms.difal.origem += trimestre[mes].totais.impostos.icms.difal.origem
        trimestre.totais.impostos.icms.difal.destino += trimestre[mes].totais.impostos.icms.difal.destino

        trimestre.totais.impostos.retencoes.irpj += trimestre[mes].totais.impostos.retencoes.irpj
        trimestre.totais.impostos.retencoes.iss += trimestre[mes].totais.impostos.retencoes.iss
        trimestre.totais.impostos.retencoes.csll += trimestre[mes].totais.impostos.retencoes.csll
        trimestre.totais.impostos.retencoes.pis += trimestre[mes].totais.impostos.retencoes.pis
        trimestre.totais.impostos.retencoes.cofins += trimestre[mes].totais.impostos.retencoes.cofins
        trimestre.totais.impostos.retencoes.total += trimestre[mes].totais.impostos.retencoes.total

        if (mes === ultimoMes) {
          callback(null, trimestre)
        }
      })
    })
  })
}
