import { ADICIONAR_PESSOA, REMOVER_PESSOA, LIMPAR_PESSOAS } from '../actions'

export function pessoas (state = {}, action) {
  switch (action.type) {
    case ADICIONAR_PESSOA:
      return { ...state,
        [action.id]: action.pessoa
      }
    case REMOVER_PESSOA:
      return { ...state,
        [action.id]: undefined
      }
    case LIMPAR_PESSOAS:
      return {
      }
    default:
      return state
  }
}
