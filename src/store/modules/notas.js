import { ADICIONAR_NOTA, REMOVER_NOTA, LIMPAR_NOTAS } from '../actions'

export const moduleNotas = {
  state: {},
  mutations: {
    [ADICIONAR_NOTA] (state, payload) {
      state[payload.id] = payload.nota
    },
    [REMOVER_NOTA] (state, payload) {
      state[payload.id] = undefined
    },
    [LIMPAR_NOTAS] (state) {
      state = {}
    }
  }
}
