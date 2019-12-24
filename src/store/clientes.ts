import {
  ClientesStore, PessoaPool, Dominio, Empresa, Grupo,
} from '../types';

export const clientesStore : ClientesStore = {
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

export type Action = {
  type : symbol;
  pessoasPool? : PessoaPool[];
  pessoaPool? : PessoaPool;
  dominio? : Dominio[];
  empresa? : Empresa;
  grupoId? : string | number;
  grupo? : Grupo;
  grupos? : Grupo[];
}

function setPessoas(state : ClientesStore, action : Action) : ClientesStore {
  const { pessoasPool } = action;

  if (!pessoasPool) return state;

  const newState = {
    ...state,
    pessoasPool,
  };

  return newState;
}

function setDominio(state : ClientesStore, action : Action) : ClientesStore {
  const { dominio } = action;

  if (!dominio) return state;

  const newState = {
    ...state,
    dominio,
  };

  return newState;
}

function addCliente(state : ClientesStore, action : Action) : ClientesStore {
  const { pessoaPool, dominio } = action;

  if (!pessoaPool || !dominio) return state;

  const newState = {
    ...state,
    dominio,
    pessoasPool: [...state.pessoasPool, pessoaPool],
  };

  return newState;
}

function removeCliente(state : ClientesStore, action : Action) : ClientesStore {
  return state;
}

function setEmpresa(state : ClientesStore, action : Action) : ClientesStore {
  const { empresa } = action;

  if (!empresa) return state;

  const newState = {
    ...state,
    empresa,
  };

  return newState;
}

function addGrupo(state : ClientesStore, action : Action) : ClientesStore {
  const { grupo } = action;

  if (!grupo) return state;

  const newState = {
    ...state,
    grupos: state.grupos.concat(grupo),
  };

  return newState;
}

function removeGrupo(state : ClientesStore, action : Action) : ClientesStore {
  const newState = {
    ...state,
    grupos: state.grupos.filter((grupo) => grupo.id !== action.grupoId),
  };

  return newState;
}

function setGrupos(state : ClientesStore, action : Action) : ClientesStore {
  const { grupos } = action;

  if (!grupos) return state;

  const newState = {
    ...state,
    grupos,
  };

  return newState;
}

export default function clientesReducer(state = clientesStore, action : Action) : ClientesStore {
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

export function carregarDominio(dominio : Dominio[]) : Action {
  return {
    type: CARREGAR_DOMINIO,
    dominio,
  };
}

export function carregarPessoas(pessoasPool : PessoaPool[]) : Action {
  return {
    type: CARREGAR_PESSOAS,
    pessoasPool,
  };
}

export function adicionarCliente(pessoaPool : PessoaPool, dominio : Dominio[]) : Action {
  return {
    type: ADICIONAR_CLIENTE,
    pessoaPool,
    dominio,
  };
}

// export function removerCleinte(numeroCliente : string) : Action {
//   return {
//     type: REMOVER_CLIENTE,
//     numeroCliente,
//   };
// }

export function carregarEmpresa(empresa : Empresa) : Action {
  return {
    type: CARREGAR_EMPRESA,
    empresa,
  };
}

export function carregarGrupos(grupos : Grupo[]) : Action {
  return {
    type: CARREGAR_GRUPOS,
    grupos,
  };
}

export function adicionarGrupo(grupo : Grupo) : Action {
  return {
    type: ADICIONAR_GRUPO,
    grupo,
  };
}

export function removerGrupo(grupoId : string | number) : Action {
  return {
    type: REMOVER_GRUPO,
    grupoId,
  };
}
