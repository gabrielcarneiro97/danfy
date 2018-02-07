import { pegarNotaProduto } from './index'
import { storeVuex } from '../../main'
import { adicionarNota } from '../../store/actions'

export let cfopCompra = ['1102', '2102']
export let cfopDevolucao = ['1202', '2202']
export let cfopDevolucaoCompra = ['5202']
export let cfopVenda = ['5102', '6102', '6108']
export let cfopConsignacao = ['1917', '2917']
export let cfopCompraConsignacao = ['1113']
export let cfopVendaConsignacao = ['5115', '6115', '5114']
export let cfopDevolucaoConsignacao = ['5918', '6918']
export let cfopDevolucaoDemonstracao = ['6913', '5913']

export function retornarTipo (cfop) {
  if (cfopCompra.includes(cfop)) {
    return 'COMPRA'
  } else if (cfopDevolucao.includes(cfop)) {
    return 'DEVOLUÇÃO DE VENDA'
  } else if (cfopVenda.includes(cfop) || cfopVendaConsignacao.includes(cfop)) {
    return 'VENDA'
  } else if (cfopConsignacao.includes(cfop)) {
    return 'CONSIGNAÇÃO'
  } else if (cfopCompraConsignacao.includes(cfop)) {
    return 'COMPRA DEFINITIVA'
  } else if (cfopDevolucaoConsignacao.includes(cfop)) {
    return 'DEVOLUÇÃO DE CONSIGNAÇÃO'
  } else if (cfopDevolucaoCompra.includes(cfop)) {
    return 'DEVOLUÇÃO DE COMPRA'
  } else if (cfopDevolucaoDemonstracao.includes(cfop)) {
    return 'DEVOLUÇÃO DEMONSTRAÇÃO'
  }
}

export function compararCFOP (notaInicial, notaFinal) {
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

export function procurarNotaPar (notas, callback) {
  let produtos = []

  let notasKey = Object.keys(notas)

  notasKey.forEach(key => {
    let nota = notas[key]
    produtos = produtos.concat(Object.keys(nota.produtos))
  })

  let movimentos = []

  pegarNotaProduto(produtos, (err, notas) => {
    if (err) {
      callback(err, null)
    }

    Object.keys(notas).forEach((prod, i, arr) => {
      let todas = notas[prod]
      let todasKey = Object.keys(todas)

      todasKey.forEach(kN1 => {
        if (notasKey.includes(kN1)) {
          let n1 = todas[kN1]
          let rmN1 = todasKey.filter(item => item !== kN1)

          if (rmN1.length > 0) {
            rmN1.forEach(kN2 => {
              let n2 = todas[kN2]

              if (n1.geral.tipo === '1' || n1.geral.cfop === '1113' || n1.geral.cfop === '1202' || n1.geral.cfop === '2202') {
                validarMovimento(n2, n1, err => {
                  if (!err) {
                    movimentos.push({
                      notaInicial: n2,
                      notaFinal: n1
                    })
                    storeVuex.commit(adicionarNota(n2.chave, n2))
                  }
                  if (i === arr.length - 1) {
                    callback(null, movimentos)
                  }
                })
              } else {
                validarMovimento(n1, n2, err => {
                  if (!err) {
                    movimentos.push({
                      notaInicial: n1,
                      notaFinal: n2
                    })
                    storeVuex.commit(adicionarNota(n2.chave, n2))
                  }
                  if (i === arr.length - 1) {
                    callback(null, movimentos)
                  }
                })
              }
            })
          } else if (i === arr.length - 1) {
            callback(null, movimentos)
          }
        }
      })
    })
  })
}

export function validarMovimento (notaInicial, notaFinal, callback) {
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
