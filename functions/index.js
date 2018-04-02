const _ = require('lodash')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })
admin.initializeApp(functions.config().firebase)

var db = admin.database()

exports.gerarMovimentos = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    let notasFinais = req.body.notasFinais
    let usuario = req.body.usuario

    let promises = []

    notasFinais.forEach(chave => {
      let p = new Promise(resolve => {
        db.ref('Notas/' + chave).once('value', snap => {
          let nota = snap.val()
          let movimento = {
            notaFinal: chave,
            notaInicial: null,
            data: nota.geral.dataHora,
            conferido: false,
            dominio: usuario.dominio,
            valores: {},
            metaDados: {
              criadoPor: usuario.email,
              dataCriacao: new Date().toISOString(),
              status: 'ATIVO',
              tipo: 'PRIM',
              movimentoRef: ''
            }
          }
          let query = db.ref('Notas/').orderByChild('emitente').equalTo(nota.emitente)
          query.on('child_added', snap => {
            let nota2 = snap.val()
            if (nota2.chave !== nota.chave) {
              let produtos = Object.keys(nota.produtos)
              let produtos2 = Object.keys(nota2.produtos)
              if (!movimento.notaInicial) {
                produtos2.forEach(produto => {
                  if (produtos.includes(produto)) {
                    validarMovimento(nota2, nota, err => {
                      if (!err) {
                        movimento.notaInicial = nota2.chave
                        pegarEmpresaImpostos(nota.emitente, (err, aliquotas) => {
                          if (err) {
                            console.error(err)
                          } else {
                            calcularImpostosMovimento(nota2, nota, aliquotas, (err, valores) => {
                              if (err) {
                                console.error(err)
                              } else {
                                movimento.valores = valores
                                movimento.conferido = true
                                resolve(movimento)
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            }
          })
          query.once('value', snap => {
            if (!movimento.notaInicial) {
              pegarEmpresaImpostos(nota.emitente, (err, aliquotas) => {
                if (err) {
                  console.error(err)
                } else {
                  calcularImpostosMovimento(null, nota, aliquotas, (err, valores) => {
                    if (err) {
                      console.error(err)
                    } else {
                      movimento.valores = valores
                      resolve(movimento)
                    }
                  })
                }
              })
            }
          })
        })
      })
      promises.push(p)
    })

    Promise.all(promises).then(arr => {
      return res.send({ movimentos: arr })
    }).catch(err => {
      console.error(err)
    })
  })
})

exports.pegarNotaProduto = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    let notas = {}

    let prodsId = decodeURI(request.query.prodId)

    let arrProds = prodsId.split('|*|')

    arrProds.forEach(id => {
      if (id !== '') {
        notas[id] = {}
      }
    })

    let query = db.ref('Notas/').orderByChild('emitente')
    query.on('child_added', snap => {
      let nota = snap.val()
      let chave = snap.key
      let listaProdutos = Object.keys(nota.produtos)

      listaProdutos.forEach(prodId => {
        if (arrProds.includes(prodId)) {
          notas[prodId][chave] = nota
        }
      })
    })
    query.once('value', snap => {
      let data = {}
      data.notas = notas
      response.send(data)
    })
  })
})

exports.pegarTudoTrimestre = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    let data = {}
    let cnpj = request.query.cnpj // '10224776000149'
    let mes = request.query.mes
    let ano = request.query.ano
    let notas = {}
    let notasEnd = false
    let servsEnd = false

    let end = () => {
      if (notasEnd && servsEnd) {
        totaisTrimestrais(cnpj, { mes: mes, ano: ano }, (err, trim) => {
          if (err) {
            data.err = err
          } else {
            data.trimestre = trim
            console.log(trim)
            response.send(data)
          }
        })
      }
    }

    pegarMovimentosMes(cnpj, { mes: mes, ano: ano }, (err, movs) => {
      if (err) {
        data.err = err
      } else {
        data.movimentos = movs
        if (_.isEmpty(movs)) {
          notasEnd = true
        }
        Object.keys(movs).forEach((k, i, arr) => {
          let m = movs[k]
          pegarNotaChave(m.notaInicial, (err, n1) => {
            if (err) {
              data.err = err
            } else {
              pegarNotaChave(m.notaFinal, (err, n2) => {
                if (err) {
                  data.err = err
                } else {
                  notas[n1.chave] = n1
                  notas[n2.chave] = n2

                  if (arr.length - 1 === i) {
                    data.notas = notas
                    notasEnd = true
                    end()
                  }
                }
              })
            }
          })
        })
      }
    })
    pegarServicosMes(cnpj, { mes: mes, ano: ano }, (err, servs) => {
      if (err) {
        data.err = err
      } else {
        data.servicos = servs
        servsEnd = true
        end()
      }
    })
  })
})

function pegarNotaChave (chave, callback) {
  let nota
  db.ref('Notas/' + chave).once('value', value => {
    nota = value.val()
    callback(null, nota)
  })
}

function calcularImpostosMovimento (notaInicial, notaFinal, aliquotas, callback) {
  let valorSaida = parseFloat(notaFinal.valor.total)
  let lucro = parseFloat(notaFinal.valor.total) - parseFloat(notaInicial ? notaInicial.valor.total : 0)
  let estadoGerador = notaFinal.informacoesEstaduais.estadoGerador
  let estadoDestino = notaFinal.informacoesEstaduais.estadoDestino
  let destinatarioContribuinte = notaFinal.informacoesEstaduais.destinatarioContribuinte

  if (estadoGerador !== 'MG') {
    return callback(new Error('Estado informado não suportado! Estado: ' + estadoGerador), null)
  }

  if (lucro < 0 && estadoGerador !== estadoDestino) {
    lucro = 0
  }
  if ((lucro < 0 && notaFinal.geral.cfop !== '1202' && notaFinal.geral.cfop !== '2202') || (notaFinal.geral.cfop === '6918' || notaFinal.geral.cfop === '5918') || (notaFinal.geral.cfop === '6913' || notaFinal.geral.cfop === '5913')) {
    return callback(null, {
      lucro: 0,
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
    })
  } else {
    var proximoPasso = () => {
      let valores = {
        lucro: lucro,
        valorSaida: valorSaida,
        impostos: {
          pis: (lucro * aliquotas.pis),
          cofins: (lucro * aliquotas.cofins),
          csll: (lucro * aliquotas.csll),
          irpj: (lucro * aliquotas.irpj),
          total: ((lucro * aliquotas.irpj) + (lucro * aliquotas.pis) + (lucro * aliquotas.cofins) + (lucro * aliquotas.csll))
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
          baseDeCalculo: (lucro * aliquotas.icms.reducao),
          proprio: (lucro * aliquotas.icms.reducao * aliquotas.icms.aliquota)
        }
        valores.impostos.total = (parseFloat(valores.impostos.total) + (lucro * aliquotas.icms.reducao * aliquotas.icms.aliquota))
      } else {
        if (destinatarioContribuinte === '2' || destinatarioContribuinte === '9') {
          let composicaoDaBase = valorSaida / (1 - icmsEstados[estadoDestino].interno)
          let baseDeCalculo = 0.05 * composicaoDaBase
          let baseDifal = estadosSemReducao.includes(estadoDestino) ? composicaoDaBase : baseDeCalculo
          let proprio = baseDifal * icmsEstados[estadoDestino].externo
          let difal = (baseDifal * icmsEstados[estadoDestino].interno) - proprio

          valores.impostos.icms = {
            composicaoDaBase: composicaoDaBase,
            baseDeCalculo: baseDeCalculo,
            proprio: proprio,
            difal: {
              origem: (difal * 0.2),
              destino: (difal * 0.8)
            }
          }

          valores.impostos.total = (parseFloat(valores.impostos.total) + (difal * 0.8) + (difal * 0.2) + proprio)
        } else if (destinatarioContribuinte === '1') {
          let baseDeCalculo = 0.05 * valorSaida
          let valor = baseDeCalculo * icmsEstados[estadoDestino].externo

          valores.impostos.icms = {
            composicaoDaBase: null,
            difal: null,
            baseDeCalculo: baseDeCalculo,
            proprio: valor
          }
          valores.impostos.total = parseFloat(valores.impostos.total) + valor
        }
      }

      callback(null, valores)
    }
    if (notaFinal.geral.cfop === '1202' || notaFinal.geral.cfop === '2202') {
      pegarMovimentoNotaFinal(notaFinal.emitente, notaInicial ? notaInicial.chave : notaInicial, (err, movimentoAnterior) => {
        if (err) {
          console.error(err)
        } else if (movimentoAnterior) {
          lucro = (-1) * movimentoAnterior.valores.lucro
          valorSaida = 0
          proximoPasso()
        } else {
          valorSaida = 0
          proximoPasso()
        }
      })
    } else {
      proximoPasso()
    }
  }
}

function pegarEmpresaImpostos (empresaCnpj, callback) {
  db.ref('Impostos/' + empresaCnpj).once('value', snap => {
    let aliquotas = snap.val()
    callback(null, aliquotas)
  }, err => {
    callback(err, null)
  })
}

function totaisTrimestrais (cnpj, competencia, callback) {
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
      adicionalIr: 0,
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
        totalSaida: 0,
        lucro: 0,
        impostos: {
          cofins: 0,
          pis: 0,
          irpj: 0,
          csll: 0,
          icms: {
            baseDeCalculo: 0,
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

    pegarServicosMes(cnpj, { mes: mes, ano: competencia.ano }, (err, servicos) => {
      if (err) {
        console.error(err)
      } else if (servicos) {
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
      }
      pegarMovimentosMes(cnpj, { mes: mes, ano: competencia.ano }, (err, movimentos) => {
        if (err) {
          console.error(err)
        }
        Object.keys(movimentos).forEach(key => {
          let movimento = movimentos[key]
          trimestre[mes].movimentos.lucro += parseFloat(movimento.valores.lucro)
          trimestre[mes].movimentos.totalSaida += parseFloat(movimento.valores.valorSaida)

          trimestre[mes].movimentos.impostos.total += parseFloat(movimento.valores.impostos.total)
          trimestre[mes].movimentos.impostos.pis += parseFloat(movimento.valores.impostos.pis)
          trimestre[mes].movimentos.impostos.cofins += parseFloat(movimento.valores.impostos.cofins)
          trimestre[mes].movimentos.impostos.csll += parseFloat(movimento.valores.impostos.csll)
          trimestre[mes].movimentos.impostos.irpj += parseFloat(movimento.valores.impostos.irpj)
          trimestre[mes].movimentos.impostos.icms.baseDeCalculo += parseFloat(movimento.valores.impostos.icms.baseDeCalculo)
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

        if (mes % 3 === 0) {
          let adicionalIr
          let baseLucro
          let baseServico
          pegarEmpresaImpostos(cnpj, (err, aliquotas) => {
            if (err) {
              console.error(err)
            } else {
              if (aliquotas.irpj === 0.012) {
                baseLucro = trimestre.totais.lucro * 0.08
              } else {
                baseLucro = trimestre.totais.lucro * 0.32
              }
              baseServico = trimestre.totais.servicos * 0.32

              if (baseLucro + baseServico > 60000) {
                adicionalIr = ((baseLucro + baseServico) - 60000) * 0.1
              } else {
                adicionalIr = 0
              }

              trimestre.totais.impostos.adicionalIr = adicionalIr

              return callback(null, trimestre)
            }
          })
        } else if (mes === ultimoMes) {
          return callback(null, trimestre)
        }
      })
    })
  })
}

function validarMovimento (notaInicial, notaFinal, callback) {
  let err = null

  if (!compararCFOP(notaInicial, notaFinal)) {
    err = new Error(`O CFOP da Nota Inicial ${notaInicial.geral.numero} ${notaInicial.geral.cfop} não é valido para o CFOP da Nota Final ${notaFinal.geral.numero} ${notaFinal.geral.cfop}`)
  } else if (!compararProduto(notaInicial, notaFinal)) {
    err = new Error(`O produto da Nota Final ${notaFinal.geral.numero} não foi localizado na Nota Inicial ${notaInicial.geral.numero}!`)
  } else if (!compararData(notaInicial, notaFinal)) {
    err = new Error(`A data da Nota Final ${notaFinal.geral.numero} é anterior a data da Nota Inicial ${notaInicial.geral.numero}!`)
  }

  callback(err)
}

function pegarServicosMes (cnpj, competencia, callback) {
  let servicos = {}
  let query = db.ref('Servicos/' + cnpj)
  query.orderByChild('data').on('child_added', snap => {
    let servico = snap.val()
    let servicoId = snap.key
    let data = new Date(servico.data)
    let mes = (data.getUTCMonth() + 1).toString()
    let ano = data.getUTCFullYear().toString()

    if (mes === competencia.mes && ano === competencia.ano) {
      servicos[servicoId] = servico
    }
  })
  query.once('value', snap => {
    callback(null, servicos)
  }, err => {
    callback(err, null)
  })
}

function pegarMovimentosMes (cnpj, competencia, callback) {
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
        movimentos[movimentoId] = movimento
      }
    } else if (mes === competencia.mes && ano === competencia.ano) {
      movimentos[movimentoId] = movimento
    }
  })
  query.once('value', snap => {
    callback(null, movimentos)
  }, err => {
    callback(err, null)
  })
}

