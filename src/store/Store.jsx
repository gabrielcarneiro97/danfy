import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import Context from './config';
import estoqueReducer, { estoqueStore } from './estoque';
import movimentoReducer, { movimentoStore } from './movimento';

function composer(reducer, store) {
  const Store = (props) => {
    const { children } = props;

    const [state, dispatcher] = useReducer(
      reducer,
      store,
    );

    const combinedReducers = {
      store: {
        ...state,
      },
      dispatch: (action) => dispatcher(action),
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
