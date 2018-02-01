import { pegarEmpresaImpostos, pegarMovimentosMes, pegarServicosMes, pegarMovimentoNotaFinal } from './index'

export function calcularImpostosServico (notaServico, callback) {
  pegarEmpresaImpostos(notaServico.emitente, (err, aliquotas) => {
    if (err) {
      console.error(err)
    } else if (aliquotas.tributacao !== 'SN') {
      let valores = {}

      valores.servico = notaServico.geral.status === 'NORMAL' ? notaServico.valor.servico : 0

      let baseDeCalculo = notaServico.geral.status === 'NORMAL' ? notaServico.valor.baseDeCalculo : 0

      let retencoes = notaServico.valor.retencoes
      let iss = notaServico.valor.iss ? notaServico.valor.iss.valor : (baseDeCalculo * aliquotas.iss)
      let aliquotaIr = 0.048
      let aliquotaCsll = 0.0288

      valores.impostos = {
        baseDeCalculo: baseDeCalculo,
        retencoes: {
          iss: notaServico.geral.status === 'NORMAL' ? retencoes.iss : 0,
          pis: notaServico.geral.status === 'NORMAL' ? retencoes.pis : 0,
          cofins: notaServico.geral.status === 'NORMAL' ? retencoes.cofins : 0,
          csll: notaServico.geral.status === 'NORMAL' ? retencoes.csll : 0,
          irpj: notaServico.geral.status === 'NORMAL' ? retencoes.irpj : 0,
          total: notaServico.geral.status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0
        },
        iss: notaServico.geral.status === 'NORMAL' ? iss : 0,
        pis: (baseDeCalculo * aliquotas.pis),
        cofins: (baseDeCalculo * aliquotas.cofins),
        csll: (baseDeCalculo * aliquotaCsll),
        irpj: (baseDeCalculo * aliquotaIr),
        total: notaServico.geral.status === 'NORMAL' ? (parseFloat(iss) + (baseDeCalculo * aliquotaIr) + (baseDeCalculo * aliquotas.pis) + (baseDeCalculo * aliquotas.cofins) + (baseDeCalculo * aliquotaCsll)) : 0
      }

      callback(null, valores)
    } else {
      let valores = {}

      valores.servico = notaServico.geral.status === 'NORMAL' ? notaServico.valor.servico : 0

      let baseDeCalculo = notaServico.geral.status === 'NORMAL' ? notaServico.valor.baseDeCalculo : 0

      let retencoes = notaServico.valor.retencoes
      let aliquotaIss = notaServico.valor.iss ? (notaServico.valor.iss.aliquota ? parseFloat(notaServico.valor.iss.aliquota) : aliquotas.iss) : aliquotas.iss
      let iss = notaServico.valor.iss ? (notaServico.valor.iss.valor ? notaServico.valor.iss.valor : 0) : (baseDeCalculo * aliquotaIss)

      valores.impostos = {
        baseDeCalculo: baseDeCalculo,
        retencoes: {
          iss: notaServico.geral.status === 'NORMAL' ? retencoes.iss : 0,
          pis: notaServico.geral.status === 'NORMAL' ? retencoes.pis : 0,
          cofins: notaServico.geral.status === 'NORMAL' ? retencoes.cofins : 0,
          csll: notaServico.geral.status === 'NORMAL' ? retencoes.csll : 0,
          irpj: notaServico.geral.status === 'NORMAL' ? retencoes.irpj : 0,
          total: notaServico.geral.status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0
        },
        iss: notaServico.geral.status === 'NORMAL' ? iss : 0,
        pis: 0,
        cofins: 0,
        csll: 0,
        irpj: 0,
        total: notaServico.geral.status === 'NORMAL' ? iss : 0
      }
      callback(null, valores)
    }
  })
}
export function calcularImpostosMovimento (notaInicial, notaFinal, callback) {
  let valorSaida = parseFloat(notaFinal.valor.total)
  let lucro = parseFloat(notaFinal.valor.total) - parseFloat(notaInicial ? notaInicial.valor.total : 0)
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
      if (lucro < 0 && estadoGerador !== estadoDestino) {
        lucro = 0
      }
      if ((lucro < 0 && notaFinal.geral.cfop !== '1202' && notaFinal.geral.cfop !== '2202') || (notaFinal.geral.cfop === '6918' || notaFinal.geral.cfop === '5918')) {
        callback(null, {
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
                  origem: (difal * 0.8),
                  destino: (difal * 0.2)
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
          pegarMovimentoNotaFinal(notaFinal.emitente, notaInicial.chave, (err, movimentoAnterior) => {
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

    pegarServicosMes(cnpj, {mes: mes, ano: competencia.ano}, (err, servicos) => {
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
          trimestre[mes].movimentos.impostos.icms.proprio += parseFloat(movimento.valores.impostos.icms.proprio)
          trimestre[mes].movimentos.impostos.icms.baseDeCalculo += parseFloat(movimento.valores.impostos.icms.baseDeCalculo)
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

              callback(null, trimestre)
            }
          })
        } else if (mes === ultimoMes) {
          callback(null, trimestre)
        }
      })
    })
  })
}

/*
* {Function} R$ (valor): recebe um {Number} e converte em uma {String} com formatação numérica brasileira
*   @param {Number} valor: número qualquer
*   @return {String}: contém o valor na formatação numérica brasileira, substituindo '.' por ',' e colocando um '.' a cada três número antes da ','
*/
export function R$ (valor) {
  valor = parseFloat(valor).toFixed(2)

  let negativo = ''

  if (valor.charAt(0) === '-') {
    negativo = '-'
    valor = valor.replace('-', '')
  }

  valor = valor.toString().replace('.', ',')

  let esquerda = valor.split(',')[0]
  let direita = valor.split(',')[1]

  let counter = 0
  let esquerdaArr = []
  for (let i = esquerda.length - 1; i >= 0; i--) {
    counter++
    esquerdaArr.push(esquerda[i])
    if (counter === 3 && i > 0) {
      esquerdaArr.push('.')
      counter = 0
    }
  }
  esquerda = esquerdaArr.reverse().join('')

  return negativo + esquerda + ',' + direita
}
