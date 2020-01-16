import {
  ImportacaoStore, NotaPool, NotaServicoPool, PessoaPool,
  StoreHandler, Dominio, Empresa, ServicoPoolWithIndex, MovWithIndexAndKey,
} from '../types';

export const importacaoStore : ImportacaoStore = {
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

export type Action = {
  type : symbol;
  notaPool? : NotaPool;
  notaServicoPool? : NotaServicoPool;
  pessoaPool? : PessoaPool;
  dominio? : Dominio[];
  empresa? : Empresa;
  fileList? : any[];
  movimentosWithIndex? : MovWithIndexAndKey[];
  servicosWithIndex? : ServicoPoolWithIndex[];
}

export type ImportacaoHandler = StoreHandler<ImportacaoStore, Action>;

function spreadState(state : ImportacaoStore) : ImportacaoStore {
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

const nfeController : ImportacaoHandler = (state, action) => {
  const { notaPool } = action;

  if (!notaPool) return state;

  const newState = spreadState(state);

  if (action.type === NFE_ADD) {
    newState.notasPool.push(notaPool);
  } else {
    newState.notasPool = newState.notasPool.filter(
      (np) => np.nota.chave !== notaPool.nota.chave,
    );
  }

  return newState;
};

const nfseController : ImportacaoHandler = (state, action) => {
  const { notaServicoPool } = action;

  if (!notaServicoPool) return state;

  const newState = spreadState(state);

  if (action.type === NFSE_ADD) {
    newState.notasServicoPool.push(notaServicoPool);
  } else {
    newState.notasServicoPool = newState.notasServicoPool.filter(
      (nsp) => nsp.notaServico.chave !== notaServicoPool.notaServico.chave,
    );
  }

  return newState;
};

const pessoasController : ImportacaoHandler = (state, action) => {
  const { pessoaPool } = action;

  if (!pessoaPool) return state;

  const newState = spreadState(state);

  if (action.type === PESSOA_ADD) {
    newState.pessoasPool.push(pessoaPool);
  } else {
    newState.pessoasPool = newState.pessoasPool.filter(
      (pp) => pp.pessoa.cpfcnpj !== pessoaPool.pessoa.cpfcnpj,
    );
  }

  return newState;
};

const setDominio : ImportacaoHandler = (state, action) => {
  const { dominio } = action;

  if (!dominio) return state;

  const newState = {
    ...spreadState(state),
    dominio,
  };

  return newState;
};

const setEmpresa : ImportacaoHandler = (state, action) => {
  const { empresa } = action;

  if (!empresa) return state;

  const newState = {
    ...spreadState(state),
    empresa,
  };

  return newState;
};

const setFileList : ImportacaoHandler = (state, action) => {
  const { fileList } = action;

  if (!fileList) return state;

  const newState = {
    ...spreadState(state),
    fileList,
  };

  return newState;
};

const setMovimentos : ImportacaoHandler = (state, action) => {
  const { movimentosWithIndex } = action;

  if (!movimentosWithIndex) return state;

  const newState = {
    ...spreadState(state),
    movimentosWithIndex,
  };

  return newState;
};

const setServicos : ImportacaoHandler = (state, action) => {
  const { servicosWithIndex } = action;

  if (!servicosWithIndex) return state;

  const newState = {
    ...spreadState(state),
    servicosWithIndex,
  };

  return newState;
};

function limpar() : ImportacaoStore {
  return importacaoStore;
}

export default function importacaoReducer(state = importacaoStore,
  action : Action) : ImportacaoStore {
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

export function addNota(notaPool : NotaPool) : Action {
  return {
    type: NFE_ADD,
    notaPool,
  };
}

export function removeNota(notaPool : NotaPool) : Action {
  return {
    type: NFE_RMV,
    notaPool,
  };
}

export function addNotaServico(notaServicoPool : NotaServicoPool) : Action {
  return {
    type: NFSE_ADD,
    notaServicoPool,
  };
}

export function removeNotaServico(notaServicoPool : NotaServicoPool) : Action {
  return {
    type: NFSE_RMV,
    notaServicoPool,
  };
}

export function addPessoa(pessoaPool : PessoaPool) : Action {
  return {
    type: PESSOA_ADD,
    pessoaPool,
  };
}

export function removePessoa(pessoaPool : PessoaPool) : Action {
  return {
    type: PESSOA_RMV,
    pessoaPool,
  };
}

export function carregarDominio(dominio : Dominio[]) : Action {
  return {
    type: CARREGAR_DOMINIO,
    dominio,
  };
}

export function carregarEmpresa(empresa : Empresa) : Action {
  return {
    type: CARREGAR_EMPRESA,
    empresa,
  };
}

export function carregarArquivos(fileList : object[]) : Action {
  return {
    type: CARREGAR_FILES,
    fileList,
  };
}

export function carregarMovimentos(movimentosWithIndex : MovWithIndexAndKey[]) : Action {
  return {
    type: CARREGAR_MOVIMENTOS,
    movimentosWithIndex,
  };
}

export function carregarServicos(servicosWithIndex : ServicoPoolWithIndex[]) : Action {
  return {
    type: CARREGAR_SERVICOS,
    servicosWithIndex,
  };
}

export function limparStore() : Action {
  return {
    type: LIMPAR,
  };
}
