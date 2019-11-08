export const importacaoStore = {
  notasPool: [],
  notasServicoPool: [],
  pessoasPool: [],
  dominio: [],
};

export const NFE_ADD = Symbol('NFE_ADD');
export const NFE_RMV = Symbol('NFE_RMV');

export const NFSE_ADD = Symbol('NFSE_ADD');
export const NFSE_RMV = Symbol('NFSE_RMV');

export const PESSOA_ADD = Symbol('PESSOA_ADD');
export const PESSOA_RMV = Symbol('PESSOA_RMV');

export const CARREGAR_DOMINIO = Symbol('CARREGAR_DOMINIO');

function nfeController(state, action) {
  const newState = { ...state };
  if (action.type === NFE_ADD) {
    newState.notasPool.push(action.notaPool);
  } else {
    newState.notasPool = newState.notasPool.filter(
      (notaPool) => notaPool.nota.chave !== action.notaPool.nota.chave,
    );
  }

  return newState;
}

function nfseController(state, action) {
  const newState = { ...state };
  if (action.type === NFE_ADD) {
    newState.notasServicoPool.push(action.notaServicoPool);
  } else {
    newState.notasServicoPool = newState.notasServicoPool.filter(
      (notaServicoPool) => notaServicoPool.nota.chave !== action.notaServicoPool.nota.chave,
    );
  }

  return newState;
}

function pessoasController(state, action) {
  const newState = { ...state };
  if (action.type === NFE_ADD) {
    newState.pessoasPool.push(action.pessoaPool);
  } else {
    newState.pessoasPool = newState.pessoasPool.filter(
      (pessoaPool) => pessoaPool.pessoa.cpfcnpj !== action.pessoaPool.pessoa.cpfcnpj,
    );
  }

  return newState;
}

function setDominio(state, action) {
  const newState = {
    ...state,
    dominio: action.dominio,
  };

  return newState;
}

export default function importacaoReducer(state = importacaoStore, action) {
  switch (action.type) {
    case NFE_ADD:
    case NFE_RMV:
      return nfeController(state, action);
    case NFSE_ADD:
    case NFSE_RMV:
      return nfseController(state, action);
    case PESSOA_ADD:
    case PESSOA_RMV:
      return pessoasController(state, action);
    case CARREGAR_DOMINIO:
      return setDominio(setDominio, action);
    default:
      break;
  }

  return state;
}

export function addNota(notaPool) {
  return {
    type: NFE_ADD,
    notaPool,
  };
}

export function removeNota(notaPool) {
  return {
    type: NFE_RMV,
    notaPool,
  };
}

export function addNotaServico(notaServicoPool) {
  return {
    type: NFSE_ADD,
    notaServicoPool,
  };
}

export function removeNotaServico(notaServicoPool) {
  return {
    type: NFSE_RMV,
    notaServicoPool,
  };
}

export function addPessoa(pessoaPool) {
  return {
    type: PESSOA_ADD,
    pessoaPool,
  };
}

export function removePessoa(pessoaPool) {
  return {
    type: PESSOA_RMV,
    pessoaPool,
  };
}

export function carregarDominio(dominio) {
  return {
    type: CARREGAR_DOMINIO,
    dominio,
  };
}
