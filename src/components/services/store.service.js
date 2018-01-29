import { store } from '../../store'
import { storeVuex } from '../../main'
import { limparNotas, limparNotasServico } from '../../store/actions'

export function limparNotasStore () {
  store.dispatch(limparNotas())
  storeVuex.commit(limparNotas())
}
export function limparNotasServicoStore () {
  store.dispatch(limparNotasServico())
  storeVuex.commit(limparNotasServico())
}
export function estaNoDominio (cnpj) {
  let empresas = store.getState().dominio.empresas
  let empresasVuex = storeVuex.state.dominio.empresas
  let retorno = false

  Object.keys(empresasVuex).forEach(key => {
    if (empresas[key] === cnpj) {
      retorno = true
    }
  })

  return retorno
}
