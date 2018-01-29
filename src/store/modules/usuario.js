import { SAIR, AUTENTICAR } from '../actions'

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
      state = payload
    },
    [SAIR] (state) {
      state = {
        nome: null,
        dominio: null,
        email: null,
        token: null,
        nivel: null,
        id: null
      }
    }
  }
}
