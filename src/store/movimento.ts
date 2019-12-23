import {
  MovimentoStore, TrimestreData, Dominio, Empresa, // eslint-disable-line no-unused-vars
  Competencia, SimplesData, Grupo, Simples, // eslint-disable-line no-unused-vars
} from '../types';

export const movimentoStore : MovimentoStore = {
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
  simplesData: {
    movimentosPool: [],
    servicosPool: [],
    simples: {
      totalDoze: 0,
      totalExercicio: 0,
      totalRetido: 0,
      totalNaoRetido: 0,
      totalServicos: 0,
      totalMovimentos: 0,
      totalMes: 0,
    },
  },
  dominio: [],
  grupos: [],
};

export const dadosVazio : MovimentoStore = {
  notasPool: [],
  notasServicoPool: [],
  grupos: [],
  trimestreData: {
    movimentosPool: [],
    servicosPool: [],
  },
  simplesData: {
    movimentosPool: [],
    servicosPool: [],
    simples: {
      totalDoze: 0,
      totalExercicio: 0,
      totalRetido: 0,
      totalNaoRetido: 0,
      totalServicos: 0,
      totalMovimentos: 0,
      totalMes: 0,
    },
  },
};

export const CARREGA_TRIMESTRE_DATA = Symbol('CARREGA_TRIMESTRE_DATA');
export const CARREGAR_DADOS = Symbol('CARREGAR_DADOS');
export const CARREGAR_DOMINIO = Symbol('CARREGAR_DOMINIO');
export const CARREGAR_EMPRESA = Symbol('CARREGAR_EMPRESA');
export const CARREGAR_COMPETENCIA = Symbol('CARREGAR_COMPETENCIA');
export const CARREGAR_SIMPLES = Symbol('CARREGAR_SIMPLES');
export const CARREGAR_GRUPOS = Symbol('CARREGAR_GRUPOS');

export type Action = {
  type : Symbol;
  trimestreData? : TrimestreData;
  dados?: MovimentoStore;
  dominio? : Dominio[];
  empresa? : Empresa;
  competencia? : Competencia;
  simples? : Simples;
  grupos? : Grupo[];
}

function loadTrim(state : MovimentoStore, action : Action) {
  const newState : MovimentoStore = { ...state };
  const { trimestreData } = action;

  if (!trimestreData) return newState;

  return {
    ...newState,
    trimestreData,
  };
}

function carregarDados(state : MovimentoStore, action : Action) {
  const { dados } = action;
  return {
    ...state,
    ...dados,
  };
}

function setDominio(state : MovimentoStore, action : Action) {
  const newState : MovimentoStore = {
    ...state,
    dominio: action.dominio,
  };

  return newState;
}

function setEmpresa(state : MovimentoStore, action : Action) {
  const newState = {
    ...state,
    empresa: action.empresa,
  };

  return newState;
}

function setCompetencia(state : MovimentoStore, action : Action) {
  const newState = {
    ...state,
    competencia: action.competencia,
  };

  return newState;
}

function setSimples(state : MovimentoStore, action : Action) {
  const newState = {
    ...state,
  };
  const { simples } = action;

  if (!simples) return newState;

  return {
    ...newState,
    simplesData: {
      ...state.simplesData,
      simples,
    },
  };
}

function setGrupos(state : MovimentoStore, action : Action) {
  const newState = {
    ...state,
  };

  const { grupos } = action;

  if (!grupos) return newState;

  return {
    ...newState,
    grupos,
  };
}

export default function movimentoReducer(state = movimentoStore, action : Action) : MovimentoStore {
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
    case CARREGAR_SIMPLES:
      return setSimples(state, action);
    case CARREGAR_GRUPOS:
      return setGrupos(state, action);
    default:
      break;
  }

  return state;
}

export function carregarTrimestre(trimestreData : TrimestreData) : Action {
  return {
    type: CARREGA_TRIMESTRE_DATA,
    trimestreData,
  };
}

export function carregarMovimento(dados : MovimentoStore) : Action {
  return {
    type: CARREGAR_DADOS,
    dados,
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

export function carregarCompetencia(competencia : Competencia) : Action {
  return {
    type: CARREGAR_COMPETENCIA,
    competencia,
  };
}

export function carregarSimples(simples : Simples) : Action {
  return {
    type: CARREGAR_SIMPLES,
    simples,
  };
}

export function carregarGrupos(grupos : Grupo[]) : Action {
  return {
    type: CARREGAR_GRUPOS,
    grupos,
  };
}

export function limparDados() : Action {
  return {
    type: CARREGAR_DADOS,
    dados: dadosVazio,
  };
}
