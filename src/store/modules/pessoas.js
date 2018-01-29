import { ADICIONAR_PESSOA, REMOVER_PESSOA, LIMPAR_PESSOAS } from '../actions'
import Vue from 'vue'

export const modulePessoas = {
  state: {},
  mutations: {
    [ADICIONAR_PESSOA] (state, payload) {
      Vue.set(state, payload.id, payload.pessoa)
    },
    [REMOVER_PESSOA] (state, payload) {
      Vue.delete(state, payload.id)
    },
    [LIMPAR_PESSOAS] (state) {
      Object.keys(state).forEach(key => {
        Vue.delete(state, key)
      })
    }
  }
}
