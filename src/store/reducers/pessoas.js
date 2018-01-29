import { ADICIONAR_PESSOA, REMOVER_PESSOA, LIMPAR_PESSOAS } from '../actions'

export default function pessoas (state = {}, action) {
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

export const modulePessoas = {
  state: {},
  mutations: {
    [ADICIONAR_PESSOA] (state, payload) {
      state[payload.id] = payload.pessoa
    },
    [REMOVER_PESSOA] (state, payload) {
      state[payload.id] = undefined
    },
    [LIMPAR_PESSOAS] (state) {
      state = {}
    }
  }
}
