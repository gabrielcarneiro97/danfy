const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })
admin.initializeApp(functions.config().firebase)

var db = admin.database()

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.pegarTudoTrimestre = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    let data = {}
    let cnpj = request.query.cnpj // '10224776000149'
    let mes = request.query.mes
    let ano = request.query.ano
    let notas = {}
    let notasEnd = false

    let end = () => {
      if (notasEnd) {
        response.send(data)
      }
    }

    pegarMovimentosMes(cnpj, {mes: mes, ano: ano}, (err, movs) => {
      if (err) {
        data.err = err
      } else {
        data.movimentos = movs
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
      pegarServicosMes(cnpj, {mes: mes, ano: ano}, (err, servs) => {
        if (err) {
          data.err = err
        } else {
          data.servicos = servs
          totaisTrimestrais(cnpj, {mes: mes, ano}, (err, trim) => {
            if (err) {
              data.err = err
            } else {
              data.trimestre = trim
              end()
            }
          })
        }
      })
    })
  })
})

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
            return 0
          })
        } else if (mes === ultimoMes) {
          return callback(null, trimestre)
        }
        return 0
      })
    })
  })
}

function pegarEmpresaImpostos (empresaCnpj, callback) {
  db.ref('Impostos/' + empresaCnpj).once('value', snap => {
    let aliquotas = snap.val()
    callback(null, aliquotas)
  }, err => {
    callback(err, null)
  })
}

function pegarNotaChave (chave, callback) {
  let nota
  db.ref('Notas/' + chave).once('value', value => {
    nota = value.val()
    callback(null, nota)
  })
}
