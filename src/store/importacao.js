export const importacaoStore = {
  movimentosWithIndex: [],
  servicosWithIndex: [],
  notasPool: [],
  notasPoolImportadas: [],
  notasServicoPool: [],
  pessoasPool: [],
  dominio: [],
  empresa: {
    cnpj: '',
    nome: '',
    numeroSistema: '',
  },
  fileList: [],
};

export const NFE_ADD = Symbol('NFE_ADD');
export const NFE_RMV = Symbol('NFE_RMV');

export const NFSE_ADD = Symbol('NFSE_ADD');
export const NFSE_RMV = Symbol('NFSE_RMV');

export const PESSOA_ADD = Symbol('PESSOA_ADD');
export const PESSOA_RMV = Symbol('PESSOA_RMV');

export const CARREGAR_DOMINIO = Symbol('CARREGAR_DOMINIO');

export const CARREGAR_EMPRESA = Symbol('CARREGAR_EMPRESA');

export const CARREGAR_FILES = Symbol('CARREGAR_FILES');

export const CARREGAR_MOVIMENTOS = Symbol('CARREGAR_MOVIMENTOS');

export const CARREGAR_SERVICOS = Symbol('CARREGAR_SERVICOS');

export const LIMPAR = Symbol('LIMPAR');

function spreadState(state) {
  return {
    movimentosWithIndex: [...state.movimentosWithIndex],
    servicosWithIndex: [...state.servicosWithIndex],
    notasPool: [...state.notasPool],
    notasPoolImportadas: [...state.notasPoolImportadas],
    notasServicoPool: [...state.notasServicoPool],
    pessoasPool: [...state.pessoasPool],
    dominio: [...state.dominio],
    empresa: { ...state.empresa },
    fileList: [...state.fileList],
  };
}

function nfeController(state, action) {
  const newState = spreadState(state);

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
  const newState = spreadState(state);
  if (action.type === NFSE_ADD) {
    newState.notasServicoPool.push(action.notaServicoPool);
  } else {
    newState.notasServicoPool = newState.notasServicoPool.filter(
      (notaServicoPool) => notaServicoPool.nota.chave !== action.notaServicoPool.nota.chave,
    );
  }

  return newState;
}

function pessoasController(state, action) {
  const newState = spreadState(state);
  if (action.type === PESSOA_ADD) {
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
    ...spreadState(state),
    dominio: action.dominio,
  };

  return newState;
}

function setEmpresa(state, action) {
  const newState = {
    ...spreadState(state),
    empresa: action.empresa,
  };

  return newState;
}

function setFileList(state, action) {
  const newState = {
    ...spreadState(state),
    fileList: action.fileList,
  };

  return newState;
}

function setMovimentos(state, action) {
  const newState = {
    ...spreadState(state),
    movimentosWithIndex: action.movimentosWithIndex,
  };

  return newState;
}

function setServicos(state, action) {
  const newState = {
    ...spreadState(state),
    servicosWithIndex: action.servicosWithIndex,
  };

  return newState;
}

function limpar() {
  return importacaoStore;
}

export default function importacaoReducer(state = importacaoStore, action) {
  if (!action) return state;
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
      return setDominio(state, action);
    case CARREGAR_EMPRESA:
      return setEmpresa(state, action);
    case CARREGAR_FILES:
      return setFileList(state, action);
    case CARREGAR_MOVIMENTOS:
      return setMovimentos(state, action);
    case CARREGAR_SERVICOS:
      return setServicos(state, action);
    case LIMPAR:
      return limpar();
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

export function carregarEmpresa(empresa) {
  return {
    type: CARREGAR_EMPRESA,
    empresa,
  };
}

export function carregarArquivos(fileList) {
  return {
    type: CARREGAR_FILES,
    fileList,
  };
}

export function carregarMovimentos(movimentosWithIndex) {
  return {
    type: CARREGAR_MOVIMENTOS,
    movimentosWithIndex,
  };
}

export function carregarServicos(servicosWithIndex) {
  return {
    type: CARREGAR_SERVICOS,
    servicosWithIndex,
  };
}

export function limparStore() {
  return {
    type: LIMPAR,
  };
}
