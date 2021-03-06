import {
  EstoqueStore, StoreHandler, EstoqueObject, EstoqueInformacoesGerais, ProdutoEstoqueLite,
} from '../types';

export const estoqueStore : EstoqueStore = {
  estoqueInfosGerais: {
    numeroSistema: '',
    nome: '',
    cnpj: '',
    diaMesAno: null,
  },
  estoque: {},
  estoqueArray: [],
  modificadosId: [],
};

export const ADICIONA_INFOS_GERAIS = Symbol('ADICIONA_INFOS_GERAIS');
export const ADICIONA_UM = Symbol('ADICIONA_UM');
export const MUDA_UM = Symbol('MUDA_UM');
export const TIRA_ID_MODIFICADOS = Symbol('TIRA_ID_MODIFICADOS');
export const REMOVE_UM = Symbol('REMOVE_UM');
export const NOVO_ESTOQUE = Symbol('NOVO_ESTOQUE');

export type Action = {
  type : symbol;
  estoqueInfosGerais? : EstoqueInformacoesGerais;
  produtoEstoque? : ProdutoEstoqueLite;
  estoque? : EstoqueObject;
  estoqueArray? : ProdutoEstoqueLite[];
}

export type EstoqueHandler = StoreHandler<EstoqueStore, Action>;

function estoqueToArray(state : EstoqueStore) : ProdutoEstoqueLite[] {
  return Object.values(state.estoque).sort((a, b) => (a.id || 0) - (b.id || 0));
}

function arrayToEstoque(state : EstoqueStore) : EstoqueObject {
  const estoque : EstoqueObject = {};
  const { estoqueArray } = state;

  estoqueArray.forEach((produtoEstoque) => {
    estoque[produtoEstoque.id || 0] = produtoEstoque;
  });

  return estoque;
}

const adicionaInfosGerais : EstoqueHandler = (state, action) => {
  const { estoqueInfosGerais } = action;
  const newState = { ...state };
  newState.estoqueInfosGerais = {
    ...newState.estoqueInfosGerais,
    ...estoqueInfosGerais,
  };

  return newState;
};

const adicionaUm : EstoqueHandler = (state, action) => {
  const { produtoEstoque } = action;

  if (!produtoEstoque) return state;

  const { id } = produtoEstoque;

  const newState = { ...state };

  newState.estoque[id || 0] = produtoEstoque;
  newState.estoqueArray = estoqueToArray(newState);

  return newState;
};

const mudaUm : EstoqueHandler = (state, action) => {
  const { produtoEstoque } = action;

  if (!produtoEstoque) return state;

  const { id } = produtoEstoque;

  const newState = { ...state };

  newState.estoque[id || 0] = {
    ...newState.estoque[id || 0],
    ...produtoEstoque,
  };
  newState.modificadosId.push(id || 0);
  newState.estoqueArray = estoqueToArray(newState);

  return newState;
};

const tiraIdModificados : EstoqueHandler = (state, action) => {
  const { produtoEstoque } = action;

  if (!produtoEstoque) return state;

  const { id } = produtoEstoque;

  const newState = { ...state };

  const i = newState.modificadosId.findIndex((v) => v === id);

  delete newState.modificadosId[i];

  return newState;
};

const removeUm : EstoqueHandler = (state, action) => {
  const { produtoEstoque } = action;

  if (!produtoEstoque) return state;

  const { id } = produtoEstoque;

  const newState = { ...state };

  delete newState.estoque[id || 0];
  newState.estoqueArray = estoqueToArray(newState);

  return newState;
};

const novoEstoque : EstoqueHandler = (state, action) => {
  const { estoque, estoqueArray } = action;

  const newState = { ...state };

  if (estoque) {
    newState.estoque = estoque;
    newState.estoqueArray = estoqueToArray(newState);
  } else if (estoqueArray) {
    newState.estoqueArray = estoqueArray.sort((a, b) => (a.id || 0) - (b.id || 0));
    newState.estoque = arrayToEstoque(newState);
  }

  newState.modificadosId = [];

  return newState;
};

export default function estoqueReducer(state = estoqueStore, action : Action) : EstoqueStore {
  switch (action.type) {
    case ADICIONA_INFOS_GERAIS:
      return adicionaInfosGerais(state, action);
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

export function carregarInfosGerais(estoqueInfosGerais : EstoqueInformacoesGerais) : Action {
  return {
    type: ADICIONA_INFOS_GERAIS,
    estoqueInfosGerais,
  };
}

export function novoProduto(produtoEstoque : ProdutoEstoqueLite) : Action {
  return {
    type: ADICIONA_UM,
    produtoEstoque,
  };
}

export function atualizarProduto(produtoEstoque : ProdutoEstoqueLite) : Action {
  return {
    type: MUDA_UM,
    produtoEstoque,
  };
}

export function atualizacaoPersistida(produtoEstoque : ProdutoEstoqueLite) : Action {
  return {
    type: TIRA_ID_MODIFICADOS,
    produtoEstoque,
  };
}

export function deletarProduto(produtoEstoque : ProdutoEstoqueLite) : Action {
  return {
    type: REMOVE_UM,
    produtoEstoque,
  };
}

export function carregarEstoque(estoqueArray? : ProdutoEstoqueLite[],
  estoque? : EstoqueObject) : Action {
  return {
    type: NOVO_ESTOQUE,
    estoqueArray,
    estoque,
  };
}
