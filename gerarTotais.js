const firebase = require('firebase')

var config = {
  apiKey: '',
  authDomain: 'danfy-4d504.firebaseapp.com',
  databaseURL: 'https://danfy-4d504.firebaseio.com',
  projectId: 'danfy-4d504',
  storageBucket: 'danfy-4d504.appspot.com',
  messagingSenderId: ''
}
firebase.initializeApp(config)

var db = firebase.database()

function gerarTotais (callback) {
  db.ref('Dominios/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    .once('value', snap => {
      let empresas = snap.val().empresas

      Object.keys(empresas).forEach(key => {
        let cnpj = empresas[key]

        for (let mes = 1; mes <= 3; mes++) {
          calculaImpostosEmpresa(cnpj, { mes: mes.toString(), ano: '2018', mesAnterior: true }, (err, impostos) => {
            if (err) {
              console.error(err)
            } else {
              gravarTotais(cnpj, { mes: mes.toString(), ano: '2018' }, impostos, err => {
                if (err) {
                  console.error(err)
                }
              })
            }
          })
        }
      })
    }).catch(err => {
      console.error(err)
    })
}

gerarTotais()

function calculaImpostosEmpresa (empresaCnpj, competencia, callback) {
  let data = {
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

  pegarServicosMes(empresaCnpj, { mes: competencia.mes, ano: competencia.ano }, (err, servicos) => {
    if (err) {
      return callback(err)
    } else if (servicos) {
      Object.keys(servicos).forEach(key => {
        let servico = servicos[key]
        data.servicos.total += parseFloat(servico.valores.servico)

        data.servicos.impostos.total += parseFloat(servico.valores.impostos.total)
        data.servicos.impostos.iss += parseFloat(servico.valores.impostos.iss)
        data.servicos.impostos.pis += parseFloat(servico.valores.impostos.pis)
        data.servicos.impostos.cofins += parseFloat(servico.valores.impostos.cofins)
        data.servicos.impostos.csll += parseFloat(servico.valores.impostos.csll)
        data.servicos.impostos.irpj += parseFloat(servico.valores.impostos.irpj)

        data.servicos.impostos.retencoes.total += parseFloat(servico.valores.impostos.retencoes.total)
        data.servicos.impostos.retencoes.iss += parseFloat(servico.valores.impostos.retencoes.iss)
        data.servicos.impostos.retencoes.pis += parseFloat(servico.valores.impostos.retencoes.pis)
        data.servicos.impostos.retencoes.cofins += parseFloat(servico.valores.impostos.retencoes.cofins)
        data.servicos.impostos.retencoes.csll += parseFloat(servico.valores.impostos.retencoes.csll)
        data.servicos.impostos.retencoes.irpj += parseFloat(servico.valores.impostos.retencoes.irpj)
      })
    }
    pegarMovimentosMes(empresaCnpj, { mes: competencia.mes, ano: competencia.ano }, (err, movimentos) => {
      if (err) {
        console.error(err)
      }
      Object.keys(movimentos).forEach(key => {
        let movimento = movimentos[key]
        data.movimentos.lucro += parseFloat(movimento.valores.lucro)
        data.movimentos.totalSaida += parseFloat(movimento.valores.valorSaida)

        data.movimentos.impostos.total += parseFloat(movimento.valores.impostos.total)
        data.movimentos.impostos.pis += parseFloat(movimento.valores.impostos.pis)
        data.movimentos.impostos.cofins += parseFloat(movimento.valores.impostos.cofins)
        data.movimentos.impostos.csll += parseFloat(movimento.valores.impostos.csll)
        data.movimentos.impostos.irpj += parseFloat(movimento.valores.impostos.irpj)
        data.movimentos.impostos.icms.baseDeCalculo += parseFloat(movimento.valores.impostos.icms.baseDeCalculo)
        data.movimentos.impostos.icms.proprio += parseFloat(movimento.valores.impostos.icms.proprio)
        if (movimento.valores.impostos.icms.difal) {
          data.movimentos.impostos.icms.difal.origem += parseFloat(movimento.valores.impostos.icms.difal.origem)
          data.movimentos.impostos.icms.difal.destino += parseFloat(movimento.valores.impostos.icms.difal.destino)
        }
      })

      data.totais = {
        servicos: data.servicos.total,
        lucro: data.movimentos.lucro,
        impostos: {
          acumulado: {
            pis: 0,
            cofins: 0
          },
          retencoes: data.servicos.impostos.retencoes,
          iss: data.servicos.impostos.iss,
          icms: data.movimentos.impostos.icms,
          irpj: data.movimentos.impostos.irpj + data.servicos.impostos.irpj,
          csll: data.movimentos.impostos.csll + data.servicos.impostos.csll,
          pis: data.movimentos.impostos.pis + data.servicos.impostos.pis,
          cofins: data.movimentos.impostos.cofins + data.servicos.impostos.cofins,
          total: data.movimentos.impostos.total + data.servicos.impostos.total
        }
      }

      if (competencia.mesAnterior) {
        let anoAnterior = competencia.ano
        let mesAnterior
        if (parseInt(competencia.mes) - 1 === 0) {
          mesAnterior = '12'
          anoAnterior = (parseInt(anoAnterior) - 1).toString()
        } else {
          mesAnterior = (parseInt(competencia.mes) - 1).toString()
        }
        calculaImpostosEmpresa(empresaCnpj, { mes: mesAnterior, ano: anoAnterior, mesAnterior: false }, (err, anterior) => {
          if (err) {
            callback(err)
          } else {
            let pisAnterior = parseFloat(anterior.totais.impostos.pis) - parseFloat(anterior.totais.impostos.retencoes.pis)
            let cofinsAnterior = parseFloat(anterior.totais.impostos.cofins) - parseFloat(anterior.totais.impostos.retencoes.cofins)

            if (pisAnterior < 10) {
              data.totais.impostos.acumulado.pis = pisAnterior
            }
            if (cofinsAnterior < 10) {
              data.totais.impostos.acumulado.cofins = cofinsAnterior
            }

            callback(null, data)
          }
        })
      } else {
        return callback(null, data)
      }
    })
  })
}

function gravarTotais (cnpj, competencia, totais, callback) {
  db.ref('Totais/' + cnpj + '/' + competencia.ano + '/' + competencia.mes).set(totais, err => {
    callback(err)
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
