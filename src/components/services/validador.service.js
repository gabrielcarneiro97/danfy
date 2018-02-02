import { pegarNotaProduto } from './index'

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

export function procurarNotaPar (notaParametro, callback) {
  if (!notaParametro || !notaParametro.geral) {
    callback(new Error('O primeiro paramêtro não é uma nota Válida!'), null)
  } else {
    let produtosParametro = notaParametro.produtos
    let tipoParametro = notaParametro.geral.tipo

    let movimentoCb = {}

    Object.keys(produtosParametro).forEach(key => {
      pegarNotaProduto(key, produtosParametro[key], (err, notas) => {
        if (err) {
          callback(err, null)
        } else if (notas) {
          for (let notaKey in notas) {
            let notaPar = notas[notaKey]

            if (tipoParametro === '1' || notaParametro.geral.cfop === '1113' || notaParametro.geral.cfop === '1202' || notaParametro.geral.cfop === '2202') {
              validarMovimento(notaPar, notaParametro, err => {
                if (!err) {
                  movimentoCb = {
                    notaInicial: notaPar,
                    notaFinal: notaParametro
                  }
                }
              })
            } else {
              validarMovimento(notaParametro, notaPar, err => {
                if (!err) {
                  movimentoCb = {
                    notaInicial: notaParametro,
                    notaFinal: notaPar
                  }
                }
              })
            }
          }
          callback(null, movimentoCb)
        }
      })
    })
  }
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
