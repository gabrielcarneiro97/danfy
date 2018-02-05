import { storeVuex } from '../../main'
import { limparNotas, limparNotasServico, limparPessoas } from '../../store/actions'

export function limparNotasStore () {
  storeVuex.commit(limparNotas())

  return true
}

export function limparNotasServicoStore () {
  storeVuex.commit(limparNotasServico())

  return true
}

export function limparStore () {
  storeVuex.commit(limparNotas())
  storeVuex.commit(limparNotasServico())
  storeVuex.commit(limparPessoas())

  return true
}

export function estaNoDominio (cnpj) {
  let empresasVuex = storeVuex.state.dominio.empresas
  let retorno = false

  Object.keys(empresasVuex).forEach(key => {
    if (empresasVuex[key] === cnpj) {
      retorno = true
    }
  })

  return retorno
}
