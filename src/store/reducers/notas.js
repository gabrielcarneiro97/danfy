import { ADICIONAR_NOTA, REMOVER_NOTA, LIMPAR_NOTAS } from '../actions'

export default function notas (state = {}, action) {
  switch (action.type) {
    case ADICIONAR_NOTA:
      return { ...state,
        [action.id]: action.nota
      }
    case REMOVER_NOTA:
      return {
        ...state,
        [action.id]: undefined
      }
    case LIMPAR_NOTAS:
      return {
      }
    default:
      return state
  }
}
