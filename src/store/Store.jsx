import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

import Context from './config';
import estoqueReducer, { estoqueStore } from './estoque';

export default function Store(props) {
  const [estoqueState, estoqueDispacher] = useReducer(
    estoqueReducer,
    estoqueStore,
  );

  const combinedReducers = {
    store: {
      ...estoqueState,
    },
    dispatch: action => estoqueDispacher(action),
  };

  return (
    <Context.Provider value={combinedReducers}>
      {props.children}
    </Context.Provider>
  );
}

Store.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

Store.defaultProps = {
  children: '',
};
