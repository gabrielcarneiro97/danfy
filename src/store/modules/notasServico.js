import { ADICIONAR_NOTA_SERVICO, REMOVER_NOTA_SERVICO, LIMPAR_NOTAS_SERVICO } from '../actions'
import Vue from 'vue'

export const moduleNotasServico = {
  state: {},
  mutations: {
    [ADICIONAR_NOTA_SERVICO] (state, payload) {
      Vue.set(state, payload.id, payload.notaServico)
    },
    [REMOVER_NOTA_SERVICO] (state, payload) {
      Vue.delete(state, payload.id)
    },
    [LIMPAR_NOTAS_SERVICO] (state) {
      Object.keys(state).forEach(key => {
        Vue.delete(state, key)
      })
    }
  }
}