function pegarMovimentoNotaFinal (cnpj, chaveNota, callback) {
  let query = db.ref('Movimentos/' + cnpj).orderByChild('notaFinal').equalTo(chaveNota)

  let jaFoi = false

  query.on('child_added', snap => {
    let movimento = snap.val()
    if (movimento.metaDados) {
      if (movimento.metaDados.status === 'ATIVO') {
        callback(null, movimento)
        jaFoi = true
      }
    } else {
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

let cfopCompra = ['1102', '2102']
let cfopDevolucao = ['1202', '2202']
let cfopDevolucaoCompra = ['5202']
let cfopVenda = ['5102', '6102', '6108']
let cfopConsignacao = ['1917', '2917']
let cfopCompraConsignacao = ['1113']
let cfopVendaConsignacao = ['5115', '6115', '5114']
let cfopDevolucaoConsignacao = ['5918', '6918']

function compararCFOP (notaInicial, notaFinal) {
  let cfopInicial = notaInicial.geral.cfop
  let cfopFinal = notaFinal.geral.cfop

  if (cfopCompra.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) {
    return true
  } else if (cfopCompraConsignacao.includes(cfopInicial) && cfopVendaConsignacao.includes(cfopFinal)) {
    return true
  } else if (cfopConsignacao.includes(cfopInicial) && cfopCompraConsignacao.includes(cfopFinal)) {
    return true
  } else if (cfopConsignacao.includes(cfopInicial) && cfopDevolucaoConsignacao.includes(cfopFinal)) {
    return true
  } else if (cfopVenda.includes(cfopInicial) && cfopDevolucao.includes(cfopFinal)) {
    return true
  } else if (cfopDevolucao.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) {
    return true
  } else if (cfopCompra.includes(cfopInicial) && cfopDevolucaoCompra.includes(cfopFinal)) {
    return true
  } else if ((cfopVenda.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) && (notaFinal.emitente !== notaInicial.emitente)) {
    return true
  } else {
    return false
  }
}

function compararProduto (notaInicial, notaFinal) {
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

function compararData (notaInicial, notaFinal) {
  let dataInicial = new Date(notaInicial.geral.dataHora).getTime()
  let dataFinal = new Date(notaFinal.geral.dataHora).getTime()

  if (dataInicial <= dataFinal) {
    return true
  } else {
    return false
  }
}
