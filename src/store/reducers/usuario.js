import { SAIR, AUTENTICAR } from '../actions'

export default function usuario (state = {}, action) {
  switch (action.type) {
    case AUTENTICAR:
      return {
        nome: action.dados.nome,
        dominio: action.dados.dominio,
        email: action.dados.email,
        token: action.dados.token,
        id: action.dados.id
      }
    case SAIR:
      return {
      }
    default:
      return state
  }
}
