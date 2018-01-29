import { xml2js } from 'xml-js'
import { store } from '../../store'
import { storeVuex } from '../../main'
import { adicionarPessoa, adicionarNota, adicionarNotaServico } from '../../store/actions'
import { gravarNota, gravarNotaServico, gravarPessoa } from './index'

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
          gravarPessoa(notaServico.emitente, emitente, err => {
            if (err) {
              console.error(err)
            }
          })
          gravarPessoa(notaServico.destinatario, destinatario, err => {
            if (err) {
              console.error(err)
            }
          })
          gravarNotaServico(notaServico.chave, notaServico, err => {
            if (err) {
              console.error(err)
            }
          })
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
          gravarPessoa(nota.emitente, emitente, err => {
            if (err) {
              console.error(err)
            }
          })
          gravarPessoa(nota.destinatario, destinatario, err => {
            if (err) {
              console.error(err)
            }
          })
          gravarNota(nota.chave, nota, err => {
            if (err) {
              console.error(err)
            }
          })
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
            gravarNota(notas[id].chave, notas[id], err => {
              if (err) {
                console.error(err)
              }
            })
            store.dispatch(adicionarNota(id, notas[id]))
            storeVuex.commit(adicionarNota(id, notas[id]))
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

  storeVuex.commit(adicionarNotaServico(notaServico.chave, notaServico))
  storeVuex.commit(adicionarPessoa(notaServico.emitente, emitente))
  storeVuex.commit(adicionarPessoa(notaServico.destinatario, destinatario))

  callback(notaServico, emitente, destinatario)
}
export function lerNfe (obj, callback) {
  if (obj.nfeProc) {
    if (!obj.nfeProc.NFe) {
      return 0
    } else if (!obj.nfeProc.NFe.Signature) {
      return 0
    }
  } else if (!obj.NFe) {
    return 0
  } else if (!obj.NFe.Signature) {
    return 0
  }

  let info = obj.nfeProc ? obj.nfeProc.NFe.infNFe : obj.NFe.infNFe

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
        codigo: emit.enderEmit.cPais ? emit.enderEmit.cPais['_text'] : '',
        nome: emit.enderEmit.xPais ? emit.enderEmit.xPais['_text'] : ''
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
      dataHora: info.ide.dhSaiEnt ? info.ide.dhSaiEnt['_text'] : info.ide.dhEmi['_text'],
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

  storeVuex.commit(adicionarNota(notaId, nota))
  storeVuex.commit(adicionarPessoa(emitenteId, emitente))
  storeVuex.commit(adicionarPessoa(destinatarioId, destinatario))

  callback(nota, emitente, destinatario)
}
