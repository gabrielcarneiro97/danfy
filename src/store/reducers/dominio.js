import { CARREGAR_DOMINIO, ADICIONAR_EMPRESA, LIMPAR_DOMINIO } from '../actions'

export default function dominio (state = {}, action) {
  switch (action.type) {
    case CARREGAR_DOMINIO:
      return {

      }
    case ADICIONAR_EMPRESA:
      return {
      }
    case LIMPAR_DOMINIO:
      return {
      }
    default:
      return {
      }
  }
}
