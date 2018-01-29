import { CARREGAR_DOMINIO, ADICIONAR_EMPRESA, LIMPAR_DOMINIO } from '../actions'
import Vue from 'vue'

export const moduleDominio = {
  state: {
    tipo: '',
    empresas: {}
  },
  mutations: {
    [CARREGAR_DOMINIO] (state, payload) {
      Vue.set(state, 'tipo', payload.dominio.tipo)
      Vue.set(state, 'empresas', payload.dominio.empresas)
    },
    [ADICIONAR_EMPRESA] (state, payload) {
      Vue.set(state.empresas, payload.empresaNum, payload.empresaCnpj)
    },
    [LIMPAR_DOMINIO] (state) {
      state = {
        tipo: '',
        empresas: {}
      }
    }
  }
}
