export const movimentoStore = {
  competencia: {
    mes: '',
    ano: '',
  },
  empresa: {
    cnpj: '',
    nome: '',
    numeroSistema: '',
    formaPagamento: '',
    simples: false,
  },
  notasPool: [],
  notasServicoPool: [],
  trimestreData: {
    movimentosPool: [],
    servicosPool: [],
  },
  dominio: [],
};

export const trimestreVazio = {
  notasPool: [],
  notasServicoPool: [],
  trimestreData: {
    movimentosPool: [],
    servicosPool: [],
  },
};

export const CARREGA_TRIMESTRE_DATA = Symbol('CARREGA_TRIMESTRE_DATA');
export const CARREGAR_DADOS = Symbol('CARREGAR_DADOS');
export const CARREGAR_DOMINIO = Symbol('CARREGAR_DOMINIO');
export const CARREGAR_EMPRESA = Symbol('CARREGAR_EMPRESA');
export const CARREGAR_COMPETENCIA = Symbol('CARREGAR_COMPETENCIA');

function loadTrim(state, action) {
  const newState = { ...state };
  const { trimestreData } = action;

  return {
    ...newState,
    trimestreData,
  };
}

function carregarDados(state, action) {
  const { dados } = action;

  return {
    ...state,
    ...dados,
  };
}

function setDominio(state, action) {
  const newState = {
    ...state,
    dominio: action.dominio,
  };

  return newState;
}

function setEmpresa(state, action) {
  const newState = {
    ...state,
    empresa: action.empresa,
  };

  return newState;
}

function setCompetencia(state, action) {
  const newState = {
    ...state,
    competencia: action.competencia,
  };

  return newState;
}

export default function movimentoReducer(state = movimentoStore, action) {
  switch (action.type) {
    case CARREGA_TRIMESTRE_DATA:
      return loadTrim(state, action);
    case CARREGAR_DADOS:
      return carregarDados(state, action);
    case CARREGAR_DOMINIO:
      return setDominio(state, action);
    case CARREGAR_EMPRESA:
      return setEmpresa(state, action);
    case CARREGAR_COMPETENCIA:
      return setCompetencia(state, action);
    default:
      break;
  }

  return state;
}

export function carregarTrimestre(trimestreData) {
  return {
    type: CARREGA_TRIMESTRE_DATA,
    trimestreData,
  };
}

export function carregarMovimento(dados) {
  return {
    type: CARREGAR_DADOS,
    dados,
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

export function carregarCompetencia(competencia) {
  return {
    type: CARREGAR_COMPETENCIA,
    competencia,
  };
}

export function limparTrimestre() {
  return {
    type: CARREGAR_DADOS,
    dados: trimestreVazio,
  };
}
