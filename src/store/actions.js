// INÍCIO REDUCER USUÁRIO
export const AUTENTICAR = 'AUTENTICAR'
export const SAIR = 'SAIR'

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
// FIM REDUCER USUÁRIO

// INÍCIO REDUCER NOTAS
export const ADICIONAR_NOTA = 'ADICIONAR_NOTA'
export const REMOVER_NOTA = 'REMOVER_NOTA'
export const LIMPAR_NOTAS = 'LIMPAR_NOTAS'

export function adicionarNota (id, nota) {
  return {
    type: ADICIONAR_NOTA,
    id: id,
    nota: nota
  }
}
export function removerNota (id) {
  return {
    type: REMOVER_NOTA,
    id: id
  }
}
export function limparNotas () {
  return {
    type: LIMPAR_NOTAS
  }
}
// FIM REDUCER NOTAS

// INÍCIO REDUCER PESSOAS
export const ADICIONAR_PESSOA = 'ADICIONAR_PESSOA'
export const REMOVER_PESSOA = 'REMOVER_PESSOA'
export const LIMPAR_PESSOAS = 'LIMPAR_PESSOAS'

export function adicionarPessoa (id, pessoa) {
  return {
    type: ADICIONAR_PESSOA,
    id: id,
    pessoa: pessoa
  }
}
export function removerPessoa (id) {
  return {
    type: REMOVER_PESSOA,
    id: id
  }
}
export function limparPessoas () {
  return {
    type: LIMPAR_PESSOAS
  }
}
// FIM REDUCER PESSOAS

// INÍCIO REDUCER EMPRESAS
export const ADICIONAR_EMPRESA = 'ADICIONAR_EMPRESA'
export const REMOVER_EMPRESA = 'REMOVER_EMPRESA'
export const LIMPAR_EMPRESAS = 'LIMPAR_EMPRESAS'

export function adicionarEmpresa (id, empresa) {
  return {
    type: ADICIONAR_EMPRESA,
    id: id,
    empresa: empresa
  }
}
export function removerEmpresa (id) {
  return {
    type: REMOVER_EMPRESA,
    id: id
  }
}
export function limparEmpresas () {
  return {
    type: LIMPAR_EMPRESAS
  }
}
// FIM REDUCER EMPRESAS
