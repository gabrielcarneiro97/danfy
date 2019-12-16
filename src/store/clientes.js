export const clientesStore = {
  dominioId: '',
  dominio: [],
  pessoasPool: [],
  empresa: {
    cnpj: '',
    nome: '',
    numeroSistema: '',
  },
  grupos: [],
};

export const CARREGAR_PESSOAS = Symbol('CARREGA_PESSOAS');

export const CARREGAR_DOMINIO = Symbol('CARREGAR_DOMINIO');

export const ADICIONAR_CLIENTE = Symbol('ADICIONAR_CLIENTE');
export const REMOVER_CLIENTE = Symbol('REMOVER_CLIENTE');

export const CARREGAR_EMPRESA = Symbol('CARREGAR_EMPRESA');

export const CARREGAR_GRUPOS = Symbol('CARREGAR_GRUPOS');
export const ADICIONAR_GRUPO = Symbol('ADICIONAR_GRUPO');
export const REMOVER_GRUPO = Symbol('REMOVER_GRUPO');

function setPessoas(state, action) {
  const newState = {
    ...state,
    pessoasPool: action.pessoasPool,
  };

  return newState;
}

function setDominio(state, action) {
  const newState = {
    ...state,
    dominio: action.dominio,
  };

  return newState;
}

function addCliente(state, action) {
  const { pessoaPool, dominio } = action;

  const newState = {
    ...state,
    dominio,
    pessoasPool: [...state.pessoaPool, pessoaPool],
  };

  return newState;
}

function removeCliente() {}

function setEmpresa(state, action) {
  const newState = {
    ...state,
    empresa: action.empresa,
  };

  return newState;
}

function addGrupo(state, action) {
  const newState = {
    ...state,
    grupos: state.grupos.concat(action.grupo),
  };

  return newState;
}

function removeGrupo(state, action) {
  const newState = {
    ...state,
    grupos: state.grupos.filter((grupo) => grupo.id !== action.grupoId),
  };

  return newState;
}

function setGrupos(state, action) {
  const newState = {
    ...state,
    grupos: action.grupos,
  };

  return newState;
}

export default function clientesReducer(state = clientesStore, action) {
  if (!action) return state;
  switch (action.type) {
    case CARREGAR_PESSOAS:
      return setPessoas(state, action);
    case CARREGAR_DOMINIO:
      return setDominio(state, action);
    case ADICIONAR_CLIENTE:
      return addCliente(state, action);
    case REMOVER_CLIENTE:
      return removeCliente(state, action);
    case CARREGAR_EMPRESA:
      return setEmpresa(state, action);
    case CARREGAR_GRUPOS:
      return setGrupos(state, action);
    case ADICIONAR_GRUPO:
      return addGrupo(state, action);
    case REMOVER_GRUPO:
      return removeGrupo(state, action);
    default:
      break;
  }

  return state;
}

export function carregarDominio(dominio) {
  return {
    type: CARREGAR_DOMINIO,
    dominio,
  };
}

export function carregarPessoas(pessoasPool) {
  return {
    type: CARREGAR_PESSOAS,
    pessoasPool,
  };
}

export function adicionarCliente(cliente) {
  return {
    type: ADICIONAR_CLIENTE,
    cliente,
  };
}

export function removerCleinte(numeroCliente) {
  return {
    type: REMOVER_CLIENTE,
    numeroCliente,
  };
}

export function carregarEmpresa(empresa) {
  return {
    type: CARREGAR_EMPRESA,
    empresa,
  };
}

export function carregarGrupos(grupos) {
  return {
    type: CARREGAR_GRUPOS,
    grupos,
  };
}

export function adicionarGrupo(grupo) {
  return {
    type: ADICIONAR_GRUPO,
    grupo,
  };
}

export function removerGrupo(grupoId) {
  return {
    type: REMOVER_GRUPO,
    grupoId,
  };
}
