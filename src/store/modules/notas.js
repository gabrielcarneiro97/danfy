import { ADICIONAR_NOTA, REMOVER_NOTA, LIMPAR_NOTAS } from '../actions'
import Vue from 'vue'

export const moduleNotas = {
  state: {},
  mutations: {
    [ADICIONAR_NOTA] (state, payload) {
      Vue.set(state, payload.id, payload.nota)
    },
    [REMOVER_NOTA] (state, payload) {
      Vue.delete(state, payload.id)
    },
    [LIMPAR_NOTAS] (state) {
      state = {}
    }
  }
}
