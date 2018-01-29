import { ADICIONAR_NOTA_SERVICO, REMOVER_NOTA_SERVICO, LIMPAR_NOTAS_SERVICO } from '../actions'

export const moduleNotasServico = {
  state: {},
  mutations: {
    [ADICIONAR_NOTA_SERVICO] (state, payload) {
      state[payload.id] = payload.notaServico
    },
    [REMOVER_NOTA_SERVICO] (state, payload) {
      state[payload.id] = undefined
    },
    [LIMPAR_NOTAS_SERVICO] (state) {
      state = {}
    }
  }
}
