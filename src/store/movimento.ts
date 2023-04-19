import {
  MovimentoStore, TrimestreData, Dominio, Empresa, Competencia, Grupo, Simples, StoreHandler, Investimentos, Aliquotas,
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
  notas: [],
  notasServico: [],
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
  notas: [],
  notasServico: [],
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
export const CARREGAR_INVESTIMENTOS = Symbol('CARREGAR_INVESTIMENTOS');
export const CARREGAR_ALIQUOTAS = Symbol('CARREGAR_ALIQUOTAS');

export type Action = {
  type : symbol;
  trimestreData? : TrimestreData;
  dados?: MovimentoStore;
  dominio? : Dominio[];
  empresa? : Empresa;
  competencia? : Competencia;
  simples? : Simples;
  grupos? : Grupo[];
  investimentos? : Investimentos;
  aliquotas? : Aliquotas;
}

export type MovimentoHandler = StoreHandler<MovimentoStore, Action>;

const loadTrim : MovimentoHandler = (state, action) => {
  const newState : MovimentoStore = { ...state };
  const { trimestreData } = action;

  if (!trimestreData) return newState;

  return {
    ...newState,
    trimestreData,
  };
};

const carregarDados : MovimentoHandler = (state, action) => {
  const { dados } = action;
  return {
    ...state,
    ...dados,
  };
};

const setDominio : MovimentoHandler = (state, action) => {
  const newState : MovimentoStore = {
    ...state,
    dominio: action.dominio,
  };

  return newState;
};

const setInvestimentos : MovimentoHandler = (state, action) => {
  const newState : MovimentoStore = {
    ...state,
    investimentos: action.investimentos,
  };

  return newState;
};

const setAliquotas : MovimentoHandler = (state, action) => {
  const newState : MovimentoStore = {
    ...state,
    aliquotas: action.aliquotas,
  };

  return newState;
};

const setEmpresa : MovimentoHandler = (state, action) => {
  const newState = {
    ...state,
    empresa: action.empresa,
  };

  return newState;
};

const setCompetencia : MovimentoHandler = (state, action) => {
  const newState = {
    ...state,
    competencia: action.competencia,
  };

  return newState;
};

const setSimples : MovimentoHandler = (state, action) => {
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
};

const setGrupos : MovimentoHandler = (state, action) => {
  const newState = {
    ...state,
  };

  const { grupos } = action;

  if (!grupos) return newState;

  return {
    ...newState,
    grupos,
  };
};

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
    case CARREGAR_INVESTIMENTOS:
      return setInvestimentos(state, action);
    case CARREGAR_ALIQUOTAS:
      return setAliquotas(state, action);
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

export function carregarInvestimentos(investimentos : Investimentos) : Action {
  return {
    type: CARREGAR_INVESTIMENTOS,
    investimentos,
  };
}

export function carregarAliquotas(aliquotas : Aliquotas) : Action {
  return {
    type: CARREGAR_ALIQUOTAS,
    aliquotas,
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

export function limparInvestimentos() : Action {
  return {
    type: CARREGAR_INVESTIMENTOS,
    dados: dadosVazio,
  };
}
