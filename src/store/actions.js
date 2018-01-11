// Tipos de ações
export const AUTENTICAR = 'AUTENTICAR'
export const SAIR = 'SAIR'

// Funções de ação
export function autenticar (dados) {
  return {
    type: AUTENTICAR,
    dados: dados
  }
}

export function sair () {
  return {
    type: SAIR
  }
}
