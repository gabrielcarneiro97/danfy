export const clientesStore = {
  dominioId: '',
  dominio: [],
  pessoasPool: [],
};

export const CARREGAR_PESSOAS = Symbol('CARREGA_PESSOAS');

export const CARREGAR_DOMINIO = Symbol('CARREGAR_DOMINIO');

export const ADICIONAR_CLIENTE = Symbol('ADICIONAR_CLIENTE');
export const REMOVER_CLIENTE = Symbol('REMOVER_CLIENTE');

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

function removeCliente(state, action) {

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
