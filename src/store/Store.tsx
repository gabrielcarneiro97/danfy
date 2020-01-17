import React, { useReducer } from 'react';

import Context from './config';
import estoqueReducer, { estoqueStore } from './estoque';
import movimentoReducer, { movimentoStore } from './movimento';
import importacaoReducer, { importacaoStore } from './importacao';
import clientesReducer, { clientesStore } from './clientes';
import {
  Reducer,
  Stores,
  EstoqueStore as TEstoqueStore,
  MovimentoStore as TMovimentoStore,
  ImportacaoStore as TImportacaoStore,
  ClientesStore as TClientesStore,
  GenericAction,
} from '../types';


function composer<T extends Stores>(
  reducer : Reducer<T>,
  store : T,
) : (props : any) => JSX.Element {
  const Store = (props : any) : JSX.Element => {
    const { children } = props;

    const [state, dispatcher] : [T, Function] = useReducer(
      reducer,
      store,
    );

    const combinedReducers : any = {
      store: {
        ...state,
      },
      dispatch: (action : GenericAction) => dispatcher(action),
    };

    return (
      <Context.Provider value={combinedReducers}>
        {children}
      </Context.Provider>
    );
  };

  return Store;
}

export const EstoqueStore = composer<TEstoqueStore>(estoqueReducer, estoqueStore);

export const MovimentoStore = composer<TMovimentoStore>(movimentoReducer, movimentoStore);

export const ImportacaoStore = composer<TImportacaoStore>(importacaoReducer, importacaoStore);

export const ClientesStore = composer<TClientesStore>(clientesReducer, clientesStore);
