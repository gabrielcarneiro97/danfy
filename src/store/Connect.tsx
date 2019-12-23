import React from 'react';
import Context from './config';

const Connect = Component => props => (
  <Context.Consumer>
    {({ dispatch, store }) => <Component {...props} store={store} dispatch={dispatch} />}
  </Context.Consumer>
);

export default Connect;
