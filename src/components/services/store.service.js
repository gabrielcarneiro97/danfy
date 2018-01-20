import store from '../../store'
import { limparNotas, limparNotasServico } from '../../store/actions'

export function limparNotasStore () {
  store.dispatch(limparNotas())
}
export function limparNotasServicoStore () {
  store.dispatch(limparNotasServico())
}
export function estaNoDominio (cnpj) {
  let empresas = store.getState().dominio.empresas
  let retorno = false

  Object.keys(empresas).forEach(key => {
    if (empresas[key] === cnpj) {
      retorno = true
    }
  })

  return retorno
}
