import { SAIR, AUTENTICAR } from '../actions'

export default function usuario (state = {}, action) {
  switch (action.type) {
    case AUTENTICAR:
      return {
        email: action.dados.email
      }
    case SAIR:
      return {
        email: undefined
      }
    default:
      return state
  }
}
