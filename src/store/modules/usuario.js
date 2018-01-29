import { SAIR, AUTENTICAR } from '../actions'
import Vue from 'vue'

export const moduleUsuario = {
  state: {
    nome: null,
    dominio: null,
    email: null,
    token: null,
    nivel: null,
    id: null
  },
  mutations: {
    [AUTENTICAR] (state, payload) {
      let dados = payload.dados
      Object.keys(dados).forEach(key => {
        Vue.set(state, key, dados[key])
      })
    },
    [SAIR] (state) {
      Object.keys(state).forEach(key => {
        Vue.set(state, key, null)
      })
    }
  }
}
