import { ADICIONAR_EMPRESA, REMOVER_EMPRESA, LIMPAR_EMPRESAS } from '../actions'

export default function empresas (state = {}, action) {
  switch (action.type) {
    case ADICIONAR_EMPRESA:
      return {
        ...state,
        [action.id]: action.empresa
      }
    case REMOVER_EMPRESA:
      return {
        ...state,
        [action.id]: undefined
      }
    case LIMPAR_EMPRESAS:
      return {
      }
    default:
      return state
  }
}
