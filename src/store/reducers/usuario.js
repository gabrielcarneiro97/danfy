import { SAIR, AUTENTICAR } from '../actions'

export default function usuario (state = {}, action) {
  switch (action.type) {
    case AUTENTICAR:
      return {
        nome: action.dados.nome,
        dominio: action.dados.dominio,
        email: action.dados.email,
        token: action.dados.token,
        nivel: action.dados.nivel,
        id: action.dados.id
      }
    case SAIR:
      return {
      }
    default:
      return state
  }
}

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
