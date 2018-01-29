import { storeVuex } from '../../main'
import { limparNotas, limparNotasServico } from '../../store/actions'

export function limparNotasStore () {
  storeVuex.commit(limparNotas())
}
export function limparNotasServicoStore () {
  storeVuex.commit(limparNotasServico())
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
