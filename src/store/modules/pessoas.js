import { ADICIONAR_PESSOA, REMOVER_PESSOA, LIMPAR_PESSOAS } from '../actions'

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
