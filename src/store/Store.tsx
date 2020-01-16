import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import Context from './config';
import estoqueReducer, { estoqueStore } from './estoque';
import movimentoReducer, { movimentoStore } from './movimento';
import importacaoReducer, { importacaoStore } from './importacao';
import clientesReducer, { clientesStore } from './clientes';


function composer(reducer : any, store : any) : any {
  const Store = (props : any) : any => {
    const { children } = props;

    const [state, dispatcher] : [any, any] = useReducer(
      reducer,
      store,
    );

    const combinedReducers : any = {
      store: {
        ...state,
      },
      dispatch: (action : any) => dispatcher(action),
    };

    return (
      <Context.Provider value={combinedReducers}>
        {children}
      </Context.Provider>
    );
  };

  Store.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.array,
    ]),
  };

  Store.defaultProps = {
    children: '',
  };

  return Store;
}

export const EstoqueStore = composer(estoqueReducer, estoqueStore);

export const MovimentoStore = composer(movimentoReducer, movimentoStore);

export const ImportacaoStore = composer(importacaoReducer, importacaoStore);

export const ClientesStore = composer(clientesReducer, clientesStore);
