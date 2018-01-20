import { pegarEmpresaImpostos, pegarMovimentosMes, pegarServicosMes } from './index'

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
