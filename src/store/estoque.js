export const estoqueStore = {
  estoque: {},
  estoqueArray: [],
  modificadosId: [],
};

export const ADICIONA_UM = Symbol('ADICIONA_UM');
export const MUDA_UM = Symbol('MUDA_UM');
export const TIRA_ID_MODIFICADOS = Symbol('TIRA_ID_MODIFICADOS');
export const REMOVE_UM = Symbol('REMOVE_UM');
export const NOVO_ESTOQUE = Symbol('NOVO_ESTOQUE');

function estoqueToArray(state) {
  return Object.values(state.estoque);
}

function arrayToEstoque(state) {
  const estoque = {};
  const { estoqueArray } = state;

  estoqueArray.forEach((produtoEstoque) => {
    estoque[produtoEstoque.id] = produtoEstoque;
  });

  return estoque;
}

function adicionaUm(state, action) {
  const { produtoEstoque } = action;
  const { id } = produtoEstoque;

  const newState = { ...state };

  newState.estoque[id] = {};
  newState.estoque[id] = produtoEstoque;
  newState.estoqueArray = estoqueToArray(newState);

  return newState;
}

function mudaUm(state, action) {
  const { produtoEstoque } = action;
  const { id } = produtoEstoque;

  const newState = { ...state };

  newState.estoque[id] = {
    ...newState.estoque[id],
    ...produtoEstoque,
  };
  newState.modificadosId.push(id);
  newState.estoqueArray = estoqueToArray(newState);

  return newState;
}

function tiraIdModificados(state, action) {
  const { produtoEstoque } = action;
  const { id } = produtoEstoque;

  const newState = { ...state };

  const i = newState.modificadosId.findIndex(v => v === id);

  delete newState.modificadosId[i];

  return newState;
}

function removeUm(state, action) {
  const { produtoEstoque } = action;
  const { id } = produtoEstoque;

  const newState = { ...state };

  delete newState.estoque[id];
  newState.estoqueArray = estoqueToArray(newState);

  return newState;
}

function novoEstoque(state, action) {
  const { estoque, estoqueArray } = action;

  const newState = { ...state };

  if (estoque) {
    newState.estoque = estoque;
    newState.estoqueArray = estoqueToArray(newState);
  } else if (estoqueArray) {
    newState.estoqueArray = estoqueArray;
    newState.estoque = arrayToEstoque(newState);
  }

  return newState;
}

export default function estoqueReducer(state = estoqueStore, action) {
  switch (action.type) {
    case ADICIONA_UM:
      return adicionaUm(state, action);
    case MUDA_UM:
      return mudaUm(state, action);
    case TIRA_ID_MODIFICADOS:
      return tiraIdModificados(state, action);
    case REMOVE_UM:
      return removeUm(state, action);
    case NOVO_ESTOQUE:
      return novoEstoque(state, action);
    default:
      break;
  }

  return state;
}

export function novoProduto(produtoEstoque) {
  return {
    type: ADICIONA_UM,
    produtoEstoque,
  };
}

export function atualizarProduto(produtoEstoque) {
  return {
    type: MUDA_UM,
    produtoEstoque,
  };
}

export function atualizacaoPersistida(produtoEstoque) {
  return {
    type: TIRA_ID_MODIFICADOS,
    produtoEstoque,
  };
}

export function deletarProduto(produtoEstoque) {
  return {
    type: REMOVE_UM,
    produtoEstoque,
  };
}

export function carregarEstoque(estoqueArray, estoque) {
  return {
    type: NOVO_ESTOQUE,
    estoqueArray,
    estoque,
  };
}

