import { CARREGAR_DOMINIO, ADICIONAR_EMPRESA, LIMPAR_DOMINIO } from '../actions'

export default function dominio (state = {}, action) {
  switch (action.type) {
    case CARREGAR_DOMINIO:
      return action.dominio
    case ADICIONAR_EMPRESA:
      let obj = {...state}
      obj.empresas = { ...state.empresas,
        [action.empresaNum]: action.empresaCnpj
      }
      return obj
    case LIMPAR_DOMINIO:
      return {}
    default:
      return state
  }
}
