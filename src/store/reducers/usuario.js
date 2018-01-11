import { SAIR, AUTENTICAR } from '../actions'

export default function usuario (state = {}, action) {
  switch (action.type) {
    case AUTENTICAR:
      return {
        email: action.dados.email,
        token: action.dados.token,
        id: action.dados.id
      }
    case SAIR:
      return {
        email: undefined,
        token: undefined,
        id: undefined
      }
    default:
      return state
  }
}
