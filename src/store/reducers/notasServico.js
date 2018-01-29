import { ADICIONAR_NOTA_SERVICO, REMOVER_NOTA_SERVICO, LIMPAR_NOTAS_SERVICO } from '../actions'

export default function notasServico (state = {}, action) {
  switch (action.type) {
    case ADICIONAR_NOTA_SERVICO:
      return {
        ...state,
        [action.id]: action.notaServico
      }
    case REMOVER_NOTA_SERVICO:
      return {
        ...state,
        [action.id]: undefined
      }
    case LIMPAR_NOTAS_SERVICO:
      return {
      }
    default:
      return state
  }
}
